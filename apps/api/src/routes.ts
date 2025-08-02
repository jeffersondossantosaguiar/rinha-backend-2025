import { FastifyInstance } from "fastify"
import { paymentProcessorHandler, paymentSummaryHandler } from "./controller.js"

export default async function routes(app: FastifyInstance) {
  app.post("/payments", paymentProcessorHandler)
  app.get("/payments-summary", paymentSummaryHandler)

  app.get("/whoami", async (request, reply) => {
    return { instance: process.env.INSTANCE_NAME || "unknown" }
  })
}
