import { motion } from 'motion/react';
import { Calendar } from 'lucide-react';
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="bg-gradient-to-r from-blue-500 via-purple-500 to-purple-600 rounded-xl shadow-lg p-8 text-white"
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="mb-2">שלום, {firstName}! 👋</h1>
          <p className="opacity-90">ברוך הבא ל-StudyHub-IL - הפלטפורמה האקדמית שלך</p>
        </div>
        <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
          <Calendar className="w-5 h-5" />
          <span>{currentDate}</span>
        </div>
      </div>
    </motion.div>
  );
}
