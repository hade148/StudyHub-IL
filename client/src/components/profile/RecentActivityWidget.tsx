import { motion } from 'motion/react';
import { Eye, MessageSquare, Star } from 'lucide-react';

interface RecentActivityWidgetProps {
  stats: {
    weeklyViews: number;
    newComments: number;
    averageRating: number;
  };
}

export function RecentActivityWidget({ stats }: RecentActivityWidgetProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white rounded-xl shadow-lg p-6 space-y-4"
    >
      <h3 className="text-gray-900">סטטיסטיקות אחרונות</h3>

      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 text-white p-2 rounded-lg">
              <Eye className="w-4 h-4" />
            </div>
            <span className="text-gray-700">צפיות השבוע</span>
          </div>
          <span className="text-blue-600">{stats.weeklyViews}</span>
        </div>

        <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="bg-purple-600 text-white p-2 rounded-lg">
              <MessageSquare className="w-4 h-4" />
            </div>
            <span className="text-gray-700">תגובות חדשות</span>
          </div>
          <span className="text-purple-600">{stats.newComments}</span>
        </div>

        <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="bg-yellow-600 text-white p-2 rounded-lg">
              <Star className="w-4 h-4" />
            </div>
            <span className="text-gray-700">דירוג ממוצע</span>
          </div>
          <span className="text-yellow-600">{stats.averageRating} ⭐</span>
        </div>
      </div>
    </motion.div>
  );
}
