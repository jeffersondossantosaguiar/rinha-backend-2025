import fastify from "fastify"
import routes from "./routes.js"

const app = fastify()

app.register(routes)

const PORT = Number(process.env.PORT) || 3000

const start = async () => {
  try {
    await app.listen({ port: PORT, host: "0.0.0.0" })
    console.log(`Server is running on http://localhost:${PORT}`)
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

start()
