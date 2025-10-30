import { useEffect, useState } from 'react';
import { CheckCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface SuccessModalProps {
  isOpen: boolean;
  onViewQuestion: () => void;
  onAskAnother: () => void;
}

export function SuccessModal({ isOpen, onViewQuestion, onAskAnother }: SuccessModalProps) {
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (isOpen) {
      setCountdown(5);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            onViewQuestion();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isOpen, onViewQuestion]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden"
        dir="rtl"
      >
        {/* Confetti Effect */}
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-500 to-purple-500 p-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', duration: 0.6 }}
            className="flex justify-center"
          >
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>
          </motion.div>

          {/* Confetti particles */}
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ y: 0, x: 0, opacity: 1 }}
              animate={{
                y: Math.random() * 200 - 100,
                x: Math.random() * 200 - 100,
                opacity: 0,
              }}
              transition={{
                duration: Math.random() * 2 + 1,
                ease: 'easeOut',
              }}
              className="absolute top-1/2 left-1/2"
              style={{
                width: Math.random() * 10 + 5,
                height: Math.random() * 10 + 5,
                backgroundColor: ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B'][Math.floor(Math.random() * 4)],
                borderRadius: Math.random() > 0.5 ? '50%' : '0%',
              }}
            />
          ))}
        </div>

        <div className="p-8 text-center">
          <h2 className="text-2xl mb-2">✓ השאלה פורסמה!</h2>
          <p className="text-gray-600 mb-6">
            השאלה שלך פורסמה בהצלחה בפורום
          </p>

          <div className="space-y-3">
            <button
              onClick={onViewQuestion}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:shadow-lg transition-all"
            >
              צפה בשאלה
            </button>
            <button
              onClick={onAskAnother}
              className="w-full px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              שאל שאלה נוספת
            </button>
          </div>

          <p className="text-sm text-gray-500 mt-4">
            מעבר אוטומטי לשאלה בעוד {countdown} שניות...
          </p>
        </div>
      </motion.div>
    </div>
  );
}
