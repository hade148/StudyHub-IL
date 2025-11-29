import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Lock, Loader2, Check, X, AlertCircle } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import api from '../../utils/api';

interface ResetPasswordPageProps {
  onNavigateLogin: () => void;
}

interface ResetPasswordFormData {
  password: string;
  confirmPassword: string;
}

interface PasswordStrength {
  score: number;
  label: string;
  color: string;
}

export function ResetPasswordPage({ onNavigateLogin }: ResetPasswordPageProps) {
  const { token } = useParams<{ token: string }>();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [redirectTimer, setRedirectTimer] = useState(5);
  const [tokenExpired, setTokenExpired] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ResetPasswordFormData>();

  const watchPassword = watch('password', '');
  const watchConfirmPassword = watch('confirmPassword', '');

  // Check token validity on mount
  useEffect(() => {
    const checkToken = () => {
      // Check if token is provided in URL params
      if (!token) {
        setTokenExpired(true);
      }
    };

    checkToken();
  }, [token]);

  // Redirect countdown after success
  useEffect(() => {
    if (success && redirectTimer > 0) {
      const timer = setTimeout(() => setRedirectTimer(redirectTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else if (success && redirectTimer === 0) {
      onNavigateLogin();
    }
  }, [success, redirectTimer, onNavigateLogin]);

  const calculatePasswordStrength = (password: string): PasswordStrength => {
    let score = 0;
    
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[@$!%*?&]/.test(password)) score++;

    if (score <= 2) return { score, label: 'חלשה', color: 'bg-red-500' };
    if (score <= 4) return { score, label: 'בינונית', color: 'bg-yellow-500' };
    return { score, label: 'חזקה', color: 'bg-green-500' };
  };

  const passwordStrength = watchPassword ? calculatePasswordStrength(watchPassword) : null;

  const passwordRequirements = [
    { test: watchPassword.length >= 8, label: 'לפחות 8 תווים' },
    { test: /[A-Z]/.test(watchPassword), label: 'אות גדולה אחת' },
    { test: /[a-z]/.test(watchPassword), label: 'אות קטנה אחת' },
    { test: /[0-9]/.test(watchPassword), label: 'מספר אחד' },
    { test: /[@$!%*?&]/.test(watchPassword), label: 'תו מיוחד (!@#$%^&*)' },
  ];

  const onSubmit = async (data: ResetPasswordFormData) => {
    setIsLoading(true);
    setError('');

    try {
      await api.post('/auth/reset-password', { 
        token, 
        password: data.password 
      });
      
      setSuccess(true);
      setRedirectTimer(5);
    } catch (err: any) {
      if (err.response?.status === 400) {
        setError('הקישור פג תוקף');
        setTokenExpired(true);
      } else {
        setError(err.response?.data?.error || 'שגיאה באיפוס הסיסמה, נסה שוב');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Token Expired State
  if (tokenExpired) {
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
            <AlertCircle className="w-12 h-12 text-red-600" />
          </motion.div>

          <h2 className="text-gray-900 mb-4">הקישור פג תוקף ⏱️</h2>
          <p className="text-gray-600 mb-6">
            קישור איפוס הסיסמה אינו תקף יותר. אנא בקש קישור חדש.
          </p>

          <div className="space-y-3">
            <Button
              onClick={onNavigateLogin}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              בקש קישור חדש
            </Button>
            <Button onClick={onNavigateLogin} variant="outline" className="w-full">
              חזרה להתחברות
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Success State
  if (success) {
    return (
      <div dir="rtl" className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.2, 1] }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center"
          >
            <Check className="w-12 h-12 text-white" />
          </motion.div>

          <h2 className="text-gray-900 mb-4">הסיסמה אופסה בהצלחה! ✅</h2>
          <p className="text-gray-600 mb-6">
            עכשיו תוכל להתחבר עם הסיסמה החדשה שלך
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-700">
              מועבר להתחברות בעוד {redirectTimer} שניות...
            </p>
          </div>

          <Button
            onClick={onNavigateLogin}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          >
            התחבר עכשיו
          </Button>
        </motion.div>
      </div>
    );
  }

  // Reset Password Form
  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full"
      >
        {/* Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center"
        >
          <span className="text-4xl">🔐</span>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center mb-8"
        >
          <h1 className="text-gray-900 mb-2">איפוס סיסמה</h1>
          <p className="text-gray-600">בחר סיסמה חדשה לחשבון שלך</p>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2"
          >
            <AlertCircle className="w-5 h-5" />
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
          {/* New Password */}
          <div>
            <Label htmlFor="password" className="mb-2 flex items-center gap-1">
              סיסמה חדשה <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                {...register('password', {
                  required: 'סיסמה היא שדה חובה',
                  minLength: {
                    value: 8,
                    message: 'הסיסמה חייבת להכיל לפחות 8 תווים',
                  },
                  pattern: {
                    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
                    message: 'הסיסמה חייבת להכיל אות גדולה, קטנה, מספר ותו מיוחד',
                  },
                })}
                placeholder="••••••••"
                className={`pr-10 pl-10 ${errors.password ? 'border-red-500' : ''}`}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-red-600 mt-1">{errors.password.message}</p>
            )}

            {/* Password Strength Indicator */}
            {watchPassword && passwordStrength && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 space-y-2"
              >
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                      className={`h-full ${passwordStrength.color} transition-all duration-300`}
                    />
                  </div>
                  <span className={`text-sm ${
                    passwordStrength.score <= 2 ? 'text-red-600' :
                    passwordStrength.score <= 4 ? 'text-yellow-600' :
                    'text-green-600'
                  }`}>
                    {passwordStrength.label}
                  </span>
                </div>

                {/* Requirements List */}
                <div className="grid grid-cols-1 gap-1 text-xs bg-gray-50 p-3 rounded-lg">
                  {passwordRequirements.map((req, index) => (
                    <div
                      key={index}
                      className={`flex items-center gap-1 ${
                        req.test ? 'text-green-600' : 'text-gray-500'
                      }`}
                    >
                      {req.test ? (
                        <Check className="w-3 h-3" />
                      ) : (
                        <X className="w-3 h-3" />
                      )}
                      {req.label}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <Label htmlFor="confirmPassword" className="mb-2 flex items-center gap-1">
              אימות סיסמה <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                {...register('confirmPassword', {
                  required: 'אימות סיסמה הוא שדה חובה',
                  validate: (value) => value === watchPassword || 'הסיסמאות אינן תואמות',
                })}
                placeholder="••••••••"
                className={`pr-10 pl-10 ${
                  errors.confirmPassword ? 'border-red-500' : 
                  watchConfirmPassword && watchConfirmPassword === watchPassword ? 'border-green-500' : ''
                }`}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-red-600 mt-1">{errors.confirmPassword.message}</p>
            )}
            {watchConfirmPassword && watchConfirmPassword === watchPassword && !errors.confirmPassword && (
              <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                <Check className="w-3 h-3" />
                הסיסמאות תואמות
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                מאפס סיסמה...
              </>
            ) : (
              'אפס סיסמה'
            )}
          </Button>
        </motion.form>

        {/* Logo at Bottom */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center flex items-center justify-center gap-2 text-gray-500"
        >
          <span className="text-xl">🎓</span>
          <span>StudyHub-IL</span>
        </motion.div>
      </motion.div>
    </div>
  );
}
