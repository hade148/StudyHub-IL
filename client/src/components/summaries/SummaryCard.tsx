import { motion } from 'motion/react';
import { Eye, Download, MessageCircle, Heart, FileText, Building2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { useState } from 'react';

interface SummaryCardProps {
  summary: {
    id: number;
    title: string;
    course: string;
    courseFullName: string;
    institution: string;
    rating: number;
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
  };
  index: number;
  onClick?: () => void;
}

export function SummaryCard({ summary, index, onClick }: SummaryCardProps) {
  const [isFavorite, setIsFavorite] = useState(summary.isFavorite);

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

        {/* Rating Badge */}
        <Badge className="absolute top-3 left-14 bg-yellow-100 text-yellow-700 hover:bg-yellow-100 flex items-center gap-1">
          <span>⭐</span>
          {summary.rating}
        </Badge>
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
