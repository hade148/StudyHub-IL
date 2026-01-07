import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { ChevronRight, Home, Wrench, Plus } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { Button } from '../ui/button';
import { ToolCard } from './ToolCard';
import { AddToolDialog } from './AddToolDialog';
import { ToolDetailDialog } from './ToolDetailDialog';
import api from '../../utils/api';

interface Tool {
  id: number;
  title: string;
  description: string;
  url: string;
  category: string;
  avgRating: number | null;
  ratingCount: number;
  isFavorite: boolean;
  addedBy?: {
    id: number;
    fullName: string;
  };
  createdAt?: string;
}

interface ToolsPageProps {
  onNavigateHome: () => void;
}

export function ToolsPage({ onNavigateHome }: ToolsPageProps) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);

  // Check URL params for addTool query
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('addTool') === 'true') {
      setIsAddDialogOpen(true);
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const loadTools = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/tools');
      setTools(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'שגיאה בטעינת כלים');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTools();
  }, []);

  const handleToggleFavorite = async (toolId: number) => {
    const tool = tools.find((t) => t.id === toolId);
    if (!tool) return;

    try {
      if (tool.isFavorite) {
        await api.delete(`/favorites/tool/${toolId}`);
      } else {
        await api.post(`/favorites/tool/${toolId}`);
      }

      // Update local state
      setTools((prevTools) =>
        prevTools.map((t) =>
          t.id === toolId ? { ...t, isFavorite: !t.isFavorite } : t
        )
      );
    } catch (err: any) {
      console.error('Toggle favorite error:', err);
    }
  };

  const handleAddSuccess = () => {
    setSuccessMessage('הכלי נוסף בהצלחה! ✅');
    loadTools();
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const filterToolsByCategory = (category: string) => {
    if (category === 'all') return tools;
    if (category === 'favorites') return tools.filter((tool) => tool.isFavorite);
    return tools.filter((tool) => tool.category === category);
  };

  const filteredTools = filterToolsByCategory(activeCategory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl" />
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4 py-8 space-y-8 relative z-10"
      >
        {/* Page Header */}
        <div className="space-y-4">
          {/* Title */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-l from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">כלים אקדמיים</h1>
              <p className="text-sm text-gray-600 mt-1">כלים שימושיים לסטודנטים</p>
            </div>
            <Button
              onClick={() => setIsAddDialogOpen(true)}
              className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:shadow-lg hover:scale-[1.02] transition-all duration-200 text-white font-medium"
              aria-label="הוסף כלי חדש"
            >
              <Plus className="w-4 h-4 ml-2" />
              הוסף כלי
            </Button>
          </div>

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <button
              onClick={onNavigateHome}
              className="hover:text-blue-600 transition-colors flex items-center gap-1"
            >
              <Home className="w-4 h-4" />
              דף הבית
            </button>
            <ChevronRight className="w-4 h-4" />
            <span>כלים</span>
          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg"
          >
            {successMessage}
          </motion.div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Category Tabs */}
        <Tabs defaultValue="all" className="w-full" onValueChange={setActiveCategory}>
          <TabsList className="bg-white rounded-lg shadow-sm p-1 w-full flex-wrap h-auto">
            <TabsTrigger value="all" className="flex-1 md:flex-none">
              הכל
            </TabsTrigger>
            <TabsTrigger value="favorites" className="flex-1 md:flex-none">
              <span className="flex items-center gap-1">
                מועדפים
                <span>❤️</span>
              </span>
            </TabsTrigger>
            <TabsTrigger value="מחשבונים" className="flex-1 md:flex-none">
              <span className="flex items-center gap-1">
                מחשבונים
                <span>🧮</span>
              </span>
            </TabsTrigger>
            <TabsTrigger value="ממירים" className="flex-1 md:flex-none">
              <span className="flex items-center gap-1">
                ממירים
                <span>🔄</span>
              </span>
            </TabsTrigger>
            <TabsTrigger value="מתכננים" className="flex-1 md:flex-none">
              <span className="flex items-center gap-1">
                מתכננים
                <span>📅</span>
              </span>
            </TabsTrigger>
            <TabsTrigger value="יצירה" className="flex-1 md:flex-none">
              <span className="flex items-center gap-1">
                יצירה
                <span>✏️</span>
              </span>
            </TabsTrigger>
            <TabsTrigger value="אחר" className="flex-1 md:flex-none">
              <span className="flex items-center gap-1">
                אחר
                <span>📦</span>
              </span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeCategory} className="space-y-8 mt-8">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">טוען כלים...</p>
                </div>
              </div>
            ) : filteredTools.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTools.map((tool, index) => (
                  <ToolCard
                    key={tool.id}
                    tool={tool}
                    index={index}
                    onToggleFavorite={handleToggleFavorite}
                    onCardClick={() => setSelectedTool(tool)}
                  />
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-lg p-12 text-center space-y-4"
              >
                <div className="text-6xl">🔍</div>
                <h3>לא נמצאו כלים{activeCategory !== 'all' ? ' בקטגוריה זו' : ''}</h3>
                <p className="text-gray-600">
                  {activeCategory === 'all'
                    ? 'התחל על ידי הוספת כלי חדש'
                    : 'נסה לבחור קטגוריה אחרת או הוסף כלי חדש'}
                </p>
                <Button
                  onClick={() => setIsAddDialogOpen(true)}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                  aria-label="הוסף כלי חדש"
                >
                  <Plus className="w-4 h-4 ml-2" />
                  הוסף כלי
                </Button>
              </motion.div>
            )}
          </TabsContent>
        </Tabs>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-xl shadow-lg p-8 text-white"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-4xl mb-2">{tools.length}</div>
              <p className="opacity-90">כלים זמינים</p>
            </div>
            <div>
              <div className="text-4xl mb-2">
                {tools.filter((t) => t.isFavorite).length}
              </div>
              <p className="opacity-90">כלים מועדפים</p>
            </div>
            <div>
              <div className="text-4xl mb-2">
                {Array.from(new Set(tools.map((t) => t.category))).length}
              </div>
              <p className="opacity-90">קטגוריות</p>
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center py-8 text-gray-600 border-t border-gray-200"
        >
          <p>💡 יש לך רעיון לכלי חדש? הוסף אותו עכשיו!</p>
        </motion.div>
      </motion.div>

      {/* Add Tool Dialog */}
      <AddToolDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSuccess={handleAddSuccess}
      />

      {/* Tool Detail Dialog */}
      {selectedTool && (
        <ToolDetailDialog
          tool={selectedTool}
          isOpen={!!selectedTool}
          onClose={() => setSelectedTool(null)}
          onToggleFavorite={handleToggleFavorite}
          onRatingUpdate={loadTools}
        />
      )}
    </div>
  );
}
