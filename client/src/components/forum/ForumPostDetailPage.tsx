import { motion } from 'motion/react';
import { useState, useEffect, useRef } from 'react';
import { ChevronRight, Home, MessageCircle, Send, User, CheckCircle2, Star, ArrowUp, ArrowDown } from 'lucide-react';
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
  category?: string;
  tags?: string[];
  images?: string[];
  isUrgent?: boolean;
  views: number;
  isAnswered: boolean;
  avgRating?: number | null;
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
  _count?: {
    ratings: number;
  };
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
  const [userRating, setUserRating] = useState<number | null>(null);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [ratingSubmitting, setRatingSubmitting] = useState(false);
  const hasFetchedPost = useRef(false);

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

  // Fetch post data (increments view count server-side). Depends only on postId to avoid double count when user state changes.
  useEffect(() => {
    // Reset flag when postId changes
    if (hasFetchedPost.current) {
      hasFetchedPost.current = false;
    }

    // Prevent double fetch in React Strict Mode
    if (hasFetchedPost.current) {
      return;
    }
    
    hasFetchedPost.current = true;

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

  // Fetch user's rating separately so post fetch does not re-run when auth state changes
  useEffect(() => {
    const fetchRating = async () => {
      if (!user) {
        setUserRating(null);
        return;
      }

      try {
        const ratingsResponse = await api.get(`/forum/${postId}/ratings`);
        setUserRating(ratingsResponse.data.userRating);
      } catch (err) {
        console.error('Error fetching rating:', err);
      }
    };

    fetchRating();
  }, [postId, user]);

  // Handle rating submission
  const handleRating = async (rating: number) => {
    if (!user) {
      alert('יש להתחבר כדי לדרג שאלה');
      return;
    }

    try {
      setRatingSubmitting(true);
      const response = await api.post(`/forum/${postId}/ratings`, { rating });
      
      // Update local state
      setUserRating(rating);
      if (post) {
        setPost({
          ...post,
          avgRating: response.data.avgRating
        });
      }
    } catch (err: any) {
      console.error('Error submitting rating:', err);
      alert(err.response?.data?.error || 'שגיאה בשמירת דירוג');
    } finally {
      setRatingSubmitting(false);
    }
  };

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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">טוען...</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">{error || 'פוסט לא נמצא'}</p>
          <Button onClick={onNavigateForum} className="mt-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
            חזרה לפורום
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4 py-8 max-w-4xl"
      >
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
          <button onClick={onNavigateHome} className="hover:text-gray-900 transition-colors flex items-center gap-1">
            <Home className="w-4 h-4" />
            דף הבית
          </button>
          <ChevronRight className="w-4 h-4" />
          <button onClick={onNavigateForum} className="hover:text-gray-900 transition-colors">
            פורום
          </button>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900 truncate max-w-md">{post.title}</span>
        </div>

        {/* Question Card */}
        <div className="bg-white border border-gray-200 rounded-xl p-8 space-y-6 mb-6 shadow-sm">
          {/* Header */}
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <Badge className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 border border-blue-200 transition-colors">
                  {post.course.courseName}
                </Badge>
                {post.isAnswered && (
                  <Badge className="bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border border-green-300 flex items-center gap-1 transition-colors">
                    <CheckCircle2 className="w-3 h-3" />
                    נענה
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-3 text-gray-500 text-sm">
                <div className="flex items-center gap-1">
                  <MessageCircle className="w-4 h-4 text-blue-500" />
                  <span>{post.comments.length} תשובות</span>
                </div>
              </div>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 leading-tight">{post.title}</h1>
          </div>

          {/* Author Info */}
          <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
            <Avatar className="w-10 h-10">
              <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white">
                {getInitials(post.author.fullName)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-gray-900">{post.author.fullName}</p>
              <p className="text-sm text-gray-500">נשאל {formatDate(post.createdAt)}</p>
            </div>
          </div>

          {/* Question Content */}
          <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
            {post.content}
          </div>

          {/* Images */}
          {post.images && post.images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
              {post.images.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`תמונה ${index + 1}`}
                  className="w-full h-48 object-cover rounded-lg border border-gray-200"
                />
              ))}
            </div>
          )}

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {post.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="border-blue-300 text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Rating Section */}
          <div className="border-t border-gray-100 pt-4 mt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-gray-700 font-medium">דרג את השאלה:</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => handleRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(null)}
                      disabled={ratingSubmitting || !user}
                      className="transition-transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Star
                        className={`w-6 h-6 transition-colors ${
                          (hoverRating !== null ? star <= hoverRating : (userRating !== null && star <= userRating))
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                {userRating && (
                  <span className="text-sm text-gray-500">
                    (דירגת {userRating} כוכבים)
                  </span>
                )}
              </div>
              {post.avgRating !== null && post.avgRating !== undefined && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{post.avgRating.toFixed(1)}</span>
                  <span className="text-sm">
                    ({post._count?.ratings || 0} דירוגים)
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Answers Section */}
        <div className="bg-white border border-gray-200 rounded-xl p-8 space-y-6 shadow-sm">
          <h2 className="text-xl font-semibold flex items-center gap-2 text-gray-900">
            <MessageCircle className="w-5 h-5 text-blue-500" />
            תשובות ({post.comments.length})
          </h2>

          {/* Answers List */}
          <div className="space-y-4">
            {post.comments.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-8 h-8 text-blue-500" />
                </div>
                <p>אין תשובות עדיין. היה הראשון לענות!</p>
              </div>
            ) : (
              post.comments.map((comment, index) => (
                <motion.div
                  key={comment.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border border-gray-200 rounded-xl p-6 hover:border-gray-300 hover:shadow-md transition-all"
                >
                  <div className="flex gap-6">
                    {/* Left side - Metadata */}
                    <div className="flex flex-col items-center gap-3 min-w-[80px] border-r border-gray-100 pr-6">
                      {/* Voting (UI only for now) */}
                      <div className="flex flex-col items-center gap-1">
                        <button className="p-1 hover:bg-blue-50 rounded-lg transition-colors">
                          <ArrowUp className="w-5 h-5 text-blue-500 hover:text-blue-700" />
                        </button>
                        <span className="text-gray-700 font-semibold">0</span>
                        <button className="p-1 hover:bg-blue-50 rounded-lg transition-colors">
                          <ArrowDown className="w-5 h-5 text-blue-500 hover:text-blue-700" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Right/Center side - Answer content */}
                    <div className="flex-1 space-y-4">
                      {/* Answer Header */}
                      <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white">
                            {getInitials(comment.author.fullName)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-gray-900">{comment.author.fullName}</p>
                          <p className="text-sm text-gray-500">{formatDate(comment.createdAt)}</p>
                        </div>
                      </div>
                      
                      {/* Answer Content */}
                      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{comment.text}</p>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>

          {/* Add Answer Form */}
          <div className="border-t border-gray-100 pt-6">
            <h3 className="font-semibold text-gray-900 mb-4">הוסף תשובה</h3>
            <div className="border border-gray-200 rounded-xl p-4 space-y-3 shadow-sm">
              <div className="flex items-center gap-2">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white text-sm">
                    {user?.fullName ? getInitials(user.fullName) : <User className="w-4 h-4" />}
                  </AvatarFallback>
                </Avatar>
                <span className="text-gray-700">{user?.fullName || 'אורח'}</span>
              </div>
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="כתוב את התשובה שלך..."
                className="resize-none border-gray-200 focus:border-blue-400"
                rows={4}
              />
              <div className="flex justify-end">
                <Button
                  onClick={handleAddComment}
                  disabled={!newComment.trim() || submitting}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all"
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
