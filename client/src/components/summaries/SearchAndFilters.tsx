import { Search, Grid3x3, List, Building2 } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

interface CourseOption {
  value: string;
  label: string;
}

interface InstitutionOption {
  value: string;
  label: string;
}

interface SearchAndFiltersProps {
  viewMode: 'grid' | 'list';
  setViewMode: (mode: 'grid' | 'list') => void;
  resultsCount: number;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  courseFilter: string;
  onCourseFilterChange: (course: string) => void;
  fileTypeFilter: string;
  onFileTypeFilterChange: (fileType: string) => void;
  institutionFilter: string;
  onInstitutionFilterChange: (institution: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  courseOptions: CourseOption[];
  institutionOptions: InstitutionOption[];
}

export function SearchAndFilters({ 
  viewMode, 
  setViewMode, 
  resultsCount,
  searchQuery,
  onSearchChange,
  courseFilter,
  onCourseFilterChange,
  fileTypeFilter,
  onFileTypeFilterChange,
  institutionFilter,
  onInstitutionFilterChange,
  sortBy,
  onSortChange,
  courseOptions,
  institutionOptions,
}: SearchAndFiltersProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input
          type="text"
          placeholder="חפש לפי שם קורס..."
          className="pr-10 border-gray-300"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      {/* Filters Row */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full flex-wrap">
          {/* Institution Filter */}
          <select
            value={institutionFilter}
            onChange={(e) => onInstitutionFilterChange(e.target.value)}
            className="w-full sm:w-[200px] h-9 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">כל המוסדות</option>
            {institutionOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {/* Course Filter */}
          <select
            value={courseFilter}
            onChange={(e) => onCourseFilterChange(e.target.value)}
            className="w-full sm:w-[180px] h-9 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">כל הקורסים</option>
            {courseOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {/* File Type Filter */}
          <select
            value={fileTypeFilter}
            onChange={(e) => onFileTypeFilterChange(e.target.value)}
            className="w-full sm:w-[150px] h-9 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">כל הסוגים</option>
            <option value="pdf">PDF</option>
            <option value="docx">DOCX</option>
            <option value="ppt">PPT</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="w-full sm:w-[150px] h-9 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="newest">החדשים ביותר</option>
            <option value="rating">דירוג גבוה</option>
            <option value="downloads">הורדות רבות</option>
            <option value="views">צפיות רבות</option>
          </select>
        </div>

        {/* View Toggle and Results Count */}
        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
          <span className="text-gray-600">נמצאו {resultsCount} סיכומים</span>
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <Button
              size="sm"
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              className={`px-3 ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}
              onClick={() => setViewMode('grid')}
            >
              <Grid3x3 className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              className={`px-3 ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
