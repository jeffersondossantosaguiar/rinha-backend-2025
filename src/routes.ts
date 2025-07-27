import { FastifyRedis } from "@fastify/redis"
import { FastifyInstance } from "fastify"
import { PaymentPayload, paymentProcessorHandler } from "./service.js"

export default async function routes(app: FastifyInstance) {
  app.post("/payments", async (req, reply) => {
    const { correlationId, amount } = req.body as PaymentPayload

    const payload = {
      correlationId,
      amount,
      requestedAt: new Date().toISOString()
    }

    await paymentProcessorHandler(payload, req.server)

    return reply.code(201).send()
  })

  app.get("/payments-summary", async (request, reply) => {
    const { from, to } = request.query as { from: string; to: string }

    const summary = await getPaymentsSummary(request.server.redis, from, to)

    return summary
  })

  app.get("/whoami", async (request, reply) => {
    return { instance: process.env.INSTANCE_NAME || "unknown" }
  })
}

async function getPaymentsSummary(
  redis: FastifyRedis,
  fromISO: string,
  toISO: string
) {
  const fromTimestamp =
    fromISO && !isNaN(new Date(fromISO).getTime())
      ? new Date(fromISO).getTime()
      : "-inf"
  const toTimestamp =
    toISO && !isNaN(new Date(toISO).getTime())
      ? new Date(toISO).getTime()
      : "+inf"

  const processors = ["default", "fallback"]
  const summary: Record<
    string,
    { totalRequests: number; totalAmount: number }
  > = {}

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
