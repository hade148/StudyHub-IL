import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function SummaryDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    fetchSummary();
    if (isAuthenticated) {
      checkFavorite();
    }
  }, [id]);

  const fetchSummary = async () => {
    try {
      const res = await api.get(`/summaries/${id}`);
      setSummary(res.data);
      
      // Set user's existing rating
      if (isAuthenticated) {
        const userRating = res.data.ratings?.find(r => r.userId === user?.id);
        if (userRating) setRating(userRating.rating);
      }
    } catch (error) {
      console.error('Error fetching summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkFavorite = async () => {
    try {
      const res = await api.get('/favorites');
      const favorite = res.data.find(f => f.summaryId === parseInt(id));
      setIsFavorite(!!favorite);
    } catch (error) {
      console.error('Error checking favorite:', error);
    }
  };

  const toggleFavorite = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      if (isFavorite) {
        await api.delete(`/favorites/summary/${id}`);
        setIsFavorite(false);
      } else {
        await api.post(`/favorites/summary/${id}`);
        setIsFavorite(true);
      }
    } catch (error) {
      alert('שגיאה בעדכון מועדפים');
    }
  };

  const handleRate = async (newRating) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      await api.post(`/summaries/${id}/rate`, { rating: newRating });
      setRating(newRating);
      fetchSummary();
    } catch (error) {
      alert('שגיאה בדירוג');
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
      await api.post(`/summaries/${id}/comments`, { text: comment });
      setComment('');
      fetchSummary();
    } catch (error) {
      alert('שגיאה בהוספת תגובה');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownload = async () => {
    // Increment download counter
    try {
      await api.post(`/summaries/${id}/download`);
    } catch (error) {
      console.error('Error tracking download:', error);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('האם אתה בטוח שברצונך למחוק סיכום זה?')) return;

    try {
      await api.delete(`/summaries/${id}`);
      navigate('/summaries');
    } catch (error) {
      alert('שגיאה במחיקת סיכום');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="card text-center py-12">
        <p className="text-xl text-gray-600">סיכום לא נמצא</p>
        <Link to="/summaries" className="btn btn-primary mt-4">חזור לסיכומים</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="card">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{summary.title}</h1>
            <Link to={`/summaries?courseId=${summary.course.id}`} className="text-primary-600 hover:underline">
              {summary.course.courseName}
            </Link>
          </div>
          
          <div className="flex space-x-2 space-x-reverse">
            <button
              onClick={toggleFavorite}
              className={`btn ${isFavorite ? 'bg-yellow-500 text-white' : 'btn-secondary'}`}
              title={isFavorite ? 'הסר ממועדפים' : 'הוסף למועדפים'}
            >
              {isFavorite ? '⭐ מועדף' : '☆ הוסף למועדפים'}
            </button>
            
            {(user?.id === summary.uploadedById || user?.role === 'ADMIN') && (
              <button onClick={handleDelete} className="btn bg-red-600 text-white hover:bg-red-700">
                🗑️ מחק
              </button>
            )}
          </div>
        </div>

        {summary.description && (
          <p className="text-gray-700 mb-4">{summary.description}</p>
        )}

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-gray-600 space-x-4 space-x-reverse">
            <span>📤 הועלה על ידי <strong>{summary.uploadedBy.fullName}</strong></span>
            <span>•</span>
            <span>{new Date(summary.uploadDate).toLocaleDateString('he-IL')}</span>
            <span>•</span>
            <span>👁️ {summary.views} צפיות</span>
            <span>•</span>
            <span>📥 {summary.downloads} הורדות</span>
          </div>
          
          {summary.avgRating && (
            <div className="flex items-center bg-yellow-100 px-3 py-1 rounded">
              <span className="text-yellow-600 font-bold text-lg">{summary.avgRating.toFixed(1)}</span>
              <span className="text-yellow-600 mr-1">⭐</span>
              <span className="text-gray-600 text-sm mr-2">({summary.ratings.length})</span>
            </div>
          )}
        </div>

        {/* Download Button */}
        <a
          href={`/${summary.filePath}`}
          download
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleDownload}
          className="block w-full btn btn-primary text-center mt-4"
        >
          📥 הורד סיכום (PDF)
        </a>
      </div>

      {/* Rating */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">דרג סיכום זה</h2>
        {isAuthenticated ? (
          <div className="flex items-center space-x-2 space-x-reverse">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => handleRate(star)}
                className={`text-3xl transition ${
                  star <= rating ? 'text-yellow-500' : 'text-gray-300 hover:text-yellow-400'
                }`}
              >
                ⭐
              </button>
            ))}
            {rating > 0 && <span className="text-gray-600 mr-3">הדירוג שלך: {rating}/5</span>}
          </div>
        ) : (
          <p className="text-gray-600">
            <Link to="/login" className="text-primary-600 hover:underline">התחבר</Link> כדי לדרג
          </p>
        )}
      </div>

      {/* Comments */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">תגובות ({summary.comments?.length || 0})</h2>

        {/* Add Comment Form */}
        {isAuthenticated ? (
          <form onSubmit={handleAddComment} className="mb-6">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="input resize-none"
              rows="3"
              placeholder="כתוב תגובה..."
              required
            />
            <button type="submit" disabled={submitting} className="btn btn-primary mt-2">
              {submitting ? 'שולח...' : 'שלח תגובה'}
            </button>
          </form>
        ) : (
          <div className="mb-6 p-4 bg-gray-100 rounded-lg">
            <Link to="/login" className="text-primary-600 hover:underline">התחבר</Link> כדי להוסיף תגובה
          </div>
        )}

        {/* Comments List */}
        <div className="space-y-4">
          {summary.comments && summary.comments.length > 0 ? (
            summary.comments.map((c) => (
              <div key={c.id} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <strong className="text-gray-800">{c.author.fullName}</strong>
                  <span className="text-sm text-gray-500">
                    {new Date(c.createdAt).toLocaleDateString('he-IL')}
                  </span>
                </div>
                <p className="text-gray-700">{c.text}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">אין תגובות עדיין</p>
          )}
        </div>
      </div>
    </div>
  );
}