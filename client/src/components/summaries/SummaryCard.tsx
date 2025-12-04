import { motion } from 'motion/react';
import { Eye, Download, MessageCircle, Heart, FileText, Building2, Star } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

interface SummaryCardProps {
  summary: {
    id: number;
    title: string;
    course: string;
    courseFullName: string;
    institution: string;
    rating: number;
    ratingsCount?: number;
    views: number;
    downloads: number;
    comments: number;
    fileType: string;
    fileSize: string;
    pages: number;
    description: string;
    uploader: string;
    uploadDate: string;
    tags: string[];
    isFavorite: boolean;
    userRating?: number;
  };
  index: number;
  onClick?: () => void;
  onRatingChange?: (id: number, newRating: number, newAvgRating: number) => void;
}

export function SummaryCard({ summary, index, onClick, onRatingChange }: SummaryCardProps) {
  const { isAuthenticated } = useAuth();
  const [isFavorite, setIsFavorite] = useState(summary.isFavorite);
  const [userRating, setUserRating] = useState(summary.userRating || 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [avgRating, setAvgRating] = useState(summary.rating);
  const [ratingsCount, setRatingsCount] = useState(summary.ratingsCount || 0);
  const [isRating, setIsRating] = useState(false);
  const [showRatingSection, setShowRatingSection] = useState(false);

  const handleRating = async (rating: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated || isRating) return;

    try {
      setIsRating(true);
      const response = await api.post(`/summaries/${summary.id}/rate`, { rating });
      setUserRating(rating);
      setAvgRating(response.data.avgRating);
      // Update ratings count (increment if this is a new rating)
      if (!summary.userRating) {
        setRatingsCount(prev => prev + 1);
      }
      onRatingChange?.(summary.id, rating, response.data.avgRating);
    } catch (error) {
      console.error('Error submitting rating:', error);
    } finally {
      setIsRating(false);
    }
  };

  const toggleRatingSection = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowRatingSection(!showRatingSection);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group cursor-pointer"
      onClick={onClick}
    >
      {/* Thumbnail Section */}
      <div className="relative bg-gradient-to-br from-blue-50 to-purple-50 p-8 flex items-center justify-center h-48">
        <FileText className="w-20 h-20 text-blue-400" />
        
        {/* Favorite Button */}
        <button
          onClick={(e) => { e.stopPropagation(); setIsFavorite(!isFavorite); }}
          className="absolute top-3 left-3 bg-white rounded-full p-2 shadow-md hover:scale-110 transition-transform"
        >
          <Heart
            className={`w-5 h-5 ${
              isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'
            }`}
          />
        </button>

        {/* File Type Badge */}
        <Badge className="absolute bottom-3 right-3 bg-blue-600 text-white hover:bg-blue-600">
          {summary.fileType}
        </Badge>

        {/* Course Badge */}
        <Badge className="absolute top-3 right-3 bg-blue-100 text-blue-700 hover:bg-blue-100">
          {summary.course}
        </Badge>

        {/* Rating Badge - Clickable */}
        <button
          onClick={toggleRatingSection}
          className="absolute top-3 left-14 bg-yellow-100 text-yellow-700 hover:bg-yellow-200 transition-colors rounded-md px-2 py-1 text-sm font-medium flex items-center gap-1"
        >
          <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
          {avgRating > 0 ? avgRating.toFixed(1) : '0'}
          {ratingsCount > 0 && <span className="text-xs">({ratingsCount})</span>}
        </button>
      </div>

      {/* Content Section */}
      <div className="p-6 space-y-4">
        {/* Title */}
        <h3 className="line-clamp-2 min-h-[3rem]">{summary.title}</h3>

        {/* Institution Badge */}
        <div className="flex items-center gap-2 text-gray-600">
          <Building2 className="w-4 h-4 text-blue-500" />
          <span className="text-sm font-medium">{summary.institution}</span>
        </div>

        {/* Description */}
        <p className="text-gray-600 line-clamp-2 min-h-[3rem]">
          {summary.description}
        </p>

        {/* Metadata */}
        <div className="flex items-center gap-3 text-gray-600 border-t border-gray-100 pt-3">
          <div className="flex items-center gap-1">
            <span>👤</span>
            <span>{summary.uploader}</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1">
            <span>📅</span>
            <span>{summary.uploadDate}</span>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-gray-600">
          <div className="flex items-center gap-1">
            <Eye className="w-4 h-4" />
            <span>{summary.views}</span>
          </div>
          <div className="flex items-center gap-1">
            <Download className="w-4 h-4" />
            <span>{summary.downloads}</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageCircle className="w-4 h-4" />
            <span>{summary.comments}</span>
          </div>
        </div>

        {/* Rating Section */}
        {showRatingSection && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border border-gray-200 rounded-lg p-3 bg-gray-50"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">דרג את הסיכום:</span>
                {userRating > 0 && (
                  <span className="text-xs text-green-600">✓ דירגת {userRating} כוכבים</span>
                )}
              </div>
              <div className="flex items-center gap-1 justify-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={(e) => handleRating(star, e)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    disabled={isRating || !isAuthenticated}
                    className={`p-1 transition-all duration-200 ${
                      isRating || !isAuthenticated ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:scale-110'
                    }`}
                    title={isAuthenticated ? `דרג ${star} כוכבים` : 'יש להתחבר כדי לדרג'}
                  >
                    <Star
                      className={`w-6 h-6 transition-colors ${
                        star <= (hoverRating || userRating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
              {!isAuthenticated && (
                <p className="text-xs text-gray-500 text-center">יש להתחבר כדי לדרג</p>
              )}
              {isRating && (
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {summary.tags.map((tag) => (
            <Badge
              key={tag}
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              {tag}
            </Badge>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white">
            <Download className="w-4 h-4 ml-1" />
            הורדה ←
          </Button>
          <Button variant="outline" className="flex-1 border-gray-300 hover:bg-gray-50">
            תצוגה מקדימה
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
