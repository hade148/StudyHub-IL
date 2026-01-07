import { motion } from 'motion/react';
import { useState } from 'react';
import { ChevronRight, Home, User, Download, Heart, MessageCircle } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { ProfileHeader } from './ProfileHeader';
import { ProfileStatsBar } from './ProfileStatsBar';
import { ActivityTimeline } from './ActivityTimeline';
import { ProfileSidebar } from './ProfileSidebar';


interface ProfilePageProps {
  onNavigateHome: () => void;
}

export function ProfilePage({ onNavigateHome }: ProfilePageProps) {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen bg-gray-50">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4 py-8 space-y-6"
      >
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-gray-600">
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
        <ProfileHeader user={userData} />

        {/* Stats Bar */}
        <ProfileStatsBar stats={userData.stats} />

        {/* Main Content with Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="overview" onValueChange={setActiveTab} className="w-full">
              <TabsList className="bg-white rounded-lg shadow-sm p-1 w-full flex-wrap h-auto">
                <TabsTrigger value="overview" className="flex-1 md:flex-none">
                  סקירה כללית
                </TabsTrigger>
                <TabsTrigger value="summaries" className="flex-1 md:flex-none">
                  <span className="flex items-center gap-1">
                    סיכומים שלי
                    <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 text-xs">
                      {userData.mySummaries.length}
                    </Badge>
                  </span>
                </TabsTrigger>
                <TabsTrigger value="favorites" className="flex-1 md:flex-none">
                  <span className="flex items-center gap-1">
                    מועדפים
                    <Badge className="bg-pink-100 text-pink-700 hover:bg-pink-100 text-xs">
                      {userData.favorites.length}
                    </Badge>
                  </span>
                </TabsTrigger>
                <TabsTrigger value="forum" className="flex-1 md:flex-none">
                  <span className="flex items-center gap-1">
                    פעילות בפורום
                    <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 text-xs">
                      {userData.forumActivity.length}
                    </Badge>
                  </span>
                </TabsTrigger>
                <TabsTrigger value="achievements" className="flex-1 md:flex-none">
                  <span className="flex items-center gap-1">
                    הישגים
                    <span>🏆</span>
                  </span>
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="mt-6 space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  {/* Activity Timeline */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <ActivityTimeline activities={userData.recentActivity} />
                  </div>

                  {/* Popular Uploads */}
                  <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
                    <h3 className="text-gray-900">הסיכומים הפופולריים ביותר</h3>
                    <div className="grid gap-4">
                      {userData.mySummaries.slice(0, 3).map((summary, index) => (
                        <motion.div
                          key={summary.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex-1">
                            <p className="text-gray-900">{summary.title}</p>
                            <p className="text-gray-600 text-sm">{summary.subject}</p>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Download className="w-4 h-4" />
                              {summary.downloads}
                            </div>
                            <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">
                              ⭐ {summary.rating}
                            </Badge>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* My Summaries Tab */}
              <TabsContent value="summaries" className="mt-6">
                <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-gray-900">הסיכומים שלי</h3>
                    <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                      + העלה סיכום חדש
                    </Button>
                  </div>
                  <div className="grid gap-4">
                    {userData.mySummaries.map((summary) => (
                      <motion.div
                        key={summary.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
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
                              <User className="w-4 h-4" />
                              {summary.views} צפיות
                            </div>
                            <div className="flex items-center gap-1">
                              ⭐ {summary.rating}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              ערוך
                            </Button>
                            <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                              מחק
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* Favorites Tab */}
              <TabsContent value="favorites" className="mt-6">
                <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
                  <h3 className="text-gray-900">סיכומים מועדפים</h3>
                  <div className="grid gap-4">
                    {userData.favorites.map((fav) => (
                      <motion.div
                        key={fav.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 border border-gray-200 rounded-lg hover:border-pink-300 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="text-gray-900">{fav.title}</h4>
                            <p className="text-gray-600 text-sm">מאת {fav.author}</p>
                            <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 mt-2">
                              {fav.subject}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">
                              ⭐ {fav.rating}
                            </Badge>
                            <Button variant="outline" size="sm">
                              <Heart className="w-4 h-4 fill-pink-500 text-pink-500" />
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* Forum Activity Tab */}
              <TabsContent value="forum" className="mt-6">
                <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
                  <h3 className="text-gray-900">פעילות בפורום</h3>
                  <div className="grid gap-4">
                    {userData.forumActivity.map((activity, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge
                                className={
                                  activity.type === 'question'
                                    ? 'bg-blue-100 text-blue-700 hover:bg-blue-100'
                                    : 'bg-green-100 text-green-700 hover:bg-green-100'
                                }
                              >
                                {activity.type === 'question' ? 'שאלה' : 'תשובה'}
                              </Badge>
                              {activity.type === 'answer' && activity.accepted && (
                                <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                                  ✓ תשובה מקובלת
                                </Badge>
                              )}
                            </div>
                            <h4 className="text-gray-900">{activity.title}</h4>
                            <p className="text-gray-600 text-sm mt-1">{activity.time}</p>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-gray-600">
                            {activity.type === 'question' && (
                              <>
                                <div className="flex items-center gap-1">
                                  <MessageCircle className="w-4 h-4" />
                                  {activity.answers}
                                </div>
                                <div className="flex items-center gap-1">
                                  👁️ {activity.views}
                                </div>
                              </>
                            )}
                            <div className="flex items-center gap-1">⬆️ {activity.votes}</div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* Achievements Tab */}
              <TabsContent value="achievements" className="mt-6">
                <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
                  <div>
                    <h3 className="text-gray-900 mb-2">ההישגים שלך</h3>
                    <p className="text-gray-600">
                      צבור נקודות והשג תגים על ידי תרומה לקהילה
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {userData.badges.map((badge) => (
                      <motion.div
                        key={badge.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ scale: 1.05 }}
                        className={`p-6 rounded-xl border-2 ${
                          badge.earned
                            ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-300'
                            : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="text-center space-y-3">
                          <span className="text-6xl">{badge.icon}</span>
                          <h4 className={badge.earned ? 'text-gray-900' : 'text-gray-500'}>
                            {badge.name}
                          </h4>
                          {badge.earned ? (
                            <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                              הושג ✓
                            </Badge>
                          ) : (
                            <div className="space-y-2">
                              <p className="text-sm text-gray-600">
                                {badge.progress}% להשגה
                              </p>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${badge.progress}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <ProfileSidebar stats={userData.stats} badges={userData.badges} />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
