import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Star, ExternalLink, Heart, Calculator, RefreshCw, Calendar, Pen, Package } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback } from '../ui/avatar';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

interface ToolDetailDialogProps {
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
  isOpen: boolean;
  onClose: () => void;
  onToggleFavorite?: (toolId: number) => void;
  onRatingUpdate?: () => void;
}

const categoryIcons: Record<string, React.ElementType> = {
  'מחשבונים': Calculator,
  'ממירים': RefreshCw,
  'מתכננים': Calendar,
  'יצירה': Pen,
  'אחר': Package,
};

const categoryColors: Record<string, string> = {
  'מחשבונים': 'text-blue-600 bg-blue-100',
  'ממירים': 'text-purple-600 bg-purple-100',
  'מתכננים': 'text-green-600 bg-green-100',
  'יצירה': 'text-orange-600 bg-orange-100',
  'אחר': 'text-gray-600 bg-gray-100',
};

export function ToolDetailDialog({
  tool,
  isOpen,
  onClose,
  onToggleFavorite,
  onRatingUpdate,
}: ToolDetailDialogProps) {
  const { user } = useAuth();
  const [userRating, setUserRating] = useState<number | null>(null);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [ratingSubmitting, setRatingSubmitting] = useState(false);
  const [avgRating, setAvgRating] = useState<number | null>(tool.avgRating ?? null);
  const [totalRatings, setTotalRatings] = useState(tool.ratingCount ?? 0);
  const [isFavorite, setIsFavorite] = useState(tool.isFavorite ?? false);

  const IconComponent = categoryIcons[tool.category] || categoryIcons['אחר'];
  const iconColors = categoryColors[tool.category] || categoryColors['אחר'];

  // Update local favorite state when tool prop changes
  useEffect(() => {
    setIsFavorite(tool.isFavorite ?? false);
  }, [tool.isFavorite]);

  useEffect(() => {
    if (isOpen && user) {
      // Fetch user's rating
      const fetchRating = async () => {
        try {
          const response = await api.get(`/tools/${tool.id}/ratings`);
          setUserRating(response.data.userRating);
          setAvgRating(response.data.avgRating);
          setTotalRatings(response.data.totalRatings);
        } catch (err) {
          console.error('Error fetching rating:', err);
        }
      };
      fetchRating();
    }
  }, [isOpen, tool.id, user]);

  const handleRating = async (rating: number) => {
    if (!user) {
      alert('יש להתחבר כדי לדרג כלי');
      return;
    }

    try {
      setRatingSubmitting(true);
      const response = await api.post(`/tools/${tool.id}/rate`, { rating });

      // Update local state
      setUserRating(rating);
      setAvgRating(response.data.avgRating);
      
      // Fetch updated total ratings
      const ratingsResponse = await api.get(`/tools/${tool.id}/ratings`);
      setTotalRatings(ratingsResponse.data.totalRatings);
      
      // Notify parent to refresh data
      if (onRatingUpdate) {
        onRatingUpdate();
      }
    } catch (err: any) {
      console.error('Error submitting rating:', err);
      alert(err.response?.data?.error || 'שגיאה בשמירת דירוג');
    } finally {
      setRatingSubmitting(false);
    }
  };

  const handleUseTool = () => {
    window.open(tool.url, '_blank', 'noopener,noreferrer');
  };

  const handleFavoriteClick = () => {
    if (onToggleFavorite) {
      // Update local state immediately for instant UI feedback
      setIsFavorite(!isFavorite);
      onToggleFavorite(tool.id);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('he-IL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl ${iconColors}`}>
              <IconComponent className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{tool.title}</h2>
              <Badge className="mt-1">{tool.category}</Badge>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Description */}
          {tool.description && (
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-700">תיאור</h3>
              <p className="text-gray-600">{tool.description}</p>
            </div>
          )}

          {/* URL */}
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-700">קישור</h3>
            <a
              href={tool.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline flex items-center gap-2"
            >
              {tool.url}
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          {/* Added By */}
          {tool.addedBy && (
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-700">נוסף על ידי</h3>
              <div className="flex items-center gap-2">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs">
                    {tool.addedBy.fullName.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-gray-600">{tool.addedBy.fullName}</span>
              </div>
            </div>
          )}

          {/* Date */}
          {tool.createdAt && (
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-700">תאריך הוספה</h3>
              <p className="text-gray-600">{formatDate(tool.createdAt)}</p>
            </div>
          )}

          {/* Rating Section */}
          <div className="border-t border-gray-200 pt-4 space-y-4">
            <h3 className="font-semibold text-gray-700">דירוג</h3>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-gray-700 font-medium">דרג את הכלי:</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => handleRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(null)}
                      disabled={ratingSubmitting || !user}
                      className="transition-transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          (hoverRating !== null
                            ? star <= hoverRating
                            : userRating !== null && star <= userRating)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                {userRating && (
                  <span className="text-sm text-gray-500">
                    (דירגת {userRating} כוכבים)
                  </span>
                )}
              </div>
              {avgRating !== null && avgRating !== undefined && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{avgRating.toFixed(1)}</span>
                  <span className="text-sm">({totalRatings} דירוגים)</span>
                </div>
              )}
            </div>
            
            {!user && (
              <p className="text-sm text-gray-500 italic">
                יש להתחבר כדי לדרג כלי זה
              </p>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex gap-3">
          <Button
            onClick={handleUseTool}
            className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          >
            <ExternalLink className="w-4 h-4 ml-2" />
            שימוש בכלי
          </Button>
          {onToggleFavorite && (
            <Button
              onClick={handleFavoriteClick}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Heart
                className={`w-4 h-4 ${
                  isFavorite ? 'fill-red-500 text-red-500' : ''
                }`}
              />
              {isFavorite ? 'הסר ממועדפים' : 'הוסף למועדפים'}
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
