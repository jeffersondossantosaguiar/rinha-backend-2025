import { FastifyReply, FastifyRequest } from "fastify"
import { getPaymentQueue } from "./queue/payment.js"
import { getPaymentsSummary } from "./services/payment-summary.js"
import { PaymentPayload, PaymentSummaryQuery } from "./types.js"

export async function paymentProcessorHandler(
  request: FastifyRequest<{ Body: PaymentPayload }>,
  reply: FastifyReply
) {
  const payload: PaymentPayload = request.body

  reply.status(202).send()

  const paymentQueue = getPaymentQueue(request.server.redis)

  await paymentQueue.add("process-payment", payload, {
    removeOnComplete: true,
    removeOnFail: true
  })
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
