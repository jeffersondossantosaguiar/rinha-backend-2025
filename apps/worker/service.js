const CircuitBreaker = require("opossum")
const { request } = require("undici")
const { dispatcher } = require("./http-client.js")

const PAYMENT_PROCESSOR_DEFAULT_URL =
  process.env.PAYMENT_PROCESSOR_DEFAULT_URL || "http://localhost:8001"
const PAYMENT_PROCESSOR_FALLBACK_URL =
  process.env.PAYMENT_PROCESSOR_FALLBACK_URL || "http://localhost:8002"

const cbOptions = {
  timeout: 1000, // 1 seconds
  errorThresholdPercentage: 40, // 40% failure rate
  resetTimeout: 5000 // 5 seconds
}

async function paymentProcessorHttpCallBase(url, cbPayload, processorName) {
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

async function paymentProcessorHttpCall(payload) {
  await paymentProcessorHttpCallBase(
    PAYMENT_PROCESSOR_DEFAULT_URL,
    payload,
    "default"
  )
}

async function paymentProcessorHttpCallFallback(payload) {
  await paymentProcessorHttpCallBase(
    PAYMENT_PROCESSOR_FALLBACK_URL,
    payload,
    "fallback"
  )
}

const cb = new CircuitBreaker(paymentProcessorHttpCall, cbOptions)

cb.fallback(paymentProcessorHttpCallFallback)

const paymentProcessor = (redis) => async (payload) => {
  const cbPayload = { ...payload, requestedAt: new Date().toISOString() }
  await cb.fire({ payload: cbPayload, redis })
}

module.exports = {
  paymentProcessor
}
