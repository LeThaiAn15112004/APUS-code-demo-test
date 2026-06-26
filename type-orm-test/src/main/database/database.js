import 'reflect-metadata'
import { DataSource } from 'typeorm'
import { app } from 'electron'
import path from 'path'
import { Todo } from '../entities/Todo'


export const AppDataSource = new DataSource({
  type: 'better-sqlite3',
  database: path.join(app.getPath('userData'), 'database.sqlite'),
  synchronize: true, // Chỉ dùng trong lúc DEV, khi build app nên tắt để dùng migration
  logging: false,
  entities: [Todo],
  migrations: [],
  subscribers: []
})
