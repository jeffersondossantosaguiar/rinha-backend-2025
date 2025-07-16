import { FastifyInstance } from "fastify"

export default async function routes(app: FastifyInstance) {
  app.post("/payments", async (request, reply) => {
    return reply.code(201).send({ message: "Pagamento processado" })
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
