import { useState } from 'react';
import { motion } from 'motion/react';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Mail, Lock, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { useAuth } from '../../context/AuthContext';

interface LoginPageProps {
  onNavigateDashboard: () => void;
  onNavigateRegister: () => void;
  onNavigateForgotPassword: () => void;
}

interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

export function LoginPage({ onNavigateDashboard, onNavigateRegister, onNavigateForgotPassword }: LoginPageProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<LoginFormData>({
    defaultValues: {
      rememberMe: false,
    },
  });

  const watchRememberMe = watch('rememberMe', false);

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError('');

    try {
      // Use real login function from AuthContext
      await login(data.email, data.password);
      
      // Navigate to dashboard only after successful login
      onNavigateDashboard();
    } catch (err: any) {
      setError(err.response?.data?.error || err.response?.data?.message || 'אימייל או סיסמה שגויים');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50 flex">
      {/* Left Side - Form */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full lg:w-1/2 flex items-center justify-center p-8"
      >
        <div className="w-full max-w-md space-y-8">
          {/* Logo & Title */}
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="inline-flex items-center gap-2 mb-6"
            >
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-3 rounded-xl">
                <span className="text-3xl">🎓</span>
              </div>
              <span className="text-2xl font-bold">StudyHub-IL</span>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h1 className="text-2xl font-bold text-gray-900 mb-2">ברוכים הבאים!</h1>
              <p className="text-gray-600">התחבר כדי להמשיך לפלטפורמה</p>
            </motion.div>
          </div>

          {/* Error Alert */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </motion.div>
          )}

          {/* Login Form */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6"
          >
            {/* Email */}
            <div>
              <Label htmlFor="email" className="mb-2 flex items-center gap-1">
                אימייל <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  {...register('email', {
                    required: 'אימייל הוא שדה חובה',
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: 'כתובת אימייל לא תקינה',
                    },
                  })}
                  placeholder="example@email.com"
                  className={`pr-10 ${errors.email ? 'border-red-500' : ''}`}
                  disabled={isLoading}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <Label htmlFor="password" className="mb-2 flex items-center gap-1">
                סיסמה <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  {...register('password', {
                    required: 'סיסמה היא שדה חובה',
                    minLength: {
                      value: 6,
                      message: 'הסיסמה חייבת להכיל לפחות 6 תווים',
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
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="rememberMe"
                  checked={watchRememberMe}
                  onCheckedChange={(checked) => setValue('rememberMe', !!checked)}
                />
                <label htmlFor="rememberMe" className="text-sm text-gray-600 cursor-pointer">
                  זכור אותי
                </label>
              </div>
              <button
                type="button"
                onClick={onNavigateForgotPassword}
                className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
              >
                שכחת סיסמה?
              </button>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                  מתחבר...
                </>
              ) : (
                'התחבר'
              )}
            </Button>
          </motion.form>

          {/* Social Login */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-gray-50 text-gray-500">או התחבר באמצעות</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              disabled={isLoading}
            >
              <span className="ml-2">🔵</span>
              Google
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              disabled={isLoading}
            >
              <span className="ml-2">📘</span>
              Facebook
            </Button>
          </div>

          {/* Register Link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center"
          >
            <p className="text-gray-600">
              אין לך חשבון?{' '}
              <button
                onClick={onNavigateRegister}
                className="text-blue-600 hover:text-blue-700 hover:underline"
              >
                הירשם עכשיו
              </button>
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* Right Side - Illustration */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-500 via-purple-500 to-purple-600 p-12 items-center justify-center relative overflow-hidden"
      >
        <div className="absolute top-20 right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-white/10 rounded-full blur-3xl" />

        <div className="relative z-10 text-white space-y-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring' }}
            className="text-center mb-8"
          >
            <h2 className="text-3xl font-bold text-white mb-4">ברוכים הבאים ל-StudyHub-IL</h2>
            <p className="text-xl text-white/90">הפלטפורמה האקדמית שלך</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-4 text-right"
          >
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <span className="text-3xl">📚</span>
              <span className="text-lg">אלפי סיכומים איכותיים</span>
            </div>
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <span className="text-3xl">💬</span>
              <span className="text-lg">קהילה פעילה של סטודנטים</span>
            </div>
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <span className="text-3xl">🛠️</span>
              <span className="text-lg">כלים חכמים ללמידה</span>
            </div>
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <span className="text-3xl">🏆</span>
              <span className="text-lg">הישגים ונקודות</span>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}