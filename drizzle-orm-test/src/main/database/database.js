import { drizzle } from 'drizzle-orm/better-sqlite3'
import Database from 'better-sqlite3'
import * as schema from './schema.js'

// khởi tạo database
export const sqlite = new Database('sqlite.db')

sqlite.exec('PRAGMA foreign_keys = ON;')
sqlite.exec('PRAGMA journal_mode = WAL;')

// thêm schema vào database
export const db = drizzle(sqlite, { schema })
