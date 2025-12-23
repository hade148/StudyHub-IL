import { motion } from 'motion/react';
import { Upload, MessageCircle, Wrench, Plus } from 'lucide-react';
import { Button } from '../ui/button';

interface QuickActionsProps {
  onNavigateUpload?: () => void;
  onNavigateForum?: () => void;
  onNavigateTools?: () => void;
  onAddTool?: () => void;
}

export function QuickActions({ onNavigateUpload, onNavigateForum, onNavigateTools, onAddTool }: QuickActionsProps) {
  const actions = [
    {
      icon: Upload,
      label: 'העלאת סיכום חדש',
      emoji: '📤',
      gradient: 'from-blue-500 to-blue-600',
      hoverGradient: 'hover:from-blue-600 hover:to-blue-700',
      onClick: onNavigateUpload,
    },
    {
      icon: MessageCircle,
      label: 'שאלה חדשה בפורום',
      emoji: '❓',
      gradient: 'from-purple-500 to-purple-600',
      hoverGradient: 'hover:from-purple-600 hover:to-purple-700',
      onClick: onNavigateForum,
    },
    {
      icon: Wrench,
      label: 'כלים שימושיים',
      emoji: '🛠️',
      gradient: 'from-green-500 to-green-600',
      hoverGradient: 'hover:from-green-600 hover:to-green-700',
      onClick: onNavigateTools,
    },
    {
      icon: Plus,
      label: 'הוסף כלי חדש',
      emoji: '➕',
      gradient: 'from-orange-500 to-orange-600',
      hoverGradient: 'hover:from-orange-600 hover:to-orange-700',
      onClick: onAddTool,
    },
  ];
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {actions.map((action, index) => (
        <motion.div
          key={action.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            onClick={action.onClick}
            className={`w-full h-auto py-6 px-6 bg-gradient-to-r ${action.gradient} ${action.hoverGradient} text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300`}
          >
            <span className="flex items-center justify-center gap-3">
              <span className="text-2xl">{action.emoji}</span>
              <span>{action.label}</span>
            </span>
          </Button>
        </motion.div>
      ))}
    </div>
  );
}
