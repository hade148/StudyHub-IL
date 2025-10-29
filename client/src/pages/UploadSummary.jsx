import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

export default function UploadSummary() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    courseId: ''
  });
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
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

    if (!file) {
      setError('יש לבחור קובץ PDF');
      return;
    }

    if (file.type !== 'application/pdf') {
      setError('רק קבצי PDF מותרים');
      return;
    }

    setUploading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('courseId', formData.courseId);
      formDataToSend.append('file', file);

      const res = await api.post('/summaries', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      navigate(`/summaries/${res.data.summary.id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'שגיאה בהעלאת סיכום');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card">
        <h1 className="text-3xl font-bold mb-6">העלאת סיכום חדש 📤</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">כותרת הסיכום *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="input"
              placeholder="למשל: סיכום מקיף לקורס מבני נתונים"
              required
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
            <label className="block text-gray-700 font-semibold mb-2">תיאור (אופציונלי)</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input resize-none"
              rows="4"
              placeholder="תאר את תוכן הסיכום..."
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">קובץ PDF *</label>
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => setFile(e.target.files[0])}
              className="input"
              required
            />
            {file && (
              <p className="text-sm text-gray-600 mt-2">
                קובץ נבחר: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
          </div>

          <div className="flex space-x-4 space-x-reverse">
            <button
              type="submit"
              disabled={uploading}
              className="btn btn-primary flex-1"
            >
              {uploading ? 'מעלה...' : 'העלה סיכום'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/summaries')}
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