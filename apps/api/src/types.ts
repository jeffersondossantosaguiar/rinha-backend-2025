import { FastifyRedis } from "@fastify/redis"

type PaymentPayload = {
  correlationId: string
  amount: number
}

type PaymentSummaryQuery = {
  from?: string
  to?: string
}

type PaymentSummary = {
  totalRequests: number
  totalAmount: number
}

type CircuitBreakerPayload = {
  payload: PaymentPayload & { requestedAt: string }
  redis: FastifyRedis
}

export type {
  CircuitBreakerPayload,
  PaymentPayload,
  PaymentSummary,
  PaymentSummaryQuery
}
