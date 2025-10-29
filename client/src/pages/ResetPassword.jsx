import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('הסיסמאות אינן תואמות');
      return;
    }

    if (newPassword.length < 6) {
      setError('הסיסמה חייבת להכיל לפחות 6 תווים');
      return;
    }

    setLoading(true);

    try {
      await api.post('/auth/reset-password', { token, newPassword });
      alert('סיסמה אופסה בהצלחה! ניתן להתחבר עכשיו');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error || 'שגיאה באיפוס סיסמה');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12">
      <div className="card">
        <h1 className="text-3xl font-bold mb-2 text-center">איפוס סיסמה 🔑</h1>
        <p className="text-gray-600 mb-6 text-center">
          הזן סיסמה חדשה לחשבון שלך
        </p>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">סיסמה חדשה</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="input"
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">אימות סיסמה</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input"
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn btn-primary"
          >
            {loading ? 'מאפס...' : 'אפס סיסמה'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/login" className="text-primary-600 hover:underline">
            ← חזור להתחברות
          </Link>
        </div>
      </div>
    </div>
  );
}