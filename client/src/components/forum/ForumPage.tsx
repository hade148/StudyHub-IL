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
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

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
  const { user } = useAuth();
  const isAuthenticated = !!user;
  const itemsPerPage = 10;



  // Fetch questions from API with filters
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
  
  const filteredQuestions = activeTab === 'unanswered' 
    ? questions.filter((q) => !q.isAnswered && q._count.comments === 0)
    : activeTab === 'mine'
    ? questions.filter((q) => q.authorId === user?.id || q.author?.id === user?.id)
    : questions;

  const totalPages = Math.ceil(filteredQuestions.length / itemsPerPage);
  const currentQuestions = filteredQuestions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-white">
      {/* Full-width Header Section */}
      <div className="w-full bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="space-y-3">
                {/* Title */}
                <div className="flex items-center gap-4">
                  <motion.div 
                    whileHover={{ scale: 1.05, rotate: 5 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-gradient-to-br from-blue-500 via-purple-500 to-purple-600 text-white p-3.5 rounded-2xl shadow-lg"
                  >
                    <MessageCircle className="w-7 h-7" />
                  </motion.div>
                  <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-purple-700 bg-clip-text text-transparent">פורום שאלות ותשובות</h1>
                    <p className="text-gray-600 text-sm mt-1">קהילת סטודנטים עוזרת</p>
                  </div>
                </div>

                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <button
                    onClick={onNavigateHome}
                    className="hover:text-blue-600 transition-colors flex items-center gap-1.5 font-medium"
                  >
                    <Home className="w-4 h-4" />
                    דף הבית
                  </button>
                  <ChevronRight className="w-4 h-4" />
                  <span className="text-gray-700 font-medium">פורום</span>
                </div>
              </div>

              {/* Ask Question Button */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  onClick={onNavigateNewQuestion}
                  className="bg-gradient-to-r from-blue-500 via-blue-600 to-purple-600 hover:from-blue-600 hover:via-purple-600 hover:to-purple-700 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 font-semibold text-base"
                >
                  <MessageCircle className="w-5 h-5 ml-2" />
                  שאלה חדשה
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Centered Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="w-full">
          {/* Tabs Navigation */}
          <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-2xl p-1.5 w-full max-w-md mx-auto mb-8 shadow-md">
              <TabsTrigger 
                value="all" 
                className="flex-1 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 font-semibold py-2.5"
              >
                הכל
              </TabsTrigger>
              <TabsTrigger 
                value="unanswered" 
                className="flex-1 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 font-semibold py-2.5"
              >
                ללא מענה
              </TabsTrigger>
              <TabsTrigger 
                value="mine" 
                className="flex-1 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 font-semibold py-2.5"
              >
                השאלות שלי
              </TabsTrigger>
            </TabsList>

          <TabsContent value="all" className="space-y-6 mt-6">
            <div className="space-y-6">
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
