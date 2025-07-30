const { Worker } = require("bullmq")
const IORedis = require("ioredis")
const { paymentProcessor } = require("./service")

const connection = new IORedis({
  host: process.env.REDIS_HOST || "localhost",
  port: Number(process.env.REDIS_PORT || 6379),
  maxRetriesPerRequest: null
})

// Escuta a fila "payments"
const worker = new Worker(
  "payments", // 👈 nome da fila
  async (job) => {
    /*     console.log(`🔧 Job recebido: ${job.name}`)
    console.log("📦 Dados:", job.data) */

    if (job.name === "process-payment") {
      await paymentProcessor(connection)(job.data)
      // Lógica específica do job "process-payment"
      //console.log(`💸 Processando pagamento de R$ ${job.data.amount}`)
      // Simula demora
      //await new Promise((res) => setTimeout(res, 1000))
    } else {
      console.warn("⚠️ Tipo de job não reconhecido:", job.name)
    }
  },
  { connection, concurrency: 10 } // 👈 número de jobs concorrentes
)

/* worker.on("completed", (job) => {
  console.log(`✅ Job ${job.id} finalizado com sucesso`)
})

worker.on("failed", (job, err) => {
  console.error(`❌ Job ${job?.id} falhou:`, err)
})
 */
