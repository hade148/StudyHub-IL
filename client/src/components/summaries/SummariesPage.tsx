import { motion } from 'motion/react';
import { useState, useMemo } from 'react';
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

const summariesData = [
  {
    id: 1,
    title: 'מבוא למדעי המחשב - פרקים 1-5',
    course: 'CS101',
    courseFullName: 'מבוא למדעי המחשב',
    institution: 'אוניברסיטה עברית',
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
    institution: 'הטכניון',
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
    institution: 'אוניברסיטת תל אביב',
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
    institution: 'אוניברסיטה עברית',
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
    institution: 'הטכניון',
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
    institution: 'אוניברסיטת תל אביב',
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
    institution: 'אוניברסיטת בן גוריון',
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
    institution: 'אוניברסיטת בר אילן',
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
    institution: 'אוניברסיטת חיפה',
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
    institution: 'הטכניון',
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
  const [searchQuery, setSearchQuery] = useState('');
  const [courseFilter, setCourseFilter] = useState('all');
  const [fileTypeFilter, setFileTypeFilter] = useState('all');
  const [institutionFilter, setInstitutionFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const itemsPerPage = 9;

  // Generate course options from the data
  const courseOptions = useMemo(() => {
    const uniqueCourses = new Map<string, string>();
    summariesData.forEach((summary) => {
      if (!uniqueCourses.has(summary.course)) {
        uniqueCourses.set(summary.course, `${summary.course} - ${summary.courseFullName}`);
      }
    });
    return Array.from(uniqueCourses.entries()).map(([value, label]) => ({
      value: value.toLowerCase(),
      label,
    }));
  }, []);

  // Generate institution options from the data
  const institutionOptions = useMemo(() => {
    const uniqueInstitutions = new Set<string>();
    summariesData.forEach((summary) => {
      if (summary.institution) {
        uniqueInstitutions.add(summary.institution);
      }
    });
    return Array.from(uniqueInstitutions).sort().map((institution) => ({
      value: institution,
      label: institution,
    }));
  }, []);

  // Filter and sort summaries
  const filteredAndSortedSummaries = useMemo(() => {
    let result = [...summariesData];

    // Filter by search query (contains in several fields)
    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      result = result.filter((summary) => {
        const inCourse = summary.course.toLowerCase().includes(query);
        const inCourseFull = summary.courseFullName.toLowerCase().includes(query);
        const inTitle = summary.title.toLowerCase().includes(query);
        const inDescription = (summary.description || '').toLowerCase().includes(query);
        const inUploader = (summary.uploader || '').toLowerCase().includes(query);
        const inTags = (summary.tags || []).join(' ').toLowerCase().includes(query);
        return inCourse || inCourseFull || inTitle || inDescription || inUploader || inTags;
      });
    }

    // Filter by course
    if (courseFilter !== 'all') {
      result = result.filter(
        (summary) => summary.course.toLowerCase() === courseFilter
      );
    }

    // Filter by file type
    if (fileTypeFilter !== 'all') {
      result = result.filter(
        (summary) => summary.fileType.toLowerCase() === fileTypeFilter
      );
    }

    // Filter by institution
    if (institutionFilter !== 'all') {
      result = result.filter(
        (summary) => summary.institution === institutionFilter
      );
    }

    // Sort
    switch (sortBy) {
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'downloads':
        result.sort((a, b) => b.downloads - a.downloads);
        break;
      case 'views':
        result.sort((a, b) => b.views - a.views);
        break;
      case 'newest':
      default:
        // Keep original order (assumed to be newest first)
        break;
    }

    return result;
  }, [searchQuery, courseFilter, fileTypeFilter, institutionFilter, sortBy]);

  // Reset to page 1 when filters change
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleCourseFilterChange = (course: string) => {
    setCourseFilter(course);
    setCurrentPage(1);
  };

  const handleFileTypeFilterChange = (fileType: string) => {
    setFileTypeFilter(fileType);
    setCurrentPage(1);
  };

  const handleInstitutionFilterChange = (institution: string) => {
    setInstitutionFilter(institution);
    setCurrentPage(1);
  };

  const handleSortChange = (sort: string) => {
    setSortBy(sort);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(filteredAndSortedSummaries.length / itemsPerPage);

  const currentSummaries = filteredAndSortedSummaries.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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

        {/* Search and Filters */}
        <SearchAndFilters
          viewMode={viewMode}
          setViewMode={setViewMode}
          resultsCount={filteredAndSortedSummaries.length}
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          courseFilter={courseFilter}
          onCourseFilterChange={handleCourseFilterChange}
          fileTypeFilter={fileTypeFilter}
          onFileTypeFilterChange={handleFileTypeFilterChange}
          institutionFilter={institutionFilter}
          onInstitutionFilterChange={handleInstitutionFilterChange}
          sortBy={sortBy}
          onSortChange={handleSortChange}
          courseOptions={courseOptions}
          institutionOptions={institutionOptions}
        />

        {/* Summaries Grid */}
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
        <div className="flex flex-col items-center gap-4 pt-8">
          <div className="text-gray-600">
            {filteredAndSortedSummaries.length > 0 ? (
              <>מציג {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredAndSortedSummaries.length)} מתוך {filteredAndSortedSummaries.length} תוצאות</>
            ) : (
              <>לא נמצאו תוצאות</>
            )}
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
      </motion.div>
    </div>
  );
}
