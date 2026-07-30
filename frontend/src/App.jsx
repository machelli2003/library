import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import DashboardLayout from "./layouts/DashboardLayout";

import Landing from "./pages/public/Landing";
import Login from "./pages/public/Login";
import Register from "./pages/public/Register";
import Unauthorized from "./pages/public/Unauthorized";
import NotFound from "./pages/public/NotFound";

import StudentDashboard from "./pages/student/Dashboard";
import Catalogue from "./pages/student/Catalogue";
import BookDetails from "./pages/student/BookDetails";
import BorrowHistory from "./pages/student/BorrowHistory";
import StudentFines from "./pages/student/Fines";
import StudentProfile from "./pages/student/Profile";

import LibrarianDashboard from "./pages/librarian/Dashboard";
import ManageBooks from "./pages/librarian/ManageBooks";
import BookForm from "./pages/librarian/BookForm";
import BorrowRequests from "./pages/librarian/BorrowRequests";
import FineManagement from "./pages/librarian/FineManagement";
import ManageCategories from "./pages/librarian/ManageCategories";
import ActiveLoans from "./pages/librarian/ActiveLoans";
import BookHistory from "./pages/librarian/BookHistory";
import BulkImport from "./pages/librarian/BulkImport";

import AdminDashboard from "./pages/admin/Dashboard";
import Reports from "./pages/admin/Reports";
import AdminManageUsers from "./pages/admin/ManageUsers";
import AdminManageBooks from "./pages/admin/ManageBooks";
import AdminManageCategories from "./pages/admin/ManageCategories";
import AdminBorrowRequests from "./pages/admin/BorrowRequests";
import AdminActiveLoans from "./pages/admin/ActiveLoans";
import AdminFines from "./pages/admin/FineManagement";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="*" element={<NotFound />} />

          <Route
            path="/student"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <DashboardLayout role="student" />
              </ProtectedRoute>
            }
          >
            <Route index element={<StudentDashboard />} />
            <Route path="catalogue" element={<Catalogue />} />
            <Route path="books/:id" element={<BookDetails />} />
            <Route path="history" element={<BorrowHistory />} />
            <Route path="fines" element={<StudentFines />} />
            <Route path="profile" element={<StudentProfile />} />
            <Route path="*" element={<NotFound />} />
          </Route>

          <Route
            path="/librarian"
            element={
              <ProtectedRoute allowedRoles={["librarian", "admin"]}>
                <DashboardLayout role="librarian" />
              </ProtectedRoute>
            }
          >
            <Route index element={<LibrarianDashboard />} />
            <Route path="books" element={<ManageBooks />} />
            <Route path="books/new" element={<BookForm />} />
            <Route path="books/:id/edit" element={<BookForm />} />
            <Route path="books/:id/history" element={<BookHistory />} />
            <Route path="books/bulk-import" element={<BulkImport />} />
            <Route path="requests" element={<BorrowRequests />} />
            <Route path="loans" element={<ActiveLoans />} />
            <Route path="fines" element={<FineManagement />} />
            <Route path="categories" element={<ManageCategories />} />
            <Route path="reports" element={<Reports />} />
            <Route path="profile" element={<StudentProfile />} />
            <Route path="*" element={<NotFound />} />
          </Route>

          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <DashboardLayout role="admin" />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="reports" element={<Reports />} />
            <Route path="users" element={<AdminManageUsers />} />
            <Route path="books" element={<AdminManageBooks />} />
            <Route path="books/new" element={<BookForm />} />
            <Route path="books/:id/edit" element={<BookForm />} />
            <Route path="books/:id/history" element={<BookHistory />} />
            <Route path="books/bulk-import" element={<BulkImport />} />
            <Route path="categories" element={<AdminManageCategories />} />
            <Route path="requests" element={<AdminBorrowRequests />} />
            <Route path="loans" element={<AdminActiveLoans />} />
            <Route path="fines" element={<AdminFines />} />
            <Route path="profile" element={<StudentProfile />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

