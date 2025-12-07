import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { ChevronRight, Upload, Home } from 'lucide-react';
import { Button } from '../ui/button';
import { SummaryCard } from './SummaryCard';
import { SearchAndFilters } from './SearchAndFilters';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '../ui/pagination';
import api from '../../utils/api';

// Interface for API response
interface ApiSummary {
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
  uploadedBy: {
    id: number;
    fullName: string;
  };
  _count: {
    ratings: number;
    comments: number;
  };
}

// Interface for transformed summary data for UI
interface TransformedSummary {
  id: number;
  title: string;
  course: string;
  courseFullName: string;
  rating: number;
  views: number;
  downloads: number;
  comments: number;
  fileType: string;
  fileSize: string;
  pages: number;
  description: string;
  uploader: string;
  uploadDate: string;
  tags: string[];
  thumbnail: string;
  isFavorite: boolean;
}

const summariesData = [
  {
    id: 1,
    title: 'מבוא למדעי המחשב - פרקים 1-5',
    course: 'CS101',
    courseFullName: 'מבוא למדעי המחשב',
    rating: 4.8,
    views: 234,
    downloads: 89,
    comments: 12,
    fileType: 'PDF',
    fileSize: '2.4 MB',
    pages: 45,
    description: 'סיכום מקיף של הפרקים הראשונים בקורס מבוא למדעי המחשב, כולל דוגמאות קוד ותרגילים מפורטים',
    uploader: 'יוסי כהן',
    uploadDate: 'לפני 3 ימים',
    tags: ['אלגוריתמים', 'תכנות', 'C++'],
    thumbnail: 'placeholder-pdf.jpg',
    isFavorite: false,
  },
  {
    id: 2,
    title: 'אלגוריתמים ומבני נתונים - מיון',
    course: 'CS202',
    courseFullName: 'אלגוריתמים ומבני נתונים',
    rating: 4.9,
    views: 456,
    downloads: 167,
    comments: 24,
    fileType: 'PDF',
    fileSize: '3.1 MB',
    pages: 67,
    description: 'סיכום מפורט של אלגוריתמי מיון: בועות, מהיר, מיזוג ועוד. כולל ניתוח זמן ריצה ודוגמאות',
    uploader: 'שרה לוי',
    uploadDate: 'לפני שבוע',
    tags: ['מיון', 'מורכבות', 'Big O'],
    thumbnail: 'placeholder-pdf.jpg',
    isFavorite: true,
  },
  {
    id: 3,
    title: 'חשבון אינפיניטסימלי - נגזרות',
    course: 'MATH101',
    courseFullName: 'חשבון אינפיניטסימלי 1',
    rating: 4.7,
    views: 189,
    downloads: 72,
    comments: 8,
    fileType: 'DOCX',
    fileSize: '1.8 MB',
    pages: 32,
    description: 'סיכום של כללי גזירה, נגזרות של פונקציות מורכבות ושימושים בנגזרות לפתרון בעיות',
    uploader: 'מיכל רוזן',
    uploadDate: 'לפני יומיים',
    tags: ['נגזרות', 'חשבון', 'מתמטיקה'],
    thumbnail: 'placeholder-doc.jpg',
    isFavorite: false,
  },
  {
    id: 4,
    title: 'פיזיקה קוונטית - עקרונות יסוד',
    course: 'PHYS201',
    courseFullName: 'פיזיקה קוונטית',
    rating: 4.6,
    views: 312,
    downloads: 95,
    comments: 18,
    fileType: 'PDF',
    fileSize: '4.2 MB',
    pages: 78,
    description: 'סיכום מקיף של עקרונות הפיזיקה הקוונטית, כולל משוואת שרדינגר ועקרון אי הוודאות',
    uploader: 'דן שמיר',
    uploadDate: 'לפני 5 ימים',
    tags: ['קוונטים', 'פיזיקה', 'משוואות'],
    thumbnail: 'placeholder-pdf.jpg',
    isFavorite: true,
  },
  {
    id: 5,
    title: 'מבני נתונים - עצים בינאריים',
    course: 'CS202',
    courseFullName: 'אלגוריתמים ומבני נתונים',
    rating: 4.8,
    views: 401,
    downloads: 156,
    comments: 21,
    fileType: 'PDF',
    fileSize: '2.9 MB',
    pages: 52,
    description: 'סיכום מפורט על עצים בינאריים, עצי חיפוש, AVL ועצים אדומים-שחורים',
    uploader: 'רונית כהן',
    uploadDate: 'לפני שבוע',
    tags: ['עצים', 'מבני נתונים', 'רקורסיה'],
    thumbnail: 'placeholder-pdf.jpg',
    isFavorite: false,
  },
  {
    id: 6,
    title: 'אינטגרלים - טכניקות אינטגרציה',
    course: 'MATH102',
    courseFullName: 'חשבון אינפיניטסימלי 2',
    rating: 4.5,
    views: 267,
    downloads: 88,
    comments: 14,
    fileType: 'PDF',
    fileSize: '3.3 MB',
    pages: 61,
    description: 'סיכום טכניקות אינטגרציה: החלפת משתנים, אינטגרציה בחלקים, שברים חלקיים ועוד',
    uploader: 'עמית גולן',
    uploadDate: 'לפני 4 ימים',
    tags: ['אינטגרלים', 'חשבון', 'מתמטיקה'],
    thumbnail: 'placeholder-pdf.jpg',
    isFavorite: false,
  },
  {
    id: 7,
    title: 'בסיסי נתונים - SQL ו-NoSQL',
    course: 'CS301',
    courseFullName: 'מערכות בסיסי נתונים',
    rating: 4.9,
    views: 523,
    downloads: 201,
    comments: 32,
    fileType: 'PDF',
    fileSize: '5.1 MB',
    pages: 89,
    description: 'סיכום מקיף של SQL, עיצוב בסיסי נתונים, נורמליזציה והשוואה עם NoSQL',
    uploader: 'אלון ברק',
    uploadDate: 'לפני 3 ימים',
    tags: ['SQL', 'בסיסי נתונים', 'MongoDB'],
    thumbnail: 'placeholder-pdf.jpg',
    isFavorite: true,
  },
  {
    id: 8,
    title: 'אלגברה לינארית - מטריצות',
    course: 'MATH201',
    courseFullName: 'אלגברה לינארית',
    rating: 4.7,
    views: 345,
    downloads: 134,
    comments: 19,
    fileType: 'DOCX',
    fileSize: '2.1 MB',
    pages: 43,
    description: 'סיכום פעולות על מטריצות, דטרמיננטות, מטריצות הופכיות וערכים עצמיים',
    uploader: 'נועה מזרחי',
    uploadDate: 'לפני 6 ימים',
    tags: ['מטריצות', 'אלגברה', 'ערכים עצמיים'],
    thumbnail: 'placeholder-doc.jpg',
    isFavorite: false,
  },
  {
    id: 9,
    title: 'רשתות מחשבים - פרוטוקולים',
    course: 'CS303',
    courseFullName: 'רשתות מחשבים',
    rating: 4.6,
    views: 278,
    downloads: 97,
    comments: 15,
    fileType: 'PDF',
    fileSize: '3.7 MB',
    pages: 72,
    description: 'סיכום פרוטוקולי רשת: TCP/IP, HTTP, DNS, והמודל OSI',
    uploader: 'יובל דהן',
    uploadDate: 'לפני שבוע',
    tags: ['רשתות', 'TCP/IP', 'פרוטוקולים'],
    thumbnail: 'placeholder-pdf.jpg',
    isFavorite: false,
  },
  {
    id: 10,
    title: 'תכנות מונחה עצמים - Java',
    course: 'CS102',
    courseFullName: 'תכנות מונחה עצמים',
    rating: 4.8,
    views: 412,
    downloads: 178,
    comments: 26,
    fileType: 'PDF',
    fileSize: '4.5 MB',
    pages: 84,
    description: 'סיכום עקרונות OOP ב-Java: ירושה, פולימורפיזם, אנקפסולציה וממשקים',
    uploader: 'תמר אשכנזי',
    uploadDate: 'לפני יומיים',
    tags: ['Java', 'OOP', 'ירושה'],
    thumbnail: 'placeholder-pdf.jpg',
    isFavorite: true,
  },
];

interface SummariesPageProps {
  onNavigateHome: () => void;
  onNavigateUpload?: () => void;
  onNavigateSummary?: (id: number) => void;
}

export function SummariesPage({ onNavigateHome, onNavigateUpload, onNavigateSummary }: SummariesPageProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [summaries, setSummaries] = useState<TransformedSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const itemsPerPage = 9;

  // Fetch summaries from API
  const fetchSummaries = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get<ApiSummary[]>('/summaries');
      
      // Transform API data to UI format
      const transformed = response.data.map((summary) => {
        const fileExt = summary.filePath.split('.').pop()?.toUpperCase() || 'PDF';
        const isUrl = summary.filePath.startsWith('http://') || summary.filePath.startsWith('https://');
        
        return {
          id: summary.id,
          title: summary.title,
          course: summary.course.courseCode,
          courseFullName: summary.course.courseName,
          rating: summary.avgRating || 0,
          views: 0, // View tracking not yet implemented
          downloads: 0, // Download tracking not yet implemented
          comments: summary._count.comments,
          fileType: isUrl ? 'PDF' : fileExt,
          fileSize: 'N/A', // File size not stored in database
          pages: 0, // Page count not stored in database
          description: summary.description || 'אין תיאור',
          uploader: summary.uploadedBy.fullName,
          uploadDate: formatDate(summary.uploadDate),
          tags: [], // Tag system not yet implemented
          thumbnail: fileExt === 'DOCX' ? 'placeholder-doc.jpg' : 'placeholder-pdf.jpg',
          isFavorite: false, // Favorites feature not yet implemented
        };
      });
      
      setSummaries(transformed);
    } catch (err) {
      console.error('Failed to fetch summaries:', err);
      setError('שגיאה בטעינת הסיכומים. אנא טען מחדש את הדף.');
      setSummaries([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummaries();
  }, []);

  // Format date to Hebrew relative time
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'היום';
    if (diffDays === 1) return 'אתמול';
    if (diffDays < 7) return `לפני ${diffDays} ימים`;
    if (diffDays < 30) return `לפני ${Math.floor(diffDays / 7)} שבועות`;
    if (diffDays < 365) return `לפני ${Math.floor(diffDays / 30)} חודשים`;
    return `לפני ${Math.floor(diffDays / 365)} שנים`;
  };

  const totalPages = Math.ceil(summaries.length / itemsPerPage);
  const currentSummaries = summaries.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">טוען סיכומים...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4 py-8 space-y-6"
      >
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-2">
            {/* Title */}
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-3 rounded-xl">
                <span className="text-2xl">📚</span>
              </div>
              <h1 className="text-gray-900">סיכומים</h1>
            </div>

            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-gray-600">
              <button onClick={onNavigateHome} className="hover:text-blue-600 transition-colors flex items-center gap-1">
                <Home className="w-4 h-4" />
                דף הבית
              </button>
              <ChevronRight className="w-4 h-4" />
              <span>סיכומים</span>
            </div>
          </div>

          {/* Upload Button */}
          <Button 
            onClick={onNavigateUpload}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
          >
            <Upload className="w-5 h-5 ml-2" />
            📤 העלאת סיכום חדש
          </Button>
        </div>

        {/* Error message with retry */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-red-800">
                <span>❌</span>
                <span>{error}</span>
              </div>
              <Button 
                onClick={fetchSummaries}
                variant="outline"
                className="border-red-300 text-red-700 hover:bg-red-100"
              >
                נסה שוב
              </Button>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <SearchAndFilters
          viewMode={viewMode}
          setViewMode={setViewMode}
          resultsCount={summaries.length}
        />

        {/* Empty state */}
        {summaries.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl text-gray-900 mb-2">אין סיכומים עדיין</h3>
            <p className="text-gray-600 mb-4">היה הראשון להעלות סיכום!</p>
            <Button onClick={onNavigateUpload} className="bg-gradient-to-r from-blue-500 to-purple-600">
              <Upload className="w-5 h-5 ml-2" />
              העלה סיכום
            </Button>
          </div>
        )}

        {/* Summaries Grid */}
        {summaries.length > 0 && (
          <>
            <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-6`}>
              {currentSummaries.map((summary, index) => (
                <SummaryCard 
                  key={summary.id} 
                  summary={summary} 
                  index={index} 
                  onClick={() => onNavigateSummary?.(summary.id)}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col items-center gap-4 pt-8">
                <div className="text-gray-600">
                  מציג {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, summaries.length)} מתוך {summaries.length} תוצאות
                </div>
                
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => setCurrentPage(page)}
                          isActive={currentPage === page}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    
                    {totalPages > 5 && (
                      <PaginationItem>
                        <PaginationEllipsis />
                      </PaginationItem>
                    )}
                    
                    <PaginationItem>
                      <PaginationNext
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
}
