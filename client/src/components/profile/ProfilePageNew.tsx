import { motion } from 'motion/react';
import { useState } from 'react';
import { ChevronRight, Home, Download, Heart, MessageCircle, Search, Edit, Trash2, Star, Eye, Upload as UploadIcon, TrendingUp } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { ProfileHeader } from './ProfileHeader';
import { ProfileStatsBar } from './ProfileStatsBar';
import { ActivityTimeline } from './ActivityTimeline';
import { AboutSection } from './AboutSection';
import { RecentActivityWidget } from './RecentActivityWidget';
import { AchievementsTab } from './AchievementsTab';
import { StatisticsTab } from './StatisticsTab';
import { EditProfileModal } from './EditProfileModal';
import { AchievementShowcase } from './AchievementShowcase';
import { useAuth } from '../../context/AuthContext';

// Empty initial data - will be populated from database
const staticUserData = {
  avatar: '',
  coverPhoto: '',
  linkedin: '',
  lastActive: new Date().toISOString(),
  isOnline: false,

  stats: {
    uploads: 0,
    totalDownloads: 0,
    reputation: 0,
    forumPosts: 0,
    totalViews: 0,
    averageRating: 0,
    responseRate: 0,
    weeklyViews: 0,
    monthlyDownloads: 0,
    followers: 0,
    following: 0,
    profileViews: 0,
  },

  recentActivity: [],
  mySummaries: [],
  favorites: [],
  forumQuestions: [],

  forumAnswers: [],

  topSummaries: [],

  earnedAchievements: [],
};

interface ProfilePageNewProps {
  onNavigateHome: () => void;
}

export function ProfilePageNew({ onNavigateHome }: ProfilePageNewProps) {
  const { user, updateProfile, uploadAvatar } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [favoritesTab, setFavoritesTab] = useState('summaries');
  const [forumTab, setForumTab] = useState('questions');
  const [sortBy, setSortBy] = useState('recent');
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Merge real user data from auth context with static data
  const userData = {
    id: user?.id || '',
    username: user?.email?.split('@')[0] || '',
    name: user?.fullName || '',
    email: user?.email || '',
    avatar: user?.avatar || staticUserData.avatar,
    coverPhoto: staticUserData.coverPhoto,
    role: user?.role?.toLowerCase() === 'admin' ? 'admin' : 'student',
    bio: user?.bio || '',
    location: user?.location || '',
    institution: user?.institution || '',
    fieldOfStudy: user?.fieldOfStudy || '',
    website: user?.website || '',
    linkedin: staticUserData.linkedin,
    interests: user?.interests || [],
    joinDate: user?.createdAt || new Date().toISOString(),
    lastActive: staticUserData.lastActive,
    isOnline: staticUserData.isOnline,
    stats: {
      ...staticUserData.stats,
      uploads: user?._count?.summaries || 0,
      forumPosts: user?._count?.forumPosts || 0,
    },
    recentActivity: staticUserData.recentActivity,
    mySummaries: staticUserData.mySummaries,
    favorites: staticUserData.favorites,
    forumQuestions: staticUserData.forumQuestions,
    forumAnswers: staticUserData.forumAnswers,
    topSummaries: staticUserData.topSummaries,
    earnedAchievements: staticUserData.earnedAchievements,
  };

  const handleEditProfile = () => {
    setSaveError(null);
    setIsEditModalOpen(true);
  };

  const extractErrorMessage = (error: any): string => {
    return error.response?.data?.error || 
           error.response?.data?.details?.[0]?.msg || 
           'שגיאה בעדכון הפרופיל. נסה שוב.';
  };

  const handleSaveProfile = async (data: any) => {
    try {
      setIsSaving(true);
      setSaveError(null);
      await updateProfile({
        fullName: data.name,
        bio: data.bio,
        location: data.location,
        institution: data.institution,
        fieldOfStudy: data.fieldOfStudy,
        website: data.website,
        interests: data.interests,
      });
      setIsEditModalOpen(false);
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      setSaveError(extractErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarUpload = async (file: File) => {
    try {
      await uploadAvatar(file);
    } catch (error: any) {
      console.error('Failed to upload avatar:', error);
      throw error; // Re-throw to let modal handle the error
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl" />
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4 py-8 space-y-6 relative z-10"
      >
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <button
            onClick={onNavigateHome}
            className="hover:text-blue-600 transition-colors flex items-center gap-1"
          >
            <Home className="w-4 h-4" />
            דף הבית
          </button>
          <ChevronRight className="w-4 h-4" />
          <span>פרופיל משתמש</span>
        </div>

        {/* Profile Header */}
        <ProfileHeader user={userData} onEditProfile={handleEditProfile} />

        {/* Stats Bar */}
        <ProfileStatsBar stats={userData.stats} />

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - 2/3 width */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="overview" onValueChange={setActiveTab} className="w-full">
              <TabsList className="bg-white rounded-lg shadow-sm p-1 w-full flex-wrap h-auto gap-1">
                <TabsTrigger value="overview" className="flex-1 md:flex-none text-sm md:text-base">
                   סקירה כללית
                </TabsTrigger>
                <TabsTrigger value="summaries" className="flex-1 md:flex-none text-sm md:text-base">
                  <span className="flex items-center gap-1">
                     סיכומים שלי
                    <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 text-xs">
                      {userData.mySummaries.length}
                    </Badge>
                  </span>
                </TabsTrigger>
                <TabsTrigger value="favorites" className="flex-1 md:flex-none text-sm md:text-base">
                  <span className="flex items-center gap-1">
                     מועדפים
                    <Badge className="bg-pink-100 text-pink-700 hover:bg-pink-100 text-xs">
                      {userData.favorites.length}
                    </Badge>
                  </span>
                </TabsTrigger>
                <TabsTrigger value="forum" className="flex-1 md:flex-none text-sm md:text-base">
                  <span className="flex items-center gap-1">
                     פעילות בפורום
                    <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 text-xs">
                      {userData.forumQuestions.length + userData.forumAnswers.length}
                    </Badge>
                  </span>
                </TabsTrigger>
                <TabsTrigger value="achievements" className="flex-1 md:flex-none text-sm md:text-base">
                   הישגים
                </TabsTrigger>
                <TabsTrigger value="statistics" className="flex-1 md:flex-none text-sm md:text-base">
                   סטטיסטיקות
                </TabsTrigger>
              </TabsList>

              {/* Tab 1 - Overview */}
              <TabsContent value="overview" className="mt-6 space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  {/* Activity Timeline */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <ActivityTimeline activities={userData.recentActivity} />
                  </div>

                  {/* Popular Uploads */}
                  <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
                    <h3 className="text-gray-900">הסיכומים הפופולריים ביותר 🔥</h3>
                    <div className="grid gap-4">
                      {userData.topSummaries.map((summary, index) => (
                        <motion.div
                          key={summary.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg hover:from-blue-100 hover:to-purple-100 transition-all duration-300 border border-blue-200"
                        >
                          <div className="flex items-center gap-4 flex-1">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white text-xl">
                              #{index + 1}
                            </div>
                            <div className="flex-1">
                              <p className="text-gray-900">{summary.title}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Download className="w-4 h-4" />
                              {summary.downloads}
                            </div>
                            <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">
                               {summary.rating}
                            </Badge>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Tab 2 - My Summaries */}
              <TabsContent value="summaries" className="mt-6">
                <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
                  {/* Filter Bar */}
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                      <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        placeholder="חפש בסיכומים שלי..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pr-10 text-right"
                      />
                    </div>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-full md:w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="recent">אחרונים</SelectItem>
                        <SelectItem value="popular">פופולריים</SelectItem>
                        <SelectItem value="rating">דירוג</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                      <UploadIcon className="w-4 h-4 ml-2" />
                      העלה סיכום חדש
                    </Button>
                  </div>

                  {/* Summaries Grid */}
                  <div className="grid gap-4">
                    {userData.mySummaries.map((summary, index) => (
                      <motion.div
                        key={summary.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all duration-300"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="text-gray-900">{summary.title}</h4>
                            <p className="text-gray-600 text-sm">{summary.subject}</p>
                          </div>
                          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                            {summary.uploadDate}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Download className="w-4 h-4" />
                              {summary.downloads} הורדות
                            </div>
                            <div className="flex items-center gap-1">
                              <Eye className="w-4 h-4" />
                              {summary.views} צפיות
                            </div>
                            <div className="flex items-center gap-1">
                              ⭐ {summary.rating}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <TrendingUp className="w-4 h-4 ml-2" />
                              סטטיסטיקות
                            </Button>
                            <Button variant="outline" size="sm">
                              <Edit className="w-4 h-4 ml-2" />
                              ערוך
                            </Button>
                            <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Empty State */}
                  {userData.mySummaries.length === 0 && (
                    <div className="text-center py-12">
                      <div className="text-6xl mb-4">📭</div>
                      <h4 className="text-gray-900 mb-2">עדיין לא העלת סיכומים</h4>
                      <p className="text-gray-600 mb-4">התחל לשתף את הידע שלך עם הקהילה</p>
                      <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                        <UploadIcon className="w-4 h-4 ml-2" />
                        העלה סיכום ראשון
                      </Button>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Tab 3 - Favorites */}
              <TabsContent value="favorites" className="mt-6">
                <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
                  {/* Sub-tabs */}
                  <Tabs defaultValue="summaries" onValueChange={setFavoritesTab}>
                    <TabsList className="bg-gray-100">
                      <TabsTrigger value="summaries">סיכומים</TabsTrigger>
                      <TabsTrigger value="posts">פוסטים</TabsTrigger>
                    </TabsList>

                    <TabsContent value="summaries" className="mt-4">
                      <div className="grid gap-4">
                        {userData.favorites.map((fav, index) => (
                          <motion.div
                            key={fav.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="p-4 border border-gray-200 rounded-lg hover:border-pink-300 hover:shadow-md transition-all duration-300"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="text-gray-900">{fav.title}</h4>
                                <p className="text-gray-600 text-sm">מאת {fav.author}</p>
                                <div className="flex items-center gap-2 mt-2">
                                  <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                                    {fav.subject}
                                  </Badge>
                                  <span className="text-sm text-gray-500">{fav.downloads} הורדות</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">
                                   {fav.rating}
                                </Badge>
                                <Button variant="outline" size="sm" className="text-pink-600 hover:text-pink-700">
                                  <Heart className="w-4 h-4 fill-pink-500 text-pink-500" />
                                </Button>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="posts" className="mt-4">
                      <div className="text-center py-12">
                        <div className="text-6xl mb-4"></div>
                        <h4 className="text-gray-900 mb-2">אין פוסטים מועדפים</h4>
                        <p className="text-gray-600">פוסטים שתשמור יופיעו כאן</p>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </TabsContent>

              {/* Tab 4 - Forum Activity */}
              <TabsContent value="forum" className="mt-6">
                <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
                  <Tabs defaultValue="questions" onValueChange={setForumTab}>
                    <TabsList className="bg-gray-100">
                      <TabsTrigger value="questions">
                         שאלות שלי ({userData.forumQuestions.length})
                      </TabsTrigger>
                      <TabsTrigger value="answers">
                         תשובות שלי ({userData.forumAnswers.length})
                      </TabsTrigger>
                    </TabsList>

                    {/* Questions List */}
                    <TabsContent value="questions" className="mt-4">
                      <div className="space-y-4">
                        {userData.forumQuestions.map((question, index) => (
                          <motion.div
                            key={question.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:shadow-md transition-all duration-300"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                                    {question.category}
                                  </Badge>
                                  {question.status === 'answered' ? (
                                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                                      ✓ נענתה
                                    </Badge>
                                  ) : (
                                    <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">
                                      ⏳ ממתינה
                                    </Badge>
                                  )}
                                </div>
                                <h4 className="text-gray-900">{question.title}</h4>
                                <p className="text-gray-500 text-sm mt-1">{question.time}</p>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4 text-sm text-gray-600">
                                <div className="flex items-center gap-1">
                                  <MessageCircle className="w-4 h-4" />
                                  {question.answers}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Eye className="w-4 h-4" />
                                  {question.views}
                                </div>
                                <div className="flex items-center gap-1">
                                  ⬆️ {question.votes}
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button variant="outline" size="sm">
                                  <Edit className="w-4 h-4 ml-2" />
                                  ערוך
                                </Button>
                                <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </TabsContent>

                    {/* Answers List */}
                    <TabsContent value="answers" className="mt-4">
                      <div className="space-y-4">
                        {userData.forumAnswers.map((answer, index) => (
                          <motion.div
                            key={answer.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:shadow-md transition-all duration-300"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                {answer.accepted && (
                                  <Badge className="bg-green-100 text-green-700 hover:bg-green-100 mb-2">
                                    ✓ תשובה מקובלת
                                  </Badge>
                                )}
                                <h4 className="text-gray-900 mb-1">
                                  <span className="text-gray-500 text-sm">תשובה לשאלה:</span> {answer.questionTitle}
                                </h4>
                                <p className="text-gray-600 text-sm">{answer.answerPreview}</p>
                                <p className="text-gray-500 text-sm mt-2">{answer.time}</p>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1 text-sm text-gray-600">
                                ⬆️ {answer.votes} הצבעות חיוביות
                              </div>
                              <Button variant="outline" size="sm">
                                צפה בתשובה
                              </Button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </TabsContent>

              {/* Tab 5 - Achievements */}
              <TabsContent value="achievements" className="mt-6">
                <AchievementsTab />
              </TabsContent>

              {/* Tab 6 - Statistics */}
              <TabsContent value="statistics" className="mt-6">
                <StatisticsTab />
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar - 1/3 width */}
          <div className="lg:col-span-1 space-y-6">
            {/* About Section */}
            <AboutSection user={userData} />

            {/* Recent Activity Widget */}
            <RecentActivityWidget
              stats={{
                weeklyViews: userData.stats.weeklyViews,
                newComments: 12,
                averageRating: userData.stats.averageRating,
              }}
            />
          </div>
        </div>
      </motion.div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSaveError(null);
        }}
        user={userData}
        onSave={handleSaveProfile}
        onAvatarUpload={handleAvatarUpload}
        isSaving={isSaving}
        error={saveError}
      />
    </div>
  );
}
