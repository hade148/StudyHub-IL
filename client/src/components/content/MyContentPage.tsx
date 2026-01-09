import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  FileText, 
  MessageCircle, 
  Wrench, 
  Edit, 
  Trash2, 
  Star,
  Eye,
  Download,
  Heart,
  Calendar,
  AlertCircle,
  Home,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import { EditSummaryDialog } from './EditSummaryDialog';
import { EditToolDialog } from './EditToolDialog';
import { EditForumPostDialog } from './EditForumPostDialog';
import { DeleteConfirmDialog } from './DeleteConfirmDialog';

interface Summary {
  id: number;
  title: string;
  description: string | null;
  filePath: string;
  uploadDate: string;
  avgRating: number | null;
  course: {
    courseCode: string;
    courseName: string;
  };
  _count: {
    ratings: number;
    comments: number;
  };
}

interface Tool {
  id: number;
  title: string;
  url: string;
  description: string | null;
  category: string | null;
  avgRating: number | null;
  createdAt: string;
  _count: {
    ratings: number;
    favorites: number;
  };
}

interface ForumPost {
  id: number;
  title: string;
  content: string;
  category: string | null;
  isUrgent: boolean;
  isAnswered: boolean;
  views: number;
  avgRating: number | null;
  createdAt: string;
  course: {
    courseCode: string;
    courseName: string;
  };
  _count: {
    comments: number;
    ratings: number;
  };
}

export function MyContentPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [tools, setTools] = useState<Tool[]>([]);
  const [forumPosts, setForumPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('summaries');

  // Edit/Delete dialog states
  const [editingSummary, setEditingSummary] = useState<Summary | null>(null);
  const [editingTool, setEditingTool] = useState<Tool | null>(null);
  const [editingForumPost, setEditingForumPost] = useState<ForumPost | null>(null);
  const [deletingItem, setDeletingItem] = useState<{ type: string; id: number; title: string } | null>(null);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    setLoading(true);
    try {
      const [summariesRes, toolsRes, postsRes] = await Promise.all([
        api.get('/summaries/my-content'),
        api.get('/tools/my-content'),
        api.get('/forum/my-posts')
      ]);
      setSummaries(summariesRes.data);
      setTools(toolsRes.data);
      setForumPosts(postsRes.data);
    } catch (error) {
      console.error('Error loading content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async () => {
    if (!deletingItem) return;

    try {
      const endpointMap: Record<string, string> = {
        'summary': `/summaries/${deletingItem.id}`,
        'tool': `/tools/${deletingItem.id}`,
        'post': `/forum/${deletingItem.id}`
      };
      
      const endpoint = endpointMap[deletingItem.type];
      if (!endpoint) {
        console.error('Unknown content type:', deletingItem.type);
        return;
      }
      
      await api.delete(endpoint);
      
      // Reload content after deletion
      await loadContent();
      setDeletingItem(null);
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('he-IL');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">טוען תכנים...</p>
        </div>
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4"
      >
        <div className="mb-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            <button
              onClick={() => navigate('/dashboard')}
              className="hover:text-blue-600 transition-colors flex items-center gap-1"
            >
              <Home className="w-4 h-4" />
              דף הבית
            </button>
            <ChevronRight className="w-4 h-4" />
            <span>התכנים שלי</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">התכנים שלי</h1>
          <p className="text-gray-600">נהל את כל התכנים שהעלית למערכת</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="summaries" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              סיכומים ({summaries.length})
            </TabsTrigger>
            <TabsTrigger value="tools" className="flex items-center gap-2">
              <Wrench className="w-4 h-4" />
              כלים ({tools.length})
            </TabsTrigger>
            <TabsTrigger value="forum" className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              שאלות ({forumPosts.length})
            </TabsTrigger>
          </TabsList>

          {/* Summaries Tab */}
          <TabsContent value="summaries">
            {summaries.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <FileText className="w-16 h-16 text-gray-300 mb-4" />
                  <p className="text-gray-500 text-lg">עדיין לא העלת סיכומים</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {summaries.map((summary) => (
                  <Card key={summary.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg">{summary.title}</CardTitle>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setEditingSummary(summary)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => setDeletingItem({ type: 'summary', id: summary.id, title: summary.title })}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <Badge variant="secondary">{summary.course.courseName}</Badge>
                    </CardHeader>
                    <CardContent>
                      {summary.description && (
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{summary.description}</p>
                      )}
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Star className="w-4 h-4" />
                            {summary.avgRating?.toFixed(1) || 'אין'}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageCircle className="w-4 h-4" />
                            {summary._count.comments}
                          </span>
                        </div>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(summary.uploadDate)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Tools Tab */}
          <TabsContent value="tools">
            {tools.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Wrench className="w-16 h-16 text-gray-300 mb-4" />
                  <p className="text-gray-500 text-lg">עדיין לא הוספת כלים</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {tools.map((tool) => (
                  <Card key={tool.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg">{tool.title}</CardTitle>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setEditingTool(tool)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => setDeletingItem({ type: 'tool', id: tool.id, title: tool.title })}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      {tool.category && <Badge variant="secondary">{tool.category}</Badge>}
                    </CardHeader>
                    <CardContent>
                      {tool.description && (
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{tool.description}</p>
                      )}
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Star className="w-4 h-4" />
                            {tool.avgRating?.toFixed(1) || 'אין'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="w-4 h-4" />
                            {tool._count.favorites}
                          </span>
                        </div>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(tool.createdAt)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Forum Posts Tab */}
          <TabsContent value="forum">
            {forumPosts.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <MessageCircle className="w-16 h-16 text-gray-300 mb-4" />
                  <p className="text-gray-500 text-lg">עדיין לא פרסמת שאלות בפורום</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {forumPosts.map((post) => (
                  <Card key={post.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <CardTitle className="text-lg">{post.title}</CardTitle>
                            {post.isUrgent && (
                              <Badge variant="destructive" className="flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                דחוף
                              </Badge>
                            )}
                            {post.isAnswered && (
                              <Badge variant="default">נענה</Badge>
                            )}
                          </div>
                          <Badge variant="secondary">{post.course.courseName}</Badge>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setEditingForumPost(post)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => setDeletingItem({ type: 'post', id: post.id, title: post.title })}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{post.content}</p>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            {post.views}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageCircle className="w-4 h-4" />
                            {post._count.comments}
                          </span>
                          <span className="flex items-center gap-1">
                            <Star className="w-4 h-4" />
                            {post.avgRating?.toFixed(1) || 'אין'}
                          </span>
                        </div>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(post.createdAt)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Edit Dialogs */}
      {editingSummary && (
        <EditSummaryDialog
          summary={editingSummary}
          open={!!editingSummary}
          onClose={() => setEditingSummary(null)}
          onSave={async () => {
            await loadContent();
            setEditingSummary(null);
          }}
        />
      )}

      {editingTool && (
        <EditToolDialog
          tool={editingTool}
          open={!!editingTool}
          onClose={() => setEditingTool(null)}
          onSave={async () => {
            await loadContent();
            setEditingTool(null);
          }}
        />
      )}

      {editingForumPost && (
        <EditForumPostDialog
          post={editingForumPost}
          open={!!editingForumPost}
          onClose={() => setEditingForumPost(null)}
          onSave={async () => {
            await loadContent();
            setEditingForumPost(null);
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {deletingItem && (
        <DeleteConfirmDialog
          open={!!deletingItem}
          title={deletingItem.title}
          type={deletingItem.type}
          onClose={() => setDeletingItem(null)}
          onConfirm={handleDeleteItem}
        />
      )}
    </div>
  );
}
