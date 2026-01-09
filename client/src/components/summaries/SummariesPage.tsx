import { motion } from 'motion/react';
import { useState, useMemo, useEffect } from 'react';
import { ChevronRight, Upload, Home, Loader2 } from 'lucide-react';
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

interface ApiSummary {
  id: number;
  title: string;
  description: string | null;
  filePath: string;
  uploadDate: string;
  avgRating: number | null;
  courseId: number;
  uploadedById: number;
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

interface TransformedSummary {
  id: number;
  title: string;
  course: string;
  courseFullName: string;
  institution: string;
  rating: number;
  ratingCount: number;
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

interface SummariesPageProps {
  onNavigateHome: () => void;
  onNavigateUpload?: () => void;
  onNavigateSummary?: (id: number) => void;
}

// Format upload date to relative time
const formatUploadDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'היום';
  if (diffDays === 1) return 'אתמול';
  if (diffDays < 7) return `לפני ${diffDays} ימים`;
  if (diffDays < 30) return `לפני ${Math.floor(diffDays / 7)} שבועות`;
  return date.toLocaleDateString('he-IL');
};

export function SummariesPage({ onNavigateHome, onNavigateUpload, onNavigateSummary }: SummariesPageProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [courseFilter, setCourseFilter] = useState('all');
  const [fileTypeFilter, setFileTypeFilter] = useState('all');
  const [institutionFilter, setInstitutionFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [summaries, setSummaries] = useState<TransformedSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [institutions, setInstitutions] = useState<string[]>([]);
  const [courses, setCourses] = useState<Array<{ id: number; courseName: string; courseCode: string; institution: string }>>([]);
  const itemsPerPage = 9;

  // Fetch summaries from API
  useEffect(() => {
    const fetchSummaries = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get('/summaries');
        
        // Transform API data to match the format expected by SummaryCard
        const transformedSummaries = response.data.map((summary: ApiSummary) => {
          // Get file extension from filePath
          const fileExtension = summary.filePath.split('.').pop()?.toUpperCase() || 'PDF';
          
          return {
            id: summary.id,
            title: summary.title,
            course: summary.course.courseName,
            courseFullName: summary.course.courseName,
            institution: summary.course.institution,
            rating: summary.avgRating || 0,
            ratingCount: summary._count.ratings,
            views: 0, // Not tracked in current schema
            downloads: 0, // Not tracked in current schema
            comments: summary._count.comments,
            fileType: fileExtension,
            fileSize: '', // Not available without fetching file
            pages: 0, // Not available
            description: summary.description || '',
            uploader: summary.uploadedBy.fullName,
            uploadDate: formatUploadDate(summary.uploadDate),
            tags: [], // Not in current schema
            thumbnail: `placeholder-${fileExtension.toLowerCase()}.jpg`,
            isFavorite: false, // Would need user-specific data
          };
        });
        
        setSummaries(transformedSummaries);
      } catch (err) {
        console.error('Error fetching summaries:', err);
        setError('שגיאה בטעינת סיכומים');
      } finally {
        setLoading(false);
      }
    };

    fetchSummaries();
  }, []);

  // Fetch institutions from API
  useEffect(() => {
    const fetchInstitutions = async () => {
      try {
        const response = await api.get('/courses/institutions');
        setInstitutions(response.data);
      } catch (err) {
        console.error('Error fetching institutions:', err);
      }
    };

    fetchInstitutions();
  }, []);

  // Fetch courses from API
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await api.get('/courses');
        setCourses(response.data);
      } catch (err) {
        console.error('Error fetching courses:', err);
      }
    };

    fetchCourses();
  }, []);

  // Generate course options from all courses in the system
  const courseOptions = useMemo(() => {
    const uniqueCourses = new Map<string, string>();
    courses.forEach((course) => {
      const key = course.courseName.toLowerCase();
      if (!uniqueCourses.has(key)) {
        uniqueCourses.set(key, course.courseName);
      }
    });
    return Array.from(uniqueCourses.entries()).map(([value, label]) => ({
      value,
      label,
    }));
  }, [courses]);

  // Generate institution options from all institutions in the system
  const institutionOptions = useMemo(() => {
    return institutions.sort().map((institution) => ({
      value: institution,
      label: institution,
    }));
  }, [institutions]);

  // Filter and sort summaries
  const filteredAndSortedSummaries = useMemo(() => {
    let result = [...summaries];

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
  }, [summaries, searchQuery, courseFilter, fileTypeFilter, institutionFilter, sortBy]);

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl" />
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4 py-8 space-y-6 relative z-10"
      >
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-2">
            {/* Title */}
            <h1 className="text-3xl font-bold bg-gradient-to-l from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">סיכומים</h1>

            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-gray-600">
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
            className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:shadow-lg hover:scale-[1.02] transition-all duration-200 text-white font-medium"
          >
            <Upload className="w-4 h-4 ml-2" />
            העלאת סיכום
          </Button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="mr-3 text-gray-600">טוען סיכומים...</span>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-center">
            {error}
          </div>
        )}

        {/* Content */}
        {!loading && !error && (
          <>
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
            {filteredAndSortedSummaries.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-600 text-lg">לא נמצאו סיכומים</p>
                <p className="text-gray-500 mt-2">נסה לשנות את הפילטרים או להעלות סיכום חדש</p>
              </div>
            ) : (
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
                <div className="flex flex-col items-center gap-4 pt-8">
                  <div className="text-gray-600">
                    מציג {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredAndSortedSummaries.length)} מתוך {filteredAndSortedSummaries.length} תוצאות
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
              </>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
}
