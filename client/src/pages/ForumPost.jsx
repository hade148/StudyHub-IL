import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function ForumPost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPost();
  }, [id]);

  const fetchPost = async () => {
    try {
      const res = await api.get(`/forum/${id}`);
      setPost(res.data);
    } catch (error) {
      console.error('Error fetching post:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setSubmitting(true);
    try {
      await api.post(`/forum/${id}/comments`, { text: comment });
      setComment('');
      fetchPost();
    } catch (error) {
      alert('שגיאה בהוספת תגובה');
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkAnswered = async () => {
    try {
      await api.patch(`/forum/${id}/answer`);
      fetchPost();
    } catch (error) {
      alert('שגיאה בעדכון סטטוס');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('האם אתה בטוח שברצונך למחוק שאלה זו?')) return;

    try {
      await api.delete(`/forum/${id}`);
      navigate('/forum');
    } catch (error) {
      alert('שגיאה במחיקת שאלה');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="card text-center py-12">
        <p className="text-xl text-gray-600">שאלה לא נמצאה</p>
        <Link to="/forum" className="btn btn-primary mt-4">חזור לפורום</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Question */}
      <div className="card">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <span className={`inline-block px-3 py-1 rounded text-sm font-semibold mb-3 ${
              post.isAnswered 
                ? 'bg-green-100 text-green-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {post.isAnswered ? '✓ נענתה' : 'ממתין לתשובה'}
            </span>
            
            <h1 className="text-3xl font-bold mb-3">{post.title}</h1>
            
            <Link to={`/forum?courseId=${post.course.id}`} className="text-primary-600 hover:underline">
              📚 {post.course.courseName}
            </Link>
          </div>

          {(user?.id === post.authorId || user?.role === 'ADMIN') && (
            <div className="flex space-x-2 space-x-reverse">
              {!post.isAnswered && user?.id === post.authorId && (
                <button onClick={handleMarkAnswered} className="btn bg-green-600 text-white hover:bg-green-700">
                  ✓ סמן כנענתה
                </button>
              )}
              <button onClick={handleDelete} className="btn bg-red-600 text-white hover:bg-red-700">
                🗑️ מחק
              </button>
            </div>
          )}
        </div>

        <p className="text-gray-700 text-lg mb-6 whitespace-pre-wrap">{post.content}</p>

        <div className="flex items-center justify-between pt-4 border-t text-sm text-gray-600">
          <div>
            <span>👤 נשאל על ידי <strong>{post.author.fullName}</strong></span>
            <span className="mx-2">•</span>
            <span>{new Date(post.createdAt).toLocaleDateString('he-IL')}</span>
          </div>
          <span>👁️ {post.views} צפיות</span>
        </div>
      </div>

      {/* Comments */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">תשובות ({post.comments?.length || 0})</h2>

        {/* Add Comment Form */}
        {isAuthenticated ? (
          <form onSubmit={handleAddComment} className="mb-6">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="input resize-none"
              rows="4"
              placeholder="כתוב תשובה..."
              required
            />
            <button type="submit" disabled={submitting} className="btn btn-primary mt-2">
              {submitting ? 'שולח...' : 'שלח תשובה'}
            </button>
          </form>
        ) : (
          <div className="mb-6 p-4 bg-gray-100 rounded-lg">
            <Link to="/login" className="text-primary-600 hover:underline">התחבר</Link> כדי לענות על שאלה זו
          </div>
        )}

        {/* Comments List */}
        <div className="space-y-4">
          {post.comments && post.comments.length > 0 ? (
            post.comments.map((c) => (
              <div key={c.id} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <strong className="text-gray-800">{c.author.fullName}</strong>
                  <span className="text-sm text-gray-500">
                    {new Date(c.createdAt).toLocaleDateString('he-IL')}
                  </span>
                </div>
                <p className="text-gray-700 whitespace-pre-wrap">{c.text}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">אין תשובות עדיין</p>
          )}
        </div>
      </div>
    </div>
  );
}