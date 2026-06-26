import { eq, like, or } from 'drizzle-orm'
import { todos } from '../database/schema.js'

export default class TodoRepository {
  constructor(db) {
    this.db = db
  }

  // Lấy danh sách tất cả todos (có hỗ trợ tìm kiếm theo text)
  getAll(filters = {}) {
    let query = this.db.select().from(todos)

    if (filters.search) {
      const searchPattern = `%${filters.search}%`
      query = query.where(
        or(
          like(todos.title, searchPattern),
          like(todos.description, searchPattern)
        )
      )
    }

    return query.all()
  }

  // Lấy chi tiết todo theo ID
  getById(id) {
    return this.db.select().from(todos).where(eq(todos.id, id)).get()
  }

  // Tạo mới một todo
  create(todoData) {
    return this.db.insert(todos).values({
      title: todoData.title,
      description: todoData.description,
      isCompleted: todoData.isCompleted,
      createdAt: todoData.createdAt || new Date()
    }).returning().get()
  }

  // Cập nhật todo theo ID
  update(id, todoData) {
    return this.db.update(todos)
      .set({
        title: todoData.title,
        description: todoData.description,
        isCompleted: todoData.isCompleted
      })
      .where(eq(todos.id, id))
      .returning().get()
  }

  // Xóa todo theo ID
  delete(id) {
    return this.db.delete(todos).where(eq(todos.id, id)).returning().get()
  }
}
