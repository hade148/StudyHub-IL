import { motion } from 'motion/react';
import { FileText, Download, Trophy, MessageCircle } from 'lucide-react';

interface ProfileStatsBarProps {
  stats: {
    uploads: number;
    totalDownloads: number;
    reputation: number;
    forumPosts: number;
    monthlyDownloads?: number;
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
      label: 'הורדות',
      value: stats.totalDownloads.toLocaleString('he-IL'),
      icon: Download,
      gradient: 'from-purple-500 to-purple-600',
      bgGradient: 'from-purple-50 to-purple-100',
      subtext: stats.monthlyDownloads ? `+${stats.monthlyDownloads} החודש` : undefined,
      emoji: '⬇️',
    },
    {
      label: 'נקודות מוניטין',
      value: stats.reputation.toLocaleString('he-IL'),
      icon: Trophy,
      gradient: 'from-green-500 to-green-600',
      bgGradient: 'from-green-50 to-green-100',
      subtext: 'רמה גבוהה',
      emoji: '⭐',
    },
    {
      label: 'תרומות',
      value: stats.forumPosts,
      icon: MessageCircle,
      gradient: 'from-orange-500 to-orange-600',
      bgGradient: 'from-orange-50 to-orange-100',
      subtext: 'תשובות ותגובות',
      emoji: '💬',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {statsData.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 + index * 0.1, duration: 0.3 }}
          whileHover={{ scale: 1.05, y: -5 }}
          className={`bg-gradient-to-br ${stat.bgGradient} rounded-xl shadow-lg p-6 cursor-pointer transition-all duration-300 border-2 border-transparent hover:border-opacity-50`}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className={`bg-gradient-to-br ${stat.gradient} text-white p-3 rounded-xl`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <span className="text-3xl">{stat.emoji}</span>
            </div>
            <div>
              <div className={`bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent text-2xl md:text-3xl`}>
                {stat.value}
              </div>
              <p className="text-gray-600 text-sm">{stat.label}</p>
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
