import { FastifyRedis } from "@fastify/redis"
import { PaymentSummary, PaymentSummaryQuery } from "../types"

export const getPaymentsSummary =
  (redis: FastifyRedis) =>
  async ({
    from,
    to
  }: PaymentSummaryQuery): Promise<Record<string, PaymentSummary>> => {
    const fromTimestamp =
      from && !isNaN(new Date(from).getTime())
        ? new Date(from).getTime()
        : "-inf"
    const toTimestamp =
      to && !isNaN(new Date(to).getTime()) ? new Date(to).getTime() : "+inf"

    const processors = ["default", "fallback"]
    const summary: Record<string, PaymentSummary> = {}

    for (const processor of processors) {
      const keySortedSet = `payments:${processor}:timestamps`

      // Recupera os pagamentos no intervalo pelo sorted set
      const paymentsInRange = await redis.zrangebyscore(
        keySortedSet,
        fromTimestamp,
        toTimestamp
      )

      let totalRequests = paymentsInRange.length
      let totalAmount = 0

      for (const paymentString of paymentsInRange) {
        const payment = JSON.parse(paymentString)
        totalAmount += payment.amount
      }

      summary[processor] = {
        totalRequests,
        totalAmount: Number(totalAmount.toFixed(2))
      }
    }

    return summary
  }
