import { motion } from 'motion/react';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';

interface Achievement {
  id: number;
  name: string;
  icon: string;
  description: string;
  earned: boolean;
  earnedDate?: string;
  progress?: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  category: 'general' | 'summaries' | 'forum' | 'special';
}

const achievements: Achievement[] = [
  // General
  {
    id: 1,
    name: 'ברוכים הבאים',
    icon: '👋',
    description: 'הצטרף לפלטפורמה',
    earned: true,
    earnedDate: '2023-10-15',
    rarity: 'common',
    category: 'general',
  },
  {
    id: 2,
    name: 'מתחיל',
    icon: '🎓',
    description: 'השלם את הגדרת הפרופיל',
    earned: true,
    earnedDate: '2023-10-16',
    rarity: 'common',
    category: 'general',
  },
  {
    id: 3,
    name: 'פעיל',
    icon: '⚡',
    description: 'התחבר 7 ימים רצופים',
    earned: true,
    earnedDate: '2023-11-01',
    rarity: 'rare',
    category: 'general',
  },
  {
    id: 4,
    name: 'אגדה',
    icon: '👑',
    description: 'הגע ל-1000 נקודות מוניטין',
    earned: false,
    progress: 45.6,
    rarity: 'legendary',
    category: 'general',
  },

  // Summaries
  {
    id: 5,
    name: 'תרומה ראשונה',
    icon: '🎉',
    description: 'העלה את הסיכום הראשון שלך',
    earned: true,
    earnedDate: '2023-10-20',
    rarity: 'common',
    category: 'summaries',
  },
  {
    id: 6,
    name: '10 סיכומים',
    icon: '📚',
    description: 'העלה 10 סיכומים',
    earned: true,
    earnedDate: '2024-03-15',
    rarity: 'rare',
    category: 'summaries',
  },
  {
    id: 7,
    name: '100 הורדות',
    icon: '⭐',
    description: 'הגע ל-100 הורדות על סיכום אחד',
    earned: true,
    earnedDate: '2024-11-20',
    rarity: 'rare',
    category: 'summaries',
  },
  {
    id: 8,
    name: 'סופרסטאר',
    icon: '🌟',
    description: 'הגע ל-1000 הורדות סה"כ',
    earned: true,
    earnedDate: '2025-09-10',
    rarity: 'epic',
    category: 'summaries',
  },
  {
    id: 9,
    name: 'איכות מעל הכל',
    icon: '💎',
    description: 'קבל דירוג 5.0 על 5 סיכומים',
    earned: false,
    progress: 60,
    rarity: 'epic',
    category: 'summaries',
  },
  {
    id: 10,
    name: 'מלך הסיכומים',
    icon: '👑',
    description: 'העלה 100 סיכומים',
    earned: false,
    progress: 24,
    rarity: 'legendary',
    category: 'summaries',
  },

  // Forum
  {
    id: 11,
    name: 'שאלה ראשונה',
    icon: '❓',
    description: 'שאל את השאלה הראשונה שלך',
    earned: true,
    earnedDate: '2023-11-05',
    rarity: 'common',
    category: 'forum',
  },
  {
    id: 12,
    name: 'תשובה ראשונה',
    icon: '💡',
    description: 'ענה על השאלה הראשונה',
    earned: true,
    earnedDate: '2023-11-06',
    rarity: 'common',
    category: 'forum',
  },
  {
    id: 13,
    name: 'מומחה פורום',
    icon: '💬',
    description: 'ענה על 50 שאלות בפורום',
    earned: false,
    progress: 66,
    rarity: 'epic',
    category: 'forum',
  },
  {
    id: 14,
    name: 'תשובה מקובלת',
    icon: '✅',
    description: 'קבל 10 תשובות מקובלות',
    earned: true,
    earnedDate: '2024-06-12',
    rarity: 'rare',
    category: 'forum',
  },
  {
    id: 15,
    name: 'גורו',
    icon: '🧙',
    description: 'ענה על 200 שאלות בפורום',
    earned: false,
    progress: 16.5,
    rarity: 'legendary',
    category: 'forum',
  },

  // Special
  {
    id: 16,
    name: 'בקיץ הראשון',
    icon: '🏖️',
    description: 'הצטרף במהלך קיץ 2023',
    earned: false,
    rarity: 'rare',
    category: 'special',
  },
  {
    id: 17,
    name: 'אוהב לעזור',
    icon: '❤️',
    description: 'קבל 100 הצבעות חיוביות',
    earned: true,
    earnedDate: '2024-08-22',
    rarity: 'epic',
    category: 'special',
  },
  {
    id: 18,
    name: 'חבר קהילה',
    icon: '🤝',
    description: 'הזמן 5 חברים לפלטפורמה',
    earned: false,
    progress: 40,
    rarity: 'rare',
    category: 'special',
  },
  {
    id: 19,
    name: 'משפיע',
    icon: '🎯',
    description: 'קבל 50 עוקבים',
    earned: false,
    progress: 90,
    rarity: 'epic',
    category: 'special',
  },
  {
    id: 20,
    name: 'מציא נדיר',
    icon: '🦄',
    description: 'השג הישג סודי מיוחד',
    earned: false,
    progress: 0,
    rarity: 'legendary',
    category: 'special',
  },
];

const rarityColors = {
  common: {
    bg: 'from-gray-50 to-gray-100',
    border: 'border-gray-300',
    badge: 'bg-gray-100 text-gray-700',
    text: 'text-gray-600',
  },
  rare: {
    bg: 'from-blue-50 to-blue-100',
    border: 'border-blue-300',
    badge: 'bg-blue-100 text-blue-700',
    text: 'text-blue-600',
  },
  epic: {
    bg: 'from-purple-50 to-purple-100',
    border: 'border-purple-300',
    badge: 'bg-purple-100 text-purple-700',
    text: 'text-purple-600',
  },
  legendary: {
    bg: 'from-yellow-50 to-orange-100',
    border: 'border-yellow-400',
    badge: 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white',
    text: 'text-orange-600',
  },
};

const rarityLabels = {
  common: 'נפוץ',
  rare: 'נדיר',
  epic: 'אפי',
  legendary: 'אגדי',
};

const categoryLabels = {
  general: '🏆 כלליים',
  summaries: '📚 סיכומים',
  forum: '💬 פורום',
  special: '🎯 מיוחדים',
};

interface AchievementCardProps {
  achievement: Achievement;
  index: number;
}

function AchievementCard({ achievement, index }: AchievementCardProps) {
  const colors = rarityColors[achievement.rarity];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ scale: 1.03, y: -5 }}
      className={`p-6 rounded-xl border-2 ${
        achievement.earned
          ? `bg-gradient-to-br ${colors.bg} ${colors.border}`
          : 'bg-gray-50 border-gray-200'
      } transition-all duration-300 cursor-pointer`}
    >
      <div className="text-center space-y-3">
        {/* Icon */}
        <div className={`text-6xl ${achievement.earned ? 'grayscale-0' : 'grayscale opacity-40'}`}>
          {achievement.icon}
        </div>

        {/* Name */}
        <h4 className={achievement.earned ? 'text-gray-900' : 'text-gray-500'}>
          {achievement.name}
        </h4>

        {/* Description */}
        <p className={`text-sm ${achievement.earned ? 'text-gray-600' : 'text-gray-400'}`}>
          {achievement.description}
        </p>

        {/* Rarity Badge */}
        <Badge className={colors.badge}>
          {rarityLabels[achievement.rarity]}
        </Badge>

        {/* Status */}
        {achievement.earned ? (
          <div className="space-y-1">
            <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
              הושג ✓
            </Badge>
            {achievement.earnedDate && (
              <p className="text-xs text-gray-500">
                {new Date(achievement.earnedDate).toLocaleDateString('he-IL', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-gray-600">{achievement.progress}% להשגה</p>
            <Progress value={achievement.progress || 0} className="h-2" />
          </div>
        )}
      </div>
    </motion.div>
  );
}

export function AchievementsTab() {
  const earnedCount = achievements.filter((a) => a.earned).length;
  const totalCount = achievements.length;

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-white mb-2">ההישגים שלך</h3>
            <p className="text-blue-100">
              צבור נקודות והשג תגים על ידי תרומה לקהילה
            </p>
          </div>
          <div className="text-left">
            <div className="text-4xl">{earnedCount}/{totalCount}</div>
            <p className="text-blue-100">הושגו</p>
          </div>
        </div>
        <div className="mt-4">
          <Progress value={(earnedCount / totalCount) * 100} className="h-3 bg-white/20" />
        </div>
      </motion.div>

      {/* Category Tabs */}
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="bg-white rounded-lg shadow-sm p-1 w-full flex-wrap h-auto">
          {Object.entries(categoryLabels).map(([key, label]) => (
            <TabsTrigger key={key} value={key} className="flex-1 md:flex-none">
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        {Object.keys(categoryLabels).map((category) => (
          <TabsContent key={category} value={category} className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {achievements
                .filter((a) => a.category === category)
                .map((achievement, index) => (
                  <AchievementCard
                    key={achievement.id}
                    achievement={achievement}
                    index={index}
                  />
                ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Rarity Legend */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-xl shadow-lg p-6"
      >
        <h4 className="text-gray-900 mb-4">רמות נדירות</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(rarityLabels).map(([key, label]) => {
            const colors = rarityColors[key as keyof typeof rarityColors];
            return (
              <div
                key={key}
                className={`p-4 rounded-lg border-2 ${colors.border} bg-gradient-to-br ${colors.bg} text-center`}
              >
                <Badge className={colors.badge}>{label}</Badge>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
