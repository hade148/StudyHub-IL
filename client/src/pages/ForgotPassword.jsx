import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [devToken, setDevToken] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/forgot-password', { email });
      setSuccess(true);
      // In development, show the token
      if (res.data.devToken) {
        setDevToken(res.data.devToken);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'שגיאה בשליחת בקשה');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-md mx-auto mt-12">
        <div className="card text-center">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-2xl font-bold mb-4">בקשה נשלחה!</h1>
          <p className="text-gray-600 mb-6">
            אם האימייל קיים במערכת, נשלח אליך קישור לאיפוס סיסמה.
          </p>
          
          {devToken && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-sm font-semibold text-yellow-800 mb-2">
                🔧 מצב פיתוח - טוקן איפוס:
              </p>
              <code className="text-xs bg-yellow-100 px-2 py-1 rounded block mb-2 break-all">
                {devToken}
              </code>
              <Link 
                to={`/reset-password/${devToken}`}
                className="text-sm text-primary-600 hover:underline"
              >
                לחץ כאן לאיפוס סיסמה →
              </Link>
            </div>
          )}

          <Link to="/login" className="btn btn-primary">
            חזור להתחברות
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-12">
      <div className="card">
        <h1 className="text-3xl font-bold mb-2 text-center">שכחת סיסמה? 🔐</h1>
        <p className="text-gray-600 mb-6 text-center">
          הזן את האימייל שלך ונשלח לך קישור לאיפוס סיסמה
        </p>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">אימייל</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              placeholder="your@email.com"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn btn-primary"
          >
            {loading ? 'שולח...' : 'שלח קישור לאיפוס'}
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