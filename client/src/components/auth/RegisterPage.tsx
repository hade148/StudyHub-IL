import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  User, 
  Loader2, 
  Check, 
  X, 
  AlertCircle,
  AlertTriangle,
  UserPlus,
  Sparkles,
  Shield,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

interface RegisterPageProps {
  onNavigateLogin: () => void;
  onNavigateDashboard: () => void;
}

interface RegisterFormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  institution?: string;
  terms: boolean;
}

interface PasswordStrength {
  score: number;
  label: string;
  color: string;
}

export function RegisterPage({ onNavigateLogin, onNavigateDashboard }: RegisterPageProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [emailWarning, setEmailWarning] = useState(false);
  const [institutions, setInstitutions] = useState<string[]>([]);
  const [loadingInstitutions, setLoadingInstitutions] = useState(true);

  const { register: registerUser } = useAuth();

  // Fetch institutions from API
  useEffect(() => {
    const fetchInstitutions = async () => {
      try {
        const response = await api.get('/courses/institutions');
        setInstitutions(response.data);
      } catch (error) {
        console.error('Error fetching institutions:', error);
        setInstitutions(['אחר']);
      } finally {
        setLoadingInstitutions(false);
      }
    };
    fetchInstitutions();
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<RegisterFormData>({
    defaultValues: {
      terms: false,
    },
  });

  const watchPassword = watch('password', '');
  const watchConfirmPassword = watch('confirmPassword', '');
  const watchTerms = watch('terms', false);

  // Password strength calculation
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

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setError('');
    setEmailWarning(false);

    try {
      // Use real register function from AuthContext with institution
      const response = await registerUser(data.fullName, data.email, data.password, data.institution!);

      console.log('Registration data:', data);
      
      // Check if welcome email was sent
      if (response && !response.emailSent) {
        setEmailWarning(true);
      }
      
      // Show success
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.error || err.response?.data?.message || 'שגיאה בהרשמה, נסה שוב');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div dir="rtl" className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-white flex items-center justify-center p-8 relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-gradient-to-br from-blue-300/20 to-purple-300/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-gradient-to-tl from-purple-300/20 to-pink-300/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
        
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border-2 border-gray-200 p-10 max-w-md w-full text-center relative z-10"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.2, 1] }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-green-400 via-emerald-500 to-green-600 rounded-full flex items-center justify-center shadow-2xl"
          >
            <Check className="w-14 h-14 text-white stroke-[3]" />
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

          <h2 className="text-3xl font-bold text-gray-900 mb-3 flex items-center justify-center gap-2">
            ההרשמה בוצעה בהצלחה!
          </h2>
          
          {emailWarning && (
            <div className="bg-gradient-to-br from-orange-50 to-yellow-50 border-2 border-orange-300 rounded-2xl p-5 mb-4 shadow-md">
              <div className="flex items-center justify-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                <p className="text-sm font-semibold text-gray-700">
                  לא ניתן לשלוח אימייל כרגע
                </p>
              </div>
              <p className="text-sm text-gray-600 text-center">
                שגיאה בשליחת המייל, אך החשבון נוצר בהצלחה ואתה יכול להמשיך
              </p>
            </div>
          )}

          {!emailWarning && (
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-300 rounded-2xl p-5 mb-6 shadow-md">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Mail className="w-5 h-5 text-blue-600" />
                <p className="text-sm font-semibold text-gray-700">
                  נשלח אימייל אימות
                </p>
              </div>
              <p className="text-blue-700 font-bold text-lg mb-2">{watch('email')}</p>
              <p className="text-sm text-gray-600">
                אנא בדוק את תיבת הדואר שלך ואמת את החשבון
              </p>
            </div>
          )}

          <div className="space-y-3">
            <Button
              onClick={onNavigateDashboard}
              className="w-full bg-gradient-to-r from-blue-500 via-purple-500 to-purple-600 hover:from-blue-600 hover:via-purple-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 text-white font-semibold py-6"
            >
              <UserPlus className="w-5 h-5 ml-2" />
              עבור לדף הבית
            </Button>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline">
              לא קיבלת? שלח שוב
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-white flex relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-gradient-to-br from-blue-300/20 to-purple-300/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-gradient-to-tl from-purple-300/20 to-pink-300/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      
      {/* Form Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full flex items-center justify-center p-8 overflow-y-auto relative z-10"
      >
        <div className="w-full max-w-md py-8">
          {/* Card Container */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border-2 border-gray-200 p-8 space-y-6"
          >
            {/* Logo & Title */}
            <div className="text-center mb-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: 'spring' }}
                className="mb-6"
              >
                <div className="flex items-center justify-center gap-3 mb-4">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                    className="bg-gradient-to-br from-blue-500 via-purple-500 to-purple-600 p-3 rounded-2xl shadow-lg"
                  >
                    <UserPlus className="w-8 h-8 text-white" />
                  </motion.div>
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-l from-blue-600 via-purple-600 to-purple-700 bg-clip-text text-transparent mb-2">StudyHub-IL</h1>
                <p className="text-base text-gray-600 font-medium">צור חשבון חדש והצטרף לקהילה</p>
              </motion.div>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50/90 backdrop-blur-sm border-2 border-red-300 rounded-2xl p-4 flex items-center gap-3 shadow-md"
              >
                <div className="bg-red-100 p-2 rounded-xl">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                </div>
                <span className="text-sm text-red-700 font-medium flex-1">{error}</span>
              </motion.div>
            )}

          {/* Registration Form */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-5"
          >
            {/* Full Name */}
            <div>
              <Label htmlFor="fullName" className="mb-2 flex items-center gap-1">
                שם מלא <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <User className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="fullName"
                  {...register('fullName', {
                    required: 'שם מלא הוא שדה חובה',
                    validate: (value) => {
                      const words = value.trim().split(/\s+/);
                      return words.length >= 2 || 'שם מלא חייב להכיל לפחות שם פרטי ושם משפחה';
                    },
                    pattern: {
                      value: /^[א-תa-zA-Z\s]+$/,
                      message: 'שם מלא יכול להכיל רק אותיות',
                    },
                  })}
                  placeholder="יוסי כהן"
                  className={`pr-10 ${errors.fullName ? 'border-red-500' : ''}`}
                  disabled={isLoading}
                />
              </div>
              {errors.fullName && (
                <p className="text-sm text-red-600 mt-1">{errors.fullName.message}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <Label htmlFor="email" className="mb-2 flex items-center gap-1">
                כתובת אימייל <span className="text-red-500">*</span>
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
                  className="mt-2 space-y-2"
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
                  <div className="grid grid-cols-1 gap-1 text-xs">
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

            {/* Institution */}
            <div>
              <Label htmlFor="institution" className="mb-2 flex items-center gap-1">
                מוסד לימודים <span className="text-red-500">*</span>
              </Label>
              <select
                id="institution"
                {...register('institution', {
                  required: 'מוסד לימודים הוא שדה חובה'
                })}
                className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 max-h-60 ${
                  errors.institution ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={isLoading || loadingInstitutions}
              >
                <option value="">
                  {loadingInstitutions ? 'טוען מוסדות...' : 'בחר מוסד לימודים'}
                </option>
                {institutions.map((inst) => (
                  <option key={inst} value={inst}>
                    {inst}
                  </option>
                ))}
              </select>
              {errors.institution && (
                <p className="text-sm text-red-600 mt-1">{errors.institution.message}</p>
              )}
            </div>

            {/* Terms & Privacy */}
            <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 rounded-2xl shadow-sm">
              <Checkbox
                id="terms"
                checked={watchTerms}
                onCheckedChange={(checked) => setValue('terms', !!checked)}
                className="mt-1"
              />
              <label htmlFor="terms" className="text-sm text-gray-700 cursor-pointer flex-1 leading-relaxed">
                <Shield className="w-4 h-4 inline ml-1 text-blue-600" />
                אני מסכים ל
                <button type="button" className="text-blue-600 hover:underline mx-1 font-semibold">
                  תנאי השימוש
                </button>
                ו
                <button type="button" className="text-blue-600 hover:underline mx-1 font-semibold">
                  מדיניות הפרטיות
                </button>
              </label>
            </div>
            {!watchTerms && (
              <p className="text-xs text-gray-500">עליך להסכים לתנאי השימוש כדי להמשיך</p>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading || !watchTerms}
              className="w-full bg-gradient-to-r from-blue-500 via-purple-500 to-purple-600 hover:from-blue-600 hover:via-purple-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 text-white font-semibold py-6"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                  יוצר חשבון...
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5 ml-2" />
                  צור חשבון
                </>
              )}
            </Button>
          </motion.form>

            {/* Login Link */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-center pt-4 border-t border-gray-100"
            >
              <p className="text-sm text-gray-600">
                כבר יש לך חשבון?{' '}
                <button
                  onClick={onNavigateLogin}
                  className="text-blue-600 hover:text-blue-700 hover:underline font-medium"
                >
                  התחבר
                </button>
              </p>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

    </div>
  );
}
