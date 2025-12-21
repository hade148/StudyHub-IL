import { Routes, Route, Navigate, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { BookOpen, MessageCircle, Wrench } from 'lucide-react';
import { Button } from './components/ui/button';
import { Avatar, AvatarFallback } from './components/ui/avatar';
import { useAuth } from './context/AuthContext';
import { StatsBar } from './components/dashboard/StatsBar';
import { WelcomeSection } from './components/dashboard/WelcomeSection';
import { QuickActions } from './components/dashboard/QuickActions';
import { RecentSummaries } from './components/dashboard/RecentSummaries';
import { LatestForumPosts } from './components/dashboard/LatestForumPosts';
import { PopularTools } from './components/dashboard/PopularTools';
import { SummariesPage } from './components/summaries/SummariesPage';
import { SummaryDetailPage } from './components/summaries/SummaryDetailPage';
import { UploadPage } from './components/summaries/UploadPage';
import { ForumPage } from './components/forum/ForumPage';
import { ForumPostDetailPage } from './components/forum/ForumPostDetailPage';
import { ToolsPage } from './components/tools/ToolsPage';
import { ProfilePageNew } from './components/profile/ProfilePageNew';
import { LoginPage } from './components/auth/LoginPage';
import { RegisterPage } from './components/auth/RegisterPage';
import { ForgotPasswordPage } from './components/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './components/auth/ResetPasswordPage';
import { VerifyEmailPage } from './components/auth/VerifyEmailPage';
import { NewQuestionPage } from './components/forum/NewQuestionPage';

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">טוען...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

// Dashboard Component
function Dashboard() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  // Get initials for avatar
  const getInitials = () => {
    if (!user?.fullName) return '??';
    const names = user.fullName.split(' ');
    if (names.length >= 2) {
      return names[0][0] + names[1][0];
    }
    return names[0].slice(0, 2);
  };

  const handleAddTool = () => {
    navigate('/tools?addTool=true');
  };

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4 py-8 space-y-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-3 rounded-xl">
              <span className="text-2xl">🎓</span>
            </div>
            <div>
              <h1 className="text-gray-900">StudyHub-IL</h1>
              <p className="text-gray-600">הפלטפורמה האקדמית שלך</p>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex flex-wrap gap-2 items-center">
            <Button
              onClick={() => navigate('/summaries')}
              variant="outline"
              className="border-blue-600 text-blue-600 hover:bg-blue-50"
            >
              <BookOpen className="w-4 h-4 ml-2" />
              סיכומים
            </Button>
            <Button
              onClick={() => navigate('/forum')}
              variant="outline"
              className="border-purple-600 text-purple-600 hover:bg-purple-50"
            >
              <MessageCircle className="w-4 h-4 ml-2" />
              פורום
            </Button>
            <Button
              onClick={() => navigate('/tools')}
              variant="outline"
              className="border-green-600 text-green-600 hover:bg-green-50"
            >
              <Wrench className="w-4 h-4 ml-2" />
              כלים
            </Button>
            <div className="relative group">
              <button
                onClick={() => navigate('/profile')}
                className="hover:opacity-80 transition-opacity"
              >
                <Avatar className="w-10 h-10 border-2 border-gray-300 hover:border-blue-500 transition-colors">
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
              </button>
              {/* Dropdown Menu */}
              <div className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                <button
                  onClick={() => navigate('/profile')}
                  className="w-full text-right px-4 py-2 hover:bg-gray-50 rounded-t-lg"
                >
                  הפרופיל שלי
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-right px-4 py-2 hover:bg-gray-50 text-red-600 rounded-b-lg"
                >
                  התנתק
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <StatsBar />

        {/* Welcome Section */}
        <WelcomeSection />

        {/* Quick Actions */}
        <QuickActions 
          onNavigateUpload={() => navigate('/upload')}
          onNavigateForum={() => navigate('/forum')}
          onNavigateTools={() => navigate('/tools')}
          onAddTool={handleAddTool}
        />

        {/* Recent Summaries */}
        <RecentSummaries onViewAll={() => navigate('/summaries')} />

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Latest Forum Posts - Takes 2 columns */}
          <div className="lg:col-span-2">
            <LatestForumPosts onViewAll={() => navigate('/forum')} />
          </div>

          {/* Empty space or additional content */}
          <div className="hidden lg:block" />
        </div>

        {/* Popular Tools */}
        <PopularTools onViewAll={() => navigate('/tools')} />

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 0.5 }}
          className="text-center py-8 text-gray-600 border-t border-gray-200"
        >
          <p>© 2025 StudyHub-IL. כל הזכויות שמורות.</p>
        </motion.footer>
      </motion.div>
    </div>
  );
}

// Wrapper component for SummaryDetailPage to get route params
function SummaryDetailWrapper() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  return (
    <div dir="rtl">
      <SummaryDetailPage
        summaryId={id || ''}
        onNavigateHome={() => navigate('/dashboard')}
        onNavigateSummaries={() => navigate('/summaries')}
      />
    </div>
  );
}

// Wrapper component for ForumPostDetailPage to get route params
function ForumPostDetailWrapper() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  return (
    <div dir="rtl">
      <ForumPostDetailPage
        postId={id || ''}
        onNavigateHome={() => navigate('/dashboard')}
        onNavigateForum={() => navigate('/forum')}
      />
    </div>
  );
}

export default function App() {
  const navigate = useNavigate();

  return (
    <Routes>
      {/* Auth Routes */}
      <Route 
        path="/login" 
        element={
          <LoginPage
            onNavigateDashboard={() => navigate('/dashboard')}
            onNavigateRegister={() => navigate('/register')}
            onNavigateForgotPassword={() => navigate('/forgot-password')}
          />
        } 
      />
      <Route 
        path="/register" 
        element={
          <RegisterPage
            onNavigateLogin={() => navigate('/login')}
            onNavigateDashboard={() => navigate('/dashboard')}
          />
        } 
      />
      <Route 
        path="/forgot-password" 
        element={
          <ForgotPasswordPage
            onNavigateLogin={() => navigate('/login')}
          />
        } 
      />
      <Route 
        path="/reset-password/:token" 
        element={
          <ResetPasswordPage
            onNavigateLogin={() => navigate('/login')}
          />
        } 
      />
      <Route 
        path="/verify-email" 
        element={
          <VerifyEmailPage
            onNavigateDashboard={() => navigate('/dashboard')}
            onNavigateLogin={() => navigate('/login')}
          />
        } 
      />

      {/* Protected Routes */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/summaries" 
        element={
          <ProtectedRoute>
            <div dir="rtl">
              <SummariesPage 
                onNavigateHome={() => navigate('/dashboard')} 
                onNavigateUpload={() => navigate('/upload')}
                onNavigateSummary={(id: number) => navigate(`/summaries/${id}`)}
              />
            </div>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/summaries/:id" 
        element={
          <ProtectedRoute>
            <SummaryDetailWrapper />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/upload" 
        element={
          <ProtectedRoute>
            <div dir="rtl">
              <UploadPage 
                onNavigateHome={() => navigate('/dashboard')}
                onNavigateSummaries={() => navigate('/summaries')}
                onNavigateSummary={(id: number) => navigate(`/summaries/${id}`)}
              />
            </div>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/forum" 
        element={
          <ProtectedRoute>
            <div dir="rtl">
              <ForumPage 
                onNavigateHome={() => navigate('/dashboard')} 
                onNavigateNewQuestion={() => navigate('/forum/new')}
                onNavigatePost={(id: number) => navigate(`/forum/${id}`)}
              />
            </div>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/forum/new" 
        element={
          <ProtectedRoute>
            <NewQuestionPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/forum/:id" 
        element={
          <ProtectedRoute>
            <ForumPostDetailWrapper />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/tools" 
        element={
          <ProtectedRoute>
            <div dir="rtl">
              <ToolsPage onNavigateHome={() => navigate('/dashboard')} />
            </div>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/profile" 
        element={
          <ProtectedRoute>
            <div dir="rtl">
              <ProfilePageNew onNavigateHome={() => navigate('/dashboard')} />
            </div>
          </ProtectedRoute>
        } 
      />

      {/* Redirects */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
