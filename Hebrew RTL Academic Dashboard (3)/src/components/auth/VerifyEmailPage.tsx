import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Loader2, CheckCircle, XCircle, Mail, AlertTriangle } from 'lucide-react';
import { Button } from '../ui/button';

interface VerifyEmailPageProps {
  onNavigateDashboard: () => void;
  onNavigateLogin: () => void;
}

type VerificationStatus = 'verifying' | 'success' | 'expired' | 'invalid' | 'already-verified' | 'error';

export function VerifyEmailPage({ onNavigateDashboard, onNavigateLogin }: VerifyEmailPageProps) {
  const [status, setStatus] = useState<VerificationStatus>('verifying');
  const [redirectTimer, setRedirectTimer] = useState(5);
  const [resendTimer, setResendTimer] = useState(0);
  const [isResending, setIsResending] = useState(false);

  // Verify email on mount
  useEffect(() => {
    const verifyEmail = async () => {
      // Get token from URL
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');

      if (!token) {
        setStatus('invalid');
        return;
      }

      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // In real app:
        // await api.post('/auth/verify-email', { token });

        // Simulate different responses for demo
        const randomOutcome = Math.random();
        
        if (randomOutcome > 0.8) {
          setStatus('expired');
        } else if (randomOutcome > 0.6) {
          setStatus('already-verified');
        } else {
          setStatus('success');
          setRedirectTimer(5);
        }
      } catch (err: any) {
        if (err.response?.status === 400) {
          setStatus('expired');
        } else if (err.response?.status === 409) {
          setStatus('already-verified');
        } else {
          setStatus('error');
        }
      }
    };

    verifyEmail();
  }, []);

  // Redirect countdown after success
  useEffect(() => {
    if (status === 'success' && redirectTimer > 0) {
      const timer = setTimeout(() => setRedirectTimer(redirectTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else if (status === 'success' && redirectTimer === 0) {
      onNavigateDashboard();
    }
  }, [status, redirectTimer, onNavigateDashboard]);

  // Resend timer
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleResendVerification = async () => {
    if (resendTimer > 0 || isResending) return;

    setIsResending(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // In real app:
      // await api.post('/auth/resend-verification');

      setResendTimer(60);
      alert('קישור אימות חדש נשלח למייל שלך');
    } catch (err) {
      alert('שגיאה בשליחת קישור חדש');
    } finally {
      setIsResending(false);
    }
  };

  // Loading/Verifying State
  if (status === 'verifying') {
    return (
      <div dir="rtl" className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="w-20 h-20 mx-auto mb-6"
          >
            <Loader2 className="w-20 h-20 text-blue-600" />
          </motion.div>

          <h2 className="text-gray-900 mb-2">מאמת את האימייל שלך...</h2>
          <p className="text-gray-600">אנא המתן</p>

          <div className="mt-8">
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Success State
  if (status === 'success') {
    return (
      <div dir="rtl" className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center"
        >
          {/* Success Icon with Animation */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.2, 1] }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="relative w-24 h-24 mx-auto mb-6"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
              <CheckCircle className="w-14 h-14 text-white" />
            </div>
            
            {/* Ripple effect */}
            <motion.div
              initial={{ scale: 1, opacity: 0.5 }}
              animate={{ scale: 2, opacity: 0 }}
              transition={{ duration: 1, repeat: Infinity }}
              className="absolute inset-0 bg-green-400 rounded-full"
            />
          </motion.div>

          <h2 className="text-gray-900 mb-4">האימייל אומת בהצלחה! ✅</h2>
          <p className="text-gray-600 mb-6">
            תודה שאישרת את כתובת המייל שלך
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-700">
              מועבר לדף הבית בעוד {redirectTimer} שניות...
            </p>
          </div>

          <div className="space-y-3">
            <Button
              onClick={onNavigateDashboard}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              המשך לדף הבית →
            </Button>
            <Button
              onClick={onNavigateLogin}
              variant="outline"
              className="w-full"
            >
              התחבר לחשבון
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Expired Token State
  if (status === 'expired') {
    return (
      <div dir="rtl" className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring' }}
            className="w-20 h-20 mx-auto mb-6 bg-yellow-100 rounded-full flex items-center justify-center"
          >
            <AlertTriangle className="w-12 h-12 text-yellow-600" />
          </motion.div>

          <h2 className="text-gray-900 mb-4">הקישור פג תוקף ⏱️</h2>
          <p className="text-gray-600 mb-6">
            קישור האימות אינו תקף יותר. אנא בקש קישור חדש.
          </p>

          <div className="space-y-3 mb-6">
            {resendTimer > 0 ? (
              <p className="text-sm text-gray-500">
                ניתן לשלוח שוב בעוד {resendTimer} שניות
              </p>
            ) : (
              <Button
                onClick={handleResendVerification}
                disabled={isResending}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                {isResending ? (
                  <>
                    <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                    שולח...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 ml-2" />
                    שלח קישור אימות חדש
                  </>
                )}
              </Button>
            )}
          </div>

          <Button
            onClick={onNavigateLogin}
            variant="outline"
            className="w-full"
          >
            חזרה להתחברות
          </Button>
        </motion.div>
      </div>
    );
  }

  // Already Verified State
  if (status === 'already-verified') {
    return (
      <div dir="rtl" className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring' }}
            className="w-20 h-20 mx-auto mb-6 bg-blue-100 rounded-full flex items-center justify-center"
          >
            <CheckCircle className="w-12 h-12 text-blue-600" />
          </motion.div>

          <h2 className="text-gray-900 mb-4">האימייל כבר אומת ✓</h2>
          <p className="text-gray-600 mb-6">
            החשבון שלך כבר אומת. תוכל להתחבר כרגיל.
          </p>

          <div className="space-y-3">
            <Button
              onClick={onNavigateLogin}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              התחבר לחשבון
            </Button>
            <Button
              onClick={onNavigateDashboard}
              variant="outline"
              className="w-full"
            >
              עבור לדף הבית
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Invalid Token or Error State
  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring' }}
          className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center"
        >
          <XCircle className="w-12 h-12 text-red-600" />
        </motion.div>

        <h2 className="text-gray-900 mb-4">אימות נכשל ❌</h2>
        <p className="text-gray-600 mb-6">
          {status === 'invalid' 
            ? 'הקישור אינו תקין. אנא בדוק שהעתקת את הקישור המלא מהמייל.'
            : 'אירעה שגיאה באימות האימייל. אנא נסה שוב.'}
        </p>

        <div className="space-y-3 mb-6">
          {resendTimer > 0 ? (
            <p className="text-sm text-gray-500">
              ניתן לשלוח שוב בעוד {resendTimer} שניות
            </p>
          ) : (
            <Button
              onClick={handleResendVerification}
              disabled={isResending}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              {isResending ? (
                <>
                  <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                  שולח...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 ml-2" />
                  שלח קישור אימות חדש
                </>
              )}
            </Button>
          )}
        </div>

        <Button
          onClick={onNavigateLogin}
          variant="outline"
          className="w-full"
        >
          חזרה להתחברות
        </Button>
      </motion.div>
    </div>
  );
}
