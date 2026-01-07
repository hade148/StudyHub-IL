import { motion } from 'motion/react';
import { MessageCircle, Eye } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback } from '../ui/avatar';

interface Post {
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
}

export function LatestForumPosts({ posts = [], onViewAll }: LatestForumPostsProps) {
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
        <button 
          className="text-blue-600 hover:text-blue-700 transition-colors"
          onClick={onViewAll}
        >
          כל הפוסטים ←
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="divide-y divide-gray-100">
          {posts.map((post, index) => (
            <motion.div
              key={post.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.1 + index * 0.1, duration: 0.5 }}
              whileHover={{ backgroundColor: '#F9FAFB' }}
              className="p-6 transition-colors duration-200 cursor-pointer"
            >
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <Avatar className="w-12 h-12 flex-shrink-0">
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                    {post.initials}
                  </AvatarFallback>
                </Avatar>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="line-clamp-1">{post.title}</h3>
                    <Badge className={`${categoryColors[post.category]} hover:${categoryColors[post.category]} flex-shrink-0`}>
                      {post.category}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-4 text-gray-600">
                    <span>{post.author}</span>
                    <span>•</span>
                    <span>{post.time}</span>
                  </div>

                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex items-center gap-1 text-gray-600">
                      <MessageCircle className="w-4 h-4" />
                      <span>{post.replies}</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-600">
                      <Eye className="w-4 h-4" />
                      <span>{post.views}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
