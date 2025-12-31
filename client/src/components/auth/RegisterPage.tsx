import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Mail, Lock, User, Loader2, Check, X, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
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
  userType: string;
  institution?: string;
  fieldOfStudy?: string;
  terms: boolean;
}

interface PasswordStrength {
  score: number;
  label: string;
  color: string;
}

const fieldsOfStudy = [
  'מדעי המחשב',
  'הנדסה',
  'מתמטיקה',
  'פיזיקה',
  'ביולוגיה',
  'כימיה',
  'כלכלה',
  'משפטים',
  'רפואה',
  'אחר',
];

export function RegisterPage({ onNavigateLogin, onNavigateDashboard }: RegisterPageProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [institutions, setInstitutions] = useState<string[]>([]);
  const [loadingInstitutions, setLoadingInstitutions] = useState(true);

  const { register: registerUser } = useAuth();

  // Fetch institutions from API
  useEffect(() => {
    const fetchInstitutions = async () => {
      try {
        const response = await api.get('/courses/institutions');
        setInstitutions([...response.data, 'אחר']);
      } catch (error) {
        console.error('Error fetching institutions:', error);
        // Fallback to default list if API fails
        setInstitutions([
          'האוניברסיטה העברית בירושלים',
          'אוניברסיטת תל אביב',
          'הטכניון – מכון טכנולוגי לישראל',
          'אוניברסיטת בן־גוריון בנגב',
          'אוניברסיטת בר־אילן',
          'אוניברסיטת חיפה',
          'אחר',
        ]);
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
      userType: 'student',
      terms: false,
    },
  });

  const watchPassword = watch('password', '');
  const watchConfirmPassword = watch('confirmPassword', '');
  const watchUserType = watch('userType', 'student');
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

    try {
      // Use real register function from AuthContext
      await registerUser(data.fullName, data.email, data.password);

      console.log('Registration data:', data);
      
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
      <div dir="rtl" className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.2, 1] }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center"
          >
            <Check className="w-12 h-12 text-white" />
          </motion.div>

          <h2 className="text-gray-900 mb-4">ההרשמה בוצעה בהצלחה! 🎉</h2>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-700 mb-2">
              נשלח אימייל אימות ל-
            </p>
            <p className="text-blue-700">{watch('email')}</p>
            <p className="text-sm text-gray-600 mt-2">
              אנא בדוק את תיבת הדואר שלך
            </p>
          </div>

          <div className="space-y-3">
            <Button
              onClick={onNavigateDashboard}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              עבור לדף הבית
            </Button>
            <button className="text-sm text-blue-600 hover:text-blue-700">
              לא קיבלת? שלח שוב
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50 flex">
      {/* Left Side - Form */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full lg:w-1/2 flex items-center justify-center p-8 overflow-y-auto"
      >
        <div className="w-full max-w-md space-y-6 py-8">
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
              <h1 className="text-gray-900 mb-2">הצטרף ל-StudyHub-IL</h1>
              <p className="text-gray-600">צור חשבון והתחל ללמוד היום</p>
            </motion.div>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2"
            >
              <AlertCircle className="w-5 h-5" />
              {error}
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

            {/* User Type */}
            <div>
              <Label className="mb-3 flex items-center gap-1">
                סוג משתמש <span className="text-red-500">*</span>
              </Label>
              <RadioGroup
                value={watchUserType}
                onValueChange={(value) => setValue('userType', value)}
                className="grid grid-cols-3 gap-3"
              >
                <label
                  className={`relative flex flex-col items-center gap-2 p-3 border-2 rounded-lg cursor-pointer transition-all ${
                    watchUserType === 'student' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <RadioGroupItem value="student" id="student" className="sr-only" />
                  <span className="text-2xl">🎓</span>
                  <span className="text-sm">סטודנט</span>
                </label>
                <label
                  className={`relative flex flex-col items-center gap-2 p-3 border-2 rounded-lg cursor-pointer transition-all ${
                    watchUserType === 'teacher' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <RadioGroupItem value="teacher" id="teacher" className="sr-only" />
                  <span className="text-2xl">👨‍🏫</span>
                  <span className="text-sm">מרצה</span>
                </label>
                <label
                  className={`relative flex flex-col items-center gap-2 p-3 border-2 rounded-lg cursor-pointer transition-all ${
                    watchUserType === 'learner' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <RadioGroupItem value="learner" id="learner" className="sr-only" />
                  <span className="text-2xl">📚</span>
                  <span className="text-sm">חובב למידה</span>
                </label>
              </RadioGroup>
            </div>

            {/* Institution */}
            <div>
              <Label htmlFor="institution" className="mb-2">
                מוסד לימודים (אופציונלי)
              </Label>
              <select
                id="institution"
                {...register('institution')}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 max-h-60"
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
            </div>

            {/* Field of Study */}
            <div>
              <Label htmlFor="fieldOfStudy" className="mb-2">
                תחום לימודים (אופציונלי)
              </Label>
              <select
                id="fieldOfStudy"
                {...register('fieldOfStudy')}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              >
                <option value="">בחר תחום לימודים</option>
                {fieldsOfStudy.map((field) => (
                  <option key={field} value={field}>
                    {field}
                  </option>
                ))}
              </select>
            </div>

            {/* Terms & Privacy */}
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <Checkbox
                id="terms"
                checked={watchTerms}
                onCheckedChange={(checked) => setValue('terms', !!checked)}
                className="mt-1"
              />
              <label htmlFor="terms" className="text-sm text-gray-700 cursor-pointer flex-1">
                אני מסכים ל
                <button type="button" className="text-blue-600 hover:underline mx-1">
                  תנאי השימוש
                </button>
                ו
                <button type="button" className="text-blue-600 hover:underline mx-1">
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
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                  יוצר חשבון...
                </>
              ) : (
                'צור חשבון'
              )}
            </Button>
          </motion.form>

          {/* Login Link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center"
          >
            <p className="text-gray-600">
              כבר יש לך חשבון?{' '}
              <button
                onClick={onNavigateLogin}
                className="text-blue-600 hover:text-blue-700 hover:underline"
              >
                התחבר
              </button>
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* Right Side - Benefits */}
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
            <h2 className="text-white mb-4">הצטרף אלינו היום</h2>
            <p className="text-xl text-white/90">וקבל גישה לכל היתרונות</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-4 text-right"
          >
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <span className="text-3xl">💾</span>
              <span className="text-lg">שמור סיכומים</span>
            </div>
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <span className="text-3xl">📤</span>
              <span className="text-lg">שתף תוכן</span>
            </div>
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <span className="text-3xl">💬</span>
              <span className="text-lg">קהילה פעילה</span>
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
