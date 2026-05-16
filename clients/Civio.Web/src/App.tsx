import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AdminLayout } from './components/AdminLayout'
import { AdminRoute } from './components/AdminRoute'
import { AppLayout } from './components/AppLayout'
import { AuthLayout } from './components/AuthLayout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { LoginPage } from './pages/auth/LoginPage'
import { RegisterPage } from './pages/auth/RegisterPage'
import { AdminOrgsPage } from './pages/admin/AdminOrgsPage'
import { AdminOrgDetailPage } from './pages/admin/AdminOrgDetailPage'
import { AdminUsersPage } from './pages/admin/AdminUsersPage'
import { AdminUserDetailPage } from './pages/admin/AdminUserDetailPage'
import { MyOrgsPage } from './pages/org/MyOrgsPage'
import { CreateOrgPage } from './pages/org/CreateOrgPage'
import { OrgDashboardPage } from './pages/org/OrgDashboardPage'
import { EmployeesPage } from './pages/org/EmployeesPage'
import { EmployeeDetailPage } from './pages/org/EmployeeDetailPage'
import { ServicesPage } from './pages/org/ServicesPage'
import { BookingsPage } from './pages/org/BookingsPage'
import { BookingDetailPage } from './pages/org/BookingDetailPage'
import { ScannerPage } from './pages/org/ScannerPage'
import DesignPreview from './design'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/design" element={<DesignPreview />} />

        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        <Route element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route
              path="/admin/organizations"
              element={<AdminOrgsPage />}
            />
            <Route
              path="/admin/organizations/:id"
              element={<AdminOrgDetailPage />}
            />
            <Route path="/admin/users" element={<AdminUsersPage />} />
            <Route
              path="/admin/users/:id"
              element={<AdminUserDetailPage />}
            />
          </Route>
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<MyOrgsPage />} />
          <Route path="/organizations/new" element={<CreateOrgPage />} />
          <Route path="/organizations/:id" element={<AppLayout />}>
            <Route index element={<OrgDashboardPage />} />
            <Route path="employees" element={<EmployeesPage />} />
            <Route
              path="employees/:empId"
              element={<EmployeeDetailPage />}
            />
            <Route path="services" element={<ServicesPage />} />
            <Route path="bookings" element={<BookingsPage />} />
            <Route
              path="bookings/:bookingId"
              element={<BookingDetailPage />}
            />
            <Route path="scan" element={<ScannerPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
