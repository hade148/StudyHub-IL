import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { ChevronRight, Home, MessageCircle, Send, User, CheckCircle2, ArrowUp, ArrowDown, Eye } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

interface ForumComment {
  id: number;
  text: string;
  createdAt: string;
  author: {
    id: number;
    fullName: string;
  };
}

interface ForumPost {
  id: number;
  title: string;
  content: string;
  views: number;
  isAnswered: boolean;
  createdAt: string;
  author: {
    id: number;
    fullName: string;
  };
  course: {
    id: number;
    courseCode: string;
    courseName: string;
  };
  comments: ForumComment[];
}

interface ForumPostDetailPageProps {
  postId: string;
  onNavigateHome: () => void;
  onNavigateForum: () => void;
}

export function ForumPostDetailPage({ postId, onNavigateHome, onNavigateForum }: ForumPostDetailPageProps) {
  const { user } = useAuth();
  const [post, setPost] = useState<ForumPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Helper to get initials from name
  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length >= 2) {
      return names[0][0] + names[1][0];
    }
    return name.slice(0, 2);
  };

  // Format date to readable string
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('he-IL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Fetch post data
  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/forum/${postId}`);
        setPost(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching post:', err);
        setError('שגיאה בטעינת הפוסט');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId]);

  // Handle adding a comment/answer
  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      setSubmitting(true);
      const response = await api.post(`/forum/${postId}/comments`, {
        text: newComment.trim()
      });
      
      // Add the new comment to the list
      if (post) {
        setPost({
          ...post,
          comments: [...post.comments, response.data.comment]
        });
      }
      setNewComment('');
    } catch (err) {
      console.error('Error adding comment:', err);
      alert('שגיאה בהוספת תגובה');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">טוען...</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">{error || 'פוסט לא נמצא'}</p>
          <Button onClick={onNavigateForum} className="mt-4">
            חזרה לפורום
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4 py-8 space-y-6"
      >
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-gray-600">
          <button onClick={onNavigateHome} className="hover:text-purple-600 transition-colors flex items-center gap-1">
            <Home className="w-4 h-4" />
            דף הבית
          </button>
          <ChevronRight className="w-4 h-4" />
          <button onClick={onNavigateForum} className="hover:text-purple-600 transition-colors">
            פורום
          </button>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900 truncate max-w-md">{post.title}</span>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-xl shadow-lg p-8 space-y-6">
          {/* Header */}
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <Badge className="bg-purple-100 text-purple-700">
                  {post.course.courseCode}
                </Badge>
                {post.isAnswered && (
                  <Badge className="bg-green-100 text-green-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    נענה
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-3 text-gray-500 text-sm">
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  <span>{post.views} צפיות</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageCircle className="w-4 h-4" />
                  <span>{post.comments.length} תשובות</span>
                </div>
              </div>
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900">{post.title}</h1>
          </div>

          {/* Author Info */}
          <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
            <Avatar className="w-10 h-10">
              <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-600 text-white">
                {getInitials(post.author.fullName)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-gray-900">{post.author.fullName}</p>
              <p className="text-sm text-gray-500">נשאל {formatDate(post.createdAt)}</p>
            </div>
          </div>

          {/* Question Content */}
          <div className="text-gray-700 whitespace-pre-wrap">
            {post.content}
          </div>
        </div>

        {/* Answers Section */}
        <div className="bg-white rounded-xl shadow-lg p-8 space-y-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-purple-600" />
            תשובות ({post.comments.length})
          </h2>

          {/* Answers List */}
          <div className="space-y-4">
            {post.comments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>אין תשובות עדיין. היה הראשון לענות!</p>
              </div>
            ) : (
              post.comments.map((comment, index) => (
                <motion.div
                  key={comment.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border border-gray-100 rounded-lg p-6 space-y-4 hover:border-purple-200 transition-colors"
                >
                  {/* Answer Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-600 text-white">
                          {getInitials(comment.author.fullName)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-gray-900">{comment.author.fullName}</p>
                        <p className="text-sm text-gray-500">{formatDate(comment.createdAt)}</p>
                      </div>
                    </div>
                    
                    {/* Voting (UI only for now) */}
                    <div className="flex items-center gap-2">
                      <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                        <ArrowUp className="w-5 h-5 text-gray-400 hover:text-green-600" />
                      </button>
                      <span className="text-gray-600 font-medium">0</span>
                      <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                        <ArrowDown className="w-5 h-5 text-gray-400 hover:text-red-600" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Answer Content */}
                  <p className="text-gray-700 whitespace-pre-wrap">{comment.text}</p>
                </motion.div>
              ))
            )}
          </div>

          {/* Add Answer Form */}
          <div className="border-t border-gray-100 pt-6">
            <h3 className="font-semibold text-gray-900 mb-4">הוסף תשובה</h3>
            <div className="border border-gray-200 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-600 text-white text-sm">
                    {user?.fullName ? getInitials(user.fullName) : <User className="w-4 h-4" />}
                  </AvatarFallback>
                </Avatar>
                <span className="text-gray-700">{user?.fullName || 'אורח'}</span>
              </div>
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="כתוב את התשובה שלך..."
                className="resize-none"
                rows={4}
              />
              <div className="flex justify-end">
                <Button
                  onClick={handleAddComment}
                  disabled={!newComment.trim() || submitting}
                  className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white"
                >
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      שולח...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Send className="w-4 h-4" />
                      שלח תשובה
                    </span>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
