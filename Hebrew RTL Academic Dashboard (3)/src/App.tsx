import { useState } from 'react';
import { motion } from 'motion/react';
import { BookOpen, MessageCircle, Wrench, User } from 'lucide-react';
import { Button } from './components/ui/button';
import { Avatar, AvatarFallback } from './components/ui/avatar';
import { StatsBar } from './components/dashboard/StatsBar';
import { WelcomeSection } from './components/dashboard/WelcomeSection';
import { QuickActions } from './components/dashboard/QuickActions';
import { RecentSummaries } from './components/dashboard/RecentSummaries';
import { LatestForumPosts } from './components/dashboard/LatestForumPosts';
import { PopularTools } from './components/dashboard/PopularTools';
import { SummariesPage } from './components/summaries/SummariesPage';
import { UploadPage } from './components/summaries/UploadPage';
import { ForumPage } from './components/forum/ForumPage';
import { ToolsPage } from './components/tools/ToolsPage';
import { ProfilePageNew } from './components/profile/ProfilePageNew';
import { LoginPage } from './components/auth/LoginPage';
import { RegisterPage } from './components/auth/RegisterPage';
import { ForgotPasswordPage } from './components/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './components/auth/ResetPasswordPage';
import { VerifyEmailPage } from './components/auth/VerifyEmailPage';
import { AuthDevNav } from './components/auth/AuthDevNav';
import { NewQuestionPage } from './components/forum/NewQuestionPage';

type PageType = 'dashboard' | 'summaries' | 'forum' | 'tools' | 'profile' | 'upload' | 'login' | 'register' | 'forgot-password' | 'reset-password' | 'verify-email' | 'new-question';

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('login');

  // Helper to set page (with type safety)
  const navigateToPage = (page: string) => {
    setCurrentPage(page as PageType);
  };

  // Authentication Pages
  if (currentPage === 'login') {
    return (
      <>
        <LoginPage
          onNavigateDashboard={() => setCurrentPage('dashboard')}
          onNavigateRegister={() => setCurrentPage('register')}
          onNavigateForgotPassword={() => setCurrentPage('forgot-password')}
        />
        <AuthDevNav currentPage={currentPage} onNavigate={navigateToPage} />
      </>
    );
  }

  if (currentPage === 'register') {
    return (
      <>
        <RegisterPage
          onNavigateLogin={() => setCurrentPage('login')}
          onNavigateDashboard={() => setCurrentPage('dashboard')}
        />
        <AuthDevNav currentPage={currentPage} onNavigate={navigateToPage} />
      </>
    );
  }

  if (currentPage === 'forgot-password') {
    return (
      <>
        <ForgotPasswordPage
          onNavigateLogin={() => setCurrentPage('login')}
        />
        <AuthDevNav currentPage={currentPage} onNavigate={navigateToPage} />
      </>
    );
  }

  if (currentPage === 'reset-password') {
    return (
      <>
        <ResetPasswordPage
          onNavigateLogin={() => setCurrentPage('login')}
        />
        <AuthDevNav currentPage={currentPage} onNavigate={navigateToPage} />
      </>
    );
  }

  if (currentPage === 'verify-email') {
    return (
      <>
        <VerifyEmailPage
          onNavigateDashboard={() => setCurrentPage('dashboard')}
          onNavigateLogin={() => setCurrentPage('login')}
        />
        <AuthDevNav currentPage={currentPage} onNavigate={navigateToPage} />
      </>
    );
  }

  // Main App Pages
  if (currentPage === 'summaries') {
    return (
      <div dir="rtl">
        <SummariesPage 
          onNavigateHome={() => setCurrentPage('dashboard')} 
          onNavigateUpload={() => setCurrentPage('upload')}
        />
      </div>
    );
  }

  if (currentPage === 'upload') {
    return (
      <div dir="rtl">
        <UploadPage 
          onNavigateHome={() => setCurrentPage('dashboard')}
          onNavigateSummaries={() => setCurrentPage('summaries')}
        />
      </div>
    );
  }

  if (currentPage === 'forum') {
    return (
      <div dir="rtl">
        <ForumPage 
          onNavigateHome={() => setCurrentPage('dashboard')} 
          onNavigateNewQuestion={() => setCurrentPage('new-question')}
        />
      </div>
    );
  }

  if (currentPage === 'new-question') {
    return <NewQuestionPage />;
  }

  if (currentPage === 'tools') {
    return (
      <div dir="rtl">
        <ToolsPage onNavigateHome={() => setCurrentPage('dashboard')} />
      </div>
    );
  }

  if (currentPage === 'profile') {
    return (
      <div dir="rtl">
        <ProfilePageNew onNavigateHome={() => setCurrentPage('dashboard')} />
      </div>
    );
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentPage('login');
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
              onClick={() => setCurrentPage('summaries')}
              variant="outline"
              className="border-blue-600 text-blue-600 hover:bg-blue-50"
            >
              <BookOpen className="w-4 h-4 ml-2" />
              סיכומים
            </Button>
            <Button
              onClick={() => setCurrentPage('forum')}
              variant="outline"
              className="border-purple-600 text-purple-600 hover:bg-purple-50"
            >
              <MessageCircle className="w-4 h-4 ml-2" />
              פורום
            </Button>
            <Button
              onClick={() => setCurrentPage('tools')}
              variant="outline"
              className="border-green-600 text-green-600 hover:bg-green-50"
            >
              <Wrench className="w-4 h-4 ml-2" />
              כלים
            </Button>
            <div className="relative group">
              <button
                onClick={() => setCurrentPage('profile')}
                className="hover:opacity-80 transition-opacity"
              >
                <Avatar className="w-10 h-10 border-2 border-gray-300 hover:border-blue-500 transition-colors">
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                    יכ
                  </AvatarFallback>
                </Avatar>
              </button>
              {/* Dropdown Menu */}
              <div className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                <button
                  onClick={() => setCurrentPage('profile')}
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
          onNavigateUpload={() => setCurrentPage('upload')}
          onNavigateForum={() => setCurrentPage('forum')}
          onNavigateTools={() => setCurrentPage('tools')}
        />

        {/* Recent Summaries */}
        <RecentSummaries onViewAll={() => setCurrentPage('summaries')} />

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Latest Forum Posts - Takes 2 columns */}
          <div className="lg:col-span-2">
            <LatestForumPosts onViewAll={() => setCurrentPage('forum')} />
          </div>

          {/* Empty space or additional content */}
          <div className="hidden lg:block" />
        </div>

        {/* Popular Tools */}
        <PopularTools onViewAll={() => setCurrentPage('tools')} />

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
