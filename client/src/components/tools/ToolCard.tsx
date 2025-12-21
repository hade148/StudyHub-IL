import { motion } from 'motion/react';
import { Heart } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

interface ToolCardProps {
  tool: {
    id: number;
    title: string;
    description: string;
    url: string;
    category: string;
    isFavorite?: boolean;
  };
  index: number;
  onToggleFavorite?: (toolId: number) => void;
}

const categoryGradients: Record<string, string> = {
  'מחשבונים': 'from-blue-500 to-cyan-500',
  'ממירים': 'from-purple-600 to-pink-600',
  'מתכננים': 'from-purple-500 to-pink-500',
  'יצירה': 'from-blue-600 to-purple-600',
  'אחר': 'from-indigo-500 to-purple-500',
};

const categoryEmojis: Record<string, string> = {
  'מחשבונים': '📊',
  'ממירים': '🔄',
  'מתכננים': '📅',
  'יצירה': '✏️',
  'אחר': '📦',
};

export function ToolCard({ tool, index, onToggleFavorite }: ToolCardProps) {
  const gradient = categoryGradients[tool.category] || categoryGradients['אחר'];
  const emoji = categoryEmojis[tool.category] || categoryEmojis['אחר'];

  const handleUseTool = () => {
    window.open(tool.url, '_blank', 'noopener,noreferrer');
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleFavorite) {
      onToggleFavorite(tool.id);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      whileHover={{ scale: 1.05, boxShadow: '0 20px 50px rgba(0, 0, 0, 0.2)' }}
      className={`bg-gradient-to-br ${gradient} rounded-xl shadow-lg p-8 text-white transition-all duration-300 relative overflow-hidden`}
    >
      {/* Favorite Button */}
      {onToggleFavorite && (
        <button
          onClick={handleFavoriteClick}
          className="absolute top-4 left-4 z-10 p-2 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-all"
        >
          <Heart
            className={`w-5 h-5 ${
              tool.isFavorite ? 'fill-white text-white' : 'text-white'
            }`}
          />
        </button>
      )}

      {/* Category Badge */}
      <Badge className="absolute top-4 right-4 bg-white/20 text-white border-white/30 backdrop-blur-sm hover:bg-white/20">
        {tool.category}
      </Badge>

      {/* Decorative circles */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />

      {/* Content */}
      <div className="relative flex flex-col items-center text-center space-y-6 mt-8">
        {/* Icon */}
        <motion.div
          whileHover={{ rotate: [0, -10, 10, -10, 0] }}
          transition={{ duration: 0.5 }}
          className="text-6xl md:text-7xl"
        >
          {emoji}
        </motion.div>

        {/* Tool Info */}
        <div className="space-y-2">
          <h3 className="text-white text-xl">{tool.title}</h3>
          {tool.description && (
            <p className="text-white/90">{tool.description}</p>
          )}
        </div>

        {/* Action Button */}
        <Button
          onClick={handleUseTool}
          className="w-full bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm transition-all duration-300"
        >
          שימוש בכלי ←
        </Button>
      </div>
    </motion.div>
  );
}
