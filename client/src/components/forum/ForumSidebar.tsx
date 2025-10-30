import { motion } from 'motion/react';
import { TrendingUp } from 'lucide-react';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Badge } from '../ui/badge';

const popularTags = [
  { name: 'Python', count: 234 },
  { name: 'Java', count: 189 },
  { name: 'אלגוריתמים', count: 156 },
  { name: 'מתמטיקה', count: 145 },
  { name: 'C++', count: 123 },
  { name: 'מבני נתונים', count: 98 },
  { name: 'פיזיקה', count: 87 },
  { name: 'SQL', count: 76 },
  { name: 'חשבון', count: 65 },
  { name: 'רשתות', count: 54 },
];

const topContributors = [
  { name: 'שרה לוי', avatar: 'של', answers: 342, reputation: 4520 },
  { name: 'יוסי כהן', avatar: 'יכ', answers: 289, reputation: 3890 },
  { name: 'דני אברהם', avatar: 'דא', answers: 256, reputation: 3450 },
  { name: 'מיכל רוזן', avatar: 'מר', answers: 198, reputation: 2980 },
  { name: 'אלון ברק', avatar: 'אב', answers: 167, reputation: 2340 },
];

export function ForumSidebar() {
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
            <span className="text-blue-600">1,247</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">שאלות היום</span>
            <span className="text-green-600">23</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">זמן מענה ממוצע</span>
            <span className="text-purple-600">2.5 שעות</span>
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
