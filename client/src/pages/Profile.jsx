import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

export default function Profile() {
  const { user, setUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    language: 'he'
  });
  const [profilePicture, setProfilePicture] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/auth/me');
      setProfile(res.data);
      setFormData({
        fullName: res.data.fullName,
        language: res.data.language || 'he'
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.patch('/auth/profile', formData);
      setProfile(res.data.user);
      setEditing(false);
      alert('פרופיל עודכן בהצלחה!');
    } catch (error) {
      alert('שגיאה בעדכון פרופיל');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadPicture = async (e) => {
    e.preventDefault();
    if (!profilePicture) return;

    setUploading(true);
    const formDataToSend = new FormData();
    formDataToSend.append('profilePicture', profilePicture);

    try {
      const res = await api.post('/auth/profile-picture', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setProfile({ ...profile, profilePicture: res.data.user.profilePicture });
      setProfilePicture(null);
      alert('תמונת פרופיל הועלתה בהצלחה!');
    } catch (error) {
      alert(error.response?.data?.error || 'שגיאה בהעלאת תמונה');
    } finally {
      setUploading(false);
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
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">הפרופיל שלי 👤</h1>

      {/* Profile Picture */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">תמונת פרופיל</h2>
        <div className="flex items-center space-x-6 space-x-reverse">
          {profile?.profilePicture ? (
            <img
              src={`/${profile.profilePicture}`}
              alt={profile.fullName}
              className="w-24 h-24 rounded-full object-cover border-4 border-primary-600"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold text-3xl">
              {profile?.fullName?.charAt(0)}
            </div>
          )}
          
          <div className="flex-1">
            <form onSubmit={handleUploadPicture} className="space-y-3">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setProfilePicture(e.target.files[0])}
                className="input"
              />
              {profilePicture && (
                <button
                  type="submit"
                  disabled={uploading}
                  className="btn btn-primary"
                >
                  {uploading ? 'מעלה...' : '📤 העלה תמונה'}
                </button>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* Profile Info */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">פרטים אישיים</h2>
          <button
            onClick={() => setEditing(!editing)}
            className="btn btn-secondary"
          >
            {editing ? 'ביטול' : '✏️ ערוך'}
          </button>
        </div>

        {editing ? (
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">שם מלא</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">שפה</label>
                <select
                  value={formData.language}
                  onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                  className="input"
                >
                  <option value="he">עברית 🇮🇱</option>
                  <option value="en">English 🇺🇸</option>
                </select>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? 'שומר...' : 'שמור שינויים'}
            </button>
          </form>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-600 text-sm mb-1">שם מלא</label>
              <p className="text-xl font-semibold">{profile?.fullName}</p>
            </div>
            <div>
              <label className="block text-gray-600 text-sm mb-1">אימייל</label>
              <p className="text-xl font-semibold">{profile?.email}</p>
            </div>
            <div>
              <label className="block text-gray-600 text-sm mb-1">תפקיד</label>
              <p className="text-xl font-semibold">
                {profile?.role === 'ADMIN' ? '🔑 מנהל' : '👨‍🎓 סטודנט'}
              </p>
            </div>
            <div>
              <label className="block text-gray-600 text-sm mb-1">שפה</label>
              <p className="text-xl font-semibold">
                {profile?.language === 'he' ? 'עברית 🇮🇱' : 'English 🇺🇸'}
              </p>
            </div>
            <div>
              <label className="block text-gray-600 text-sm mb-1">חבר מאז</label>
              <p className="text-xl font-semibold">
                {new Date(profile?.createdAt).toLocaleDateString('he-IL')}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Statistics */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="card text-center">
          <div className="text-4xl mb-2">📚</div>
          <p className="text-3xl font-bold text-primary-600">{profile?._count?.summaries || 0}</p>
          <p className="text-gray-600">סיכומים שהעליתי</p>
        </div>
        <div className="card text-center">
          <div className="text-4xl mb-2">💬</div>
          <p className="text-3xl font-bold text-primary-600">{profile?._count?.forumPosts || 0}</p>
          <p className="text-gray-600">שאלות שפתחתי</p>
        </div>
        <div className="card text-center">
          <div className="text-4xl mb-2">⭐</div>
          <p className="text-3xl font-bold text-primary-600">{profile?._count?.ratings || 0}</p>
          <p className="text-gray-600">דירוגים שנתתי</p>
        </div>
      </div>
    </div>
  );
}