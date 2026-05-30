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
import { ActivityLogPage } from './pages/admin/ActivityLogPage'
import { AdminStatisticsPage } from './pages/admin/AdminStatisticsPage'
import { AdminOrgStatisticsPage } from './pages/admin/AdminOrgStatisticsPage'
import { MyOrgsPage } from './pages/org/MyOrgsPage'
import { CreateOrgPage } from './pages/org/CreateOrgPage'
import { EditOrgPage } from './pages/org/EditOrgPage'
import { OrgDashboardPage } from './pages/org/OrgDashboardPage'
import { EmployeesPage } from './pages/org/EmployeesPage'
import { EmployeeDetailPage } from './pages/org/EmployeeDetailPage'
import { ServicesPage } from './pages/org/ServicesPage'
import { BookingsPage } from './pages/org/BookingsPage'
import { BookingDetailPage } from './pages/org/BookingDetailPage'
import { ScannerPage } from './pages/org/ScannerPage'
import { OrgStatsPage } from './pages/org/OrgStatsPage'
import { ProfilePage } from './pages/profile/ProfilePage'
import { EmployeeLayout } from './components/EmployeeLayout'
import { EmployeeDashboardPage } from './pages/employee/EmployeeDashboardPage'
import { MySchedulePage } from './pages/employee/MySchedulePage'
import { EmployeeBookingsPage } from './pages/employee/EmployeeBookingsPage'
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
            <Route path="/admin/activity-log" element={<ActivityLogPage />} />
            <Route path="/admin/statistics" element={<AdminStatisticsPage />} />
            <Route
              path="/admin/organizations/:orgId/statistics"
              element={<AdminOrgStatisticsPage />}
            />
          </Route>
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path="/employee/:id" element={<EmployeeLayout />}>
            <Route index element={<EmployeeDashboardPage />} />
            <Route path="schedule" element={<MySchedulePage />} />
            <Route path="bookings" element={<EmployeeBookingsPage />} />
            <Route path="bookings/:bookingId" element={<BookingDetailPage />} />
            <Route path="scan" element={<ScannerPage />} />
          </Route>
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/" element={<MyOrgsPage />} />
          <Route path="/organizations/new" element={<CreateOrgPage />} />
          <Route path="/organizations/:id/edit" element={<EditOrgPage />} />
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
            <Route path="stats" element={<OrgStatsPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
