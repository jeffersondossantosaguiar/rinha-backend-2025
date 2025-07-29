import { FastifyRedis } from "@fastify/redis"
import { PaymentSummary, PaymentSummaryQuery } from "../types"

const parseDate = (
  date: string | undefined,
  fallback: string
): number | string => {
  const parsed = new Date(date ?? "").getTime()
  return isNaN(parsed) ? fallback : parsed
}

const parsePayment = (json: string): { amount: number } => {
  try {
    return JSON.parse(json)
  } catch {
    return { amount: 0 }
  }
}

const calculateSummary = (payments: string[]): PaymentSummary => {
  const { totalAmount, count } = payments.reduce(
    (acc, p) => {
      const { amount } = parsePayment(p)
      return {
        totalAmount: acc.totalAmount + amount,
        count: acc.count + 1
      }
    },
    { totalAmount: 0, count: 0 }
  )

  return {
    totalRequests: count,
    totalAmount: Number(totalAmount.toFixed(2))
  }
}

const getProcessorSummary =
  (redis: FastifyRedis, from: number | string, to: number | string) =>
  async (processor: string): Promise<[string, PaymentSummary]> => {
    const key = `payments:${processor}:timestamps`
    const payments = await redis.zrangebyscore(key, from, to)
    const summary = calculateSummary(payments)
    return [processor, summary]
  }

export const getPaymentsSummary =
  (redis: FastifyRedis) =>
  async ({
    from,
    to
  }: PaymentSummaryQuery): Promise<Record<string, PaymentSummary>> => {
    const fromTs = parseDate(from, "-inf")
    const toTs = parseDate(to, "+inf")

    const processors = ["default", "fallback"]
    const results = await Promise.all(
      processors.map(getProcessorSummary(redis, fromTs, toTs))
    )

    return Object.fromEntries(results)
  }
