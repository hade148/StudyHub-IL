import { motion } from 'motion/react';
import { MessageCircle, Eye } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback } from '../ui/avatar';

interface Post {
  id: number;
  title: string;
  category: string;
  author: string;
  initials: string;
  time: string;
  replies: number;
  views: number;
}

const categoryColors: Record<string, string> = {
  'אלגוריתמים': 'bg-purple-100 text-purple-700',
  'מתמטיקה': 'bg-blue-100 text-blue-700',
  'משאבי לימוד': 'bg-green-100 text-green-700',
  'פיזיקה': 'bg-orange-100 text-orange-700',
};

interface LatestForumPostsProps {
  posts?: Post[];
  onViewAll?: () => void;
  onPostClick?: (id: number) => void;
}

export function LatestForumPosts({ posts = [], onViewAll, onPostClick }: LatestForumPostsProps) {
  if (posts.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2>פוסטים אחרונים בפורום</h2>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-12 text-center space-y-4">
          <div className="text-6xl">💬</div>
          <h3>אין פוסטים בפורום</h3>
          <p className="text-gray-600">פוסטים חדשים יופיעו כאן</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2>פוסטים אחרונים בפורום</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {posts.map((post, index) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 + index * 0.1, duration: 0.5 }}
            whileHover={{ y: -8, scale: 1.02 }}
            onClick={() => onPostClick?.(post.id)}
            className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer"
          >
            <div className="p-6 space-y-4">
              {/* Header with Avatar and Category */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10 flex-shrink-0">
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm">
                      {post.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{post.author}</p>
                    <p className="text-xs text-gray-500">{post.time}</p>
                  </div>
                </div>
                <Badge className={`${categoryColors[post.category] || 'bg-gray-100 text-gray-700'} hover:${categoryColors[post.category] || 'bg-gray-100'} flex-shrink-0 text-xs`}>
                  {post.category}
                </Badge>
              </div>

              {/* Title */}
              <h3 className="line-clamp-2 text-lg">{post.title}</h3>

              {/* Stats */}
              <div className="flex items-center gap-4 pt-2 border-t border-gray-100">
                <div className="flex items-center gap-1 text-gray-600">
                  <MessageCircle className="w-4 h-4" />
                  <span className="text-sm">{post.replies}</span>
                </div>
                <div className="flex items-center gap-1 text-gray-600">
                  <Eye className="w-4 h-4" />
                  <span className="text-sm">{post.views}</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
