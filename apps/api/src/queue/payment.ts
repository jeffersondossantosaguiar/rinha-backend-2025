import { Queue } from "bullmq"

export const paymentQueue = new Queue("payments", {
  connection: {
    host: process.env.REDIS_HOST || "localhost",
    port: Number(process.env.REDIS_PORT || 6379)
  }
})
