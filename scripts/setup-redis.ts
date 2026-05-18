import { Client } from "pg"

async function createRedisService() {
  console.log("To create a Redis service in Aiven:")
  console.log("1. Go to https://console.aiven.io/")
  console.log("2. Click 'Create service'")
  console.log("3. Select 'Redis' as the service type")
  console.log("4. Choose a plan (free tier available)")
  console.log("5. Select your project")
  console.log("6. Give it a service name (e.g., testwise-redis)")
  console.log("7. Click 'Create service'")
  console.log("\nOnce created, add the connection string to .env.local:")
  console.log("REDIS_URL=rediss://user:password@host:port")
}

createRedisService().catch(console.error)