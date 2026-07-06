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
    setupFiles: ["./__tests__/setup.ts"],
    include: ["**/*.{test,spec}.ts"],
    exclude: ["node_modules", ".next", "dist"],
    // Run test files sequentially to avoid DB collisions when sharing the same database
    fileParallelism: false,
    fileParallelism: false,
    deps: ({
      // Force inline processing for these ESM deps during tests.
      // Cast to `any` to avoid TypeScript's DepsOptions shape mismatch in this workspace.
      inline: ["@prisma/client", "@prisma/adapter-pg"],
    } as any),
    env: {
      POSTGRES_USER: "futurekawa",
      POSTGRES_PASSWORD: "futurekawa_secret",
      POSTGRES_DB: "futurekawa",
      POSTGRES_HOST: "localhost",
      POSTGRES_PORT: "5433",
      DATABASE_URL: "postgresql://futurekawa:futurekawa_secret@localhost:5433/futurekawa",
      SERVICE_API_KEY: "test-service-key",
      SMTP_HOST: "localhost",
      SMTP_PORT: "1025",
      SMTP_USER: "test@mailhog.local",
      SMTP_PASSWORD: "test-password",
      ALERT_EMAIL_TO: "alerts@futurekawa.local",
    },
  },
})