import { motion } from 'motion/react';
import { MessageCircle, Star, CheckCircle2 } from 'lucide-react';
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
  'אלגוריתמים': 'bg-blue-50 text-blue-700 border-blue-200',
  'מתמטיקה': 'bg-purple-50 text-purple-700 border-purple-200',
  'פיזיקה': 'bg-green-50 text-green-700 border-green-200',
  'כימיה': 'bg-orange-50 text-orange-700 border-orange-200',
  'משאבי לימוד': 'bg-blue-50 text-blue-700 border-blue-200',
  'כללי': 'bg-gray-50 text-gray-700 border-gray-200',
};

export function QuestionCard({ question, index, onClick }: QuestionCardProps) {
  const displayName = question.author.fullName || question.author.name || 'אנונימי';
  const displayAvatar = question.author.avatar || displayName.substring(0, 2);
  const views = question.views || question.stats?.views || 0;
  const answers = question._count?.comments || question.stats?.answers || 0;
  // A question is considered answered if it has comments or the isAnswered flag is true
  const hasComments = answers > 0;
  const isAnswered = question.isAnswered || question.stats?.isAnswered || hasComments;
  const description = question.content || question.description || '';
  const displayTime = question.time || (question.createdAt ? new Date(question.createdAt).toLocaleDateString('he-IL') : '');
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      whileHover={{ y: -3, boxShadow: "0 8px 24px rgba(59, 130, 246, 0.15)" }}
      className="bg-white border border-gray-200 rounded-xl hover:border-blue-200 transition-all duration-200 p-6 cursor-pointer shadow-sm"
      onClick={onClick}
    >
      <div className="flex gap-6 overflow-hidden">
        {/* Stats Section (Left) */}
        <div className="flex flex-col gap-3 items-center min-w-[80px] border-r border-gray-100 pr-6">
          {/* Rating */}
          {question.avgRating != null && (
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-1 text-blue-600">
                <Star className="w-5 h-5 fill-blue-400 stroke-blue-400" />
                <span className="font-semibold">{question.avgRating.toFixed(1)}</span>
              </div>
              <span className="text-xs text-gray-500" aria-label="מספר דירוגים">
                {question._count?.ratings || 0}
              </span>
            </div>
          )}

          {/* Answers */}
          <div
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg border transition-colors ${
              isAnswered
                ? 'bg-blue-50 text-blue-700 border-blue-200'
                : 'bg-white text-gray-600 border-gray-200'
            }`}
          >
            {isAnswered && (
              <CheckCircle2 className="w-4 h-4 text-blue-600" />
            )}
            <span className="font-semibold">{answers}</span>
            <span className="text-xs">תשובות</span>
          </div>

          {/* Views - Hidden per requirements */}
        </div>

        {/* Main Content (Right/Center) */}
        <div className="flex-1 space-y-3 min-w-0 overflow-hidden">
          {/* Category Badge */}
          {question.category && (
            <Badge className={`${categoryColors[question.category] || categoryColors['כללי']} hover:${categoryColors[question.category]} transition-colors`}>
              {question.category}
            </Badge>
          )}

          {/* Title */}
          <h3 className="text-lg font-semibold text-gray-900 hover:text-gray-700 transition-colors leading-snug break-words">
            {question.title}
          </h3>

          {/* Description */}
          {description && (
            <p className="text-gray-600 line-clamp-2 leading-relaxed">
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
                  className="border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Author and Activity */}
          <div className="flex flex-wrap items-center gap-3 text-gray-600 pt-2 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <Avatar className="w-6 h-6">
                <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white text-xs">
                  {displayAvatar}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm">{displayName}</span>
              {question.author.reputation && (
                <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full border border-blue-200">
                  {question.author.reputation}
                </span>
              )}
            </div>
            {displayTime && (
              <>
                <span className="text-gray-400">•</span>
                <span className="text-sm">נשאל {displayTime}</span>
              </>
            )}
            {question.lastActivity && (
              <>
                <span className="text-gray-400">•</span>
                <span className="text-sm text-gray-600">
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
