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
import MyJobs from './pages/MyJobs';
import SignOffs from './pages/SignOffs';

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
      <Route path="/my-jobs" element={<ProtectedRoute allowedRoles={['Artisan', 'Admin']}><MainLayout><MyJobs /></MainLayout></ProtectedRoute>} />
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

