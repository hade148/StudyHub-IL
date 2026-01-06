import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  Home, 
  MessageSquare, 
  CheckCircle, 
  AlertCircle,
  Save,
  Eye,
  X as XIcon,
  Lightbulb,
  Flame,
  ChevronRight
} from 'lucide-react';
import { TagInput } from './TagInput';
import { RichTextEditor } from './RichTextEditor';
import { CodeSnippetEditor } from './CodeSnippetEditor';
import { ImageUpload } from './ImageUpload';
import { SimilarQuestions } from './SimilarQuestions';
import { QuestionPreviewModal } from './QuestionPreviewModal';
import { SuccessModal } from './SuccessModal';
import api from '../../utils/api';
import { coursesList } from '../../constants/coursesList';

interface CodeSnippet {
  id: string;
  language: string;
  code: string;
}

interface FormData {
  title: string;
  description: string;
  courseId: number;
  tags: string[];
  codeSnippets: CodeSnippet[];
  images: string[];
  isUrgent: boolean;
  followPost: boolean;
}

const POPULAR_TAGS = [
  'Python',
  'JavaScript',
  'אלגוריתמים',
  'C++',
  'מבני נתונים',
  'מתמטיקה',
  'פיזיקה',
  'Java',
  'HTML',
  'CSS',
  'SQL',
  'מחשבון אינטגרלים',
  'סטטיסטיקה',
];

const SIMILAR_QUESTIONS = [
  {
    id: '1',
    title: 'איך לממש מיון בועות ב-Python?',
    answerCount: 12,
    isSolved: true,
  },
  {
    id: '2',
    title: 'בעיות במימוש אלגוריתם מיון',
    answerCount: 8,
    isSolved: false,
  },
  {
    id: '3',
    title: 'השוואה בין אלגוריתמי מיון שונים',
    answerCount: 15,
    isSolved: true,
  },
];

export function NewQuestionPage() {
  const navigate = useNavigate();
  const [showSimilarQuestions, setShowSimilarQuestions] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [createdPostId, setCreatedPostId] = useState<number | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [userPoints] = useState(45);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    mode: 'onChange',
    defaultValues: {
      title: '',
      description: '',
      courseId: 0,
      tags: [],
      codeSnippets: [],
      images: [],
      isUrgent: false,
      followPost: true,
    },
  });

  const watchedFields = watch();

  // Auto-save functionality
  useEffect(() => {
    const timer = setTimeout(() => {
      if (watchedFields.title || watchedFields.description) {
        // Simulate auto-save
        setLastSaved(new Date());
        localStorage.setItem('questionDraft', JSON.stringify(watchedFields));
      }
    }, 30000); // 30 seconds

    return () => clearTimeout(timer);
  }, [watchedFields]);

  // Check for similar questions when typing title
  useEffect(() => {
    if (watchedFields.title && watchedFields.title.length > 10) {
      setShowSimilarQuestions(true);
    }
  }, [watchedFields.title]);

  const onSubmit = async (data: FormData) => {
    try {
      setIsLoading(true);
      setError(null);

      // Create FormData for multipart upload
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('content', data.description);
      formData.append('courseId', data.courseId.toString());
      
      if (data.tags && data.tags.length > 0) {
        formData.append('tags', JSON.stringify(data.tags));
      }
      
      formData.append('isUrgent', data.isUrgent.toString());

      // Add image files
      imageFiles.forEach((file) => {
        formData.append('images', file);
      });

      const response = await api.post('/forum', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Question created:', response.data);
      setCreatedPostId(response.data.post.id);
      setShowSuccess(true);
      localStorage.removeItem('questionDraft');
    } catch (err: any) {
      console.error('Error creating question:', err);
      setError(err.response?.data?.error || 'שגיאה ביצירת שאלה');
      setIsLoading(false);
    }
  };

  const handleSaveDraft = () => {
    localStorage.setItem('questionDraft', JSON.stringify(watchedFields));
    setLastSaved(new Date());
  };

  const handleViewQuestion = () => {
    if (createdPostId) {
      navigate(`/forum/${createdPostId}`);
    } else {
      navigate('/forum');
    }
  };

  const handleAskAnother = () => {
    navigate(0); // Reload current route
  };

  const getValidationStatus = () => {
    return {
      title: watchedFields.title.length >= 10 && watchedFields.title.length <= 150,
      description: watchedFields.description.length >= 50,
      tags: watchedFields.tags.length >= 1,
      course: !!watchedFields.courseId && watchedFields.courseId > 0,
    };
  };

  const validationStatus = getValidationStatus();
  const allValid = Object.values(validationStatus).every((v) => v);

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return 'לפני כמה שניות';
    const minutes = Math.floor(seconds / 60);
    if (minutes === 1) return 'לפני דקה';
    if (minutes < 60) return `לפני ${minutes} דקות`;
    return 'לפני שעה';
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <button
              onClick={() => navigate('/dashboard')}
              className="hover:text-blue-600 transition-colors flex items-center gap-1"
            >
              <Home className="w-4 h-4" />
              דף הבית
            </button>
            <ChevronRight className="w-4 h-4" />
            <button
              onClick={() => navigate('/forum')}
              className="hover:text-blue-600 transition-colors flex items-center gap-1"
            >
              <MessageSquare className="w-4 h-4" />
              פורום
            </button>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900">שאלה חדשה</span>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-2">
            <MessageSquare className="w-8 h-8" />
            <h1 className="text-3xl">שאול שאלה חדשה</h1>
          </div>
          <p className="text-blue-100">תאר את השאלה שלך בפרטים כדי לקבל תשובות טובות</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form - Left/Main Column */}
          <div className="lg:col-span-2 space-y-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Step 1 - Title */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
              >
                <h2 className="text-xl mb-4 flex items-center gap-2">
                  <span className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full">1</span>
                  כותרת השאלה
                </h2>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm mb-2">
                      כותרת השאלה <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...register('title', {
                        required: 'כותרת היא שדה חובה',
                        minLength: { value: 10, message: 'הכותרת חייבת להכיל לפחות 10 תווים' },
                        maxLength: { value: 150, message: 'הכותרת לא יכולה לעבור 150 תווים' },
                      })}
                      type="text"
                      placeholder="למשל: איך לפתור בעיית המיון בועות ב-Python?"
                      maxLength={150}
                      className={`w-full px-4 py-3 border rounded-lg outline-none transition-all ${
                        errors.title
                          ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                          : validationStatus.title
                          ? 'border-green-300 focus:border-green-500 focus:ring-2 focus:ring-green-200'
                          : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
                      }`}
                      dir="rtl"
                    />
                    <div className="flex items-center justify-between mt-2 text-sm">
                      <span className={watchedFields.title.length > 135 ? 'text-orange-500' : 'text-gray-500'}>
                        {watchedFields.title.length}/150 תווים
                      </span>
                      {validationStatus.title && (
                        <span className="text-green-600 flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" />
                          כותרת תקינה
                        </span>
                      )}
                    </div>
                    {errors.title && (
                      <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
                    )}
                    {!errors.title && watchedFields.title.length < 10 && watchedFields.title.length > 0 && (
                      <p className="text-orange-500 text-sm mt-1">כתוב כותרת ברורה וספציפית (לפחות 10 תווים)</p>
                    )}
                  </div>

                  {/* Similar Questions */}
                  {showSimilarQuestions && watchedFields.title.length > 10 && (
                    <SimilarQuestions
                      questions={SIMILAR_QUESTIONS}
                      onClose={() => setShowSimilarQuestions(false)}
                    />
                  )}
                </div>
              </motion.div>

              {/* Step 2 - Description */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
              >
                <h2 className="text-xl mb-4 flex items-center gap-2">
                  <span className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full">2</span>
                  פרטי השאלה
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm mb-2">
                      תאר את השאלה בפרטים <span className="text-red-500">*</span>
                    </label>
                    <RichTextEditor
                      value={watchedFields.description}
                      onChange={(value) => setValue('description', value, { shouldValidate: true })}
                    />
                    {errors.description && (
                      <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
                    )}
                  </div>

                  {/* Code Snippets */}
                  <div>
                    <label className="block text-sm mb-2">קטעי קוד (אופציונלי)</label>
                    <CodeSnippetEditor
                      snippets={watchedFields.codeSnippets}
                      onChange={(snippets) => setValue('codeSnippets', snippets)}
                    />
                  </div>

                  {/* Images */}
                  <div>
                    <label className="block text-sm mb-2">תמונות (אופציונלי)</label>
                    <ImageUpload
                      images={watchedFields.images}
                      onChange={(images) => {
                        setValue('images', images);
                        // Convert base64 to File objects for upload
                        const files = images.map((base64, index) => {
                          const arr = base64.split(',');
                          const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
                          const bstr = atob(arr[1]);
                          let n = bstr.length;
                          const u8arr = new Uint8Array(n);
                          while (n--) {
                            u8arr[n] = bstr.charCodeAt(n);
                          }
                          return new File([u8arr], `image-${index}.${mime.split('/')[1]}`, { type: mime });
                        });
                        setImageFiles(files);
                      }}
                    />
                  </div>
                </div>
              </motion.div>

              {/* Step 3 - Tags */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
              >
                <h2 className="text-xl mb-4 flex items-center gap-2">
                  <span className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full">3</span>
                  קטגוריה ותגיות
                </h2>

                <div className="space-y-6">
                  {/* Course Selection */}
                  <div>
                    <label className="block text-sm mb-3">
                      קורס <span className="text-red-500">*</span>
                    </label>
                    <select
                      {...register('courseId', { 
                        required: 'יש לבחור קורס',
                        validate: (value) => value > 0 || 'יש לבחור קורס'
                      })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    >
                      <option value="0">בחר קורס...</option>
                      {coursesList.map((courseName, index) => (
                        <option key={index + 1} value={index + 1}>
                          {courseName}
                        </option>
                      ))}
                    </select>
                    {errors.courseId && (
                      <p className="text-red-500 text-sm mt-2">{errors.courseId.message}</p>
                    )}
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="block text-sm mb-2">
                      תגיות <span className="text-red-500">*</span>
                      <span className="text-gray-500 text-xs mr-2">(מינימום 1, מקסימום 5)</span>
                    </label>
                    <TagInput
                      tags={watchedFields.tags}
                      onChange={(tags) => setValue('tags', tags, { shouldValidate: true })}
                      suggestions={POPULAR_TAGS}
                    />
                    {watchedFields.tags.length === 0 && (
                      <p className="text-orange-500 text-sm mt-2">יש להוסיף לפחות תג אחד</p>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Step 4 - Additional Options */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
              >
                <h2 className="text-xl mb-4 flex items-center gap-2">
                  <span className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full">4</span>
                  אפשרויות נוספות
                </h2>

                <div className="space-y-4">
                  {/* Follow Post */}
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      {...register('followPost')}
                      type="checkbox"
                      className="mt-1 w-5 h-5 text-blue-500 rounded"
                    />
                    <div>
                      <div className="group-hover:text-blue-600 transition-colors">
                        הוסף למעקב - קבל התראות על תשובות חדשות
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        תקבל התראה בכל פעם שמישהו עונה על השאלה שלך
                      </p>
                    </div>
                  </label>

                  {/* Urgent */}
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      {...register('isUrgent')}
                      type="checkbox"
                      className="mt-1 w-5 h-5 text-red-500 rounded"
                    />
                    <div className="flex-1">
                      <div className="group-hover:text-red-600 transition-colors flex items-center gap-2">
                        <Flame className="w-5 h-5" />
                        שאלה דחופה - הדגש את השאלה
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        השאלה תקבל עדיפות גבוהה בפורום
                      </p>
                      {watchedFields.isUrgent && (
                        <div className="mt-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-orange-700">עלות: 10 נקודות</span>
                            <span className="text-gray-600">יש לך {userPoints} נקודות</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </label>
                </div>
              </motion.div>
            </form>
          </div>

          {/* Guidelines Sidebar - Right Column */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 space-y-6">
              {/* Validation Checklist */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
              >
                <h3 className="flex items-center gap-2 mb-4">
                  <CheckCircle className="w-5 h-5 text-blue-500" />
                  סטטוס תקינות
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    {validationStatus.title ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-gray-400" />
                    )}
                    <span className={validationStatus.title ? 'text-green-700' : 'text-gray-600'}>
                      כותרת (10-150 תווים)
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    {validationStatus.description ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-gray-400" />
                    )}
                    <span className={validationStatus.description ? 'text-green-700' : 'text-gray-600'}>
                      תיאור (50+ תווים)
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    {validationStatus.course ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-gray-400" />
                    )}
                    <span className={validationStatus.course ? 'text-green-700' : 'text-gray-600'}>
                      קורס נבחר
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    {validationStatus.tags ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-gray-400" />
                    )}
                    <span className={validationStatus.tags ? 'text-green-700' : 'text-gray-600'}>
                      תג אחד לפחות
                    </span>
                  </div>
                  {allValid && (
                    <div className="pt-3 mt-3 border-t border-gray-200">
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="w-5 h-5" />
                        <span>מוכן לפרסום!</span>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Guidelines */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-blue-50 rounded-lg border border-blue-200 p-6"
              >
                <h3 className="flex items-center gap-2 mb-4 text-blue-900">
                  <Lightbulb className="w-5 h-5" />
                  טיפים לשאלה טובה
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-blue-900">כתוב כותרת ברורה וספציפית</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-blue-900">תאר את הבעיה בפרטים</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-blue-900">הוסף קוד רלוונטי</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-blue-900">ציין מה כבר ניסית</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-blue-900">תאר את התוצאה הרצויה</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-blue-900">הוסף תגיות רלוונטיות</span>
                  </div>
                  
                  <div className="pt-3 mt-3 border-t border-blue-300 space-y-2">
                    <div className="flex items-start gap-2">
                      <XIcon className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                      <span className="text-blue-900">אל תשאל שאלות כלליות מדי</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <XIcon className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                      <span className="text-blue-900">אל תשאל כמה שאלות בפוסט אחד</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          {/* Error Display */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}
          
          <div className="flex items-center justify-between gap-4 flex-wrap">
            {/* Left Side */}
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={handleSaveDraft}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                💾 שמור טיוטה
              </button>
              {lastSaved && (
                <span className="text-sm text-gray-500">
                  ✓ נשמר אוטומטית {formatTimeAgo(lastSaved)}
                </span>
              )}
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowPreview(true)}
                disabled={!allValid || isLoading}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Eye className="w-4 h-4" />
                👁️ תצוגה מקדימה
              </button>
              <button
                type="button"
                onClick={() => window.history.back()}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                <XIcon className="w-4 h-4" />
                ביטול
              </button>
              <button
                type="submit"
                onClick={handleSubmit(onSubmit)}
                disabled={!allValid || isLoading}
                className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    שומר...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    ✓ פרסם שאלה
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add bottom padding to account for sticky bar */}
      <div className="h-24" />

      {/* Modals */}
      <QuestionPreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        onPublish={() => {
          setShowPreview(false);
          handleSubmit(onSubmit)();
        }}
        preview={watchedFields}
      />

      <SuccessModal
        isOpen={showSuccess}
        onViewQuestion={handleViewQuestion}
        onAskAnother={handleAskAnother}
      />
    </div>
  );
}
