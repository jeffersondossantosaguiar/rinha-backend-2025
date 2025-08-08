import { Queue } from "bullmq"
import { Redis } from "ioredis"

let paymentQueue: Queue | null = null

export function getPaymentQueue(redis: Redis): Queue {
  if (!paymentQueue) {
    paymentQueue = new Queue("payments", {
      connection: redis
    })
  }

  return paymentQueue
}
