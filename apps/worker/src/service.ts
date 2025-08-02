import IORedis from "ioredis"
import CircuitBreaker from "opossum"
import { request } from "undici"
import { dispatcher } from "./http-client.js"

const PAYMENT_PROCESSOR_DEFAULT_URL =
  process.env.PAYMENT_PROCESSOR_DEFAULT_URL || "http://localhost:8001"
const PAYMENT_PROCESSOR_FALLBACK_URL =
  process.env.PAYMENT_PROCESSOR_FALLBACK_URL || "http://localhost:8002"

const cbOptions = {
  timeout: 500, // 500 mili seconds
  errorThresholdPercentage: 40, // 40% failure rate
  resetTimeout: 1000 // 1 seconds
}

type PaymentPayload = {
  correlationId: string
  amount: number
}

async function paymentProcessorHttpCallBase(
  url: string,
  cbPayload: { redis: IORedis; payload: PaymentPayload },
  processorName: "default" | "fallback"
) {
  const { redis, payload } = cbPayload

  const requestPayload = { ...payload, requestedAt: new Date().toISOString() }

  const response = await request(`${url}/payments`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(requestPayload),
    dispatcher
  })

  if (response.statusCode < 200 || response.statusCode >= 300) {
    throw new Error(`[${processorName}] HTTP ${response.statusCode}`)
  }

  const keyTotalRequests = `payments:${processorName}:totalRequests`
  const keyTotalAmount = `payments:${processorName}:totalAmount`
  const keySortedSet = `payments:${processorName}:timestamps`

  const timestamp = new Date(requestPayload.requestedAt).getTime()

  await redis
    .multi()
    .incr(keyTotalRequests)
    .incrbyfloat(keyTotalAmount, payload.amount)
    .zadd(keySortedSet, timestamp, JSON.stringify(payload))
    .exec()
}

async function paymentProcessorHttpCall(payload: {
  redis: IORedis
  payload: PaymentPayload
}) {
  await paymentProcessorHttpCallBase(
    PAYMENT_PROCESSOR_DEFAULT_URL,
    payload,
    "default"
  )
}

async function paymentProcessorHttpCallFallback(payload: {
  redis: IORedis
  payload: PaymentPayload
}) {
  await paymentProcessorHttpCallBase(
    PAYMENT_PROCESSOR_FALLBACK_URL,
    payload,
    "fallback"
  )
}

const cb = new CircuitBreaker<[{ redis: IORedis; payload: PaymentPayload }]>(
  paymentProcessorHttpCall,
  cbOptions
)

cb.fallback(paymentProcessorHttpCallFallback)

const paymentProcessor =
  (redis: IORedis) => async (payload: PaymentPayload) => {
    await cb.fire({ payload, redis })
  }

export { paymentProcessor }
