import CircuitBreaker from "opossum"
import { request } from "undici"
import { dispatcher } from "./http-client.js"

const PAYMENT_PROCESSOR_DEFAULT_URL =
  process.env.PAYMENT_PROCESSOR_DEFAULT_URL || "http://localhost:8001"
const PAYMENT_PROCESSOR_FALLBACK_URL =
  process.env.PAYMENT_PROCESSOR_FALLBACK_URL || "http://localhost:8002"

const cbOptions = {
  timeout: 1000, // 1 seconds
  errorThresholdPercentage: 50, // 50% failure rate
  resetTimeout: 5000 // 5 seconds
}

type PaymentPayload = {
  correlationId: string
  amount: number
}

async function paymentProcessorHttpCallBase(
  url: string,
  payload: PaymentPayload
) {
  await request(`${url}/payments`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
    dispatcher
  })
}

async function paymentProcessorHttpCall(payload: PaymentPayload) {
  await paymentProcessorHttpCallBase(PAYMENT_PROCESSOR_DEFAULT_URL, payload)
}

async function paymentProcessorHttpCallFallback(payload: PaymentPayload) {
  await paymentProcessorHttpCallBase(PAYMENT_PROCESSOR_FALLBACK_URL, payload)
}

const cb = new CircuitBreaker<[PaymentPayload], void>(
  paymentProcessorHttpCall,
  cbOptions
)

cb.on("open", () => {
  console.log("OPEN")
}).fallback(paymentProcessorHttpCallFallback)

const paymentProcessorHandler = async (payload: PaymentPayload) => {
  await cb.fire(payload)
}

export { PaymentPayload, paymentProcessorHandler }
