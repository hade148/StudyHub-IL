import { Search, Grid3x3, List } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

interface SearchAndFiltersProps {
  viewMode: 'grid' | 'list';
  setViewMode: (mode: 'grid' | 'list') => void;
  resultsCount: number;
}

export function SearchAndFilters({ viewMode, setViewMode, resultsCount }: SearchAndFiltersProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input
          type="text"
          placeholder="חפש סיכומים..."
          className="pr-10 border-gray-300"
        />
      </div>

      {/* Filters Row */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full">
          {/* Course Filter */}
          <Select defaultValue="all">
            <SelectTrigger className="w-full sm:w-[180px] border-gray-300">
              <SelectValue placeholder="כל הקורסים" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">כל הקורסים</SelectItem>
              <SelectItem value="cs101">CS101 - מבוא למדעי המחשב</SelectItem>
              <SelectItem value="cs202">CS202 - אלגוריתמים</SelectItem>
              <SelectItem value="math101">MATH101 - חשבון</SelectItem>
              <SelectItem value="phys101">PHYS101 - פיזיקה</SelectItem>
            </SelectContent>
          </Select>

          {/* File Type Filter */}
          <Select defaultValue="all">
            <SelectTrigger className="w-full sm:w-[150px] border-gray-300">
              <SelectValue placeholder="כל הסוגים" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">כל הסוגים</SelectItem>
              <SelectItem value="pdf">PDF</SelectItem>
              <SelectItem value="docx">DOCX</SelectItem>
              <SelectItem value="ppt">PPT</SelectItem>
            </SelectContent>
          </Select>

          {/* Sort By */}
          <Select defaultValue="newest">
            <SelectTrigger className="w-full sm:w-[150px] border-gray-300">
              <SelectValue placeholder="מיון לפי" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">החדשים ביותר</SelectItem>
              <SelectItem value="rating">דירוג גבוה</SelectItem>
              <SelectItem value="downloads">הורדות רבות</SelectItem>
              <SelectItem value="views">צפיות רבות</SelectItem>
            </SelectContent>
          </Select>
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
