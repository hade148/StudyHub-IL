import { motion } from 'motion/react';
import { TrendingUp } from 'lucide-react';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Badge } from '../ui/badge';

interface ForumSidebarProps {
  stats?: {
    totalQuestions: number;
    todayQuestions: number;
    avgResponseTime: string;
  };
  popularTags?: Array<{ name: string; count: number }>;
  topContributors?: Array<{ name: string; avatar: string; answers: number; reputation: number }>;
}

export function ForumSidebar({ 
  stats = { totalQuestions: 0, todayQuestions: 0, avgResponseTime: '0' },
  popularTags = [],
  topContributors = []
}: ForumSidebarProps) {
  return (
    <div className="space-y-6">
      {/* Statistics Widget */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-xl shadow-lg p-6 space-y-4"
      >
        <div className="flex items-center gap-2">
          <span className="text-2xl">📊</span>
          <h3>סטטיסטיקות הפורום</h3>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">סה״כ שאלות</span>
            <span className="text-blue-600">{stats.totalQuestions}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">שאלות היום</span>
            <span className="text-green-600">{stats.todayQuestions}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">זמן מענה ממוצע</span>
            <span className="text-purple-600">{stats.avgResponseTime}</span>
          </div>
        </div>
      </motion.div>

      {/* Popular Tags */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-white rounded-xl shadow-lg p-6 space-y-4"
      >
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          <h3>תגיות פופולריות</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {popularTags.map((tag, index) => (
            <Badge
              key={tag.name}
              variant="outline"
              className="border-gray-300 hover:bg-blue-50 hover:border-blue-300 cursor-pointer transition-colors"
              style={{
                fontSize: Math.max(0.75, Math.min(1, tag.count / 200)) + 'rem',
              }}
            >
              {tag.name}
              <span className="mr-1 text-gray-500">({tag.count})</span>
            </Badge>
          ))}
        </div>
      </motion.div>

      {/* Top Contributors */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white rounded-xl shadow-lg p-6 space-y-4"
      >
        <div className="flex items-center gap-2">
          <span className="text-2xl">🏆</span>
          <h3>תורמים מובילים</h3>
        </div>
        <div className="space-y-3">
          {topContributors.map((contributor, index) => (
            <div
              key={contributor.name}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2 flex-1">
                <span className="text-gray-500 w-5">{index + 1}.</span>
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs">
                    {contributor.avatar}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="truncate">{contributor.name}</div>
                  <div className="text-xs text-gray-600">
                    {contributor.answers} תשובות
                  </div>
                </div>
              </div>
              <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                {contributor.reputation}
              </Badge>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
