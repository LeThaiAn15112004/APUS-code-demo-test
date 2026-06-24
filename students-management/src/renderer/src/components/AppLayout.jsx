import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'

function AppLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  return (
    <div className={`app-layout ${isSidebarOpen ? '' : 'sidebar-collapsed'}`}>
      <aside className="sidebar">
        <div className="sidebar-header">
          {isSidebarOpen && <strong>APUS</strong>}
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
      </aside>
      <section className="layout-main">
        <Outlet />
      </section>
    </div>
  )
}

export default AppLayout
