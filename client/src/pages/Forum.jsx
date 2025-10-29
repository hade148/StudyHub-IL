import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function Forum() {
  const { isAuthenticated } = useAuth();
  const [posts, setPosts] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    courseId: '',
    search: '',
    answered: ''
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [filters]);

  const fetchCourses = async () => {
    try {
      const res = await api.get('/courses');
      setCourses(res.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.courseId) params.append('courseId', filters.courseId);
      if (filters.search) params.append('search', filters.search);
      if (filters.answered) params.append('answered', filters.answered);

      const res = await api.get(`/forum?${params}`);
      setPosts(res.data);
    } catch (error) {
      console.error('Error fetching forum posts:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">פורום שאלות ותשובות 💬</h1>
        {isAuthenticated && (
          <Link to="/forum/create" className="btn btn-primary">
            + שאל שאלה
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">קורס</label>
            <select
              value={filters.courseId}
              onChange={(e) => setFilters({ ...filters, courseId: e.target.value })}
              className="input"
            >
              <option value="">כל הקורסים</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.courseName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">חיפוש</label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="input"
              placeholder="חפש שאלה..."
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">סטטוס</label>
            <select
              value={filters.answered}
              onChange={(e) => setFilters({ ...filters, answered: e.target.value })}
              className="input"
            >
              <option value="">הכל</option>
              <option value="false">ממתין לתשובה</option>
              <option value="true">נענה</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : posts.length > 0 ? (
        <div className="space-y-4">
          {posts.map((post) => (
            <Link
              key={post.id}
              to={`/forum/${post.id}`}
              className="card hover:shadow-xl transition block"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-gray-800 mb-2">{post.title}</h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{post.content}</p>
                  
                  <div className="flex items-center space-x-4 space-x-reverse text-sm text-gray-500">
                    <span>📚 {post.course?.courseName}</span>
                    <span>👤 {post.author?.fullName}</span>
                    <span>💬 {post._count?.comments || 0} תגובות</span>
                    <span>👁️ {post.views} צפיות</span>
                  </div>
                </div>

                <span className={`px-3 py-1 rounded text-sm font-semibold ${
                  post.isAnswered 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {post.isAnswered ? '✓ נענתה' : 'ממתין'}
                </span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="card text-center py-12">
          <div className="text-6xl mb-4">💭</div>
          <p className="text-xl text-gray-600">לא נמצאו שאלות</p>
          {isAuthenticated && (
            <Link to="/forum/create" className="inline-block mt-4 btn btn-primary">
              שאל את השאלה הראשונה!
            </Link>
          )}
        </div>
      )}
    </div>
  );
}