import { FastifyReply, FastifyRequest } from "fastify"
import { paymentProcessor } from "./services/payment-processor.js"
import { getPaymentsSummary } from "./services/payment-summary.js"
import { PaymentPayload, PaymentSummaryQuery } from "./types.js"

export async function paymentProcessorHandler(
  request: FastifyRequest<{ Body: PaymentPayload }>,
  reply: FastifyReply
) {
  const redis = request.server.redis
  const payload: PaymentPayload = request.body

  await paymentProcessor(redis)(payload)

  return reply.code(202).send()
}

export async function paymentSummaryHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const redis = request.server.redis
  const { from, to } = request.query as PaymentSummaryQuery

  const summary = await getPaymentsSummary(redis)({ from, to })

  return reply.code(200).send(summary)
}
