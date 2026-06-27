import { Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from './components/AppLayout'
import CourseManagementPage from './pages/coursemanagement/CourseManagementPage'
import StudentDetailPage from './pages/studentdetail/StudentDetailPage'
import StudentListPage from './pages/studentlist/StudentListPage'

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<StudentListPage />} />
        <Route path="/students/:id" element={<StudentDetailPage />} />
        <Route path="/courses" element={<CourseManagementPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
