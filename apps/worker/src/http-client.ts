import { Agent, Pool } from "undici"

const dispatcher = new Agent({
  connectTimeout: 5_000, // 5 seconds
  factory(origin, opts) {
    return new Pool(origin, {
      ...opts,
      connections: 10,
      allowH2: true,
      clientTtl: 60_000, // 1 minute
      keepAliveTimeout: 30_000 // 30 seconds
    })
  }
})

export { dispatcher }
