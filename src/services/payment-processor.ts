import { FastifyRedis } from "@fastify/redis"
import CircuitBreaker from "opossum"
import { request } from "undici"
import { dispatcher } from "../http-client.js"
import { CircuitBreakerPayload, PaymentPayload } from "../types.js"

const PAYMENT_PROCESSOR_DEFAULT_URL =
  process.env.PAYMENT_PROCESSOR_DEFAULT_URL || "http://localhost:8001"
const PAYMENT_PROCESSOR_FALLBACK_URL =
  process.env.PAYMENT_PROCESSOR_FALLBACK_URL || "http://localhost:8002"

const cbOptions = {
  timeout: 1000, // 1 seconds
  errorThresholdPercentage: 50, // 50% failure rate
  resetTimeout: 5000 // 5 seconds
}

async function paymentProcessorHttpCallBase(
  url: string,
  cbPayload: CircuitBreakerPayload,
  processorName: "default" | "fallback"
) {
  const { redis, payload } = cbPayload
  await request(`${url}/payments`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
    dispatcher
  })

  const keyTotalRequests = `payments:${processorName}:totalRequests`
  const keyTotalAmount = `payments:${processorName}:totalAmount`
  const keySortedSet = `payments:${processorName}:timestamps`

  const timestamp = Date.now()

  await redis
    .multi()
    .incr(keyTotalRequests)
    .incrbyfloat(keyTotalAmount, payload.amount)
    .zadd(keySortedSet, timestamp, JSON.stringify(payload))
    .exec()
}

async function paymentProcessorHttpCall(payload: CircuitBreakerPayload) {
  await paymentProcessorHttpCallBase(
    PAYMENT_PROCESSOR_DEFAULT_URL,
    payload,
    "default"
  )
}

async function paymentProcessorHttpCallFallback(
  payload: CircuitBreakerPayload
) {
  await paymentProcessorHttpCallBase(
    PAYMENT_PROCESSOR_FALLBACK_URL,
    payload,
    "fallback"
  )
}

const cb = new CircuitBreaker<[CircuitBreakerPayload], void>(
  paymentProcessorHttpCall,
  cbOptions
)

cb.fallback(paymentProcessorHttpCallFallback)

export const paymentProcessor =
  (redis: FastifyRedis) => async (payload: PaymentPayload) => {
    const cbPayload = { ...payload, requestedAt: new Date().toISOString() }
    await cb.fire({ payload: cbPayload, redis })
  }
