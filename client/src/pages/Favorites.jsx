import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

export default function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('summaries'); // summaries or tools

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      const res = await api.get('/favorites');
      setFavorites(res.data);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (type, id) => {
    if (!window.confirm('האם להסיר מהמועדפים?')) return;

    try {
      await api.delete(`/favorites/${type}/${id}`);
      fetchFavorites();
    } catch (error) {
      alert('שגיאה בהסרה');
    }
  };

  const summaryFavorites = favorites.filter(f => f.summary);
  const toolFavorites = favorites.filter(f => f.tool);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">המועדפים שלי ⭐</h1>

      {/* Tabs */}
      <div className="flex space-x-4 space-x-reverse border-b">
        <button
          onClick={() => setActiveTab('summaries')}
          className={`px-4 py-2 font-semibold transition ${
            activeTab === 'summaries'
              ? 'border-b-2 border-primary-600 text-primary-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          סיכומים ({summaryFavorites.length})
        </button>
        <button
          onClick={() => setActiveTab('tools')}
          className={`px-4 py-2 font-semibold transition ${
            activeTab === 'tools'
              ? 'border-b-2 border-primary-600 text-primary-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          כלים ({toolFavorites.length})
        </button>
      </div>

      {/* Content */}
      {activeTab === 'summaries' && (
        <div>
          {summaryFavorites.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {summaryFavorites.map((fav) => (
                <div key={fav.id} className="card hover:shadow-xl transition">
                  <div className="flex justify-between items-start mb-3">
                    <Link
                      to={`/summaries/${fav.summary.id}`}
                      className="flex-1 font-bold text-lg text-gray-800 hover:text-primary-600"
                    >
                      {fav.summary.title}
                    </Link>
                    <button
                      onClick={() => removeFavorite('summary', fav.summary.id)}
                      className="text-red-600 hover:text-red-700"
                      title="הסר מהמועדפים"
                    >
                      🗑️
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {fav.summary.course?.courseName}
                  </p>
                  {fav.summary.avgRating && (
                    <div className="flex items-center">
                      <span className="text-yellow-600">⭐</span>
                      <span className="text-sm mr-1">{fav.summary.avgRating.toFixed(1)}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="card text-center py-12">
              <span className="text-6xl block mb-4">📚</span>
              <p className="text-xl text-gray-600">אין סיכומים מועדפים</p>
              <Link to="/summaries" className="btn btn-primary mt-4">
                חפש סיכומים
              </Link>
            </div>
          )}
        </div>
      )}

      {activeTab === 'tools' && (
        <div>
          {toolFavorites.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {toolFavorites.map((fav) => (
                <div key={fav.id} className="card hover:shadow-xl transition">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="flex-1 font-bold text-lg text-gray-800">
                      {fav.tool.title}
                    </h3>
                    <button
                      onClick={() => removeFavorite('tool', fav.tool.id)}
                      className="text-red-600 hover:text-red-700"
                      title="הסר מהמועדפים"
                    >
                      🗑️
                    </button>
                  </div>
                  {fav.tool.description && (
                    <p className="text-sm text-gray-700 mb-3">{fav.tool.description}</p>
                  )}
                  <a
                    href={fav.tool.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary w-full text-center"
                  >
                    🔗 פתח כלי
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <div className="card text-center py-12">
              <span className="text-6xl block mb-4">🛠️</span>
              <p className="text-xl text-gray-600">אין כלים מועדפים</p>
              <Link to="/tools" className="btn btn-primary mt-4">
                גלה כלים
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}