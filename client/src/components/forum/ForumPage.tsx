import { motion } from 'motion/react';
import { useState, useEffect, useMemo } from 'react';
import { ChevronRight, MessageCircle, Home } from 'lucide-react';
import { Button } from '../ui/button';
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

const questionsData: any[] = [];


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
  
  // Apply client-side filters with memoization for better performance
  // Note: Search filtering is now handled by the backend API
  const filteredQuestions = useMemo(() => {
    let result = [...questions];

    // Filter by tab (server-side filtering for 'unanswered' and 'mine')

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Full-width Header Section */}
      <div className="w-full px-4 py-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Page Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div className="space-y-2">
              {/* Title */}
              <div className="flex items-center gap-3">
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="bg-gradient-to-br from-blue-500 to-purple-600 text-white p-3 rounded-xl shadow-lg"
                >
                  <MessageCircle className="w-6 h-6" />
                </motion.div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">פורום שאלות ותשובות</h1>
              </div>

              {/* Breadcrumb */}
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <button
                  onClick={onNavigateHome}
                  className="hover:text-blue-600 transition-colors flex items-center gap-1"
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
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
            >
              שאלה חדשה
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Centered Content Section */}
      <div className="flex justify-center px-4 pb-12">
        <div className="w-full max-w-4xl">
          {/* Tabs Navigation */}
          <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="bg-white border border-blue-100 rounded-lg p-1 w-full mb-6 shadow-sm">
            <TabsTrigger value="all" className="flex-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white transition-all">
              הכל
            </TabsTrigger>
            <TabsTrigger value="unanswered" className="flex-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white transition-all">
              ללא מענה
            </TabsTrigger>
            <TabsTrigger value="mine" className="flex-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white transition-all">
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
              <div className="flex flex-col items-center gap-4 pt-8 pb-12">
                <div className="text-gray-600">
                  מציג {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredQuestions.length)} מתוך {filteredQuestions.length} תוצאות
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

          <TabsContent value="mine" className="space-y-6 mt-6">
            <div className="space-y-6">
              <ForumFilters
                searchQuery={searchQuery}
                onSearchChange={handleSearchChange}
              />
              {!isAuthenticated ? (
                <div className="bg-white rounded-lg border border-gray-200 p-12 text-center space-y-4 shadow-sm">
                  <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                    <MessageCircle className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">נדרש כניסה למערכת</h3>
                  <p className="text-gray-600">התחבר כדי לראות את השאלות שלך</p>
                </div>
              ) : currentQuestions.length === 0 ? (
                <div className="bg-white rounded-lg border border-gray-200 p-12 text-center space-y-4 shadow-sm">
                  <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                    <MessageCircle className="w-8 h-8 text-gray-400" />
                  </div>
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
        </div>
      </div>
    </div>
  );
}
