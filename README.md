# 🥩 Rinha de Backend 2025 — Node.js Implementation

Official repo: https://github.com/zanfranceschi/rinha-de-backend-2025

This project is my submission for the **Rinha de Backend 2025** challenge. It implements a high-performance, resilient payment gateway using Node.js, Fastify, BullMQ, Redis, and a circuit breaker pattern. The system dynamically chooses between two payment processors (`default` and `fallback`) based on availability and error rates, ensuring low-latency processing, fault tolerance, and observability under heavy load.

---

## 📜 Challenge Summary

**Requirement:**  
Your team (or you) must develop a backend that intermediates payment requests to a payment processing service, called Payment Processor.

- For each payment, a financial fee is charged. For example, with a 5% fee on a $100.00 payment, you are charged $5.00 and keep $95.00.
- However, the Payment Processor will suffer instabilities: high response times and HTTP 500 errors.
- There is a fallback Payment Processor (with a higher fee) for contingency, but it can also become unstable or unavailable. Both processors may be unstable or unavailable at the same time.
- In addition to the `POST /payments` endpoint, you must provide a `GET /payments-summary` endpoint to audit the consistency of processed payments. This is used to compare your backend's records with those of the processors, and inconsistencies will result in penalties.

**Architecture & Restrictions:**

- At least **two web server instances** must respond to `POST /payments` and `GET /payments-summary`, with load balancing (e.g., via nginx).
- **Resource limits:** All declared services together must not exceed 1.5 CPUs and 350MB RAM (set via `deploy.resources.limits.cpus` and `deploy.resources.limits.memory`).
- **Other restrictions:**
  - Images must be compatible with `linux-amd64`.
  - Network mode must be `bridge` (not `host`).
  - No privileged mode.
  - No use of replicated services.

---

## 🚀 Tech Stack

- **Node.js** (Fastify for HTTP API)
- **TypeScript** (strict typing and modern JS features)
- **BullMQ** (Redis-based job queue for async processing)
- **Redis** (data storage, queue backend, and analytics)
- **Undici** (high-performance HTTP client)
- **Opossum** (circuit breaker for payment processor resiliency)
- **Docker & Docker Compose** (containerized deployment)
- **NGINX** (load balancer)
- **K6** (performance/load testing)

---

## 🏗️ Architecture Overview

- **API Layer**: Two Fastify instances (`api01`, `api02`) behind an NGINX load balancer, exposing endpoints for payment submission and summary.
- **Queue**: Payments are enqueued via BullMQ and processed asynchronously.
- **Worker**: Dedicated Node.js worker consumes the queue, processes payments, and interacts with payment processors using a circuit breaker.
- **Circuit Breaker**: Opossum library automatically switches to the fallback processor on failures or high error rates.
- **Redis**: Central data store for queue, payment logs, and summary analytics.
- **Observability**: Payment metadata and stats are stored in Redis for real-time summary queries.
- **Load Balancer**: NGINX distributes traffic across API instances for high availability.

---

## 📂 Project Structure

```
apps/
  api/
    src/
      controller.ts        # HTTP request handlers
      routes.ts            # Fastify route definitions
      server.ts            # Fastify server entry point
      types.ts             # Shared TypeScript types
      queue/
        payment.ts         # BullMQ payment queue setup
      services/
        payment-summary.ts # Payment summary logic (Redis analytics)
    Dockerfile
    package.json
    tsconfig.json
  worker/
    src/
      index.ts             # Worker entry point (BullMQ consumer)
      service.ts           # Payment processor logic + circuit breaker
      http-client.ts       # Undici HTTP dispatcher
    Dockerfile
    package.json
    tsconfig.json
docker-compose.yml         # Multi-container orchestration
nginx.conf                 # NGINX load balancer config
README.md
```

---

## ⚙️ Features

- 🧩 **Circuit Breaker**: Automatic failover to fallback processor using Opossum.
- ⚡ **Queue-based Processing**: Payments are enqueued and processed asynchronously for high throughput.
- 📊 **Metrics & Consistency**: All payment requests and stats are stored in Redis, enabling `/payments-summary` queries with time filtering.
- 🧪 **Load Testing**: K6 scripts (not included here) can be used for benchmarking throughput, latency (`p99`), and failure handling.
- 🏷️ **Containerized**: All components run in isolated Docker containers for easy deployment and scaling.
- 🔄 **Horizontal Scalability**: Multiple API instances and stateless worker(s) allow scaling under load.

---

## 📦 Main Dependencies

| Library          | Description                            |
| ---------------- | -------------------------------------- |
| `fastify`        | High-performance HTTP server framework |
| `bullmq`         | Redis-based job/queue manager          |
| `undici`         | Fast, spec-compliant HTTP client       |
| `@fastify/redis` | Redis client plugin for Fastify        |
| `opossum`        | Circuit breaker pattern implementation |
| `ioredis`        | Robust Redis client for Node.js        |
| `typescript`     | Type-safe JavaScript                   |
| `nginx`          | Load balancer (containerized)          |
| `docker`         | Containerization                       |

---

## 🐳 Running with Docker

```bash
docker compose up --build
```

This will spin up:

- Two API instances (`api01`, `api02`)
- A Redis instance
- A worker container to process queued jobs
- An NGINX load balancer

---

## 🔧 Environment Variables

- `REDIS_HOST`: Redis connection hostname
- `REDIS_PORT`: Redis port (default: 6379)
- `PAYMENT_PROCESSOR_DEFAULT_URL`: URL to default payment processor
- `PAYMENT_PROCESSOR_FALLBACK_URL`: URL to fallback payment processor
- `INSTANCE_NAME`: Used to identify API container instance

---

## 📈 Example Endpoints

- `POST /payments` — Enqueues a payment to be processed
- `GET /payments-summary?from=...&to=...` — Returns total requests and amount processed by each processor (optionally filtered by time)
- `GET /whoami` — Identifies the running API instance

---

## 🎯 Performance Goals

- Minimize p99 latency (target: <1s)
- Maximize transaction throughput
- Maintain consistency and observability across processors
- Handle failures gracefully via circuit breaker and fallback

---

## 📝 Notes

- The payment processors themselves are mocked/external and not included in this repo.
- All business logic is implemented in TypeScript and split between API and Worker services.
- For local development, you can run API and Worker independently using `npm run dev` in each subfolder.

---

## 📚 References

- [BullMQ Documentation](https://docs.bullmq.io/)
- [Fastify Documentation](https://www.fastify.io/docs/latest/)
- [Opossum (Circuit Breaker)](https://nodeshift.dev/opossum/)
- [Undici HTTP Client](https://undici.nodejs.org/)
- [Rinha de Backend 2025 Challenge](https://github.com/zanfranceschi/rinha-de-backend-2025)

---
