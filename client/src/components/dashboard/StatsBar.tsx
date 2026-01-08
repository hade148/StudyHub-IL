import { motion } from 'motion/react';
import { BookOpen, MessageCircle, Wrench, Users } from 'lucide-react';

interface Stat {
  icon: any;
  value: string | number;
  label: string;
  color: string;
  bgColor: string;
}

interface StatsBarProps {
  stats?: Stat[];
}

export function StatsBar({ stats = [] }: StatsBarProps) {
  // Default empty state
  const defaultStats: Stat[] = [
    {
      icon: BookOpen,
      value: '0',
      label: 'סיכומים',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      icon: MessageCircle,
      value: '0',
      label: 'פוסטים בפורום',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      icon: Wrench,
      value: '0',
      label: 'כלים',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      icon: Users,
      value: '0',
      label: 'משתמשים פעילים',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  const displayStats = stats.length > 0 ? stats : defaultStats;
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {displayStats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.08, duration: 0.4 }}
          whileHover={{ y: -4 }}
          className="group relative bg-white rounded-2xl p-6 border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300"
        >
          <div className="flex items-start justify-between">
            <div className="space-y-3 flex-1">
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">{stat.label}</p>
              <div className="text-4xl font-bold text-gray-900">{stat.value}</div>
            </div>
            <div className={`${stat.bgColor} p-3 rounded-xl group-hover:scale-110 transition-transform duration-300`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
