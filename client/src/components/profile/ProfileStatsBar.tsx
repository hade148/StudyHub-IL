import { motion } from 'motion/react';
import { FileText, HelpCircle, MessageCircle } from 'lucide-react';

interface ProfileStatsBarProps {
  stats: {
    uploads: number;
    forumPosts: number;
    forumAnswers: number;
  };
}

export function ProfileStatsBar({ stats }: ProfileStatsBarProps) {
  const statsData = [
    {
      label: 'סיכומים',
      value: stats.uploads,
      icon: FileText,
      gradient: 'from-blue-500 to-blue-600',
      bgGradient: 'from-blue-50 to-blue-100',
      subtext: 'שותפו',
      emoji: '📚',
    },
    {
      label: 'פוסטים',
      value: stats.forumPosts,
      icon: HelpCircle,
      gradient: 'from-purple-500 to-purple-600',
      bgGradient: 'from-purple-50 to-purple-100',
      subtext: 'שאלות שפורסמו',
      emoji: '❓',
    },
    {
      label: 'תגובות',
      value: stats.forumAnswers,
      icon: MessageCircle,
      gradient: 'from-green-500 to-green-600',
      bgGradient: 'from-green-50 to-green-100',
      subtext: 'תשובות שניתנו',
      emoji: '💬',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {statsData.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 + index * 0.1, duration: 0.3 }}
          whileHover={{ y: -4 }}
          className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg p-5 border border-white/20 hover:shadow-xl transition-all duration-300"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className={`bg-gradient-to-br ${stat.gradient} text-white p-2.5 rounded-xl shadow-md`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className={`bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent text-2xl md:text-3xl font-bold`}>
                {stat.value}
              </div>
              <p className="text-gray-600 text-sm font-medium">{stat.label}</p>
              {stat.subtext && (
                <p className="text-xs text-gray-500 mt-1">{stat.subtext}</p>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
