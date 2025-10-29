import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

export default function HelpRequests() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    details: '',
    courseId: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [requestsRes, coursesRes] = await Promise.all([
        api.get('/help-requests'),
        api.get('/courses')
      ]);
      setRequests(requestsRes.data);
      setCourses(coursesRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/help-requests', formData);
      setFormData({ title: '', details: '', courseId: '' });
      setShowForm(false);
      fetchData();
    } catch (error) {
      alert('שגיאה ביצירת בקשה');
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await api.patch(`/help-requests/${id}/status`, { status });
      fetchData();
    } catch (error) {
      alert('שגיאה בעדכון סטטוס');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('האם אתה בטוח?')) return;
    try {
      await api.delete(`/help-requests/${id}`);
      fetchData();
    } catch (error) {
      alert('שגיאה במחיקה');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">בקשות עזרה 🆘</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">
          {showForm ? 'ביטול' : '+ בקשת עזרה חדשה'}
        </button>
      </div>

      {showForm && (
        <div className="card">
          <h2 className="text-xl font-bold mb-4">צור בקשת עזרה</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">נושא *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="input"
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
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>{c.courseName}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">פרטים</label>
              <textarea
                value={formData.details}
                onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                className="input resize-none"
                rows="4"
              />
            </div>
            <button type="submit" className="btn btn-primary">שלח בקשה</button>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {requests.map((req) => (
          <div key={req.id} className="card">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-2">{req.title}</h3>
                <p className="text-sm text-gray-600 mb-2">{req.course?.courseName}</p>
                {req.details && <p className="text-gray-700 mb-3">{req.details}</p>}
                <p className="text-sm text-gray-500">
                  נוצר על ידי {req.author?.fullName} • {new Date(req.createdAt).toLocaleDateString('he-IL')}
                </p>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <span className={`px-3 py-1 rounded text-sm font-semibold ${
                  req.status === 'open' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                }`}>
                  {req.status === 'open' ? 'פתוח' : 'סגור'}
                </span>
                {user?.id === req.authorId && (
                  <>
                    <button
                      onClick={() => handleStatusChange(req.id, req.status === 'open' ? 'closed' : 'open')}
                      className="btn btn-secondary text-sm"
                    >
                      {req.status === 'open' ? 'סגור' : 'פתח מחדש'}
                    </button>
                    <button onClick={() => handleDelete(req.id)} className="text-red-600 hover:text-red-700">
                      🗑️
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}