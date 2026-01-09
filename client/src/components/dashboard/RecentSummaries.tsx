import { motion } from 'motion/react';
import { useState } from 'react';
import { Eye, Download, Heart, Star } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import api from '../../utils/api';

interface Summary {
  id: number;
  title: string;
  course: string;
  rating: number;
  views: number;
  downloads: number;
  fileType: string;
  description: string;
  uploadDate: string;
  filePath?: string;
}

interface RecentSummariesProps {
  summaries?: Summary[];
  onViewAll?: () => void;
  onSummaryClick?: (id: number) => void;
}

export function RecentSummaries({ summaries = [], onViewAll, onSummaryClick }: RecentSummariesProps) {
  const [favorites, setFavorites] = useState<Set<number>>(new Set());

  const handleFavorite = async (e: React.MouseEvent, summaryId: number) => {
    e.stopPropagation();
    try {
      if (favorites.has(summaryId)) {
        await api.delete(`/favorites/summary/${summaryId}`);
        setFavorites(prev => {
          const newSet = new Set(prev);
          newSet.delete(summaryId);
          return newSet;
        });
      } else {
        await api.post('/favorites/summary', { summaryId });
        setFavorites(prev => new Set(prev).add(summaryId));
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleDownload = async (e: React.MouseEvent, summary: Summary) => {
    e.stopPropagation();
    try {
      const response = await fetch(`http://localhost:4000${summary.filePath || ''}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${summary.title}.${summary.fileType.toLowerCase()}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };
  if (summaries.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2>סיכומים אחרונים</h2>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-12 text-center space-y-4">
          <div className="text-6xl"></div>
          <h3>אין סיכומים זמינים כרגע</h3>
          <p className="text-gray-600">סיכומים חדשים יופיעו כאן</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2>סיכומים אחרונים</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {summaries.map((summary, index) => (
          <motion.div
            key={summary.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 + index * 0.1, duration: 0.5 }}
            whileHover={{ y: -8, scale: 1.02 }}
            onClick={() => onSummaryClick?.(summary.id)}
            className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer"
          >
            <div className="p-6 space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                  {summary.course}
                </Badge>
                {summary.rating > 0 && (
                  <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 flex items-center gap-1">
                    <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                    {summary.rating}
                  </Badge>
                )}
              </div>

              {/* Title & Description */}
              <div className="space-y-2">
                <h3 className="line-clamp-2">{summary.title}</h3>
                {summary.description && (
                  <p className="text-gray-600 line-clamp-2">{summary.description}</p>
                )}
              </div>

              {/* File Type */}
              <Badge variant="outline" className="border-gray-300">
                {summary.fileType}
              </Badge>

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
              </div>

              {/* Footer */}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-2">
                <span className="text-gray-500 text-sm">{summary.uploadDate}</span>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={(e) => handleDownload(e, summary)}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Download className="w-4 h-4 ml-1" />
                    הורדה
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => handleFavorite(e, summary.id)}
                    className={`border-gray-300 hover:bg-gray-50 ${favorites.has(summary.id) ? 'text-red-500' : ''}`}
                  >
                    <Heart className={`w-4 h-4 ${favorites.has(summary.id) ? 'fill-red-500' : ''}`} />
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
