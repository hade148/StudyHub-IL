import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Summaries from './pages/Summaries';
import SummaryDetail from './pages/SummaryDetail';
import UploadSummary from './pages/UploadSummary';
import Forum from './pages/Forum';
import ForumPost from './pages/ForumPost';
import CreateForumPost from './pages/CreateForumPost';
import Tools from './pages/Tools';
import HelpRequests from './pages/HelpRequests';
import AdminPanel from './pages/AdminPanel';
import Profile from './pages/Profile';
import Messages from './pages/Messages';
import Favorites from './pages/Favorites';

// Protected Route Component
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">טוען...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user?.role !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function AppContent() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />

          <Route path="/messages" element={
            <ProtectedRoute>
              <Messages />
            </ProtectedRoute>
          } />

          <Route path="/messages/:userId" element={
            <ProtectedRoute>
              <Messages />
            </ProtectedRoute>
          } />

          <Route path="/favorites" element={
            <ProtectedRoute>
              <Favorites />
            </ProtectedRoute>
          } />
          
          <Route path="/summaries" element={<Summaries />} />
          <Route path="/summaries/:id" element={<SummaryDetail />} />
          <Route path="/summaries/upload" element={
            <ProtectedRoute>
              <UploadSummary />
            </ProtectedRoute>
          } />
          
          <Route path="/forum" element={<Forum />} />
          <Route path="/forum/:id" element={<ForumPost />} />
          <Route path="/forum/create" element={
            <ProtectedRoute>
              <CreateForumPost />
            </ProtectedRoute>
          } />
          
          <Route path="/tools" element={<Tools />} />
          
          <Route path="/help-requests" element={
            <ProtectedRoute>
              <HelpRequests />
            </ProtectedRoute>
          } />
          
          <Route path="/admin" element={
            <ProtectedRoute adminOnly>
              <AdminPanel />
            </ProtectedRoute>
          } />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;