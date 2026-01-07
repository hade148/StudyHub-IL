import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, HelpCircle, ArrowLeft } from 'lucide-react';

interface SimilarQuestion {
  id: string;
  title: string;
  answerCount: number;
  isSolved: boolean;
}

interface SimilarQuestionsProps {
  questions: SimilarQuestion[];
  onClose: () => void;
}

export function SimilarQuestions({ questions, onClose }: SimilarQuestionsProps) {
  if (questions.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg"
        dir="rtl"
      >
        <div className="flex items-start gap-3 mb-3">
          <HelpCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-yellow-900 mb-1"> שאלות דומות שכבר נשאלו:</h3>
            <p className="text-sm text-yellow-700">
              בדוק אם אחת מהשאלות האלה עונה על השאלה שלך
            </p>
          </div>
        </div>

        <div className="space-y-2 mb-3">
          {questions.map((question) => (
            <motion.a
              key={question.id}
              href={`/forum/question/${question.id}`}
              target="_blank"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="block p-3 bg-white rounded-lg border border-yellow-200 hover:border-yellow-400 hover:shadow-md transition-all group"
            >
              <div className="flex items-start gap-2">
                <div className="flex-1">
                  <div className="text-gray-900 group-hover:text-blue-600 transition-colors">
                    {question.title}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-sm text-gray-600">
                    <span>{question.answerCount} תשובות</span>
                    {question.isSolved && (
                      <span className="flex items-center gap-1 text-green-600">
                        <CheckCircle className="w-4 h-4" />
                        נפתר
                      </span>
                    )}
                  </div>
                </div>
                <ArrowLeft className="w-4 h-4 text-gray-400 group-hover:text-blue-500 flex-shrink-0 mt-1" />
              </div>
            </motion.a>
          ))}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-2 text-sm text-yellow-700 hover:text-yellow-900 transition-colors"
        >
          לא מצאתי תשובה, המשך לשאול ←
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
