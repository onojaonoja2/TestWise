import { Client } from "pg"

async function createRedisService() {
  console.log("To provision Redis for TestWise on Railway:")
  console.log("1. Open your Railway project")
  console.log("2. Click '+ New' -> 'Database' -> 'Add Redis'")
  console.log("3. Open the Redis service -> 'Variables' tab")
  console.log("4. For the worker service (same Railway project), reference the PRIVATE")
  console.log("   URL, e.g. ${{Redis.REDIS_URL}} — no egress, no TLS needed.")
  console.log("5. For Vercel (queue producer, outside Railway), copy the PUBLIC Redis")
  console.log("   URL into Vercel's REDIS_URL environment variable.")
  console.log("\nFor local dev, keep using docker-compose (redis://localhost:6379)")
  console.log("or add a public dev URL to .env.local (never commit it):")
  console.log("REDIS_URL=redis://localhost:6379")
}

createRedisService().catch(console.error)