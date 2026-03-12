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

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
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
      <Route path="/job-cards/new" element={<ProtectedRoute><MainLayout><NewJobCard /></MainLayout></ProtectedRoute>} />
      <Route path="/job-cards/edit/:id" element={<ProtectedRoute><MainLayout><EditJobCard /></MainLayout></ProtectedRoute>} />
      <Route path="/job-cards/view/:id" element={<ProtectedRoute><MainLayout><JobCardDetail /></MainLayout></ProtectedRoute>} />
      
      <Route path="/allocations" element={<ProtectedRoute><MainLayout><Allocations /></MainLayout></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute><MainLayout><div style={{padding: '2rem', color: 'white'}}>Reports (WIP)</div></MainLayout></ProtectedRoute>} />
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

