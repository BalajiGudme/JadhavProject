//---------------------=18/10/2025================================-----------------------------------------------------
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import AdminLayout from "./components/Admin/AdminLayout";
import FormBuilder from "./components/FormBuilder";
import FormList from "./components/FormList";
import StudentForm from "./components/StudentForm";
import ArchitectureManager from "./components/ArchitectureManager";
import ArchitectureFormTracker from "./components/ArchitectureFormTracker";
import A from "./components/A";
import Lan from "./components/Lan";
import LandingPage from "./components/LandingPage";
import ArchitectureResponsesView from './components/ArchitectureResponsesView';
import Login from "./components/LoginClient/Login"; 
import Register from "./components/LoginClient/Register";
import ProtectedRoute from "./components/ProtectedRoute";
import Unauthorized from "./components/Unauthorized";
// import CustomerDashboard from "./components/LoginClient/CustomerDashboard";
import AdminDashboard from "./components/Admin/AdminDashboard";
import AdminLogin from "./components/Admin/AdminLogin";
import CustSentRecord from "./components/Admin/CustSentRecord";
import AdminArchitectureResponsesView from "./components/Admin/AdminArchitectureResponses";
import AdminIDCardMaker from  "./components/Admin/AdminIDCardMaker";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes with main Layout */}
        <Route element={<Layout />}>
          {/* <Route path="/" element={<LandingPage />} /> */}
           <Route path="/" element={<Lan/>} />
          {/* <Route path="/admin" element={<LandingPage />} /> */}
          <Route path="/login" element={<Login />} />
          {/* <Route path="/login-admin" element={<AdminLogin />} /> */}
          <Route path="/admin-login" element={<LandingPage showAdminLogin={true} />} />
          <Route path="/register" element={<Register />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/student" element={<StudentForm />} />
          {/* Customer protected routes */}
          <Route 
            path="/arch" 
            element={
              <ProtectedRoute allowedRoles={["customer", "admin"]}>
                <ArchitectureFormTracker />
              </ProtectedRoute>
            } 
          />
          {/* <Route 
            path="/customer-dashboard" 
            element={
              <ProtectedRoute allowedRoles={["customer", "admin"]}>
                <CustomerDashboard/>
              </ProtectedRoute>
            } 
          /> */}
          {/* Customer Management Routes */}
          <Route 
            path="/formbuilder" 
            element={
              <ProtectedRoute allowedRoles={["customer", "admin"]}>
                <FormBuilder />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/forms" 
            element={
              <ProtectedRoute allowedRoles={["customer", "admin"]}>
                <FormList />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/architecture" 
            element={
              <ProtectedRoute allowedRoles={["customer", "admin"]}>
                <ArchitectureManager />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/architecture/:architectureId/responses" 
            element={
              <ProtectedRoute allowedRoles={["customer", "admin"]}>
                <ArchitectureResponsesView />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/students" 
            element={
              <ProtectedRoute allowedRoles={["customer", "admin"]}>
                <StudentForm />
              </ProtectedRoute>
            } 
          />
        </Route>
        {/* Admin routes with AdminLayout */}
        <Route path="/admin">
          <Route element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route path="/admin/home" element={<LandingPage />} />
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/admin/custmsentrecord" element={<CustSentRecord />} />
            <Route path="/admin/architecture/:architectureId/responses" element={<AdminArchitectureResponsesView />} />
            <Route path="/admin/make-id-card" element={<AdminIDCardMaker />} />
            <Route path="dashboard" element={<AdminDashboard/>} />
            <Route path="formbuilder" element={<FormBuilder />} />
            <Route path="forms" element={<FormList />} />
            <Route path="architecture" element={<ArchitectureManager />} />
            <Route 
              path="architecture/:architectureId/responses" 
              element={<ArchitectureResponsesView />} 
            />
            <Route path="students" element={<StudentForm />} />
            <Route path="reports" element={<div>Admin Reports</div>} />
            <Route path="settings" element={<div>Admin Settings</div>} />
          </Route>
        </Route>
        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;