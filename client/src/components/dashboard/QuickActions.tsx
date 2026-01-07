import { motion } from 'motion/react';
import { Upload, MessageCircle, Plus } from 'lucide-react';

interface QuickActionsProps {
  onNavigateUpload?: () => void;
  onNavigateForum?: () => void;
  onAddTool?: () => void;
}

export function QuickActions({ onNavigateUpload, onNavigateForum, onAddTool }: QuickActionsProps) {
  const actions = [
    {
      icon: Upload,
      label: 'העלאת סיכום',
      description: 'שתף את הסיכום שלך',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      hoverBg: 'hover:bg-blue-100',
      onClick: onNavigateUpload,
    },
    {
      icon: MessageCircle,
      label: 'שאלה בפורום',
      description: 'קבל עזרה מהקהילה',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      hoverBg: 'hover:bg-purple-100',
      onClick: onNavigateForum,
    },
    {
      icon: Plus,
      label: 'הוסף כלי',
      description: 'שתף כלי חדש',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      hoverBg: 'hover:bg-orange-100',
      onClick: onAddTool,
    },
  ];
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {actions.map((action, index) => (
        <motion.button
          key={action.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 + index * 0.08, duration: 0.4 }}
          whileHover={{ y: -4, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={action.onClick}
          className={`group relative bg-white rounded-2xl p-6 text-right border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300 ${action.hoverBg}`}
        >
          <div className="flex items-start gap-4">
            <div className={`${action.bgColor} p-3 rounded-xl group-hover:scale-110 transition-transform duration-300`}>
              <action.icon className={`w-6 h-6 ${action.color}`} />
            </div>
            <div className="flex-1 space-y-1">
              <h3 className="text-lg font-semibold text-gray-900">{action.label}</h3>
              <p className="text-sm text-gray-500">{action.description}</p>
            </div>
          </div>
          
          {/* Subtle arrow indicator */}
          <div className={`absolute bottom-4 left-4 w-6 h-6 ${action.color} opacity-0 group-hover:opacity-100 transition-opacity`}>
            ←
          </div>
        </motion.button>
      ))}
    </div>
  );
}
