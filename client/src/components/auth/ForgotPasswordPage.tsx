import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useForm } from 'react-hook-form';
import { 
  Mail, 
  ArrowRight, 
  Loader2, 
  CheckCircle,
  KeyRound,
  Clock,
  Sparkles,
  Shield,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import api from '../../utils/api';

interface ForgotPasswordPageProps {
  onNavigateLogin: () => void;
}

interface ForgotPasswordFormData {
  email: string;
}

export function ForgotPasswordPage({ onNavigateLogin }: ForgotPasswordPageProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ForgotPasswordFormData>();

  const watchEmail = watch('email', '');

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    setError('');

    try {
      await api.post('/auth/forgot-password', { email: data.email });
      
      setSuccess(true);
      setResendTimer(60); // 60 seconds cooldown
    } catch (err: any) {
      setError(err.response?.data?.error || 'שגיאה בשליחת הקישור, נסה שוב');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;

    setIsLoading(true);
    setError('');

    try {
      await api.post('/auth/forgot-password', { email: watchEmail });
      setResendTimer(60);
    } catch (err: any) {
      setError(err.response?.data?.error || 'שגיאה בשליחה חוזרת');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-white flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-gradient-to-br from-blue-300/20 to-purple-300/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-gradient-to-tl from-purple-300/20 to-pink-300/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border-2 border-gray-200 p-8 max-w-md w-full relative z-10"
      >
        {!success ? (
          <>
            {/* Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="mb-6"
            >
              <div className="flex items-center justify-center gap-3 mb-4">
                <motion.div
                  animate={{ rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  className="bg-gradient-to-br from-blue-500 via-purple-500 to-purple-600 p-4 rounded-2xl shadow-lg"
                >
                  <KeyRound className="w-10 h-10 text-white" />
                </motion.div>
              </div>
            </motion.div>

            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center mb-8"
            >
              <h1 className="text-3xl font-bold text-gray-900 mb-3">שכחת סיסמה?</h1>
              <p className="text-gray-600 text-base">אל דאגה, נעזור לך לאפס אותה</p>
            </motion.div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-red-50/90 border-2 border-red-300 text-red-700 px-4 py-3 rounded-2xl mb-6 flex items-center gap-3 shadow-md"
              >
                <div className="bg-red-100 p-2 rounded-xl">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <span className="font-medium flex-1">{error}</span>
              </motion.div>
            )}

            {/* Form */}
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-6"
            >
              <div>
                <Label htmlFor="email" className="mb-2">
                  כתובת האימייל שלך
                </Label>
                <div className="relative">
                  <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    {...register('email', {
                      required: 'אימייל הוא שדה חובה',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'כתובת אימייל לא תקינה',
                      },
                    })}
                    placeholder="your@email.com"
                    className={`pr-10 ${errors.email ? 'border-red-500' : ''}`}
                    disabled={isLoading}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
                )}
                <p className="text-sm text-gray-500 mt-2">
                  נשלח לך קישור לאיפוס סיסמה למייל זה
                </p>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-500 via-purple-500 to-purple-600 hover:from-blue-600 hover:via-purple-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 font-semibold py-6"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                    שולח...
                  </>
                ) : (
                  <>
                    <Mail className="w-5 h-5 ml-2" />
                    שלח קישור לאיפוס
                  </>
                )}
              </Button>
            </motion.form>

            {/* Back to Login */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-6 text-center"
            >
              <button
                onClick={onNavigateLogin}
                className="text-blue-600 hover:text-blue-700 hover:underline flex items-center justify-center gap-2 mx-auto"
              >
                <ArrowRight className="w-4 h-4" />
                חזרה להתחברות
              </button>
            </motion.div>
          </>
        ) : (
          // Success State
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            {/* Success Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-green-400 via-emerald-500 to-green-600 rounded-full flex items-center justify-center shadow-2xl"
            >
              <CheckCircle className="w-14 h-14 text-white stroke-[3]" />
            </motion.div>

            {/* Sparkles Animation */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                  scale: [0, 1, 0],
                  opacity: [0, 1, 0],
                  x: Math.cos((i * Math.PI) / 3) * 100,
                  y: Math.sin((i * Math.PI) / 3) * 100,
                }}
                transition={{ delay: 0.3 + i * 0.1, duration: 1 }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
              >
                <Sparkles className="w-6 h-6 text-yellow-500" />
              </motion.div>
            ))}

            {/* Success Message */}
            <h2 className="text-3xl font-bold text-gray-900 mb-4">קישור לאיפוס נשלח!</h2>
            
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-300 rounded-2xl p-5 mb-6 text-right shadow-md">
              <div className="flex items-center gap-2 mb-3">
                <Mail className="w-5 h-5 text-blue-600" />
                <p className="text-gray-700 font-semibold">
                  בדוק את תיבת המייל שלך
                </p>
              </div>
              <p className="text-blue-700 font-bold text-lg mb-3">{watchEmail}</p>
              <div className="flex items-center gap-2 text-sm text-gray-600 bg-white/50 rounded-xl p-3">
                <Clock className="w-4 h-4 text-orange-500" />
                <span className="font-medium">הקישור יפוג בעוד 15 דקות</span>
              </div>
            </div>

            {/* Resend Link */}
            <div className="mb-6">
              {resendTimer > 0 ? (
                <p className="text-sm text-gray-500">
                  לא קיבלת? שלח שוב (זמין בעוד {resendTimer} שניות)
                </p>
              ) : (
                <button
                  onClick={handleResend}
                  disabled={isLoading}
                  className="text-sm text-blue-600 hover:text-blue-700 hover:underline disabled:opacity-50"
                >
                  {isLoading ? 'שולח...' : 'לא קיבלת? שלח שוב'}
                </button>
              )}
            </div>

            {/* Help Text */}
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-2xl p-4 mb-6 shadow-md">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-yellow-600" />
                <p className="text-sm text-gray-700 font-medium">
                  לא מצאת את המייל? בדוק בתיקיית הספאם
                </p>
              </div>
            </div>

            {/* Back to Login */}
            <Button
              onClick={onNavigateLogin}
              variant="outline"
              className="w-full border-2 hover:bg-gray-50 font-semibold py-6"
            >
              <ArrowRight className="w-5 h-5 ml-2" />
              חזרה להתחברות
            </Button>
          </motion.div>
        )}

        {/* Logo at Bottom */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 text-center flex items-center justify-center gap-2 text-gray-600"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          >
            <Shield className="w-6 h-6 text-blue-600" />
          </motion.div>
          <span className="font-semibold">StudyHub-IL</span>
        </motion.div>
      </motion.div>
    </div>
  );
}
