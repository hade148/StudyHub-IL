import React, { useEffect, useState } from 'react';
import api from '../utils/api';

export default function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, statsRes] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/stats')
      ]);
      setUsers(usersRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.patch(`/admin/users/${userId}/role`, { role: newRole });
      fetchData();
    } catch (error) {
      alert('שגיאה בעדכון תפקיד');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('האם אתה בטוח שברצונך למחוק משתמש זה?')) return;

    try {
      await api.delete(`/admin/users/${userId}`);
      fetchData();
    } catch (error) {
      alert('שגיאה במחיקת משתמש');
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
      <h1 className="text-3xl font-bold text-red-600">🔑 פאנל ניהול</h1>

      {/* Stats */}
      <div className="grid md:grid-cols-5 gap-4">
        <div className="card text-center">
          <p className="text-2xl font-bold text-primary-600">{stats?.totalUsers || 0}</p>
          <p className="text-gray-600">משתמשים</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-primary-600">{stats?.totalCourses || 0}</p>
          <p className="text-gray-600">קורסים</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-primary-600">{stats?.totalSummaries || 0}</p>
          <p className="text-gray-600">סיכומים</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-primary-600">{stats?.totalForumPosts || 0}</p>
          <p className="text-gray-600">שאלות</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-primary-600">{stats?.totalTools || 0}</p>
          <p className="text-gray-600">כלים</p>
        </div>
      </div>

      {/* Users Table */}
      <div className="card">
        <h2 className="text-2xl font-bold mb-4">ניהול משתמשים</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-right">שם</th>
                <th className="px-4 py-3 text-right">אימייל</th>
                <th className="px-4 py-3 text-right">תפקיד</th>
                <th className="px-4 py-3 text-right">סיכומים</th>
                <th className="px-4 py-3 text-right">שאלות</th>
                <th className="px-4 py-3 text-right">פעולות</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-t">
                  <td className="px-4 py-3">{user.fullName}</td>
                  <td className="px-4 py-3">{user.email}</td>
                  <td className="px-4 py-3">
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      className={`px-2 py-1 rounded ${
                        user.role === 'ADMIN' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      <option value="USER">USER</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">{user._count?.summaries || 0}</td>
                  <td className="px-4 py-3">{user._count?.forumPosts || 0}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      🗑️ מחק
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Activity */}
      {stats?.recentActivity && (
        <div className="card">
          <h2 className="text-2xl font-bold mb-4">פעילות אחרונה</h2>
          <div className="space-y-2">
            {stats.recentActivity.map((item) => (
              <div key={item.id} className="p-3 bg-gray-50 rounded">
                <p className="font-semibold">{item.title}</p>
                <p className="text-sm text-gray-600">
                  {item.course?.courseName} • {item.uploadedBy?.fullName}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}