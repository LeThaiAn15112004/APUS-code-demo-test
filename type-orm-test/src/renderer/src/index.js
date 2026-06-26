const missingApiMessage = 'Renderer API is not available. Please check preload contextBridge setup.'

function getApi() {
  if (!window.api) {
    throw new Error(missingApiMessage)
  }
  return window.api
}

export const todoApi = {
  getAll: (filters = {}) => getApi().crud_todos.getAll(filters),
  getById: (id) => getApi().crud_todos.getById(id),
  create: (todo) => getApi().crud_todos.create(todo),
  update: (id, todo) => getApi().crud_todos.update(id, todo),
  delete: (id) => getApi().crud_todos.delete(id)
}
