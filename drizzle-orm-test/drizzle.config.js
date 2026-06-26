import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './src/main/database/schema.js',
  out: './src/main/database/migrations',
  dialect: 'sqlite',
  dbCredentials: {
    url: 'sqlite.db'
  }
})
