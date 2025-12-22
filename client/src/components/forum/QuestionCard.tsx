import { motion } from 'motion/react';
import { Eye, MessageCircle, Star, CheckCircle2 } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback } from '../ui/avatar';

interface QuestionCardProps {
  question: {
    id: number;
    title: string;
    content?: string;
    description?: string;
    category?: string;
    tags: string[];
    author: {
      id?: number;
      name?: string;
      fullName?: string;
      avatar?: string;
      reputation?: number;
    };
    stats?: {
      views: number;
      answers: number;
      votes?: number;
      isAnswered: boolean;
    };
    views?: number;
    isAnswered?: boolean;
    avgRating?: number | null;
    time?: string;
    createdAt?: string;
    lastActivity?: {
      user: string;
      time: string;
    };
    _count?: {
      comments: number;
      ratings: number;
    };
  };
  index: number;
  onClick?: () => void;
}

const categoryColors: Record<string, string> = {
  'אלגוריתמים': 'bg-purple-100 text-purple-700 border-purple-300',
  'מתמטיקה': 'bg-blue-100 text-blue-700 border-blue-300',
  'פיזיקה': 'bg-orange-100 text-orange-700 border-orange-300',
  'כימיה': 'bg-green-100 text-green-700 border-green-300',
  'משאבי לימוד': 'bg-teal-100 text-teal-700 border-teal-300',
  'כללי': 'bg-gray-100 text-gray-700 border-gray-300',
};

export function QuestionCard({ question, index, onClick }: QuestionCardProps) {
  const displayName = question.author.fullName || question.author.name || 'אנונימי';
  const displayAvatar = question.author.avatar || displayName.substring(0, 2);
  const views = question.views || question.stats?.views || 0;
  const answers = question._count?.comments || question.stats?.answers || 0;
  const isAnswered = question.isAnswered || question.stats?.isAnswered || false;
  const description = question.content || question.description || '';
  const displayTime = question.time || (question.createdAt ? new Date(question.createdAt).toLocaleDateString('he-IL') : '');
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      whileHover={{ backgroundColor: '#F9FAFB', borderRightColor: '#3B82F6' }}
      className="bg-white border-r-4 border-r-transparent rounded-lg shadow-sm hover:shadow-md transition-all duration-200 p-6 cursor-pointer"
      onClick={onClick}
    >
      <div className="flex gap-6">
        {/* Stats Section (Right) */}
        <div className="flex flex-col gap-3 items-center min-w-[80px]">
          {/* Rating */}
          {question.avgRating != null && (
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-1 text-yellow-500">
                <Star className="w-5 h-5 fill-current" />
                <span className="text-gray-900">{question.avgRating.toFixed(1)}</span>
              </div>
              <span className="text-xs text-gray-500">
                {question._count?.ratings || 0} דירוגים
              </span>
            </div>
          )}

          {/* Answers */}
          <div
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg ${
              isAnswered
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            {isAnswered && (
              <CheckCircle2 className="w-4 h-4" />
            )}
            <span>{answers}</span>
            <span className="text-xs">תשובות</span>
          </div>

          {/* Views */}
          <div className="flex items-center gap-1 text-gray-600">
            <Eye className="w-4 h-4" />
            <span>{views}</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 space-y-3">
          {/* Category Badge */}
          {question.category && (
            <Badge className={`${categoryColors[question.category] || categoryColors['כללי']} hover:${categoryColors[question.category]}`}>
              {question.category}
            </Badge>
          )}

          {/* Title */}
          <h3 className="text-gray-900 hover:text-blue-600 transition-colors">
            {question.title}
          </h3>

          {/* Description */}
          {description && (
            <p className="text-gray-600 line-clamp-2">
              {description}
            </p>
          )}

          {/* Tags */}
          {question.tags && question.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {question.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Author and Activity */}
          <div className="flex flex-wrap items-center gap-3 text-gray-600 pt-2">
            <div className="flex items-center gap-2">
              <Avatar className="w-6 h-6">
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs">
                  {displayAvatar}
                </AvatarFallback>
              </Avatar>
              <span>{displayName}</span>
              {question.author.reputation && (
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                  {question.author.reputation}
                </span>
              )}
            </div>
            {displayTime && (
              <>
                <span>•</span>
                <span>נשאל {displayTime}</span>
              </>
            )}
            {question.lastActivity && (
              <>
                <span>•</span>
                <span className="text-green-600">
                  תשובה אחרונה מ- {question.lastActivity.user} {question.lastActivity.time}
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
