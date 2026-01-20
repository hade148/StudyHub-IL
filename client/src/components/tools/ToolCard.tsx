import { motion } from 'framer-motion';
import { Heart, Star, Calculator, RefreshCw, Calendar, Pen, Package, ExternalLink } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

interface ToolCardProps {
  tool: {
    id: number;
    title: string;
    description: string;
    url: string;
    category: string;
    avgRating?: number | null;
    ratingCount?: number;
    isFavorite?: boolean;
    addedBy?: {
      id: number;
      fullName: string;
    };
    createdAt?: string;
  };
  index: number;
  onToggleFavorite?: (toolId: number) => void;
  onCardClick?: () => void;
}

const categoryIcons: Record<string, React.ElementType> = {
  'מחשבונים': Calculator,
  'ממירים': RefreshCw,
  'מתכננים': Calendar,
  'יצירה': Pen,
  'אחר': Package,
};

const categoryColors: Record<string, { bg: string; border: string; icon: string }> = {
  'מחשבונים': { bg: 'bg-blue-50', border: 'border-blue-200', icon: 'text-blue-600' },
  'ממירים': { bg: 'bg-purple-50', border: 'border-purple-200', icon: 'text-purple-600' },
  'מתכננים': { bg: 'bg-green-50', border: 'border-green-200', icon: 'text-green-600' },
  'יצירה': { bg: 'bg-orange-50', border: 'border-orange-200', icon: 'text-orange-600' },
  'אחר': { bg: 'bg-gray-50', border: 'border-gray-200', icon: 'text-gray-600' },
};

export function ToolCard({ tool, index, onToggleFavorite, onCardClick }: ToolCardProps) {
  const IconComponent = categoryIcons[tool.category] || categoryIcons['אחר'];
  const colors = categoryColors[tool.category] || categoryColors['אחר'];

  const handleUseTool = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(tool.url, '_blank', 'noopener,noreferrer');
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleFavorite) {
      onToggleFavorite(tool.id);
    }
  };

  const handleCardClick = () => {
    if (onCardClick) {
      onCardClick();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      whileHover={{ y: -4, boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)' }}
      onClick={handleCardClick}
      className={`${colors.bg} border-2 ${colors.border} rounded-xl shadow-sm hover:shadow-md p-6 transition-all duration-300 relative cursor-pointer group`}
    >
      {/* Favorite Button */}
      {onToggleFavorite && (
        <button
          onClick={handleFavoriteClick}
          className="absolute top-4 left-4 z-10 p-2 rounded-lg bg-white hover:bg-gray-50 border border-gray-200 shadow-sm transition-all"
          aria-label={tool.isFavorite ? 'הסר ממועדפים' : 'הוסף למועדפים'}
        >
          <Heart
            className={`w-4 h-4 ${
              tool.isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'
            }`}
          />
        </button>
      )}

      {/* Category Badge */}
      <Badge className={`absolute top-4 right-4 ${colors.bg} ${colors.icon} border ${colors.border} font-medium`}>
        {tool.category}
      </Badge>

      {/* Rating Badge */}
      {tool.avgRating !== null && tool.avgRating !== undefined && tool.avgRating > 0 && (
        <Badge className="absolute top-14 right-4 bg-yellow-50 text-yellow-700 border border-yellow-200 flex items-center gap-1">
          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
          <span className="font-semibold">{tool.avgRating.toFixed(1)}</span>
          {tool.ratingCount !== undefined && tool.ratingCount > 0 && (
            <span className="text-xs opacity-75">({tool.ratingCount})</span>
          )}
        </Badge>
      )}

      {/* Content */}
      <div className="relative flex flex-col items-center text-center space-y-4 mt-12">
        {/* Icon */}
        <motion.div
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.2 }}
          className={`${colors.icon} p-4 rounded-2xl bg-white border-2 ${colors.border} shadow-sm`}
        >
          <IconComponent className="w-10 h-10" />
        </motion.div>

        {/* Tool Info */}
        <div className="space-y-2 min-h-[80px] flex flex-col justify-center">
          <h3 className="text-gray-900 text-lg font-semibold">{tool.title}</h3>
          {tool.description && (
            <p className="text-gray-600 text-sm line-clamp-2">{tool.description}</p>
          )}
        </div>

        {/* Action Button */}
        <Button
          onClick={handleUseTool}
          className="w-full bg-white hover:bg-gray-50 text-gray-900 border-2 border-gray-200 shadow-sm group-hover:border-blue-300 group-hover:text-blue-600 transition-all duration-300 flex items-center justify-center gap-2"
        >
          שימוש בכלי
          <ExternalLink className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
}
