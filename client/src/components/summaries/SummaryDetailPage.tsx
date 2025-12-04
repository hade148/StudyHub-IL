import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { ChevronRight, Home, FileText, Download, Star, MessageCircle, Send, User } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

interface Comment {
  id: number;
  text: string;
  createdAt: string;
  author: {
    id: number;
    fullName: string;
  };
}

interface Rating {
  id: number;
  rating: number;
  userId: number;
  user: { fullName: string };
}

interface Summary {
  id: number;
  title: string;
  description: string | null;
  filePath: string;
  uploadDate: string;
  avgRating: number | null;
  course: {
    id: number;
    courseCode: string;
    courseName: string;
  };
  uploadedBy: {
    id: number;
    fullName: string;
  };
  comments: Comment[];
  ratings: Rating[];
}

interface SummaryDetailPageProps {
  summaryId: string;
  onNavigateHome: () => void;
  onNavigateSummaries: () => void;
}

export function SummaryDetailPage({ summaryId, onNavigateHome, onNavigateSummaries }: SummaryDetailPageProps) {
  const { user, isAuthenticated } = useAuth();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [userRating, setUserRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [ratingSubmitting, setRatingSubmitting] = useState(false);

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

  // Fetch summary data
  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/summaries/${summaryId}`);
        setSummary(response.data);
        
        // Find and set user's existing rating if they are logged in
        if (user && response.data.ratings) {
          const existingRating = response.data.ratings.find(
            (r: Rating) => r.userId === parseInt(user.id)
          );
          if (existingRating) {
            setUserRating(existingRating.rating);
          }
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching summary:', err);
        setError('שגיאה בטעינת הסיכום');
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [summaryId, user]);

  // Handle rating submission
  const handleRating = async (rating: number) => {
    if (!isAuthenticated) {
      alert('יש להתחבר כדי לדרג סיכומים');
      return;
    }

    try {
      setRatingSubmitting(true);
      const response = await api.post(`/summaries/${summaryId}/rate`, { rating });
      
      setUserRating(rating);
      
      // Update summary with new average rating
      if (summary) {
        setSummary({
          ...summary,
          avgRating: response.data.avgRating
        });
      }
    } catch (err) {
      console.error('Error submitting rating:', err);
      alert('שגיאה בשמירת הדירוג');
    } finally {
      setRatingSubmitting(false);
    }
  };

  // Handle adding a comment
  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      setSubmitting(true);
      const response = await api.post(`/summaries/${summaryId}/comments`, {
        text: newComment.trim()
      });
      
      // Add the new comment to the list
      if (summary) {
        setSummary({
          ...summary,
          comments: [response.data.comment, ...summary.comments]
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">טוען...</p>
        </div>
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">{error || 'סיכום לא נמצא'}</p>
          <Button onClick={onNavigateSummaries} className="mt-4">
            חזרה לסיכומים
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
          <button onClick={onNavigateHome} className="hover:text-blue-600 transition-colors flex items-center gap-1">
            <Home className="w-4 h-4" />
            דף הבית
          </button>
          <ChevronRight className="w-4 h-4" />
          <button onClick={onNavigateSummaries} className="hover:text-blue-600 transition-colors">
            סיכומים
          </button>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900">{summary.title}</span>
        </div>

        {/* Summary Card */}
        <div className="bg-white rounded-xl shadow-lg p-8 space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-3 rounded-xl">
                  <FileText className="w-6 h-6" />
                </div>
                <h1 className="text-gray-900 text-2xl">{summary.title}</h1>
              </div>
              <Badge className="bg-blue-100 text-blue-700">
                {summary.course.courseCode} - {summary.course.courseName}
              </Badge>
            </div>
            
            <div className="flex items-center gap-3">
              {summary.avgRating && (
                <div className="flex items-center gap-1 bg-yellow-100 text-yellow-700 px-3 py-1 rounded-lg">
                  <Star className="w-4 h-4 fill-yellow-500" />
                  <span>{summary.avgRating.toFixed(1)}</span>
                </div>
              )}
              <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white">
                <Download className="w-4 h-4 ml-2" />
                הורדה
              </Button>
            </div>
          </div>

          {/* Description */}
          {summary.description && (
            <p className="text-gray-600">{summary.description}</p>
          )}

          {/* Metadata */}
          <div className="flex items-center gap-4 text-gray-600 border-t border-gray-100 pt-4">
            <div className="flex items-center gap-2">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm">
                  {getInitials(summary.uploadedBy.fullName)}
                </AvatarFallback>
              </Avatar>
              <span>{summary.uploadedBy.fullName}</span>
            </div>
            <span>•</span>
            <span>{formatDate(summary.uploadDate)}</span>
            <span>•</span>
            <div className="flex items-center gap-1">
              <MessageCircle className="w-4 h-4" />
              <span>{summary.comments.length} תגובות</span>
            </div>
          </div>

          {/* Rating Section */}
          <div className="border-t border-gray-100 pt-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  דרג את הסיכום
                </h3>
                <p className="text-sm text-gray-500">
                  {summary.ratings.length > 0 
                    ? `${summary.ratings.length} דירוגים • ממוצע ${summary.avgRating?.toFixed(1) || 0}` 
                    : 'היה הראשון לדרג!'}
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => handleRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      disabled={ratingSubmitting}
                      className={`p-1 transition-all duration-200 ${
                        ratingSubmitting ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:scale-110'
                      }`}
                      title={isAuthenticated ? `דרג ${star} כוכבים` : 'יש להתחבר כדי לדרג'}
                    >
                      <Star
                        className={`w-8 h-8 transition-colors ${
                          star <= (hoverRating || userRating)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                {userRating > 0 && (
                  <span className="text-sm text-green-600 font-medium">
                    ✓ דירגת {userRating} כוכבים
                  </span>
                )}
                {ratingSubmitting && (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="bg-white rounded-xl shadow-lg p-8 space-y-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            תגובות ({summary.comments.length})
          </h2>

          {/* Add Comment Form */}
          <div className="border border-gray-200 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm">
                  {user?.fullName ? getInitials(user.fullName) : <User className="w-4 h-4" />}
                </AvatarFallback>
              </Avatar>
              <span className="text-gray-700">{user?.fullName || 'אורח'}</span>
            </div>
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="הוסף תגובה..."
              className="resize-none"
              rows={3}
            />
            <div className="flex justify-end">
              <Button
                onClick={handleAddComment}
                disabled={!newComment.trim() || submitting}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    שולח...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Send className="w-4 h-4" />
                    שלח תגובה
                  </span>
                )}
              </Button>
            </div>
          </div>

          {/* Comments List */}
          <div className="space-y-4">
            {summary.comments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>אין תגובות עדיין. היה הראשון להגיב!</p>
              </div>
            ) : (
              summary.comments.map((comment) => (
                <motion.div
                  key={comment.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border border-gray-100 rounded-lg p-4 space-y-2 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                        {getInitials(comment.author.fullName)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-gray-900">{comment.author.fullName}</p>
                      <p className="text-sm text-gray-500">{formatDate(comment.createdAt)}</p>
                    </div>
                  </div>
                  <p className="text-gray-700 pr-12">{comment.text}</p>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
