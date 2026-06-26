import { Like } from 'typeorm'
import { Todo } from '../entities/Todo'


export default class TodoRepository {
  constructor(dataSource) {
    this.repo = dataSource.getRepository(Todo)
  }

  // Lấy danh sách tất cả todos (có hỗ trợ tìm kiếm theo text)
  async getAll(filters = {}) {
    const findOptions = {}

    if (filters.search) {
      const searchPattern = `%${filters.search}%`
      findOptions.where = [
        { title: Like(searchPattern) },
        { description: Like(searchPattern) }
      ]
    }

    return this.repo.find(findOptions)
  }

  // Lấy chi tiết todo theo ID
  async getById(id) {
    return this.repo.findOneBy({ id })
  }

  // Tạo mới một todo
  async create(todoData) {
    const todo = this.repo.create({
      title: todoData.title,
      description: todoData.description,
      isCompleted: todoData.isCompleted || false
    })
    return this.repo.save(todo)
  }

  // Cập nhật todo theo ID
  async update(id, todoData) {
    await this.repo.update(id, {
      title: todoData.title,
      description: todoData.description,
      isCompleted: todoData.isCompleted
    })
    return this.getById(id)
  }

  // Xóa todo theo ID
  async delete(id) {
    const todo = await this.getById(id)
    if (todo) {
      await this.repo.remove(todo)
      return todo
    }
    return null
  }
}
