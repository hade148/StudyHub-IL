import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

export default function CreateForumPost() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    courseId: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await api.get('/courses');
      setCourses(res.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const res = await api.post('/forum', formData);
      navigate(`/forum/${res.data.post.id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'שגיאה ביצירת שאלה');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card">
        <h1 className="text-3xl font-bold mb-6">שאל שאלה חדשה 💬</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">כותרת השאלה *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="input"
              placeholder="למשל: איך מממשים Linked List ב-C?"
              required
              minLength={5}
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">קורס *</label>
            <select
              value={formData.courseId}
              onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
              className="input"
              required
            >
              <option value="">בחר קורס</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.courseName} ({course.courseCode})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">תוכן השאלה *</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="input resize-none"
              rows="8"
              placeholder="פרט את השאלה שלך..."
              required
              minLength={10}
            />
          </div>

          <div className="flex space-x-4 space-x-reverse">
            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary flex-1"
            >
              {submitting ? 'שולח...' : 'פרסם שאלה'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/forum')}
              className="btn btn-secondary"
            >
              ביטול
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}