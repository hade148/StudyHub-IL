import { motion } from 'motion/react';
import { Upload, MessageCircle, Award, Heart, FileText } from 'lucide-react';

interface Activity {
  type: string;
  title: string;
  description: string;
  time: string;
}

interface ActivityTimelineProps {
  activities: Activity[];
}

const activityIcons: Record<string, any> = {
  upload: Upload,
  answer: MessageCircle,
  badge: Award,
  favorite: Heart,
  comment: MessageCircle,
  summary: FileText,
};

const activityColors: Record<string, string> = {
  upload: 'bg-blue-100 text-blue-600',
  answer: 'bg-green-100 text-green-600',
  badge: 'bg-yellow-100 text-yellow-600',
  favorite: 'bg-pink-100 text-pink-600',
  comment: 'bg-purple-100 text-purple-600',
  summary: 'bg-cyan-100 text-cyan-600',
};

export function ActivityTimeline({ activities }: ActivityTimelineProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-gray-900">פעילות אחרונה</h3>

      <div className="space-y-4">
        {activities.map((activity, index) => {
          const Icon = activityIcons[activity.type] || FileText;
          const colorClass = activityColors[activity.type] || 'bg-gray-100 text-gray-600';

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
              className="flex gap-4 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              {/* Icon */}
              <div className={`${colorClass} p-3 rounded-lg h-fit`}>
                <Icon className="w-5 h-5" />
              </div>

              {/* Content */}
              <div className="flex-1 space-y-1">
                <p className="text-gray-900">{activity.title}</p>
                <p className="text-gray-600">{activity.description}</p>
                <p className="text-gray-500 text-sm">{activity.time}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
