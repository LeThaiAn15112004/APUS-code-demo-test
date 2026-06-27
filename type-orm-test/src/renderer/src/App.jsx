import { useState, useEffect } from 'react'
import { todoApi } from './index.js'

function App() {
  const [todos, setTodos] = useState([])
  const [search, setSearch] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [editingId, setEditingId] = useState(null)
  // Thay window.confirm() bằng state-based dialog để tránh Electron mất focus webContents
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)

  // Fetch todos
  const fetchTodos = async (query = '') => {
    try {
      const data = await todoApi.getAll({ search: query })
      setTodos(data)
    } catch (error) {
      console.error('Failed to fetch todos:', error)
    }
  }

  // Initial load & search handler
  useEffect(() => {
    fetchTodos(search)
  }, [search])

  // Create or Update
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim()) return

    try {
      if (editingId) {
        await todoApi.update(editingId, {
          title,
          description,
          isCompleted: todos.find(t => t.id === editingId)?.isCompleted || false
        })
        setEditingId(null)
      } else {
        await todoApi.create({
          title,
          description,
          isCompleted: false
        })
      }
      setTitle('')
      setDescription('')
      fetchTodos(search)
    } catch (error) {
      console.error('Save failed:', error)
    }
  }

  // Start edit
  const handleEdit = (todo) => {
    setEditingId(todo.id)
    setTitle(todo.title)
    setDescription(todo.description || '')
  }

  // Cancel edit
  const handleCancel = () => {
    setEditingId(null)
    setTitle('')
    setDescription('')
  }

  // Toggle completion
  const handleToggle = async (todo) => {
    try {
      await todoApi.update(todo.id, {
        title: todo.title,
        description: todo.description,
        isCompleted: !todo.isCompleted
      })
      fetchTodos(search)
    } catch (error) {
      console.error('Toggle failed:', error)
    }
  }

  // Delete — dùng state dialog thay vì window.confirm() để tránh mất focus
  const handleDelete = async (id) => {
    setConfirmDeleteId(id)
  }

  const handleConfirmDelete = async () => {
    if (!confirmDeleteId) return
    try {
      await todoApi.delete(confirmDeleteId)
      fetchTodos(search)
    } catch (error) {
      console.error('Delete failed:', error)
    } finally {
      setConfirmDeleteId(null)
    }
  }

  const handleCancelDelete = () => setConfirmDeleteId(null)

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Todo List (TypeORM)</h1>

      {/* Form thêm / sửa */}
      <form onSubmit={handleSubmit} style={styles.form}>
        <h3 style={styles.formTitle}>{editingId ? 'Cập nhật công việc' : 'Thêm công việc mới'}</h3>
        <input
          type="text"
          placeholder="Tiêu đề..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          style={styles.input}
        />
        <textarea
          placeholder="Mô tả chi tiết (tùy chọn)..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{ ...styles.input, height: '60px', resize: 'none' }}
        />
        <div style={styles.formActions}>
          <button type="submit" style={styles.submitBtn}>
            {editingId ? 'Cập nhật' : 'Thêm mới'}
          </button>
          {editingId && (
            <button type="button" onClick={handleCancel} style={styles.cancelBtn}>
              Hủy
            </button>
          )}
        </div>
      </form>

      {/* Tìm kiếm */}
      <div style={styles.searchContainer}>
        <input
          type="text"
          placeholder="Tìm kiếm công việc..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={styles.searchInput}
        />
      </div>

      {/* Danh sách */}
      <div style={styles.todoList}>
        {todos.length === 0 ? (
          <p style={styles.noTodos}>Không tìm thấy công việc nào.</p>
        ) : (
          todos.map((todo) => (
            <div key={todo.id} style={{ ...styles.todoItem, opacity: todo.isCompleted ? 0.7 : 1 }}>
              <div style={styles.todoInfo} onClick={() => handleToggle(todo)}>
                <input
                  type="checkbox"
                  checked={!!todo.isCompleted}
                  readOnly
                  style={styles.checkbox}
                />
                <div>
                  <h4 style={{
                    ...styles.todoTitle,
                    textDecoration: todo.isCompleted ? 'line-through' : 'none',
                    color: todo.isCompleted ? '#888' : '#e0e0e0'
                  }}>
                    {todo.title}
                  </h4>
                  {todo.description && (
                    <p style={{
                      ...styles.todoDesc,
                      textDecoration: todo.isCompleted ? 'line-through' : 'none'
                    }}>
                      {todo.description}
                    </p>
                  )}
                </div>
              </div>

              <div style={styles.actions}>
                <button onClick={() => handleEdit(todo)} style={styles.editBtn}>Sửa</button>
                <button onClick={() => handleDelete(todo.id)} style={styles.deleteBtn}>Xóa</button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Confirm dialog — thay thế window.confirm() để không mất focus Electron */}
      {confirmDeleteId && (
        <div style={styles.overlay}>
          <div style={styles.confirmBox}>
            <p style={styles.confirmText}>Bạn có chắc chắn muốn xóa todo này không?</p>
            <div style={styles.confirmActions}>
              <button onClick={handleCancelDelete} style={styles.cancelBtn}>Hủy</button>
              <button onClick={handleConfirmDelete} style={{ ...styles.cancelBtn, background: '#ef4444', color: '#fff' }}>Xóa</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const styles = {
  container: {
    width: '450px',
    background: 'rgba(30, 31, 38, 0.85)',
    padding: '30px',
    borderRadius: '16px',
    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
    backdropFilter: 'blur(8px)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: 'system-ui, -apple-system, sans-serif'
  },
  header: {
    textAlign: 'center',
    color: '#fff',
    marginBottom: '20px',
    fontSize: '24px',
    fontWeight: '700'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginBottom: '20px',
    background: 'rgba(255, 255, 255, 0.03)',
    padding: '15px',
    borderRadius: '10px',
    border: '1px solid rgba(255, 255, 255, 0.05)'
  },
  formTitle: {
    margin: 0,
    fontSize: '14px',
    color: '#aaa',
    fontWeight: '600'
  },
  input: {
    padding: '10px',
    borderRadius: '6px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    background: 'rgba(0, 0, 0, 0.2)',
    color: '#fff',
    fontSize: '14px',
    outline: 'none'
  },
  formActions: {
    display: 'flex',
    gap: '10px'
  },
  submitBtn: {
    flex: 1,
    padding: '10px',
    borderRadius: '6px',
    background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
    color: '#fff',
    border: 'none',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'opacity 0.2s'
  },
  cancelBtn: {
    padding: '10px 15px',
    borderRadius: '6px',
    background: '#374151',
    color: '#fff',
    border: 'none',
    cursor: 'pointer'
  },
  searchContainer: {
    marginBottom: '15px'
  },
  searchInput: {
    width: '100%',
    padding: '10px',
    borderRadius: '6px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    background: 'rgba(0, 0, 0, 0.2)',
    color: '#fff',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box'
  },
  todoList: {
    maxHeight: '300px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  todoItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px',
    borderRadius: '8px',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    transition: 'all 0.2s'
  },
  todoInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    cursor: 'pointer',
    flex: 1
  },
  checkbox: {
    cursor: 'pointer',
    width: '18px',
    height: '18px'
  },
  todoTitle: {
    margin: 0,
    fontSize: '15px',
    fontWeight: '600'
  },
  todoDesc: {
    margin: '4px 0 0 0',
    fontSize: '12px',
    color: '#aaa'
  },
  actions: {
    display: 'flex',
    gap: '8px'
  },
  editBtn: {
    padding: '4px 8px',
    fontSize: '12px',
    background: 'rgba(59, 130, 246, 0.1)',
    border: '1px solid rgba(59, 130, 246, 0.3)',
    color: '#3b82f6',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  deleteBtn: {
    padding: '4px 8px',
    fontSize: '12px',
    background: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    color: '#ef4444',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  noTodos: {
    textAlign: 'center',
    color: '#888',
    fontSize: '14px',
    margin: '20px 0'
  },
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.55)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  },
  confirmBox: {
    background: '#1e1f26',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '12px',
    padding: '24px',
    width: '300px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
  },
  confirmText: {
    color: '#e0e0e0',
    fontSize: '15px',
    margin: '0 0 20px 0',
    lineHeight: 1.5
  },
  confirmActions: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'flex-end'
  }
}

export default App
