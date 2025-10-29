import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function Summaries() {
  const { isAuthenticated } = useAuth();
  const [summaries, setSummaries] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    courseId: '',
    search: '',
    sortBy: 'recent'
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    fetchSummaries();
  }, [filters]);

  const fetchCourses = async () => {
    try {
      const res = await api.get('/courses');
      setCourses(res.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const fetchSummaries = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.courseId) params.append('courseId', filters.courseId);
      if (filters.search) params.append('search', filters.search);
      if (filters.sortBy) params.append('sortBy', filters.sortBy);

      const res = await api.get(`/summaries?${params}`);
      setSummaries(res.data);
    } catch (error) {
      console.error('Error fetching summaries:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">סיכומים 📚</h1>
        {isAuthenticated && (
          <Link to="/summaries/upload" className="btn btn-primary">
            + העלה סיכום
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
              placeholder="חפש סיכום..."
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">מיון</label>
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
              className="input"
            >
              <option value="recent">אחרונים</option>
              <option value="rating">דירוג</option>
              <option value="title">שם</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : summaries.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {summaries.map((summary) => (
            <Link
              key={summary.id}
              to={`/summaries/${summary.id}`}
              className="card hover:shadow-xl transition"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-bold text-lg text-gray-800 flex-1">{summary.title}</h3>
                {summary.avgRating && (
                  <div className="flex items-center bg-yellow-100 px-2 py-1 rounded">
                    <span className="text-yellow-600 font-semibold">{summary.avgRating.toFixed(1)}</span>
                    <span className="text-yellow-600 mr-1">⭐</span>
                  </div>
                )}
              </div>

              <p className="text-sm text-gray-600 mb-2">{summary.course?.courseName}</p>
              
              {summary.description && (
                <p className="text-gray-700 text-sm mb-3 line-clamp-2">{summary.description}</p>
              )}

              <div className="flex items-center justify-between text-sm text-gray-500 pt-3 border-t">
                <span>📤 {summary.uploadedBy?.fullName}</span>
                <span>💬 {summary._count?.comments || 0}</span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="card text-center py-12">
          <div className="text-6xl mb-4">📭</div>
          <p className="text-xl text-gray-600">לא נמצאו סיכומים</p>
          {isAuthenticated && (
            <Link to="/summaries/upload" className="inline-block mt-4 btn btn-primary">
              העלה את הסיכום הראשון!
            </Link>
          )}
        </div>
      )}
    </div>
  );
}