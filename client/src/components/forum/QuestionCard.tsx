import { motion } from 'motion/react';
import { Eye, MessageCircle, ArrowUp, ArrowDown, CheckCircle2 } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback } from '../ui/avatar';

interface QuestionCardProps {
  question: {
    id: number;
    title: string;
    description: string;
    category: string;
    tags: string[];
    author: {
      name: string;
      avatar: string;
      reputation: number;
    };
    stats: {
      views: number;
      answers: number;
      votes: number;
      isAnswered: boolean;
    };
    time: string;
    lastActivity?: {
      user: string;
      time: string;
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
          {/* Votes */}
          <div className="flex flex-col items-center gap-1">
            <button className="p-1 hover:bg-gray-100 rounded transition-colors">
              <ArrowUp className="w-5 h-5 text-gray-600" />
            </button>
            <span className="text-gray-900">{question.stats.votes}</span>
            <button className="p-1 hover:bg-gray-100 rounded transition-colors">
              <ArrowDown className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Answers */}
          <div
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg ${
              question.stats.isAnswered
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            {question.stats.isAnswered && (
              <CheckCircle2 className="w-4 h-4" />
            )}
            <span>{question.stats.answers}</span>
            <span className="text-xs">תשובות</span>
          </div>

          {/* Views */}
          <div className="flex items-center gap-1 text-gray-600">
            <Eye className="w-4 h-4" />
            <span>{question.stats.views}</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 space-y-3">
          {/* Category Badge */}
          <Badge className={`${categoryColors[question.category] || categoryColors['כללי']} hover:${categoryColors[question.category]}`}>
            {question.category}
          </Badge>

          {/* Title */}
          <h3 className="text-gray-900 hover:text-blue-600 transition-colors">
            {question.title}
          </h3>

          {/* Description */}
          <p className="text-gray-600 line-clamp-2">
            {question.description}
          </p>

          {/* Tags */}
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

          {/* Author and Activity */}
          <div className="flex flex-wrap items-center gap-3 text-gray-600 pt-2">
            <div className="flex items-center gap-2">
              <Avatar className="w-6 h-6">
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs">
                  {question.author.avatar}
                </AvatarFallback>
              </Avatar>
              <span>{question.author.name}</span>
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                {question.author.reputation}
              </span>
            </div>
            <span>•</span>
            <span>נשאל {question.time}</span>
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
