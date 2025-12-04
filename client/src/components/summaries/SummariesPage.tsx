import { motion } from 'motion/react';
import { useState, useMemo, useEffect } from 'react';
import { ChevronRight, Upload, Home } from 'lucide-react';
import { Button } from '../ui/button';
import { SummaryCard } from './SummaryCard';
import { SearchAndFilters } from './SearchAndFilters';
import api from '../../utils/api';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '../ui/pagination';

interface APISummary {
  id: number;
  title: string;
  description: string | null;
  filePath: string;
  uploadDate: string;
  avgRating: number | null;
  course: {
    courseCode: string;
    courseName: string;
    institution: string;
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

interface SummaryCardData {
  id: number;
  title: string;
  course: string;
  courseFullName: string;
  institution: string;
  rating: number;
  ratingsCount: number;
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
  isFavorite: boolean;
}

// Helper function to format date for display
const formatRelativeDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'היום';
  if (diffDays === 1) return 'אתמול';
  if (diffDays < 7) return `לפני ${diffDays} ימים`;
  if (diffDays < 14) return 'לפני שבוע';
  if (diffDays < 30) return `לפני ${Math.floor(diffDays / 7)} שבועות`;
  return date.toLocaleDateString('he-IL');
};

// Helper function to extract file extension safely
const getFileExtension = (filePath: string): string => {
  if (!filePath) return 'PDF';
  const lastDotIndex = filePath.lastIndexOf('.');
  if (lastDotIndex === -1 || lastDotIndex === filePath.length - 1) return 'PDF';
  return filePath.substring(lastDotIndex + 1).toUpperCase();
};

// Transform API data to card format
const transformSummary = (apiSummary: APISummary): SummaryCardData => ({
  id: apiSummary.id,
  title: apiSummary.title,
  course: apiSummary.course.courseCode,
  courseFullName: apiSummary.course.courseName,
  institution: apiSummary.course.institution,
  rating: apiSummary.avgRating ?? 0,
  ratingsCount: apiSummary._count.ratings,
  views: 0, // Not tracked in current DB
  downloads: 0, // Not tracked in current DB
  comments: apiSummary._count.comments,
  fileType: getFileExtension(apiSummary.filePath),
  fileSize: '', // Not tracked in current DB
  pages: 0, // Not tracked in current DB
  description: apiSummary.description || '',
  uploader: apiSummary.uploadedBy.fullName,
  uploadDate: formatRelativeDate(apiSummary.uploadDate),
  tags: [], // Not tracked in current DB
  isFavorite: false, // Not tracked in current implementation
});

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
  const [summariesData, setSummariesData] = useState<SummaryCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const itemsPerPage = 9;

  // Fetch summaries from API
  useEffect(() => {
    const fetchSummaries = async () => {
      try {
        setLoading(true);
        const params: Record<string, string> = {};
        
        if (searchQuery.trim()) {
          params.search = searchQuery.trim();
        }
        if (institutionFilter !== 'all') {
          params.institution = institutionFilter;
        }
        if (sortBy === 'rating') {
          params.sortBy = 'rating';
        } else if (sortBy === 'title') {
          params.sortBy = 'title';
        } else {
          params.sortBy = 'recent';
        }

        const response = await api.get('/summaries', { params });
        const transformedData = response.data.map(transformSummary);
        setSummariesData(transformedData);
        setError(null);
      } catch (err) {
        console.error('Error fetching summaries:', err);
        setError('שגיאה בטעינת הסיכומים');
      } finally {
        setLoading(false);
      }
    };

    fetchSummaries();
  }, [searchQuery, institutionFilter, sortBy]);

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
  }, [summariesData]);

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
  }, [summariesData]);

  // Filter summaries locally for course and file type (API handles search, institution, sortBy)
  const filteredAndSortedSummaries = useMemo(() => {
    let result = [...summariesData];

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

    return result;
  }, [summariesData, courseFilter, fileTypeFilter]);

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

  // Handle rating change from SummaryCard
  const handleRatingChange = (id: number, _newRating: number, newAvgRating: number) => {
    setSummariesData(prev => 
      prev.map(summary => 
        summary.id === id 
          ? { ...summary, rating: newAvgRating }
          : summary
      )
    );
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
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">טוען סיכומים...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <p className="text-red-600">{error}</p>
              <Button 
                onClick={() => window.location.reload()} 
                className="mt-4"
              >
                נסה שוב
              </Button>
            </div>
          </div>
        ) : currentSummaries.length === 0 ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center text-gray-500">
              <span className="text-6xl">📚</span>
              <p className="mt-4 text-lg">לא נמצאו סיכומים</p>
              <p className="text-sm">נסה לשנות את הפילטרים או העלה סיכום חדש</p>
            </div>
          </div>
        ) : (
          <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-6`}>
            {currentSummaries.map((summary, index) => (
              <SummaryCard 
                key={summary.id} 
                summary={summary} 
                index={index} 
                onClick={() => onNavigateSummary?.(summary.id)}
                onRatingChange={handleRatingChange}
              />
            ))}
          </div>
        )}

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
