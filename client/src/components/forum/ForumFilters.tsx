import { Search } from 'lucide-react';
import { Input } from '../ui/input';

interface ForumFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function ForumFilters({
  searchQuery,
  onSearchChange,
}: ForumFiltersProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="חפש שאלות..."
            className="pr-10 border-gray-300 focus:border-gray-400"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
