import { motion } from 'motion/react';
import { Badge } from '../ui/badge';

interface AchievementShowcaseProps {
  achievements: Array<{
    id: number;
    name: string;
    icon: string;
    description: string;
    earnedDate: string;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
  }>;
}

const rarityColors = {
  common: 'from-gray-50 to-gray-100 border-gray-300',
  rare: 'from-blue-50 to-blue-100 border-blue-300',
  epic: 'from-purple-50 to-purple-100 border-purple-300',
  legendary: 'from-yellow-50 to-orange-100 border-yellow-400',
};

const rarityLabels = {
  common: 'נפוץ',
  rare: 'נדיר',
  epic: 'אפי',
  legendary: 'אגדי',
};

export function AchievementShowcase({ achievements }: AchievementShowcaseProps) {
  // Show only the 6 most recent achievements
  const recentAchievements = achievements.slice(0, 6);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-white rounded-xl shadow-lg p-6 space-y-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-gray-900">הישגים אחרונים 🏆</h3>
        <span className="text-sm text-gray-500">{achievements.length} הישגים</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {recentAchievements.map((achievement, index) => (
          <motion.div
            key={achievement.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 + index * 0.05 }}
            whileHover={{ scale: 1.05, y: -5 }}
            className={`bg-gradient-to-br ${rarityColors[achievement.rarity]} border-2 rounded-xl p-4 cursor-pointer transition-all duration-300`}
          >
            <div className="text-center space-y-2">
              <div className="text-4xl">{achievement.icon}</div>
              <p className="text-sm text-gray-900">{achievement.name}</p>
              <Badge className="bg-white/80 text-gray-700 text-xs">
                {rarityLabels[achievement.rarity]}
              </Badge>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
