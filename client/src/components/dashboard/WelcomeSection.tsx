import { motion } from 'motion/react';
import { Calendar, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function WelcomeSection() {
  const { user } = useAuth();
  
  const currentDate = new Date().toLocaleDateString('he-IL', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Get first name for greeting
  const firstName = user?.fullName?.split(' ')[0] || 'משתמש';

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-2xl p-8 border border-gray-100/50"
    >
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-40 h-40 bg-blue-200/30 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-60 h-60 bg-purple-200/30 rounded-full blur-3xl" />
      
      <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <Sparkles className="w-6 h-6 text-purple-500" />
            </motion.div>
            <h1 className="text-3xl font-bold bg-gradient-to-l from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              שלום, {firstName}
            </h1>
          </div>
          <p className="text-gray-600 text-lg">ברוך הבא ל-StudyHub-IL - הפלטפורמה האקדמית שלך</p>
        </div>
        
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="flex items-center gap-3 bg-white/60 backdrop-blur-md rounded-xl px-5 py-3 border border-white/50 shadow-sm"
        >
          <Calendar className="w-5 h-5 text-gray-600" />
          <span className="text-gray-700 font-medium">{currentDate}</span>
        </motion.div>
      </div>
    </motion.div>
  );
}
