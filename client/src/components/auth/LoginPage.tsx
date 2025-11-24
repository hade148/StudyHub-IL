import { useState } from 'react';
import { motion } from 'motion/react';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Mail, Lock, Loader2 } from 'lucide-react';
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
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<LoginFormData>({
    defaultValues: {
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError('');

    try {
      // Use real login function from AuthContext
      await login(data.email, data.password);
      
      // Navigate to dashboard only after successful login
      onNavigateDashboard();
    } catch (err: any) {
      // Handle axios errors and other error types
      const errorMessage = err.response?.data?.message || err.message || 'אימייל או סיסמה שגויים';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider: string) => {
    console.log(`Login with ${provider}`);
    // Implement social login
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
              <span className="text-2xl">StudyHub-IL</span>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h1 className="text-gray-900 mb-2">ברוך הבא בחזרה!</h1>
              <p className="text-gray-600">התחבר לחשבון שלך והמשך ללמוד</p>
            </motion.div>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg"
            >
              {error}
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
            {/* Email Input */}
            <div>
              <Label htmlFor="email" className="mb-2">
                כתובת אימייל
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
            </div>

            {/* Password Input */}
            <div>
              <Label htmlFor="password" className="mb-2">
                סיסמה
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
                <Checkbox id="rememberMe" {...register('rememberMe')} />
                <label htmlFor="rememberMe" className="text-sm text-gray-700 cursor-pointer">
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

          {/* Divider */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="relative"
          >
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-50 text-gray-500">או</span>
            </div>
          </motion.div>

          {/* Social Login */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="space-y-3"
          >
            <Button
              type="button"
              onClick={() => handleSocialLogin('google')}
              variant="outline"
              className="w-full"
              disabled={isLoading}
            >
              <span className="ml-2">🔍</span>
              התחבר עם Google
            </Button>
            <Button
              type="button"
              onClick={() => handleSocialLogin('facebook')}
              variant="outline"
              className="w-full"
              disabled={isLoading}
            >
              <span className="ml-2">📘</span>
              התחבר עם Facebook
            </Button>
          </motion.div>

          {/* Sign Up Link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-center"
          >
            <p className="text-gray-600">
              אין לך חשבון?{' '}
              <button
                onClick={onNavigateRegister}
                className="text-blue-600 hover:text-blue-700 hover:underline"
              >
                הרשם עכשיו
              </button>
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* Right Side - Illustration/Gradient */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-500 via-purple-500 to-purple-600 p-12 items-center justify-center relative overflow-hidden"
      >
        {/* Decorative shapes */}
        <div className="absolute top-20 right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-white/10 rounded-full blur-3xl" />

        <div className="relative z-10 text-white text-center space-y-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring' }}
          >
            <h2 className="text-white mb-4">StudyHub-IL</h2>
            <p className="text-xl text-white/90 mb-8">הפלטפורמה האקדמית שלך</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-4 text-right"
          >
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <span className="text-3xl">📚</span>
              <span className="text-lg">אלפי סיכומים</span>
            </div>
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <span className="text-3xl">💬</span>
              <span className="text-lg">קהילה פעילה</span>
            </div>
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <span className="text-3xl">🛠️</span>
              <span className="text-lg">כלים שימושיים</span>
            </div>
          </motion.div>

          {/* Floating elements */}
          <motion.div
            animate={{
              y: [0, -20, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute top-32 left-32 text-6xl opacity-20"
          >
            📖
          </motion.div>
          <motion.div
            animate={{
              y: [0, 20, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute bottom-32 right-32 text-6xl opacity-20"
          >
            🎓
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
