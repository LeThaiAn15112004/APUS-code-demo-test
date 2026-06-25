import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'

function AppLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const today = new Intl.DateTimeFormat('vi-VN').format(new Date())

  return (
    <div className={`app-layout ${isSidebarOpen ? '' : 'sidebar-collapsed'}`}>
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="brand-lockup">
            <span className="brand-mark">A</span>
            {isSidebarOpen && (
              <span>
                <strong>APUS</strong>
                <small>He thong Dao tao</small>
              </span>
            )}
          </div>
          <button
            className="sidebar-toggle"
            type="button"
            onClick={() => setIsSidebarOpen((value) => !value)}
            aria-label={isSidebarOpen ? 'Đóng sidebar' : 'Mở sidebar'}
          >
            {isSidebarOpen ? '‹' : '›'}
          </button>
        </div>
        <nav className="sidebar-nav" aria-label="Điều hướng chính">
          <NavLink to="/" end>
            <span>SV</span>
            {isSidebarOpen && <strong>Quản lý sinh viên</strong>}
          </NavLink>
          <NavLink to="/courses">
            <span>KH</span>
            {isSidebarOpen && <strong>Quản lý môn học</strong>}
          </NavLink>
        </nav>
        <div className="sidebar-user">
          <span className="user-avatar">AD</span>
          {isSidebarOpen && (
            <span>
              <strong>Senior Manager</strong>
              <small>admin@apus.edu.vn</small>
            </span>
          )}
        </div>
      </aside>
      <section className="layout-main">
        <header className="topbar">
          <span className="system-status">
            <i aria-hidden="true" />
            He thong hoat dong on dinh
          </span>
          <div className="topbar-meta">
            <button className="help-button" type="button">
              Huong dan nhanh
            </button>
            <span>
              Hom nay: <strong>{today}</strong>
            </span>
          </div>
        </header>
        <div className="workspace">
          <Outlet />
        </div>
      </section>
    </div>
  )
}

export default AppLayout
