import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentSummaries, setRecentSummaries] = useState([]);
  const [recentPosts, setRecentPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, summariesRes, postsRes] = await Promise.all([
          api.get('/auth/me'),
          api.get('/summaries?limit=5'),
          api.get('/forum?limit=5')
        ]);
        
        setStats(userRes.data._count);
        setRecentSummaries(summariesRes.data.slice(0, 5));
        setRecentPosts(postsRes.data.slice(0, 5));
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="card bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <h1 className="text-3xl font-bold mb-2">שלום, {user?.fullName}! 👋</h1>
        <p className="text-primary-100">ברוך הבא ללוח הבקרה שלך</p>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="card hover:shadow-xl transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 mb-1">הסיכומים שלי</p>
              <p className="text-3xl font-bold text-primary-600">{stats?.summaries || 0}</p>
            </div>
            <div className="text-4xl">📚</div>
          </div>
        </div>

        <div className="card hover:shadow-xl transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 mb-1">שאלות שפתחתי</p>
              <p className="text-3xl font-bold text-primary-600">{stats?.forumPosts || 0}</p>
            </div>
            <div className="text-4xl">💬</div>
          </div>
        </div>

        <div className="card hover:shadow-xl transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 mb-1">דירוגים שנתתי</p>
              <p className="text-3xl font-bold text-primary-600">{stats?.ratings || 0}</p>
            </div>
            <div className="text-4xl">⭐</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 className="text-2xl font-bold mb-4">פעולות מהירות</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <Link to="/summaries/upload" className="btn btn-primary text-center">
            📤 העלה סיכום
          </Link>
          <Link to="/forum/create" className="btn btn-secondary text-center">
            ✏️ שאל שאלה
          </Link>
          <Link to="/summaries" className="btn btn-secondary text-center">
            🔍 חפש סיכומים
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Summaries */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4">סיכומים אחרונים</h2>
          <div className="space-y-3">
            {recentSummaries.length > 0 ? (
              recentSummaries.map((summary) => (
                <Link
                  key={summary.id}
                  to={`/summaries/${summary.id}`}
                  className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                >
                  <p className="font-semibold text-gray-800">{summary.title}</p>
                  <p className="text-sm text-gray-600">{summary.course?.courseName}</p>
                </Link>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">אין סיכומים אחרונים</p>
            )}
          </div>
          <Link to="/summaries" className="block mt-4 text-primary-600 font-semibold hover:underline text-center">
            צפה בכל הסיכומים →
          </Link>
        </div>

        {/* Recent Forum Posts */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4">שאלות אחרונות בפורום</h2>
          <div className="space-y-3">
            {recentPosts.length > 0 ? (
              recentPosts.map((post) => (
                <Link
                  key={post.id}
                  to={`/forum/${post.id}`}
                  className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                >
                  <p className="font-semibold text-gray-800">{post.title}</p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-sm text-gray-600">{post.course?.courseName}</p>
                    <span className={`text-xs px-2 py-1 rounded ${
                      post.isAnswered ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {post.isAnswered ? '✓ נענתה' : 'ממתין'}
                    </span>
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">אין שאלות אחרונות</p>
            )}
          </div>
          <Link to="/forum" className="block mt-4 text-primary-600 font-semibold hover:underline text-center">
            צפה בכל הפורום →
          </Link>
        </div>
      </div>
    </div>
  );
}