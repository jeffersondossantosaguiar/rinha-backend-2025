import { Worker } from "bullmq"
import IORedis from "ioredis"
import { paymentProcessor } from "./service.js"

const connection = new IORedis({
  host: process.env.REDIS_HOST || "localhost",
  port: Number(process.env.REDIS_PORT || 6379),
  maxRetriesPerRequest: null
})

// Escuta a fila "payments"
const worker = new Worker(
  "payments", // 👈 nome da fila
  async (job) => {
    if (job.name === "process-payment") {
      await paymentProcessor(connection)(job.data)
    } else {
      console.warn("⚠️ Tipo de job não reconhecido:", job.name)
    }
  },
  { connection, concurrency: 10 } // 👈 número de jobs concorrentes
)

worker.on("ready", () => {
  console.log("✅ Worker está pronto e escutando a fila 'payments'")
})

/* worker.on("completed", (job) => {
  console.log(`✅ Job ${job.id} finalizado com sucesso`)
})

worker.on("failed", (job, err) => {
  console.error(`❌ Job ${job?.id} falhou:`, err)
}) */
