import path from "path"
import { fileURLToPath } from "url"
import { defineConfig } from "vitest/config"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
  test: {
    globals: true,
    environment: "node",
    include: ["**/*.{test,spec}.{ts,tsx}"],
    exclude: ["node_modules", ".next", "dist"],
    env: {
      SERVICE_API_KEY: "test-service-key",
      AUTH_SECRET: "test-auth-secret-key-must-be-long-enough",
      AUTH_API_URL: "http://localhost:3001",
    },
  },
})
