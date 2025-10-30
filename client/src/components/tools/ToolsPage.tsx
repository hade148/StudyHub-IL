import { motion } from 'motion/react';
import { useState } from 'react';
import { ChevronRight, Home, Wrench } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { ToolCard } from './ToolCard';

const toolsData = [
  {
    id: 1,
    name: 'מחשבון ממוצע ציונים',
    description: 'חשב את הממוצע שלך בקלות ובמהירות',
    icon: '📊',
    category: 'מחשבונים',
    usageCount: 1234,
    gradient: 'from-blue-500 to-cyan-500',
    route: '/tools/grade-calculator',
    featured: true,
  },
  {
    id: 2,
    name: 'מתכנן לימודים שבועי',
    description: 'תכנן את לוח הזמנים השבועי שלך',
    icon: '📅',
    category: 'מתכננים',
    usageCount: 892,
    gradient: 'from-purple-500 to-pink-500',
    route: '/tools/study-planner',
    featured: true,
  },
  {
    id: 3,
    name: 'יצירת כרטיסיות למידה',
    description: 'צור כרטיסיות ללמידה יעילה ומהירה',
    icon: '📝',
    category: 'יצירה',
    usageCount: 756,
    gradient: 'from-blue-600 to-purple-600',
    route: '/tools/flashcards',
    featured: true,
  },
  {
    id: 4,
    name: 'מחשבון GPA',
    description: 'חשב את ה-GPA שלך לפי הציונים',
    icon: '📈',
    category: 'מחשבונים',
    usageCount: 645,
    gradient: 'from-green-500 to-teal-500',
    route: '/tools/gpa-calculator',
    featured: false,
  },
  {
    id: 5,
    name: 'מחשבון שעות לימוד',
    description: 'עקוב אחר שעות הלימוד שלך',
    icon: '⏰',
    category: 'מחשבונים',
    usageCount: 523,
    gradient: 'from-orange-500 to-red-500',
    route: '/tools/study-hours',
    featured: false,
  },
  {
    id: 6,
    name: 'ממיר יחידות',
    description: 'המר בין יחידות מידה שונות',
    icon: '🔄',
    category: 'ממירים',
    usageCount: 489,
    gradient: 'from-purple-600 to-pink-600',
    route: '/tools/unit-converter',
    featured: false,
  },
  {
    id: 7,
    name: 'ממיר מטבעות',
    description: 'המר בין מטבעות שונים',
    icon: '💱',
    category: 'ממירים',
    usageCount: 412,
    gradient: 'from-yellow-400 to-orange-500',
    route: '/tools/currency-converter',
    featured: false,
  },
  {
    id: 8,
    name: 'מתכנן מבחנים',
    description: 'תכנן ונהל את המבחנים שלך',
    icon: '📆',
    category: 'מתכננים',
    usageCount: 678,
    gradient: 'from-red-500 to-pink-500',
    route: '/tools/exam-planner',
    featured: false,
  },
  {
    id: 9,
    name: 'מעקב אחר משימות',
    description: 'עקוב אחר המשימות והתרגילים',
    icon: '✅',
    category: 'מתכננים',
    usageCount: 834,
    gradient: 'from-green-500 to-emerald-500',
    route: '/tools/task-tracker',
    featured: false,
  },
  {
    id: 10,
    name: 'יצירת מצגות',
    description: 'צור מצגות מרשימות במהירות',
    icon: '🎨',
    category: 'יצירה',
    usageCount: 567,
    gradient: 'from-pink-500 to-rose-500',
    route: '/tools/presentation-maker',
    featured: false,
  },
  {
    id: 11,
    name: 'יצירת מפות חשיבה',
    description: 'ארגן רעיונות עם מפות חשיבה',
    icon: '🧠',
    category: 'יצירה',
    usageCount: 445,
    gradient: 'from-cyan-500 to-blue-500',
    route: '/tools/mind-map',
    featured: false,
  },
  {
    id: 12,
    name: 'טיימר פומודורו',
    description: 'שפר את הריכוז עם טכניקת פומודורו',
    icon: '⏲️',
    category: 'אחר',
    usageCount: 1089,
    gradient: 'from-red-600 to-orange-600',
    route: '/tools/pomodoro',
    featured: false,
  },
  {
    id: 13,
    name: 'רשימת קריאה',
    description: 'נהל את רשימת הקריאה שלך',
    icon: '📚',
    category: 'אחר',
    usageCount: 398,
    gradient: 'from-indigo-500 to-purple-500',
    route: '/tools/reading-list',
    featured: false,
  },
  {
    id: 14,
    name: 'מחולל ביבליוגרפיה',
    description: 'צור ביבליוגרפיה בפורמטים שונים',
    icon: '📖',
    category: 'אחר',
    usageCount: 612,
    gradient: 'from-gray-600 to-slate-600',
    route: '/tools/bibliography',
    featured: false,
  },
  {
    id: 15,
    name: 'מחשבון אחוזים',
    description: 'חשב אחוזים ושינויים במהירות',
    icon: '💯',
    category: 'מחשבונים',
    usageCount: 723,
    gradient: 'from-teal-500 to-cyan-600',
    route: '/tools/percentage',
    featured: false,
  },
];

interface ToolsPageProps {
  onNavigateHome: () => void;
}

export function ToolsPage({ onNavigateHome }: ToolsPageProps) {
  const [activeCategory, setActiveCategory] = useState('all');

  const featuredTools = toolsData.filter((tool) => tool.featured);
  const regularTools = toolsData.filter((tool) => !tool.featured);

  const filterToolsByCategory = (category: string) => {
    if (category === 'all') return toolsData;
    return toolsData.filter((tool) => tool.category === category);
  };

  const filteredTools = filterToolsByCategory(activeCategory);
  const filteredFeatured = filteredTools.filter((tool) => tool.featured);
  const filteredRegular = filteredTools.filter((tool) => !tool.featured);

  return (
    <div className="min-h-screen bg-gray-50">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4 py-8 space-y-8"
      >
        {/* Page Header */}
        <div className="space-y-4">
          {/* Title */}
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-3 rounded-xl">
              <Wrench className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-gray-900">כלים אקדמיים</h1>
              <p className="text-gray-600">כלים שימושיים לסטודנטים</p>
            </div>
          </div>

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-gray-600">
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

        {/* Category Tabs */}
        <Tabs defaultValue="all" className="w-full" onValueChange={setActiveCategory}>
          <TabsList className="bg-white rounded-lg shadow-sm p-1 w-full flex-wrap h-auto">
            <TabsTrigger value="all" className="flex-1 md:flex-none">
              הכל
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
            {/* Featured Tools */}
            {filteredFeatured.length > 0 && (
              <div>
                <h2 className="mb-6 text-gray-900">כלים מומלצים</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredFeatured.map((tool, index) => (
                    <ToolCard key={tool.id} tool={tool} index={index} />
                  ))}
                </div>
              </div>
            )}

            {/* Regular Tools */}
            {filteredRegular.length > 0 && (
              <div>
                {filteredFeatured.length > 0 && (
                  <h2 className="mb-6 text-gray-900">כלים נוספים</h2>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredRegular.map((tool, index) => (
                    <ToolCard
                      key={tool.id}
                      tool={tool}
                      index={index + filteredFeatured.length}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {filteredTools.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-lg p-12 text-center space-y-4"
              >
                <div className="text-6xl">🔍</div>
                <h3>לא נמצאו כלים בקטגוריה זו</h3>
                <p className="text-gray-600">נסה לבחור קטגוריה אחרת</p>
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
              <div className="text-4xl mb-2">{toolsData.length}</div>
              <p className="opacity-90">כלים זמינים</p>
            </div>
            <div>
              <div className="text-4xl mb-2">
                {toolsData.reduce((sum, tool) => sum + tool.usageCount, 0).toLocaleString('he-IL')}
              </div>
              <p className="opacity-90">סה״כ שימושים</p>
            </div>
            <div>
              <div className="text-4xl mb-2">6</div>
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
          <p>💡 יש לך רעיון לכלי חדש? שלח לנו הצעה!</p>
        </motion.div>
      </motion.div>
    </div>
  );
}
