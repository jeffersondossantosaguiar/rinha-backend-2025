import fastifyRedis from "@fastify/redis"
import fastify from "fastify"
import routes from "./routes.js"

const PORT = Number(process.env.PORT) || 3000
const app = fastify()

app.register(fastifyRedis, {
  host: process.env.REDIS_HOST || "localhost",
  port: Number(process.env.REDIS_PORT || 6379)
})

app.register(routes)

app.listen({ port: PORT }, (err, address) => {
  if (err) {
    app.log.error(err)
    process.exit(1)
  }
  console.log(`Server is listening at ${address}`)
})
