import { motion } from 'motion/react';
import { useState, useEffect, useMemo } from 'react';
import { ChevronRight, MessageCircle, Home } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '../ui/pagination';
import { QuestionCard } from './QuestionCard';
import { ForumFilters } from './ForumFilters';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

const questionsData = [
  {
    id: 1,
    title: 'איך לפתור בעיית המיון בועות?',
    description: 'אני מנסה לממש את אלגוריתם המיון בועות ב-Python אבל אני מקבל תוצאות שגויות. הקוד שלי מתחיל עם לולאה כפולה אבל משהו לא עובד כמו שצריך...',
    category: 'אלגוריתמים',
    tags: ['Python', 'מיון', 'אלגוריתמים'],
    author: {
      name: 'יוסי כהן',
      avatar: 'יכ',
      reputation: 245,
    },
    stats: {
      views: 145,
      answers: 12,
      votes: 8,
      isAnswered: true,
    },
    time: 'לפני 2 שעות',
    lastActivity: {
      user: 'שרה לוי',
      time: 'לפני שעה',
    },
  },
  {
    id: 2,
    title: 'שאלה לגבי נגזרת של פונקציה מורכבת',
    description: 'אני לא מבין איך לגזור פונקציה מורכבת בצורה נכונה. למדתי את כלל השרשרת אבל עדיין מתבלבל בתרגילים מסובכים יותר...',
    category: 'מתמטיקה',
    tags: ['נגזרות', 'חשבון', 'כלל השרשרת'],
    author: {
      name: 'מיכל רוזן',
      avatar: 'מר',
      reputation: 189,
    },
    stats: {
      views: 92,
      answers: 8,
      votes: 5,
      isAnswered: true,
    },
    time: 'לפני 4 שעות',
    lastActivity: {
      user: 'דני אברהם',
      time: 'לפני 3 שעות',
    },
  },
  {
    id: 3,
    title: 'איך להבין את עקרון אי הוודאות?',
    description: 'אני לומד פיזיקה קוונטית ומתקשה להבין את עקרון אי הוודאות של הייזנברג. מישהו יכול להסביר בצורה פשוטה יותר?',
    category: 'פיזיקה',
    tags: ['קוונטים', 'הייזנברג', 'פיזיקה'],
    author: {
      name: 'דן שמיר',
      avatar: 'דש',
      reputation: 412,
    },
    stats: {
      views: 203,
      answers: 0,
      votes: 12,
      isAnswered: false,
    },
    time: 'לפני 5 שעות',
  },
  {
    id: 4,
    title: 'המלצות על ספרים לקורס מבני נתונים?',
    description: 'אני מחפש ספרים טובים ללימוד מבני נתונים באנגלית. מישהו יכול להמליץ על חומרים איכוטיים?',
    category: 'משאבי לימוד',
    tags: ['ספרים', 'מבני נתונים', 'המלצות'],
    author: {
      name: 'רונית כהן',
      avatar: 'רכ',
      reputation: 567,
    },
    stats: {
      views: 178,
      answers: 15,
      votes: 21,
      isAnswered: true,
    },
    time: 'לפני 6 שעות',
    lastActivity: {
      user: 'אלון ברק',
      time: 'לפני 2 שעות',
    },
  },
  {
    id: 5,
    title: 'עזרה בפתרון תרגיל אינטגרלים',
    description: 'אני תקוע בתרגיל אינטגרל מסובך. ניסיתי החלפת משתנים אבל זה לא עוזר. האם יש דרך אחרת לפתור את זה?',
    category: 'מתמטיקה',
    tags: ['אינטגרלים', 'חשבון', 'תרגילים'],
    author: {
      name: 'עמית גולן',
      avatar: 'עג',
      reputation: 298,
    },
    stats: {
      views: 134,
      answers: 6,
      votes: 4,
      isAnswered: true,
    },
    time: 'לפני 8 שעות',
    lastActivity: {
      user: 'שרה לוי',
      time: 'לפני 5 שעות',
    },
  },
  {
    id: 6,
    title: 'הבדל בין SQL ל-NoSQL?',
    description: 'מה ההבדל המהוותי בין בסיסי נתונים מסוג SQL לבין NoSQL? מתי עדיף להשתמש בכל אחד מהם?',
    category: 'כללי',
    tags: ['SQL', 'NoSQL', 'בסיסי נתונים'],
    author: {
      name: 'אלון ברק',
      avatar: 'אב',
      reputation: 823,
    },
    stats: {
      views: 456,
      answers: 18,
      votes: 34,
      isAnswered: true,
    },
    time: 'לפני 12 שעות',
    lastActivity: {
      user: 'יוסי כהן',
      time: 'לפני 7 שעות',
    },
  },
  {
    id: 7,
    title: 'איך לחשב דטרמיננטה של מטריצה 4x4?',
    description: 'אני יודע לחשב דטרמיננטה של 2x2 ו-3x3 אבל 4x4 נראה מסובך מאוד. יש טריק מהיר?',
    category: 'מתמטיקה',
    tags: ['אלגברה לינארית', 'מטריצות', 'דטרמיננטה'],
    author: {
      name: 'נועה מזרחי',
      avatar: 'נמ',
      reputation: 445,
    },
    stats: {
      views: 89,
      answers: 0,
      votes: 3,
      isAnswered: false,
    },
    time: 'לפני שעה',
  },
  {
    id: 8,
    title: 'הסבר על המודל OSI ברשתות',
    description: 'מתקשה להבין את 7 השכבות של המודל OSI. מישהו יכול להסביר עם דוגמאות מעשיות?',
    category: 'כללי',
    tags: ['רשתות', 'OSI', 'פרוטוקולים'],
    author: {
      name: 'יובל דהן',
      avatar: 'יד',
      reputation: 356,
    },
    stats: {
      views: 267,
      answers: 9,
      votes: 15,
      isAnswered: true,
    },
    time: 'לפני יום',
    lastActivity: {
      user: 'דני אברהם',
      time: 'לפני 10 שעות',
    },
  },
  {
    id: 9,
    title: 'מה זה פולימורפיזם ב-Java?',
    description: 'שמעתי הרבה על המושג פולימורפיזם ב-OOP אבל לא לגמרי ברור לי איך זה עובד ב-Java. מישהו יכול להסביר עם דוגמת קוד?',
    category: 'אלגוריתמים',
    tags: ['Java', 'OOP', 'פולימורפיזם'],
    author: {
      name: 'תמר אשכנזי',
      avatar: 'תא',
      reputation: 678,
    },
    stats: {
      views: 312,
      answers: 11,
      votes: 19,
      isAnswered: true,
    },
    time: 'לפני יום',
    lastActivity: {
      user: 'רונית כהן',
      time: 'לפני 8 שעות',
    },
  },
  {
    id: 10,
    title: 'איך לפתור משוואה דיפרנציאלית?',
    description: 'נתקלתי במשוואה דיפרנציאלית מסדר ראשון ולא יודע איך להתחיל לפתור אותה. יש מתודה כללית?',
    category: 'מתמטיקה',
    tags: ['משוואות דיפרנציאליות', 'חשבון', 'מתמטיקה'],
    author: {
      name: 'גיא אלמוג',
      avatar: 'גא',
      reputation: 234,
    },
    stats: {
      views: 156,
      answers: 0,
      votes: 7,
      isAnswered: false,
    },
    time: 'לפני 3 שעות',
  },
  {
    id: 11,
    title: 'תרגיל בכימיה אורגנית - מנגנוני תגובה',
    description: 'צריך עזרה בהבנת מנגנון תגובת SN2. איך קובעים את הסטריאוכימיה של התוצר?',
    category: 'כימיה',
    tags: ['כימיה אורגנית', 'תגובות', 'מנגנונים'],
    author: {
      name: 'ליאור שחר',
      avatar: 'לש',
      reputation: 389,
    },
    stats: {
      views: 98,
      answers: 4,
      votes: 6,
      isAnswered: true,
    },
    time: 'לפני 9 שעות',
    lastActivity: {
      user: 'מיכל רוזן',
      time: 'לפני 4 שעות',
    },
  },
  {
    id: 12,
    title: 'איך עובד אלגוריתם Dijkstra?',
    description: 'אני לומד גרפים ומתקשה להבין את אלגוריתם Dijkstra למציאת המסלול הקצר ביותר. מישהו יכול להסביר צעד אחר צעד?',
    category: 'אלגוריתמים',
    tags: ['גרפים', 'Dijkstra', 'מסלולים'],
    author: {
      name: 'אורי נחום',
      avatar: 'אנ',
      reputation: 512,
    },
    stats: {
      views: 234,
      answers: 13,
      votes: 22,
      isAnswered: true,
    },
    time: 'לפני 2 ימים',
    lastActivity: {
      user: 'שרה לוי',
      time: 'לפני יום',
    },
  },
  {
    id: 13,
    title: 'הסבר על רקורסיה',
    description: 'רקורסיה מבלבלת אותי לגמרי. מישהו יכול להסביר עם דוגמה פשוטה איך זה עובד ומתי כדאי להשתמש בזה?',
    category: 'אלגוריתמים',
    tags: ['רקורסיה', 'תכנות', 'אלגוריתמים'],
    author: {
      name: 'רועי ברקאי',
      avatar: 'רב',
      reputation: 167,
    },
    stats: {
      views: 189,
      answers: 0,
      votes: 9,
      isAnswered: false,
    },
    time: 'לפני 30 דקות',
  },
  {
    id: 14,
    title: 'מה ההבדל בין Stack ל-Queue?',
    description: 'אני מבין את העיקרון אבל לא ברור לי מתי להשתמש ב-Stack ומתי ב-Queue. מישהו יכול לתת דוגמאות מעשיות?',
    category: 'אלגוריתמים',
    tags: ['מבני נתונים', 'Stack', 'Queue'],
    author: {
      name: 'שירה כץ',
      avatar: 'שכ',
      reputation: 423,
    },
    stats: {
      views: 278,
      answers: 16,
      votes: 28,
      isAnswered: true,
    },
    time: 'לפני 3 ימים',
    lastActivity: {
      user: 'אלון ברק',
      time: 'לפני יום',
    },
  },
  {
    id: 15,
    title: 'עזרה בהוכחה מתמטית באינדוקציה',
    description: 'צריך להוכיח נוסחה באינדוקציה מתמטית ותקוע בשלב האינדוקציה. מישהו יכול לעזור?',
    category: 'מתמטיקה',
    tags: ['אינדוקציה', 'הוכחות', 'מתמטיקה'],
    author: {
      name: 'בר סיון',
      avatar: 'בס',
      reputation: 289,
    },
    stats: {
      views: 145,
      answers: 7,
      votes: 11,
      isAnswered: true,
    },
    time: 'לפני יום',
    lastActivity: {
      user: 'נועה מזרחי',
      time: 'לפני 12 שעות',
    },
  },
];

interface ForumPageProps {
  onNavigateHome: () => void;
  onNavigateNewQuestion?: () => void;
  onNavigatePost?: (id: number) => void;
}

export function ForumPage({ onNavigateHome, onNavigateNewQuestion, onNavigatePost }: ForumPageProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState('all');
  const [questions, setQuestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const itemsPerPage = 10;
  const { isAuthenticated } = useAuth();

  // Constants for popular question threshold
  const POPULAR_ENGAGEMENT_THRESHOLD = 15;
  const VIEWS_WEIGHT = 0.1; // Views are weighted less than votes and answers

  // Fetch questions from API with filters
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setIsLoading(true);
        
        // Build query parameters
        const params = new URLSearchParams();
        
        // Add search query if present
        if (searchQuery.trim()) {
          params.append('search', searchQuery.trim());
        }
        
        // Add answered filter based on active tab
        if (activeTab === 'unanswered') {
          params.append('answered', 'false');
        }
        
        // Add myQuestions filter for 'mine' tab
        if (activeTab === 'mine') {
          params.append('myQuestions', 'true');
        }
        
        const queryString = params.toString();
        const url = queryString ? `/forum?${queryString}` : '/forum';
        
        const response = await api.get(url);
        setQuestions(response.data);
      } catch (error) {
        console.error('Error fetching questions:', error);
        // Fallback to hardcoded data on error
        setQuestions(questionsData);
      } finally {
        setIsLoading(false);
      }
    };
    fetchQuestions();
  }, [searchQuery, activeTab]);

  const unansweredCount = questions.filter((q) => {
    // A question is considered answered if it has comments or the isAnswered flag is true
    const hasComments = (q._count?.comments || 0) > 0;
    const isAnswered = q.isAnswered || q.stats?.isAnswered || hasComments;
    return !isAnswered;
  }).length;
  
  // Apply client-side filters with memoization for better performance
  // Note: Search filtering is now handled by the backend API
  const filteredQuestions = useMemo(() => {
    let result = [...questions];

    // Filter by tab (client-side only for 'popular' tab)
    // 'unanswered' and 'mine' are handled by the backend via query parameters
    if (activeTab === 'popular') {
      // Popular: questions with high engagement (votes, answers, views)
      result = result.filter((q) => {
        const totalEngagement = (q.stats?.votes || 0) + (q.stats?.answers || 0) + (q.stats?.views || 0) * VIEWS_WEIGHT;
        return totalEngagement > POPULAR_ENGAGEMENT_THRESHOLD;
      });
    }

    // Search and 'mine' filtering are now handled server-side

    return result;
  }, [questions, activeTab]);

  const totalPages = Math.ceil(filteredQuestions.length / itemsPerPage);
  const currentQuestions = filteredQuestions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handler function that resets to page 1 when search changes
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4 py-8 max-w-5xl"
      >
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div className="space-y-2">
            {/* Title */}
            <div className="flex items-center gap-3">
              <div className="bg-gray-900 text-white p-2.5 rounded-lg">
                <MessageCircle className="w-5 h-5" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">פורום שאלות ותשובות</h1>
            </div>

            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <button
                onClick={onNavigateHome}
                className="hover:text-gray-900 transition-colors flex items-center gap-1"
              >
                <Home className="w-4 h-4" />
                דף הבית
              </button>
              <ChevronRight className="w-4 h-4" />
              <span>פורום</span>
            </div>
          </div>

          {/* Ask Question Button */}
          <Button 
            onClick={onNavigateNewQuestion}
            className="bg-gray-900 hover:bg-gray-800 text-white px-6"
          >
            שאלה חדשה
          </Button>
        </div>

        {/* Tabs Navigation */}
        <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="bg-white border border-gray-200 rounded-lg p-1 w-full md:w-auto mb-6">
            <TabsTrigger value="all" className="flex-1 md:flex-none data-[state=active]:bg-gray-900 data-[state=active]:text-white">
              הכל
            </TabsTrigger>
            <TabsTrigger value="unanswered" className="flex-1 md:flex-none data-[state=active]:bg-gray-900 data-[state=active]:text-white">
              <span className="flex items-center gap-2">
                ללא מענה
                <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100">
                  {unansweredCount}
                </Badge>
              </span>
            </TabsTrigger>
            <TabsTrigger value="popular" className="flex-1 md:flex-none data-[state=active]:bg-gray-900 data-[state=active]:text-white">
              פופולרי
            </TabsTrigger>
            <TabsTrigger value="mine" className="flex-1 md:flex-none data-[state=active]:bg-gray-900 data-[state=active]:text-white">
              השאלות שלי
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6 mt-6">
            <div className="space-y-6">
              {/* Filters */}
              <ForumFilters
                searchQuery={searchQuery}
                onSearchChange={handleSearchChange}
              />

              {/* Questions List */}
              <div className="space-y-4">
                {isLoading ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : currentQuestions.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    אין שאלות להצגה
                  </div>
                ) : (
                  currentQuestions.map((question, index) => (
                    <QuestionCard 
                      key={question.id} 
                      question={question} 
                      index={index}
                      onClick={() => onNavigatePost?.(question.id)}
                    />
                  ))
                )}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
              <div className="flex flex-col items-center gap-4 pt-8">
                <div className="text-sm text-gray-600">
                  מציג {(currentPage - 1) * itemsPerPage + 1}-
                  {Math.min(currentPage * itemsPerPage, filteredQuestions.length)} מתוך{' '}
                  {filteredQuestions.length} שאלות
                </div>

                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        className={
                          currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'
                        }
                      />
                    </PaginationItem>

                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map(
                      (page) => (
                        <PaginationItem key={page}>
                          <PaginationLink
                            onClick={() => setCurrentPage(page)}
                            isActive={currentPage === page}
                            className="cursor-pointer"
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      )
                    )}

                    {totalPages > 5 && (
                      <PaginationItem>
                        <PaginationEllipsis />
                      </PaginationItem>
                    )}

                    <PaginationItem>
                      <PaginationNext
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        className={
                          currentPage === totalPages
                            ? 'pointer-events-none opacity-50'
                            : 'cursor-pointer'
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="unanswered" className="space-y-6 mt-6">
            <div className="space-y-6">
              <ForumFilters
                searchQuery={searchQuery}
                onSearchChange={handleSearchChange}
              />
              <div className="space-y-4">
                {currentQuestions.map((question, index) => (
                  <QuestionCard 
                    key={question.id} 
                    question={question} 
                    index={index}
                    onClick={() => onNavigatePost?.(question.id)}
                  />
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="popular" className="space-y-6 mt-6">
            <div className="space-y-6">
              <ForumFilters
                searchQuery={searchQuery}
                onSearchChange={handleSearchChange}
              />
              <div className="space-y-4">
                {currentQuestions.map((question, index) => (
                  <QuestionCard 
                    key={question.id} 
                    question={question} 
                    index={index}
                    onClick={() => onNavigatePost?.(question.id)}
                  />
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="mine" className="space-y-6 mt-6">
            <div className="space-y-6">
              <ForumFilters
                searchQuery={searchQuery}
                onSearchChange={handleSearchChange}
              />
              {!isAuthenticated ? (
                <div className="bg-white rounded-lg border border-gray-200 p-12 text-center space-y-4">
                  <div className="text-5xl text-gray-300">🔒</div>
                  <h3 className="text-lg font-semibold text-gray-900">נדרש כניסה למערכת</h3>
                  <p className="text-gray-600">התחבר כדי לראות את השאלות שלך</p>
                </div>
              ) : currentQuestions.length === 0 ? (
                <div className="bg-white rounded-lg border border-gray-200 p-12 text-center space-y-4">
                  <div className="text-5xl text-gray-300">📭</div>
                  <h3 className="text-lg font-semibold text-gray-900">אין לך שאלות עדיין</h3>
                  <p className="text-gray-600">התחל לשאול שאלות ותראה אותן כאן</p>
                  {onNavigateNewQuestion && (
                    <Button 
                      onClick={onNavigateNewQuestion}
                      className="bg-gray-900 hover:bg-gray-800 text-white mt-4">
                      שאל שאלה ראשונה
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {currentQuestions.map((question, index) => (
                    <QuestionCard 
                      key={question.id} 
                      question={question} 
                      index={index}
                      onClick={() => onNavigatePost?.(question.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
