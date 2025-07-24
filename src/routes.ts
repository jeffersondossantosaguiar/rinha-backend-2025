import { FastifyInstance } from "fastify"
import { request } from "undici"
import { dispatcher } from "./http-client.js"

// TODO: Testar early return

const PAYMENT_PROCESSOR_DEFAULT_URL =
  process.env.PAYMENT_PROCESSOR_DEFAULT_URL || "http://localhost:8001"

export default async function routes(app: FastifyInstance) {
  app.post("/payments", async (req, reply) => {
    const { correlationId, amount } = req.body as any

    const payload = {
      correlationId,
      amount,
      requestedAt: new Date().toISOString()
    }

    const { body, statusCode } = await request(
      `${PAYMENT_PROCESSOR_DEFAULT_URL}/payments`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
        dispatcher
      }
    )

    return reply.code(201).send()
  })

  app.get("/payments-summary", async (request, reply) => {
    return {
      total: 100,
      successful: 98,
      failed: 2,
      from: "2025-07-16T00:00:00.000Z",
      to: "2025-07-16T23:59:59.999Z"
    }
  })

  app.get("/whoami", async (request, reply) => {
    return { instance: process.env.INSTANCE_NAME || "unknown" }
  })
}
