import { motion } from 'motion/react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

interface ToolCardProps {
  tool: {
    id: number;
    name: string;
    description: string;
    icon: string;
    category: string;
    usageCount: number;
    gradient: string;
    featured?: boolean;
  };
  index: number;
}

export function ToolCard({ tool, index }: ToolCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      whileHover={{ scale: 1.05, boxShadow: '0 20px 50px rgba(0, 0, 0, 0.2)' }}
      whileTap={{ scale: 0.98 }}
      className={`bg-gradient-to-br ${tool.gradient} rounded-xl shadow-lg p-8 text-white transition-all duration-300 cursor-pointer relative overflow-hidden ${
        tool.featured ? 'md:col-span-2 lg:col-span-1' : ''
      }`}
    >
      {/* Featured Badge */}
      {tool.featured && (
        <Badge className="absolute top-4 left-4 bg-white/20 text-white border-white/30 backdrop-blur-sm hover:bg-white/20">
          פופולרי ביותר 🌟
        </Badge>
      )}

      {/* Decorative circles */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />

      {/* Content */}
      <div className="relative flex flex-col items-center text-center space-y-6">
        {/* Icon */}
        <motion.div
          whileHover={{ rotate: [0, -10, 10, -10, 0] }}
          transition={{ duration: 0.5 }}
          className="text-6xl md:text-7xl"
        >
          {tool.icon}
        </motion.div>

        {/* Tool Info */}
        <div className="space-y-2">
          <h3 className="text-white text-xl">{tool.name}</h3>
          <p className="text-white/90">{tool.description}</p>
        </div>

        {/* Usage Count */}
        <div className="flex items-center gap-2 text-white/80 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
          <span>🔥</span>
          <span>נוצל {tool.usageCount.toLocaleString('he-IL')} פעמים</span>
        </div>

        {/* Action Button */}
        <Button
          className="w-full bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm transition-all duration-300"
        >
          שימוש בכלי ←
        </Button>
      </div>
    </motion.div>
  );
}
