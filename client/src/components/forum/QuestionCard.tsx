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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4, ease: "easeOut" }}
      whileHover={{ 
        y: -4, 
        boxShadow: "0 12px 32px rgba(59, 130, 246, 0.2)",
        scale: 1.005
      }}
      className="bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-2xl hover:border-blue-300 transition-all duration-300 p-6 cursor-pointer shadow-md hover:shadow-xl"
      onClick={onClick}
    >
      <div className="flex gap-6 overflow-hidden">
        {/* Stats Section (Left) */}
        <div className="flex flex-col gap-4 items-center min-w-[90px] border-r-2 border-gray-200 pr-6">
          {/* Rating */}
          {question.avgRating != null && (
            <motion.div 
              className="flex flex-col items-center gap-1"
              whileHover={{ scale: 1.1 }}
            >
              <div className="flex items-center gap-1.5 text-yellow-500">
                <Star className="w-6 h-6 fill-yellow-400 stroke-yellow-500" />
                <span className="font-bold text-lg">{question.avgRating.toFixed(1)}</span>
              </div>
              <span className="text-xs text-gray-500 font-medium" aria-label="מספר דירוגים">
                {question._count?.ratings || 0} דירוגים
              </span>
            </motion.div>
          )}

          {/* Answers */}
          <div
            className={`flex flex-col items-center gap-1.5 px-4 py-3 rounded-xl border-2 transition-all shadow-sm ${
              isAnswered
                ? 'bg-gradient-to-br from-blue-50 to-purple-50 text-blue-700 border-blue-300'
                : 'bg-gray-50 text-gray-600 border-gray-300'
            }`}
          >
            {isAnswered && (
              <CheckCircle2 className="w-5 h-5 text-blue-600" />
            )}
            <span className="font-bold text-lg">{answers}</span>
            <span className="text-xs font-medium">תשובות</span>
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
            <Badge className={`${categoryColors[question.category] || categoryColors['כללי']} hover:${categoryColors[question.category]} transition-all font-semibold px-3 py-1 text-sm shadow-sm`}>
              {question.category}
            </Badge>
          )}

          {/* Title */}
          <h3 className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors leading-snug break-words">
            {question.title}
          </h3>

          {/* Description */}
          {description && (
            <p className="text-gray-600 line-clamp-2 leading-relaxed text-base">
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
                  className="border-2 border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300 transition-all font-medium px-3 py-1 rounded-lg"
                >
                  #{tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Author and Activity */}
          <div className="flex flex-wrap items-center gap-3 text-gray-600 pt-3 border-t-2 border-gray-200">
            <div className="flex items-center gap-2.5">
              <Avatar className="w-7 h-7 border-2 border-white shadow-sm">
                <AvatarFallback className="bg-gradient-to-br from-blue-500 via-purple-500 to-purple-600 text-white text-xs font-semibold">
                  {displayAvatar}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-semibold text-gray-800">{displayName}</span>
              {question.author.reputation && (
                <span className="text-xs bg-gradient-to-r from-blue-500 to-purple-500 text-white px-2.5 py-1 rounded-full font-semibold shadow-sm">
                  {question.author.reputation} ⭐
                </span>
              )}
            </div>
            {displayTime && (
              <>
                <span className="text-gray-400 font-bold">•</span>
                <span className="text-sm text-gray-600">נשאל {displayTime}</span>
              </>
            )}
            {question.lastActivity && (
              <>
                <span className="text-gray-400 font-bold">•</span>
                <span className="text-sm text-gray-600 font-medium">
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
