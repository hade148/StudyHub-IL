import { Search } from 'lucide-react';
import { Input } from '../ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

export function ForumFilters() {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="חפש שאלות..."
            className="pr-10 border-gray-300"
          />
        </div>

        {/* Category Filter */}
        <Select defaultValue="all">
          <SelectTrigger className="w-full md:w-[180px] border-gray-300">
            <SelectValue placeholder="כל הקטגוריות" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">כל הקטגוריות</SelectItem>
            <SelectItem value="algorithms">אלגוריתמים</SelectItem>
            <SelectItem value="math">מתמטיקה</SelectItem>
            <SelectItem value="physics">פיזיקה</SelectItem>
            <SelectItem value="chemistry">כימיה</SelectItem>
            <SelectItem value="resources">משאבי לימוד</SelectItem>
            <SelectItem value="general">כללי</SelectItem>
          </SelectContent>
        </Select>

        {/* Sort By */}
        <Select defaultValue="newest">
          <SelectTrigger className="w-full md:w-[150px] border-gray-300">
            <SelectValue placeholder="מיון" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">אחרונות</SelectItem>
            <SelectItem value="popular">פופולרי</SelectItem>
            <SelectItem value="unanswered">ללא מענה</SelectItem>
            <SelectItem value="votes">הצבעות</SelectItem>
          </SelectContent>
        </Select>

        {/* Time Filter */}
        <Select defaultValue="all">
          <SelectTrigger className="w-full md:w-[150px] border-gray-300">
            <SelectValue placeholder="זמן" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">כל הזמנים</SelectItem>
            <SelectItem value="today">היום</SelectItem>
            <SelectItem value="week">שבוע אחרון</SelectItem>
            <SelectItem value="month">חודש אחרון</SelectItem>
            <SelectItem value="year">שנה אחרונה</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
