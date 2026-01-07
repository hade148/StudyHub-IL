import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { ChevronRight, MessageCircle, Home } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
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
  const itemsPerPage = 10;

  // Fetch questions from API
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setIsLoading(true);
        const response = await api.get('/forum');
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
  }, []);

  const unansweredCount = questions.filter((q) => !q.isAnswered).length;
  
  const filteredQuestions = activeTab === 'unanswered' 
    ? questions.filter((q) => !q.isAnswered)
    : questions;

  const totalPages = Math.ceil(filteredQuestions.length / itemsPerPage);
  const currentQuestions = filteredQuestions.slice(
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
                <MessageCircle className="w-6 h-6" />
              </div>
              <h1 className="text-gray-900">פורום שאלות ותשובות</h1>
            </div>

            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-gray-600">
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
            className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white"
          >
            <span className="text-xl ml-2"></span>
            שאלה חדשה
          </Button>
        </div>

        {/* Tabs Navigation */}
        <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="bg-white rounded-lg shadow-sm p-1 w-full md:w-auto">
            <TabsTrigger value="all" className="flex-1 md:flex-none">
              הכל
            </TabsTrigger>
            <TabsTrigger value="unanswered" className="flex-1 md:flex-none">
              <span className="flex items-center gap-2">
                ללא מענה
                <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">
                  {unansweredCount}
                </Badge>
              </span>
            </TabsTrigger>
            <TabsTrigger value="popular" className="flex-1 md:flex-none">
              <span className="flex items-center gap-1">
                פופולרי
                <span>🔥</span>
              </span>
            </TabsTrigger>
            <TabsTrigger value="mine" className="flex-1 md:flex-none">
              השאלות שלי
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6 mt-6">
            <div className="max-w-5xl mx-auto">
              {/* Main Content */}
              <div className="space-y-6">
                {/* Filters */}
                <ForumFilters />

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
                <div className="flex flex-col items-center gap-4 pt-4">
                  <div className="text-gray-600">
                    מציג {(currentPage - 1) * itemsPerPage + 1}-
                    {Math.min(currentPage * itemsPerPage, filteredQuestions.length)} מתוך{' '}
                    {filteredQuestions.length} שאלות
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
              </div>
            </div>
          </TabsContent>

          <TabsContent value="unanswered" className="space-y-6 mt-6">
            <div className="max-w-5xl mx-auto">
              <div className="space-y-6">
                <ForumFilters />
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
            </div>
          </TabsContent>

          <TabsContent value="popular" className="space-y-6 mt-6">
            <div className="max-w-5xl mx-auto">
              <div className="space-y-6">
                <ForumFilters />
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
            </div>
          </TabsContent>

          <TabsContent value="mine" className="space-y-6 mt-6">
            <div className="max-w-5xl mx-auto">
              <div className="space-y-6">
                <ForumFilters />
                <div className="bg-white rounded-xl shadow-lg p-12 text-center space-y-4">
                  <div className="text-6xl">📭</div>
                  <h3>אין לך שאלות עדיין</h3>
                  <p className="text-gray-600">התחל לשאול שאלות ותראה אותן כאן</p>
                  <Button className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white">
                    <span className="text-xl ml-2"></span>
                    שאל שאלה ראשונה
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
