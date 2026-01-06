import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useForm } from 'react-hook-form';
import {
  Upload,
  FileText,
  X,
  ChevronRight,
  ChevronLeft,
  Check,
  Home,
  BookOpen,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { Badge } from '../ui/badge';
import api from '../../utils/api';
import { coursesList } from '../../constants/coursesList';

interface UploadPageProps {
  onNavigateHome: () => void;
  onNavigateSummaries: () => void;
  onNavigateSummary?: (id: number) => void;
}

interface FormData {
  file: File | null;
  title: string;
  courseId: string;
  description: string;
  language: string;
  tags: string[];
  terms: boolean;
}

export function UploadPage({ onNavigateHome, onNavigateSummaries, onNavigateSummary }: UploadPageProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedSummaryId, setUploadedSummaryId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    trigger,
    reset,
  } = useForm<FormData>({
    defaultValues: {
      language: 'hebrew',
      terms: false,
    },
  });

  const watchTitle = watch('title', '');
  const watchDescription = watch('description', '');
  const watchCourseId = watch('courseId', '');
  const watchLanguage = watch('language', 'hebrew');
  const watchTerms = watch('terms', false);

  const popularTags = [
    'בחינה',
    'מועד א',
    'תרגילים',
    'הרצאות',
    'נוסחאות',
    'דוגמאות',
    'חומר מלא',
    'סמסטר א',
  ];

  // Handle file drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  const validateAndSetFile = (file: File) => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['pdf', 'docx'];
    const fileExtension = file.name.split('.').pop()?.toLowerCase();

    if (file.size > maxSize) {
      alert('הקובץ גדול מדי. גודל מקסימלי: 10MB');
      return;
    }

    if (!fileExtension || !allowedTypes.includes(fileExtension)) {
      alert('סוג קובץ לא נתמך. אנא העלה PDF או DOCX');
      return;
    }

    setUploadedFile(file);
    setValue('file', file);
  };

  const removeFile = () => {
    setUploadedFile(null);
    setValue('file', null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const addTag = () => {
    if (tagInput.trim() && tags.length < 10 && !tags.includes(tagInput.trim())) {
      const newTags = [...tags, tagInput.trim()];
      setTags(newTags);
      setValue('tags', newTags);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    const newTags = tags.filter((tag) => tag !== tagToRemove);
    setTags(newTags);
    setValue('tags', newTags);
  };

  const addPopularTag = (tag: string) => {
    if (!tags.includes(tag) && tags.length < 10) {
      const newTags = [...tags, tag];
      setTags(newTags);
      setValue('tags', newTags);
    }
  };

  const goToNextStep = async () => {
    let isValid = false;

    if (currentStep === 1) {
      isValid = !!uploadedFile;
    } else if (currentStep === 2) {
      isValid = await trigger(['title', 'courseId']);
    } else if (currentStep === 3) {
      isValid = tags.length > 0;
    }

    if (isValid) {
      setCurrentStep(currentStep + 1);
    }
  };

  const goToPreviousStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const onSubmit = async (data: FormData) => {
    if (!uploadedFile) {
      alert('אנא העלה קובץ');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      formData.append('file', uploadedFile);
      formData.append('title', data.title);
      formData.append('courseId', data.courseId);
      if (data.description) {
        formData.append('description', data.description);
      }

      const response = await api.post('/summaries', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Upload successful:', response.data);
      
      // Store the uploaded summary ID for navigation
      if (response.data?.summary?.id) {
        setUploadedSummaryId(response.data.summary.id);
      }
      
      setShowSuccess(true);
    } catch (error: any) {
      console.error('Upload error:', error);
      const errorMessage = error.response?.data?.error || 'שגיאה בהעלאת הסיכום';
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return '📕';
    if (ext === 'docx') return '📘';
    if (ext === 'ppt' || ext === 'pptx') return '📊';
    return '📄';
  };

  const steps = [
    { number: 1, label: 'העלאת קובץ', icon: '📄' },
    { number: 2, label: 'פרטי הסיכום', icon: '📝' },
    { number: 3, label: 'תגיות', icon: '🏷️' },
    { number: 4, label: 'תצוגה מקדימה', icon: '👀' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-3 rounded-xl">
                <span className="text-2xl">🎓</span>
              </div>
              <div>
                <h1 className="text-gray-900">StudyHub-IL</h1>
                <p className="text-gray-600">הפלטפורמה האקדמית שלך</p>
              </div>
            </div>
            <Button onClick={onNavigateHome} variant="outline">
              <Home className="w-4 h-4 ml-2" />
              חזרה לדף הבית
            </Button>
          </div>

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <button onClick={onNavigateHome} className="hover:text-blue-600 transition-colors">
              דף הבית
            </button>
            <ChevronLeft className="w-4 h-4" />
            <button onClick={onNavigateSummaries} className="hover:text-blue-600 transition-colors">
              סיכומים
            </button>
            <ChevronLeft className="w-4 h-4" />
            <span className="text-gray-900">העלאה</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Page Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h2 className="text-gray-900 mb-2">העלאת סיכום חדש 📤</h2>
          <p className="text-gray-600">שתף את הסיכום שלך עם הקהילה</p>
        </motion.div>

        {/* Progress Steps */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="max-w-4xl mx-auto mb-12"
        >
          <div className="relative">
            {/* Progress Bar Background */}
            <div className="absolute top-8 right-0 left-0 h-1 bg-gray-200" />
            {/* Progress Bar Fill */}
            <div
              className="absolute top-8 right-0 h-1 bg-gradient-to-l from-blue-500 to-purple-600 transition-all duration-500"
              style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
            />

            {/* Steps */}
            <div className="relative flex justify-between">
              {steps.map((step) => (
                <div key={step.number} className="flex flex-col items-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: step.number * 0.1 }}
                    className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl mb-2 border-4 ${
                      currentStep >= step.number
                        ? 'bg-gradient-to-br from-blue-500 to-purple-600 border-white shadow-lg'
                        : 'bg-white border-gray-300'
                    }`}
                  >
                    {step.icon}
                  </motion.div>
                  <p
                    className={`text-sm ${
                      currentStep >= step.number ? 'text-gray-900' : 'text-gray-500'
                    }`}
                  >
                    {step.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Form Container */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="max-w-3xl mx-auto"
        >
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <form onSubmit={handleSubmit(onSubmit)}>
              <AnimatePresence mode="wait">
                {/* Step 1: File Upload */}
                {currentStep === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h3 className="text-gray-900 mb-6">העלאת קובץ 📁</h3>

                    {!uploadedFile ? (
                      <>
                        {/* Drag and Drop Zone */}
                        <div
                          onDrop={handleDrop}
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onClick={() => fileInputRef.current?.click()}
                          className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${
                            isDragging
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                          }`}
                        >
                          <Upload className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                          <p className="text-gray-900 mb-2">גרור קובץ לכאן או לחץ לבחירה</p>
                          <p className="text-sm text-gray-500">PDF או DOCX - עד 10MB</p>
                        </div>

                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".pdf,.docx"
                          onChange={handleFileSelect}
                          className="hidden"
                        />

                        <div className="flex items-center gap-4 my-6">
                          <div className="flex-1 h-px bg-gray-200" />
                          <span className="text-gray-500">או</span>
                          <div className="flex-1 h-px bg-gray-200" />
                        </div>

                        <Button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          variant="outline"
                          className="w-full"
                        >
                          <FileText className="w-4 h-4 ml-2" />
                          בחר קובץ מהמחשב
                        </Button>
                        
                        <p className="text-xs text-gray-500 mt-4 text-center">
                          תומך בקבצי PDF ו-DOCX בלבד, עד 10MB
                        </p>
                      </>
                    ) : (
                      // File Preview
                      <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="border-2 border-green-500 rounded-xl p-6 bg-green-50"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="text-4xl">{getFileIcon(uploadedFile.name)}</div>
                            <div>
                              <p className="text-gray-900">{uploadedFile.name}</p>
                              <p className="text-sm text-gray-600">{formatFileSize(uploadedFile.size)}</p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            onClick={removeFile}
                            variant="ghost"
                            size="icon"
                            className="text-red-600 hover:text-red-700 hover:bg-red-100"
                          >
                            <X className="w-5 h-5" />
                          </Button>
                        </div>
                      </motion.div>
                    )}

                    <div className="flex justify-end mt-8">
                      <Button
                        type="button"
                        onClick={goToNextStep}
                        disabled={!uploadedFile}
                        className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                      >
                        המשך
                        <ChevronRight className="w-4 h-4 mr-2" />
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Summary Details */}
                {currentStep === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <h3 className="text-gray-900 mb-6">פרטי הסיכום 📝</h3>

                    {/* Title */}
                    <div>
                      <Label htmlFor="title" className="mb-2 flex items-center gap-2">
                        כותרת הסיכום <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="title"
                        {...register('title', {
                          required: 'שדה חובה',
                          minLength: { value: 10, message: 'כותרת חייבת להכיל לפחות 10 תווים' },
                          maxLength: { value: 100, message: 'כותרת לא יכולה להכיל יותר מ-100 תווים' },
                        })}
                        placeholder="לדוגמה: סיכום מלא למבחן במבוא למדעי המחשב"
                        className={errors.title ? 'border-red-500' : ''}
                      />
                      {errors.title && (
                        <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.title.message}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        {watchTitle.length}/100 תווים
                      </p>
                    </div>

                    {/* Course Selection */}
                    <div>
                      <Label htmlFor="courseId" className="mb-2 flex items-center gap-2">
                        בחר קורס <span className="text-red-500">*</span>
                      </Label>
                      <select
                        id="courseId"
                        {...register('courseId', { required: 'יש לבחור קורס' })}
                        className={`w-full rounded-md border ${
                          errors.courseId ? 'border-red-500' : 'border-gray-300'
                        } px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      >
                        <option value="">בחר קורס מהרשימה</option>
                        {coursesList.map((courseName, index) => (
                          <option key={index + 1} value={index + 1}>
                            {courseName}
                          </option>
                        ))}
                      </select>
                      {errors.courseId && (
                        <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.courseId.message}
                        </p>
                      )}
                    </div>

                    {/* Description */}
                    <div>
                      <Label htmlFor="description" className="mb-2">
                        תיאור קצר (אופציונלי)
                      </Label>
                      <Textarea
                        id="description"
                        {...register('description', {
                          maxLength: { value: 500, message: 'תיאור לא יכול להכיל יותר מ-500 תווים' },
                        })}
                        placeholder="כתוב תיאור קצר על הסיכום - מה הוא כולל, לאיזה מועד, וכו'"
                        rows={4}
                        className={errors.description ? 'border-red-500' : ''}
                      />
                      {errors.description && (
                        <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        {watchDescription.length}/500 תווים
                      </p>
                    </div>

                    {/* Language Toggle */}
                    <div>
                      <Label className="mb-3">שפת הסיכום</Label>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            value="hebrew"
                            {...register('language')}
                            className="w-4 h-4 text-blue-600"
                          />
                          <span>עברית</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            value="english"
                            {...register('language')}
                            className="w-4 h-4 text-blue-600"
                          />
                          <span>אנגלית</span>
                        </label>
                      </div>
                    </div>

                    <div className="flex justify-between mt-8">
                      <Button type="button" onClick={goToPreviousStep} variant="outline">
                        <ChevronLeft className="w-4 h-4 ml-2" />
                        חזור
                      </Button>
                      <Button
                        type="button"
                        onClick={goToNextStep}
                        className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                      >
                        המשך
                        <ChevronRight className="w-4 h-4 mr-2" />
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Tags */}
                {currentStep === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <h3 className="text-gray-900 mb-6">תגיות 🏷️</h3>

                    {/* Tags Input */}
                    <div>
                      <Label htmlFor="tagInput" className="mb-2 flex items-center gap-2">
                        הוסף תגיות <span className="text-red-500">*</span>
                        <span className="text-xs text-gray-500">({tags.length}/10)</span>
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          id="tagInput"
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addTag();
                            }
                          }}
                          placeholder="הקלד תגית ולחץ Enter"
                          disabled={tags.length >= 10}
                        />
                        <Button
                          type="button"
                          onClick={addTag}
                          disabled={!tagInput.trim() || tags.length >= 10}
                          variant="outline"
                        >
                          הוסף
                        </Button>
                      </div>

                      {/* Tags Display */}
                      {tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {tags.map((tag) => (
                            <Badge
                              key={tag}
                              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white pr-2"
                            >
                              {tag}
                              <button
                                type="button"
                                onClick={() => removeTag(tag)}
                                className="mr-1 hover:bg-white/20 rounded-full p-0.5"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* Popular Tags */}
                      <div className="mt-4">
                        <p className="text-sm text-gray-600 mb-2">תגיות פופולריות:</p>
                        <div className="flex flex-wrap gap-2">
                          {popularTags.map((tag) => (
                            <button
                              key={tag}
                              type="button"
                              onClick={() => addPopularTag(tag)}
                              disabled={tags.includes(tag) || tags.length >= 10}
                              className="px-3 py-1 text-sm border border-gray-300 rounded-full hover:border-blue-500 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              {tag}
                            </button>
                          ))}
                        </div>
                      </div>

                      {tags.length === 0 && currentStep === 3 && (
                        <p className="text-sm text-gray-500 mt-2">אנא הוסף לפחות תגית אחת</p>
                      )}
                    </div>

                    <div className="flex justify-between mt-8">
                      <Button type="button" onClick={goToPreviousStep} variant="outline">
                        <ChevronLeft className="w-4 h-4 ml-2" />
                        חזור
                      </Button>
                      <Button
                        type="button"
                        onClick={goToNextStep}
                        disabled={tags.length === 0}
                        className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                      >
                        המשך
                        <ChevronRight className="w-4 h-4 mr-2" />
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* Step 4: Preview */}
                {currentStep === 4 && (
                  <motion.div
                    key="step4"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <h3 className="text-gray-900 mb-6">תצוגה מקדימה 👀</h3>

                    {/* Preview Card */}
                    <div className="border-2 border-gray-200 rounded-xl p-6 bg-gradient-to-br from-blue-50 to-purple-50">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h4 className="text-gray-900 mb-2">{watchTitle || 'כותרת הסיכום'}</h4>
                          <p className="text-gray-600">{watchCourseId || 'שם הקורס'}</p>
                        </div>
                        <div className="text-3xl">{getFileIcon(uploadedFile?.name || '')}</div>
                      </div>

                      {watchDescription && (
                        <p className="text-gray-700 mb-4 p-3 bg-white/50 rounded-lg">
                          {watchDescription}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-2 mb-4">
                        <Badge variant="outline" className="border-purple-500 text-purple-700">
                          {watchLanguage === 'hebrew' ? 'עברית' : 'אנגלית'}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {tags.map((tag) => (
                          <Badge
                            key={tag}
                            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      {uploadedFile && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <FileText className="w-4 h-4" />
                            <span>{uploadedFile.name}</span>
                            <span>({formatFileSize(uploadedFile.size)})</span>
                          </div>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => setCurrentStep(2)}
                        className="mt-4 text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                      >
                        ערוך פרטים
                        <ChevronLeft className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Terms Checkbox */}
                    <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <Checkbox
                        id="terms"
                        checked={watchTerms}
                        onCheckedChange={(checked) => setValue('terms', !!checked)}
                        className="mt-1"
                      />
                      <label htmlFor="terms" className="text-sm text-gray-700 cursor-pointer flex-1">
                        אני מאשר/ת שהתוכן הוא שלי או שיש לי את הזכויות לשתף אותו, ואני מבין/ה שהסיכום
                        יהיה זמין לכלל הקהילה.
                      </label>
                    </div>

                    <div className="flex justify-between mt-8">
                      <Button type="button" onClick={goToPreviousStep} variant="outline">
                        <ChevronLeft className="w-4 h-4 ml-2" />
                        חזור
                      </Button>
                      <Button
                        type="submit"
                        disabled={!watchTerms || isSubmitting}
                        className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                      >
                        {isSubmitting ? 'מעלה...' : 'פרסם סיכום'}
                        <Check className="w-4 h-4 mr-2" />
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </div>
        </motion.div>
      </div>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowSuccess(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className="bg-white rounded-2xl p-8 max-w-md w-full text-center"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Success Animation */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.2, 1] }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center"
              >
                <Check className="w-12 h-12 text-white" />
              </motion.div>

              {/* Sparkles */}
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

              <h3 className="text-gray-900 mb-2">הסיכום הועלה בהצלחה! 🎉</h3>
              <p className="text-gray-600 mb-6">
                הסיכום שלך פורסם ועכשיו זמין לכלל הקהילה. תודה על השיתוף!
              </p>

              <div className="space-y-3">
                <Button
                  onClick={() => {
                    // Navigate to the specific summary if ID is available and callback exists
                    if (uploadedSummaryId && onNavigateSummary) {
                      onNavigateSummary(uploadedSummaryId);
                    } else {
                      // Fallback to summaries list
                      onNavigateSummaries();
                    }
                  }}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  <BookOpen className="w-4 h-4 ml-2" />
                  צפה בסיכום
                </Button>
                <Button
                  onClick={() => {
                    setShowSuccess(false);
                    setCurrentStep(1);
                    setUploadedFile(null);
                    setUploadedSummaryId(null);
                    setTags([]);
                    reset();
                  }}
                  variant="outline"
                  className="w-full"
                >
                  <Upload className="w-4 h-4 ml-2" />
                  העלה סיכום נוסף
                </Button>
                <Button onClick={onNavigateHome} variant="ghost" className="w-full">
                  <Home className="w-4 h-4 ml-2" />
                  חזור לדף הבית
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
