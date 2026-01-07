import { motion } from 'motion/react';
import { Calculator, Calendar, FileText } from 'lucide-react';
import { Button } from '../ui/button';

interface Tool {
  name: string;
  description: string;
  icon?: any;
  gradient?: string;
  emoji: string;
}

interface PopularToolsProps {
  tools?: Tool[];
  onViewAll?: () => void;
}

export function PopularTools({ tools = [], onViewAll }: PopularToolsProps) {
  if (tools.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2>כלים פופולריים</h2>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-12 text-center space-y-4">
          <div className="text-6xl">🔧</div>
          <h3>אין כלים זמינים כרגע</h3>
          <p className="text-gray-600">כלים חדשים יופיעו כאן</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2>כלים פופולריים</h2>
        <button 
          className="text-blue-600 hover:text-blue-700 transition-colors"
          onClick={onViewAll}
        >
          כל הכלים ←
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {tools.map((tool, index) => (
          <motion.div
            key={tool.name}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.5 + index * 0.1, duration: 0.5 }}
            whileHover={{ scale: 1.05, boxShadow: '0 20px 50px rgba(0, 0, 0, 0.15)' }}
            className={`bg-gradient-to-br ${tool.gradient} rounded-xl shadow-lg p-6 text-white transition-all duration-300`}
          >
            <div className="flex flex-col items-center text-center space-y-4">
              {/* Icon */}
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
                <div className="text-4xl">{tool.emoji}</div>
              </div>

              {/* Content */}
              <div className="space-y-2">
                <h3 className="text-white">{tool.name}</h3>
                <p className="text-white/90">{tool.description}</p>
              </div>

              {/* Button */}
              <Button
                variant="secondary"
                className="w-full bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm"
              >
                שימוש בכלי ←
              </Button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
