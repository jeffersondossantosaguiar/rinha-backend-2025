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

    await paymentProcessorHandler(payload)

    return reply.code(201).send()
  })

  app.get("/payments-summary", async (request, reply) => {
    const { from, to } = request.query as { from?: string; to?: string }

    return {
      default: {
        totalRequests: 43236,
        totalAmount: 415542345.98
      },
      fallback: {
        totalRequests: 423545,
        totalAmount: 329347.34
      }
    }
  })

  app.get("/whoami", async (request, reply) => {
    return { instance: process.env.INSTANCE_NAME || "unknown" }
  })
}
