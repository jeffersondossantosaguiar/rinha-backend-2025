import { FastifyReply, FastifyRequest } from "fastify"
import { paymentQueue } from "./queue/payment.js"
import { getPaymentsSummary } from "./services/payment-summary.js"
import { PaymentPayload, PaymentSummaryQuery } from "./types.js"

export async function paymentProcessorHandler(
  request: FastifyRequest<{ Body: PaymentPayload }>,
  reply: FastifyReply
) {
  const payload: PaymentPayload = request.body

  paymentQueue.add("process-payment", payload, {
    removeOnComplete: true,
    removeOnFail: true
  })

  return reply.status(202).send()
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
