import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

export default function Tools() {
  const { isAuthenticated, user } = useAuth();
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    description: '',
    category: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTools();
  }, []);

  const fetchTools = async () => {
    setLoading(true);
    try {
      const res = await api.get('/tools');
      setTools(res.data);
    } catch (error) {
      console.error('Error fetching tools:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await api.post('/tools', formData);
      setFormData({ title: '', url: '', description: '', category: '' });
      setShowAddForm(false);
      fetchTools();
    } catch (error) {
      alert('שגיאה בהוספת כלי');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('האם אתה בטוח שברצונך למחוק כלי זה?')) return;

    try {
      await api.delete(`/tools/${id}`);
      fetchTools();
    } catch (error) {
      alert('שגיאה במחיקת כלי');
    }
  };

  const categories = [...new Set(tools.map(t => t.category).filter(Boolean))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">כלים לימודיים 🛠️</h1>
        {isAuthenticated && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="btn btn-primary"
          >
            {showAddForm ? 'ביטול' : '+ הוסף כלי'}
          </button>
        )}
      </div>

      {/* Add Tool Form */}
      {showAddForm && (
        <div className="card">
          <h2 className="text-xl font-bold mb-4">הוסף כלי חדש</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">שם הכלי *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="input"
                  placeholder="Visual Studio Code"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">קטגוריה</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="input"
                  placeholder="IDE, Resources, Tools..."
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">כתובת URL *</label>
              <input
                type="url"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                className="input"
                placeholder="https://example.com"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">תיאור</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input resize-none"
                rows="3"
                placeholder="תאר את הכלי..."
              />
            </div>

            <button type="submit" disabled={submitting} className="btn btn-primary">
              {submitting ? 'מוסיף...' : 'הוסף כלי'}
            </button>
          </form>
        </div>
      )}

      {/* Tools List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : tools.length > 0 ? (
        <div>
          {categories.length > 0 ? (
            categories.map((category) => (
              <div key={category} className="mb-8">
                <h2 className="text-2xl font-bold mb-4">{category}</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {tools
                    .filter((tool) => tool.category === category)
                    .map((tool) => (
                      <ToolCard key={tool.id} tool={tool} onDelete={handleDelete} user={user} />
                    ))}
                </div>
              </div>
            ))
          ) : null}

          {/* Uncategorized tools */}
          {tools.filter(t => !t.category).length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-4">כללי</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tools
                  .filter((tool) => !tool.category)
                  .map((tool) => (
                    <ToolCard key={tool.id} tool={tool} onDelete={handleDelete} user={user} />
                  ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="card text-center py-12">
          <div className="text-6xl mb-4">🛠️</div>
          <p className="text-xl text-gray-600">אין כלים עדיין</p>
          {isAuthenticated && (
            <button onClick={() => setShowAddForm(true)} className="btn btn-primary mt-4">
              הוסף את הכלי הראשון!
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function ToolCard({ tool, onDelete, user }) {
  return (
    <div className="card hover:shadow-xl transition">
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-bold text-lg text-gray-800">{tool.title}</h3>
        {(user?.id === tool.addedById || user?.role === 'ADMIN') && (
          <button
            onClick={() => onDelete(tool.id)}
            className="text-red-600 hover:text-red-700"
          >
            🗑️
          </button>
        )}
      </div>

      {tool.description && (
        <p className="text-gray-700 text-sm mb-4">{tool.description}</p>
      )}

      <a
        href={tool.url}
        target="_blank"
        rel="noopener noreferrer"
        className="btn btn-primary w-full text-center"
      >
        🔗 פתח כלי
      </a>

      <p className="text-xs text-gray-500 mt-3">
        נוסף על ידי {tool.addedBy?.fullName}
      </p>
    </div>
  );
}