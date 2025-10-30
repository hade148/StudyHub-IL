import { motion } from 'motion/react';
import { BookOpen, MessageCircle, Wrench, Users } from 'lucide-react';

const stats = [
  {
    icon: BookOpen,
    value: '1,247',
    label: 'סיכומים',
    gradient: 'from-blue-500 to-blue-600',
  },
  {
    icon: MessageCircle,
    value: '856',
    label: 'פוסטים בפורום',
    gradient: 'from-purple-500 to-purple-600',
  },
  {
    icon: Wrench,
    value: '12',
    label: 'כלים',
    gradient: 'from-green-500 to-green-600',
  },
  {
    icon: Users,
    value: '3,492',
    label: 'משתמשים פעילים',
    gradient: 'from-orange-500 to-orange-600',
  },
];

export function StatsBar() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1, duration: 0.5 }}
          whileHover={{ scale: 1.02 }}
          className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300"
        >
          <div className={`h-1 bg-gradient-to-r ${stat.gradient} rounded-t-xl`} />
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 bg-gradient-to-r ${stat.gradient} rounded-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl">{stat.value}</div>
              <p className="text-gray-600">{stat.label}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
