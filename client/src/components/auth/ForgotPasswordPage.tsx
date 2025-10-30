import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useForm } from 'react-hook-form';
import { Mail, ArrowRight, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

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
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      console.log('Forgot password for:', data.email);
      
      setSuccess(true);
      setResendTimer(60); // 60 seconds cooldown
    } catch (err) {
      setError('שגיאה בשליחת הקישור, נסה שוב');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;

    setIsLoading(true);
    setError('');

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setResendTimer(60);
    } catch (err) {
      setError('שגיאה בשליחה חוזרת');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full"
      >
        {!success ? (
          <>
            {/* Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center"
            >
              <span className="text-4xl">🔑</span>
            </motion.div>

            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center mb-8"
            >
              <h1 className="text-gray-900 mb-2">שכחת סיסמה?</h1>
              <p className="text-gray-600">אל דאגה, נעזור לך לאפס אותה</p>
            </motion.div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6"
              >
                {error}
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
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                    שולח...
                  </>
                ) : (
                  'שלח קישור לאיפוס'
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
              className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center"
            >
              <CheckCircle className="w-12 h-12 text-white" />
            </motion.div>

            {/* Success Message */}
            <h2 className="text-gray-900 mb-4">קישור לאיפוס נשלח! ✉️</h2>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-right">
              <p className="text-gray-700 mb-2">
                בדוק את תיבת המייל שלך ב-
              </p>
              <p className="text-blue-700 mb-3">{watchEmail}</p>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="text-lg">⏱️</span>
                <span>הקישור יפוג בעוד 15 דקות</span>
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
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-700">
                💡 לא מצאת את המייל? בדוק בתיקיית הספאם
              </p>
            </div>

            {/* Back to Login */}
            <Button
              onClick={onNavigateLogin}
              variant="outline"
              className="w-full"
            >
              <ArrowRight className="w-4 h-4 ml-2" />
              חזרה להתחברות
            </Button>
          </motion.div>
        )}

        {/* Logo at Bottom */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 text-center flex items-center justify-center gap-2 text-gray-500"
        >
          <span className="text-xl">🎓</span>
          <span>StudyHub-IL</span>
        </motion.div>
      </motion.div>
    </div>
  );
}
