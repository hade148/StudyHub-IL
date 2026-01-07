import { motion } from 'motion/react';
import { Eye, Download, Heart, Star } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

interface Summary {
  title: string;
  course: string;
  rating: number;
  views: number;
  downloads: number;
  fileType: string;
  description: string;
  uploadDate: string;
}

interface RecentSummariesProps {
  summaries?: Summary[];
  onViewAll?: () => void;
}

export function RecentSummaries({ summaries = [], onViewAll }: RecentSummariesProps) {
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
        <Button 
          variant="ghost" 
          className="text-blue-600 hover:text-blue-700"
          onClick={onViewAll}
        >
          צפה בכל הסיכומים ←
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {summaries.map((summary, index) => (
          <motion.div
            key={summary.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 + index * 0.1, duration: 0.5 }}
            whileHover={{ y: -8, scale: 1.02 }}
            className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden"
          >
            <div className="p-6 space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                  {summary.course}
                </Badge>
                <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 flex items-center gap-1">
                  <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                  {summary.rating}
                </Badge>
              </div>

              {/* Title & Description */}
              <div className="space-y-2">
                <h3 className="line-clamp-2">{summary.title}</h3>
                <p className="text-gray-600 line-clamp-2">{summary.description}</p>
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
                <span className="text-gray-500">{summary.uploadDate}</span>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Download className="w-4 h-4 ml-1" />
                    הורד
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-gray-300 hover:bg-gray-50"
                  >
                    <Heart className="w-4 h-4" />
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
