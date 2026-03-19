import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { JobCardProvider } from './context/JobCardContext';
import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import JobCards from './pages/JobCards';
import NewJobCard from './pages/NewJobCard';
import EditJobCard from './pages/EditJobCard';
import JobCardDetail from './pages/JobCardDetail';
import Allocations from './pages/Allocations';
import AllocationForm from './pages/AllocationForm';
import Reports from './pages/Reports';
import Approvals from './pages/Approvals';
import Planning from './pages/Planning';
import Assignments from './pages/Assignments';
import SignOffs from './pages/SignOffs';
import ArtisanDashboard from './pages/artisan/ArtisanDashboard';
import ArtisanJobDetail from './pages/artisan/ArtisanJobDetail';
import WorkExecution from './pages/artisan/WorkExecution';
import MaterialsResources from './pages/artisan/MaterialsResources';
import ReviewSubmit from './pages/artisan/ReviewSubmit';
import MyHistory from './pages/artisan/MyHistory';
import SupervisorDashboard from './pages/supervisor/SupervisorDashboard';
import JobApproval from './pages/supervisor/JobApproval';
import JobAssignment from './pages/supervisor/JobAssignment';
import ActiveJobsMonitor from './pages/supervisor/ActiveJobsMonitor';
import JobReview from './pages/supervisor/JobReview';
import SupervisorReports from './pages/supervisor/SupervisorReports';

const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

const AppContent = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<ProtectedRoute><MainLayout><Dashboard /></MainLayout></ProtectedRoute>} />
      
      {/* Job Card Module */}
      <Route path="/job-cards" element={<ProtectedRoute><MainLayout><JobCards /></MainLayout></ProtectedRoute>} />
      <Route path="/job-cards/new" element={<ProtectedRoute allowedRoles={['Initiator', 'Admin']}><MainLayout><NewJobCard /></MainLayout></ProtectedRoute>} />
      <Route path="/job-cards/edit/:id" element={<ProtectedRoute allowedRoles={['Initiator', 'Admin', 'Supervisor']}><MainLayout><EditJobCard /></MainLayout></ProtectedRoute>} />
      <Route path="/job-cards/view/:id" element={<ProtectedRoute><MainLayout><JobCardDetail /></MainLayout></ProtectedRoute>} />
      
      <Route path="/allocations" element={<ProtectedRoute allowedRoles={['Supervisor', 'EngSupervisor', 'Admin', 'PlanningOffice']}><MainLayout><Allocations /></MainLayout></ProtectedRoute>} />
      <Route path="/allocations/new" element={<ProtectedRoute allowedRoles={['Supervisor', 'EngSupervisor', 'Admin']}><MainLayout><AllocationForm /></MainLayout></ProtectedRoute>} />
      <Route path="/allocations/edit/:id" element={<ProtectedRoute allowedRoles={['Supervisor', 'EngSupervisor', 'Admin']}><MainLayout><AllocationForm /></MainLayout></ProtectedRoute>} />
      
      <Route path="/approvals" element={<ProtectedRoute allowedRoles={['Supervisor', 'HOD', 'Admin']}><MainLayout><Approvals /></MainLayout></ProtectedRoute>} />
      <Route path="/planning" element={<ProtectedRoute allowedRoles={['PlanningOffice', 'Admin']}><MainLayout><Planning /></MainLayout></ProtectedRoute>} />
      <Route path="/assignments" element={<ProtectedRoute allowedRoles={['EngSupervisor', 'Admin']}><MainLayout><Assignments /></MainLayout></ProtectedRoute>} />
      <Route path="/sign-offs" element={<ProtectedRoute allowedRoles={['Initiator', 'Admin']}><MainLayout><SignOffs /></MainLayout></ProtectedRoute>} />
      
      {/* Artisan Module */}
      <Route path="/artisan/dashboard" element={<ProtectedRoute allowedRoles={['Artisan', 'Admin']}><MainLayout><ArtisanDashboard /></MainLayout></ProtectedRoute>} />
      <Route path="/artisan/job-details/:id" element={<ProtectedRoute allowedRoles={['Artisan', 'Admin']}><MainLayout><ArtisanJobDetail /></MainLayout></ProtectedRoute>} />
      <Route path="/artisan/execute-work/:id" element={<ProtectedRoute allowedRoles={['Artisan', 'Admin']}><MainLayout><WorkExecution /></MainLayout></ProtectedRoute>} />
      <Route path="/artisan/materials/:id" element={<ProtectedRoute allowedRoles={['Artisan', 'Admin']}><MainLayout><MaterialsResources /></MainLayout></ProtectedRoute>} />
      <Route path="/artisan/review/:id" element={<ProtectedRoute allowedRoles={['Artisan', 'Admin']}><MainLayout><ReviewSubmit /></MainLayout></ProtectedRoute>} />
      <Route path="/artisan/history" element={<ProtectedRoute allowedRoles={['Artisan', 'Admin']}><MainLayout><MyHistory /></MainLayout></ProtectedRoute>} />
      
      {/* Supervisor Module */}
      <Route path="/supervisor/dashboard" element={<ProtectedRoute allowedRoles={['Supervisor', 'EngSupervisor', 'Admin']}><MainLayout><SupervisorDashboard /></MainLayout></ProtectedRoute>} />
      <Route path="/supervisor/approve/:id" element={<ProtectedRoute allowedRoles={['Supervisor', 'EngSupervisor', 'Admin']}><MainLayout><JobApproval /></MainLayout></ProtectedRoute>} />
      <Route path="/supervisor/assign/:id" element={<ProtectedRoute allowedRoles={['Supervisor', 'EngSupervisor', 'Admin']}><MainLayout><JobAssignment /></MainLayout></ProtectedRoute>} />
      <Route path="/supervisor/active" element={<ProtectedRoute allowedRoles={['Supervisor', 'EngSupervisor', 'Admin']}><MainLayout><ActiveJobsMonitor /></MainLayout></ProtectedRoute>} />
      <Route path="/supervisor/review/:id" element={<ProtectedRoute allowedRoles={['Supervisor', 'EngSupervisor', 'Admin']}><MainLayout><JobReview /></MainLayout></ProtectedRoute>} />
      <Route path="/supervisor/reports" element={<ProtectedRoute allowedRoles={['Supervisor', 'EngSupervisor', 'Admin', 'HOD']}><MainLayout><SupervisorReports /></MainLayout></ProtectedRoute>} />

      <Route path="/reports" element={<ProtectedRoute allowedRoles={['Admin', 'Supervisor', 'HOD', 'EngSupervisor']}><MainLayout><Reports /></MainLayout></ProtectedRoute>} />
      <Route path="/login" element={<Login />} />
    </Routes>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <JobCardProvider>
          <AppContent />
        </JobCardProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

