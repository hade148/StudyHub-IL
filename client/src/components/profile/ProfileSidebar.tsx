import { motion } from 'motion/react';
import { Eye, Star, MessageCircle } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';

interface ProfileSidebarProps {
  stats: {
    views: number;
    averageRating: number;
    responseRate: number;
  };
  badges: Array<{
    id: number;
    name: string;
    icon: string;
    earned: boolean;
    progress?: number;
  }>;
}

export function ProfileSidebar({ stats, badges }: ProfileSidebarProps) {
  return (
    <div className="space-y-6">
      {/* Quick Stats Widget */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-xl shadow-lg p-6 space-y-4"
      >
        <h3>סטטיסטיקות מהירות</h3>

        <div className="space-y-4">
          {/* Views */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-600">
              <Eye className="w-5 h-5" />
              <span>צפיות</span>
            </div>
            <span className="text-blue-600">{stats.views.toLocaleString('he-IL')}</span>
          </div>

          {/* Average Rating */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-600">
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              <span>דירוג ממוצע</span>
            </div>
            <span className="text-yellow-600">{stats.averageRating} ⭐</span>
          </div>

          {/* Response Rate */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-600">
              <MessageCircle className="w-5 h-5" />
              <span>אחוז מענה</span>
            </div>
            <span className="text-green-600">{stats.responseRate}%</span>
          </div>
        </div>
      </motion.div>

      {/* Badges Display */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-white rounded-xl shadow-lg p-6 space-y-4"
      >
        <h3>תגים והישגים</h3>

        <div className="space-y-4">
          {badges.map((badge) => (
            <div
              key={badge.id}
              className={`p-4 rounded-lg border-2 ${
                badge.earned
                  ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-300'
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">{badge.icon}</span>
                <div className="flex-1">
                  <p className={badge.earned ? 'text-gray-900' : 'text-gray-500'}>
                    {badge.name}
                  </p>
                  {!badge.earned && badge.progress !== undefined && (
                    <p className="text-sm text-gray-500">{badge.progress}% להשגה</p>
                  )}
                </div>
                {badge.earned && (
                  <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                    הושג ✓
                  </Badge>
                )}
              </div>
              {!badge.earned && badge.progress !== undefined && (
                <Progress value={badge.progress} className="h-2" />
              )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Call to Action */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg p-6 text-white text-center space-y-3"
      >
        <span className="text-4xl">🎯</span>
        <h3 className="text-white">שפר את הפרופיל שלך</h3>
        <p className="opacity-90">העלה עוד סיכומים וענה על שאלות כדי לקבל תגים נוספים!</p>
      </motion.div>
    </div>
  );
}
