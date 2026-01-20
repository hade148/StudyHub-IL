import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { ChevronRight, Home, Wrench, Plus, Heart } from 'lucide-react';
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
    <div className="min-h-screen bg-gray-50 relative">
      {/* Subtle decorative gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-purple-50/30 pointer-events-none" />
      
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
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Wrench className="w-8 h-8 text-blue-600" />
                כלים אקדמיים
              </h1>
              <p className="text-sm text-gray-600 mt-2">כלים שימושיים לסטודנטים ללמידה יעילה</p>
            </div>
            <Button
              onClick={() => setIsAddDialogOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md transition-all"
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
          <TabsList className="bg-white rounded-xl shadow-sm border border-gray-200 p-1.5 w-full flex-wrap h-auto gap-1">
            <TabsTrigger value="all" className="flex-1 md:flex-none data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
              הכל
            </TabsTrigger>
            <TabsTrigger value="favorites" className="flex-1 md:flex-none data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
              <span className="flex items-center gap-1.5">
                מועדפים
                <Heart className="w-3.5 h-3.5" />
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
                <h3 className="text-xl font-semibold text-gray-700">לא נמצאו כלים{activeCategory !== 'all' ? ' בקטגוריה זו' : ''}</h3>
                <p className="text-gray-600">
                  {activeCategory === 'all'
                    ? 'התחל על ידי הוספת כלי חדש'
                    : 'נסה לבחור קטגוריה אחרת או הוסף כלי חדש'}
                </p>
                <Button
                  onClick={() => setIsAddDialogOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
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
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 rounded-lg bg-blue-50 border border-blue-100">
              <div className="text-4xl font-bold text-blue-600 mb-2">{tools.length}</div>
              <p className="text-sm text-gray-600">כלים זמינים</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-purple-50 border border-purple-100">
              <div className="text-4xl font-bold text-purple-600 mb-2">
                {tools.filter((t) => t.isFavorite).length}
              </div>
              <p className="text-sm text-gray-600">כלים מועדפים</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-green-50 border border-green-100">
              <div className="text-4xl font-bold text-green-600 mb-2">
                {Array.from(new Set(tools.map((t) => t.category))).length}
              </div>
              <p className="text-sm text-gray-600">קטגוריות</p>
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
          <p>יש לך רעיון לכלי חדש? הוסף אותו עכשיו!</p>
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
