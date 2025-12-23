import { motion } from 'motion/react';
import { useState, useMemo, useEffect } from 'react';
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

interface ApiSummary {
  id: number;
  title: string;
  description: string | null;
  filePath: string;
  uploadDate: string;
  avgRating: number | null;
  course: {
    id: number;
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

  // State for API data
  const [summaries, setSummaries] = useState<ApiSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch summaries from API
  useEffect(() => {
    const fetchSummaries = async () => {
      try {
        setLoading(true);
        const response = await api.get('/summaries');
        setSummaries(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching summaries:', err);
        setError('שגיאה בטעינת סיכומים');
      } finally {
        setLoading(false);
      }
    };

    fetchSummaries();
  }, []);

  // Generate course options from the data
  const courseOptions = useMemo(() => {
    const uniqueCourses = new Map<string, string>();
    summaries.forEach((summary) => {
      const key = summary.course.courseCode.toLowerCase();
      if (!uniqueCourses.has(key)) {
        uniqueCourses.set(key, `${summary.course.courseCode} - ${summary.course.courseName}`);
      }
    });
    return Array.from(uniqueCourses.entries()).map(([value, label]) => ({
      value,
      label,
    }));
  }, [summaries]);

  // Generate institution options from the data
  const institutionOptions = useMemo(() => {
    const uniqueInstitutions = new Set<string>();
    summaries.forEach((summary) => {
      if (summary.course.institution) {
        uniqueInstitutions.add(summary.course.institution);
      }
    });
    return Array.from(uniqueInstitutions).sort().map((institution) => ({
      value: institution,
      label: institution,
    }));
  }, [summaries]);

  // Filter and sort summaries
  const filteredAndSortedSummaries = useMemo(() => {
    let result = [...summaries];

    // Filter by search query (contains in several fields)
    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      result = result.filter((summary) => {
        const inCourse = summary.course.courseCode.toLowerCase().includes(query);
        const inCourseFull = summary.course.courseName.toLowerCase().includes(query);
        const inTitle = summary.title.toLowerCase().includes(query);
        const inDescription = (summary.description || '').toLowerCase().includes(query);
        const inUploader = (summary.uploadedBy.fullName || '').toLowerCase().includes(query);
        const inInstitution = (summary.course.institution || '').toLowerCase().includes(query);
        return inCourse || inCourseFull || inTitle || inDescription || inUploader || inInstitution;
      });
    }

    // Filter by course
    if (courseFilter !== 'all') {
      result = result.filter(
        (summary) => summary.course.courseCode.toLowerCase() === courseFilter
      );
    }

    // Filter by file type
    if (fileTypeFilter !== 'all') {
      result = result.filter((summary) => {
        const fileExt = summary.filePath.split('.').pop()?.toLowerCase() || '';
        return fileExt === fileTypeFilter;
      });
    }

    // Filter by institution
    if (institutionFilter !== 'all') {
      result = result.filter(
        (summary) => summary.course.institution === institutionFilter
      );
    }

    // Sort
    switch (sortBy) {
      case 'rating':
        result.sort((a, b) => (b.avgRating || 0) - (a.avgRating || 0));
        break;
      case 'downloads':
        // Downloads tracking not implemented, sort by comments as a proxy for popularity
        result.sort((a, b) => b._count.comments - a._count.comments);
        break;
      case 'views':
        // Views tracking not implemented, sort by comments as a proxy for engagement
        result.sort((a, b) => b._count.comments - a._count.comments);
        break;
      case 'title':
        result.sort((a, b) => a.title.localeCompare(b.title, 'he'));
        break;
      case 'newest':
      default:
        result.sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime());
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

  // Transform API summary to SummaryCard format
  const transformSummary = (apiSummary: ApiSummary) => {
    const fileExt = apiSummary.filePath.split('.').pop()?.toUpperCase() || 'PDF';
    return {
      id: apiSummary.id,
      title: apiSummary.title,
      course: apiSummary.course.courseCode,
      courseFullName: apiSummary.course.courseName,
      institution: apiSummary.course.institution,
      rating: apiSummary.avgRating || 0,
      views: 0, // View tracking not implemented yet
      downloads: 0, // Download tracking not implemented yet
      comments: apiSummary._count.comments,
      fileType: fileExt,
      fileSize: '', // File size not available from API
      pages: 0, // Page count not available from API
      description: apiSummary.description || '',
      uploader: apiSummary.uploadedBy.fullName,
      uploadDate: new Date(apiSummary.uploadDate).toLocaleDateString('he-IL'),
      tags: [], // Tags not implemented yet
      isFavorite: false, // Favorites not implemented yet
    };
  };

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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()} className="bg-blue-600 hover:bg-blue-700">
            נסה שוב
          </Button>
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
        {currentSummaries.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500 text-lg">לא נמצאו סיכומים</p>
          </div>
        ) : (
          <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-6`}>
            {currentSummaries.map((summary, index) => (
              <SummaryCard 
                key={summary.id} 
                summary={transformSummary(summary)} 
                index={index} 
                onClick={() => onNavigateSummary?.(summary.id)}
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
