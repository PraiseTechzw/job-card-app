import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { JobCardProvider } from './context/JobCardContext';
import { RuntimeConfigProvider, useRuntimeConfig } from './context/RuntimeConfigContext';
import { Toaster } from 'react-hot-toast';

const MainLayout = lazy(() => import('./layouts/MainLayout'));
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const JobCards = lazy(() => import('./pages/JobCards'));
const NewJobCard = lazy(() => import('./pages/NewJobCard'));
const EditJobCard = lazy(() => import('./pages/EditJobCard'));
const JobCardDetail = lazy(() => import('./pages/JobCardDetail'));
const Allocations = lazy(() => import('./pages/Allocations'));
const AllocationForm = lazy(() => import('./pages/AllocationForm'));
const Reports = lazy(() => import('./pages/Reports'));
const Approvals = lazy(() => import('./pages/Approvals'));
const Planning = lazy(() => import('./pages/Planning'));
const Assignments = lazy(() => import('./pages/Assignments'));
const SignOffs = lazy(() => import('./pages/SignOffs'));
const ArtisanDashboard = lazy(() => import('./pages/artisan/ArtisanDashboard'));
const ArtisanJobDetail = lazy(() => import('./pages/artisan/ArtisanJobDetail'));
const WorkExecution = lazy(() => import('./pages/artisan/WorkExecution'));
const MaterialsResources = lazy(() => import('./pages/artisan/MaterialsResources'));
const ReviewSubmit = lazy(() => import('./pages/artisan/ReviewSubmit'));
const MyHistory = lazy(() => import('./pages/artisan/MyHistory'));
const SupervisorDashboard = lazy(() => import('./pages/supervisor/SupervisorDashboard'));
const JobApproval = lazy(() => import('./pages/supervisor/JobApproval'));
const JobAssignment = lazy(() => import('./pages/supervisor/JobAssignment'));
const ActiveJobsMonitor = lazy(() => import('./pages/supervisor/ActiveJobsMonitor'));
const JobReview = lazy(() => import('./pages/supervisor/JobReview'));
const SupervisorReports = lazy(() => import('./pages/supervisor/SupervisorReports'));
const InitiatorDashboard = lazy(() => import('./pages/initiator/InitiatorDashboard'));
const CreateJobRequest = lazy(() => import('./pages/initiator/CreateJobRequest'));
const RequestDetails = lazy(() => import('./pages/initiator/RequestDetails'));
const RequestHistory = lazy(() => import('./pages/initiator/RequestHistory'));
const CompletionFeedback = lazy(() => import('./pages/initiator/CompletionFeedback'));
const PlannerDashboard = lazy(() => import('./pages/planner/PlannerDashboard'));
const JobRecordsManagement = lazy(() => import('./pages/planner/JobRecordsManagement'));
const JobClassification = lazy(() => import('./pages/planner/JobClassification'));
const MaintenanceHistory = lazy(() => import('./pages/planner/MaintenanceHistory'));
const ReportingAnalytics = lazy(() => import('./pages/planner/ReportingAnalytics'));
const PreventiveMaintenancePlanning = lazy(() => import('./pages/planner/PreventiveMaintenancePlanning'));
const ArchiveManagement = lazy(() => import('./pages/planner/ArchiveManagement'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const UserManagement = lazy(() => import('./pages/admin/UserManagement'));
const RolesPermissions = lazy(() => import('./pages/admin/RolesPermissions'));
const MasterDataManager = lazy(() => import('./pages/admin/MasterDataManager'));
const WorkflowConfig = lazy(() => import('./pages/admin/WorkflowConfig'));
const NotificationSettings = lazy(() => import('./pages/admin/NotificationSettings'));
const AuditLogs = lazy(() => import('./pages/admin/AuditLogs'));
const RetentionSettings = lazy(() => import('./pages/admin/RetentionSettings'));
const SystemSettings = lazy(() => import('./pages/admin/SystemSettings'));

const RouteLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-300">
    <div className="flex flex-col items-center gap-3">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-700 border-t-blue-400" />
      <p className="text-sm tracking-wide uppercase">Loading workspace...</p>
    </div>
  </div>
);

const ProtectedRoute = ({ children, allowedRoles, moduleName }: { children: React.ReactNode; allowedRoles?: string[]; moduleName?: string }) => {
  const { user, isLoading } = useAuth();
  const { hasModuleAccess, isLoading: isRuntimeConfigLoading } = useRuntimeConfig();

  if (isLoading || (user && isRuntimeConfigLoading)) {
    return <RouteLoader />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  if (!hasModuleAccess(moduleName)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

const withLayout = (page: React.ReactNode, allowedRoles?: string[], moduleName?: string) => (
  <ProtectedRoute allowedRoles={allowedRoles} moduleName={moduleName}>
    <MainLayout>{page}</MainLayout>
  </ProtectedRoute>
);

const AppContent = () => {
  return (
    <Suspense fallback={<RouteLoader />}>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={withLayout(<Dashboard />)} />

        <Route path="/job-cards" element={withLayout(<JobCards />)} />
        <Route path="/job-cards/new" element={withLayout(<NewJobCard />, ['Initiator', 'Admin'], 'Job Requests')} />
        <Route path="/job-cards/edit/:id" element={withLayout(<EditJobCard />, ['Initiator', 'Admin', 'Supervisor'])} />
        <Route path="/job-cards/view/:id" element={withLayout(<JobCardDetail />)} />

        <Route path="/allocations" element={withLayout(<Allocations />, ['Supervisor', 'EngSupervisor', 'Admin', 'PlanningOffice'], 'Assignments')} />
        <Route path="/allocations/new" element={withLayout(<AllocationForm />, ['Supervisor', 'EngSupervisor', 'Admin'], 'Assignments')} />
        <Route path="/allocations/edit/:id" element={withLayout(<AllocationForm />, ['Supervisor', 'EngSupervisor', 'Admin'], 'Assignments')} />

        <Route path="/approvals" element={withLayout(<Approvals />, ['Supervisor', 'EngSupervisor', 'HOD', 'Admin'], 'Approvals')} />
        <Route path="/planning" element={withLayout(<Planning />, ['PlanningOffice', 'Admin'], 'Planning & Records')} />
        <Route path="/assignments" element={withLayout(<Assignments />, ['Supervisor', 'EngSupervisor', 'Admin'], 'Assignments')} />
        <Route path="/sign-offs" element={withLayout(<SignOffs />, ['Initiator', 'Admin'], 'Job Requests')} />

        <Route path="/artisan/dashboard" element={withLayout(<ArtisanDashboard />, ['Artisan', 'Admin'], 'Work Execution')} />
        <Route path="/artisan/job-details/:id" element={withLayout(<ArtisanJobDetail />, ['Artisan', 'Admin'], 'Work Execution')} />
        <Route path="/artisan/execute-work/:id" element={withLayout(<WorkExecution />, ['Artisan', 'Admin'], 'Work Execution')} />
        <Route path="/artisan/materials/:id" element={withLayout(<MaterialsResources />, ['Artisan', 'Admin'], 'Work Execution')} />
        <Route path="/artisan/review/:id" element={withLayout(<ReviewSubmit />, ['Artisan', 'Admin'], 'Work Execution')} />
        <Route path="/artisan/history" element={withLayout(<MyHistory />, ['Artisan', 'Admin'], 'Work Execution')} />

        <Route path="/supervisor/dashboard" element={withLayout(<SupervisorDashboard />, ['Supervisor', 'EngSupervisor', 'Admin'], 'Approvals')} />
        <Route path="/supervisor/approve/:id" element={withLayout(<JobApproval />, ['Supervisor', 'EngSupervisor', 'Admin'], 'Approvals')} />
        <Route path="/supervisor/assign/:id" element={withLayout(<JobAssignment />, ['Supervisor', 'EngSupervisor', 'Admin'], 'Assignments')} />
        <Route path="/supervisor/active" element={withLayout(<ActiveJobsMonitor />, ['Supervisor', 'EngSupervisor', 'Admin'], 'Assignments')} />
        <Route path="/supervisor/review/:id" element={withLayout(<JobReview />, ['Supervisor', 'EngSupervisor', 'Admin'], 'Approvals')} />
        <Route path="/supervisor/reports" element={withLayout(<SupervisorReports />, ['Supervisor', 'EngSupervisor', 'Admin', 'HOD'], 'Reporting & Analytics')} />

        <Route path="/initiator/dashboard" element={withLayout(<InitiatorDashboard />, ['Initiator', 'Admin'], 'Job Requests')} />
        <Route path="/initiator/new" element={withLayout(<CreateJobRequest />, ['Initiator', 'Admin'], 'Job Requests')} />
        <Route path="/initiator/edit/:id" element={withLayout(<CreateJobRequest />, ['Initiator', 'Admin'], 'Job Requests')} />
        <Route path="/initiator/request/:id" element={withLayout(<RequestDetails />, ['Initiator', 'Admin'], 'Job Requests')} />
        <Route path="/initiator/history" element={withLayout(<RequestHistory />, ['Initiator', 'Admin'], 'Job Requests')} />
        <Route path="/initiator/feedback/:id" element={withLayout(<CompletionFeedback />, ['Initiator', 'Admin'], 'Job Requests')} />

        <Route path="/planner/dashboard" element={withLayout(<PlannerDashboard />, ['PlanningOffice', 'Admin'], 'Planning & Records')} />
        <Route path="/planner/jobs" element={withLayout(<JobRecordsManagement />, ['PlanningOffice', 'Admin'], 'Planning & Records')} />
        <Route path="/planner/job/:id" element={withLayout(<JobClassification />, ['PlanningOffice', 'Admin'], 'Planning & Records')} />
        <Route path="/planner/history" element={withLayout(<MaintenanceHistory />, ['PlanningOffice', 'Admin'], 'Planning & Records')} />
        <Route path="/planner/reports" element={withLayout(<ReportingAnalytics />, ['PlanningOffice', 'Admin'], 'Reporting & Analytics')} />
        <Route path="/planner/preventive" element={withLayout(<PreventiveMaintenancePlanning />, ['PlanningOffice', 'Admin'], 'Planning & Records')} />
        <Route path="/planner/archive" element={withLayout(<ArchiveManagement />, ['PlanningOffice', 'Admin'], 'Archiving')} />

        <Route path="/admin/dashboard" element={withLayout(<AdminDashboard />, ['Admin'], 'Admin Controls')} />
        <Route path="/admin/users" element={withLayout(<UserManagement />, ['Admin'], 'Admin Controls')} />
        <Route path="/admin/roles" element={withLayout(<RolesPermissions />, ['Admin'], 'Admin Controls')} />
        <Route path="/admin/master-data" element={withLayout(<MasterDataManager />, ['Admin'], 'Admin Controls')} />
        <Route path="/admin/workflow" element={withLayout(<WorkflowConfig />, ['Admin'], 'Admin Controls')} />
        <Route path="/admin/notifications" element={withLayout(<NotificationSettings />, ['Admin'], 'Admin Controls')} />
        <Route path="/admin/audit" element={withLayout(<AuditLogs />, ['Admin'], 'Admin Controls')} />
        <Route path="/admin/retention" element={withLayout(<RetentionSettings />, ['Admin'], 'Admin Controls')} />
        <Route path="/admin/settings" element={withLayout(<SystemSettings />, ['Admin'], 'Admin Controls')} />

        <Route path="/reports" element={withLayout(<Reports />, ['Admin', 'Supervisor', 'HOD', 'EngSupervisor'], 'Reporting & Analytics')} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </Suspense>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <RuntimeConfigProvider>
          <JobCardProvider>
            <Toaster position="top-right" reverseOrder={false} />
            <AppContent />
          </JobCardProvider>
        </RuntimeConfigProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
