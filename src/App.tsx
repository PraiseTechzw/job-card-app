import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { JobCardProvider } from './context/JobCardContext';
import { Toaster } from 'react-hot-toast';
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
import InitiatorDashboard from './pages/initiator/InitiatorDashboard';
import CreateJobRequest from './pages/initiator/CreateJobRequest';
import RequestDetails from './pages/initiator/RequestDetails';
import RequestHistory from './pages/initiator/RequestHistory';
import CompletionFeedback from './pages/initiator/CompletionFeedback';

import PlannerDashboard from './pages/planner/PlannerDashboard';
import JobRecordsManagement from './pages/planner/JobRecordsManagement';
import JobClassification from './pages/planner/JobClassification';
import MaintenanceHistory from './pages/planner/MaintenanceHistory';
import ReportingAnalytics from './pages/planner/ReportingAnalytics';
import PreventiveMaintenancePlanning from './pages/planner/PreventiveMaintenancePlanning';
import ArchiveManagement from './pages/planner/ArchiveManagement';

import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import RolesPermissions from './pages/admin/RolesPermissions';
import MasterDataManager from './pages/admin/MasterDataManager';
import WorkflowConfig from './pages/admin/WorkflowConfig';
import NotificationSettings from './pages/admin/NotificationSettings';
import AuditLogs from './pages/admin/AuditLogs';
import RetentionSettings from './pages/admin/RetentionSettings';
import SystemSettings from './pages/admin/SystemSettings';

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
      
      <Route path="/approvals" element={<ProtectedRoute allowedRoles={['Supervisor', 'EngSupervisor', 'HOD', 'Admin']}><MainLayout><Approvals /></MainLayout></ProtectedRoute>} />
      <Route path="/planning" element={<ProtectedRoute allowedRoles={['PlanningOffice', 'Admin']}><MainLayout><Planning /></MainLayout></ProtectedRoute>} />
      <Route path="/assignments" element={<ProtectedRoute allowedRoles={['Supervisor', 'EngSupervisor', 'Admin']}><MainLayout><Assignments /></MainLayout></ProtectedRoute>} />
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

      {/* Initiator Module */}
      <Route path="/initiator/dashboard" element={<ProtectedRoute allowedRoles={['Initiator', 'Admin']}><MainLayout><InitiatorDashboard /></MainLayout></ProtectedRoute>} />
      <Route path="/initiator/new" element={<ProtectedRoute allowedRoles={['Initiator', 'Admin']}><MainLayout><CreateJobRequest /></MainLayout></ProtectedRoute>} />
      <Route path="/initiator/edit/:id" element={<ProtectedRoute allowedRoles={['Initiator', 'Admin']}><MainLayout><CreateJobRequest /></MainLayout></ProtectedRoute>} />
      <Route path="/initiator/request/:id" element={<ProtectedRoute allowedRoles={['Initiator', 'Admin']}><MainLayout><RequestDetails /></MainLayout></ProtectedRoute>} />
      <Route path="/initiator/history" element={<ProtectedRoute allowedRoles={['Initiator', 'Admin']}><MainLayout><RequestHistory /></MainLayout></ProtectedRoute>} />
      <Route path="/initiator/feedback/:id" element={<ProtectedRoute allowedRoles={['Initiator', 'Admin']}><MainLayout><CompletionFeedback /></MainLayout></ProtectedRoute>} />

      {/* Planning Office Module */}
      <Route path="/planner/dashboard" element={<ProtectedRoute allowedRoles={['PlanningOffice', 'Admin']}><MainLayout><PlannerDashboard /></MainLayout></ProtectedRoute>} />
      <Route path="/planner/jobs" element={<ProtectedRoute allowedRoles={['PlanningOffice', 'Admin']}><MainLayout><JobRecordsManagement /></MainLayout></ProtectedRoute>} />
      <Route path="/planner/job/:id" element={<ProtectedRoute allowedRoles={['PlanningOffice', 'Admin']}><MainLayout><JobClassification /></MainLayout></ProtectedRoute>} />
      <Route path="/planner/history" element={<ProtectedRoute allowedRoles={['PlanningOffice', 'Admin']}><MainLayout><MaintenanceHistory /></MainLayout></ProtectedRoute>} />
      <Route path="/planner/reports" element={<ProtectedRoute allowedRoles={['PlanningOffice', 'Admin']}><MainLayout><ReportingAnalytics /></MainLayout></ProtectedRoute>} />
      <Route path="/planner/preventive" element={<ProtectedRoute allowedRoles={['PlanningOffice', 'Admin']}><MainLayout><PreventiveMaintenancePlanning /></MainLayout></ProtectedRoute>} />
      <Route path="/planner/archive" element={<ProtectedRoute allowedRoles={['PlanningOffice', 'Admin']}><MainLayout><ArchiveManagement /></MainLayout></ProtectedRoute>} />

      {/* Admin Module */}
      <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['Admin']}><MainLayout><AdminDashboard /></MainLayout></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['Admin']}><MainLayout><UserManagement /></MainLayout></ProtectedRoute>} />
      <Route path="/admin/roles" element={<ProtectedRoute allowedRoles={['Admin']}><MainLayout><RolesPermissions /></MainLayout></ProtectedRoute>} />
      <Route path="/admin/master-data" element={<ProtectedRoute allowedRoles={['Admin']}><MainLayout><MasterDataManager /></MainLayout></ProtectedRoute>} />
      <Route path="/admin/workflow" element={<ProtectedRoute allowedRoles={['Admin']}><MainLayout><WorkflowConfig /></MainLayout></ProtectedRoute>} />
      <Route path="/admin/notifications" element={<ProtectedRoute allowedRoles={['Admin']}><MainLayout><NotificationSettings /></MainLayout></ProtectedRoute>} />
      <Route path="/admin/audit" element={<ProtectedRoute allowedRoles={['Admin']}><MainLayout><AuditLogs /></MainLayout></ProtectedRoute>} />
      <Route path="/admin/retention" element={<ProtectedRoute allowedRoles={['Admin']}><MainLayout><RetentionSettings /></MainLayout></ProtectedRoute>} />
      <Route path="/admin/settings" element={<ProtectedRoute allowedRoles={['Admin']}><MainLayout><SystemSettings /></MainLayout></ProtectedRoute>} />

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
          <Toaster position="top-right" reverseOrder={false} />
          <AppContent />
        </JobCardProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

