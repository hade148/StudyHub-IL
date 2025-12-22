const { body, param, query, validationResult } = require('express-validator');

/**
 * Middleware to check validation results
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      error: 'שגיאות בנתונים שהוזנו',
      details: errors.array() 
    });
  }
  next();
};

/**
 * Validation rules for user registration
 */
const registerValidation = [
  body('fullName')
    .trim()
    .notEmpty().withMessage('שם מלא הוא שדה חובה')
    .isLength({ min: 2 }).withMessage('שם מלא חייב להכיל לפחות 2 תווים'),
  body('email')
    .trim()
    .notEmpty().withMessage('אימייל הוא שדה חובה')
    .isEmail().withMessage('אימייל לא תקין'),
  body('password')
    .notEmpty().withMessage('סיסמה היא שדה חובה')
    .isLength({ min: 6 }).withMessage('סיסמה חייבת להכיל לפחות 6 תווים'),
  validate
];

/**
 * Validation rules for user login
 */
const loginValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('אימייל הוא שדה חובה')
    .isEmail().withMessage('אימייל לא תקין'),
  body('password')
    .notEmpty().withMessage('סיסמה היא שדה חובה'),
  validate
];

/**
 * Validation rules for forgot password
 */
const forgotPasswordValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('אימייל הוא שדה חובה')
    .isEmail().withMessage('אימייל לא תקין'),
  validate
];

/**
 * Validation rules for reset password
 */
const resetPasswordValidation = [
  body('token')
    .trim()
    .notEmpty().withMessage('טוקן איפוס הוא שדה חובה'),
  body('password')
    .notEmpty().withMessage('סיסמה היא שדה חובה')
    .isLength({ min: 6 }).withMessage('סיסמה חייבת להכיל לפחות 6 תווים'),
  validate
];

/**
 * Validation rules for creating a course
 */
const courseValidation = [
  body('courseCode')
    .trim()
    .notEmpty().withMessage('קוד קורס הוא שדה חובה'),
  body('courseName')
    .trim()
    .notEmpty().withMessage('שם קורס הוא שדה חובה'),
  body('institution')
    .trim()
    .notEmpty().withMessage('מוסד לימודי הוא שדה חובה'),
  body('semester')
    .trim()
    .notEmpty().withMessage('סמסטר הוא שדה חובה'),
  validate
];

/**
 * Validation rules for creating a summary
 */
const summaryValidation = [
  body('title')
    .trim()
    .notEmpty().withMessage('כותרת היא שדה חובה')
    .isLength({ min: 3 }).withMessage('כותרת חייבת להכיל לפחות 3 תווים'),
  body('courseId')
    .notEmpty().withMessage('קורס הוא שדה חובה')
    .isInt({ min: 1 }).withMessage('מזהה קורס לא תקין'),
  body('description')
    .optional()
    .trim(),
  validate
];

/**
 * Validation rules for rating a summary
 */
const ratingValidation = [
  body('rating')
    .notEmpty().withMessage('דירוג הוא שדה חובה')
    .isInt({ min: 1, max: 5 }).withMessage('דירוג חייב להיות בין 1 ל-5'),
  validate
];

/**
 * Validation rules for rating a forum post
 */
const forumRatingValidation = [
  body('rating')
    .notEmpty().withMessage('דירוג הוא שדה חובה')
    .isInt({ min: 1, max: 5 }).withMessage('דירוג חייב להיות בין 1 ל-5'),
  validate
];

/**
 * Validation rules for creating a forum post
 */
const forumPostValidation = [
  body('title')
    .trim()
    .notEmpty().withMessage('כותרת היא שדה חובה')
    .isLength({ min: 10, max: 150 }).withMessage('כותרת חייבת להכיל בין 10 ל-150 תווים'),
  body('content')
    .trim()
    .notEmpty().withMessage('תוכן הוא שדה חובה')
    .isLength({ min: 50 }).withMessage('תוכן חייב להכיל לפחות 50 תווים'),
  body('courseId')
    .notEmpty().withMessage('קורס הוא שדה חובה')
    .isInt({ min: 1 }).withMessage('מזהה קורס לא תקין'),
  body('category')
    .optional()
    .trim()
    .isIn(['computer-science', 'mathematics', 'physics', 'chemistry', 'study-resources', 'general'])
    .withMessage('קטגוריה לא תקינה'),
  body('tags')
    .optional()
    .isArray().withMessage('תגיות חייבות להיות רשימה')
    .custom((value) => {
      if (value && value.length > 5) {
        throw new Error('ניתן להוסיף עד 5 תגיות');
      }
      return true;
    }),
  body('isUrgent')
    .optional()
    .isBoolean().withMessage('isUrgent חייב להיות ערך בוליאני'),
  validate
];

/**
 * Validation rules for creating a comment
 */
const commentValidation = [
  body('text')
    .trim()
    .notEmpty().withMessage('טקסט התגובה הוא שדה חובה')
    .isLength({ min: 1 }).withMessage('תגובה חייבת להכיל לפחות תו אחד'),
  validate
];

/**
 * Validation rules for creating a tool
 */
const toolValidation = [
  body('title')
    .trim()
    .notEmpty().withMessage('כותרת היא שדה חובה'),
  body('url')
    .trim()
    .notEmpty().withMessage('כתובת URL היא שדה חובה')
    .isURL().withMessage('כתובת URL לא תקינה'),
  body('description')
    .optional()
    .trim(),
  body('category')
    .optional()
    .trim(),
  validate
];

/**
 * Validation rules for updating user profile
 */
const profileUpdateValidation = [
  body('fullName')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ min: 2 }).withMessage('שם מלא חייב להכיל לפחות 2 תווים'),
  body('bio')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 500 }).withMessage('תיאור עצמי יכול להכיל עד 500 תווים'),
  body('location')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 100 }).withMessage('מיקום יכול להכיל עד 100 תווים'),
  body('institution')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 200 }).withMessage('מוסד לימודים יכול להכיל עד 200 תווים'),
  body('fieldOfStudy')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 100 }).withMessage('תחום לימוד יכול להכיל עד 100 תווים'),
  // Allow URLs without protocol (e.g., "example.com") for better user experience
  // The isURL validator still validates the format to prevent invalid/malicious input
  body('website')
    .optional({ values: 'falsy' })
    .trim()
    .isURL({ require_protocol: false }).withMessage('כתובת אתר לא תקינה'),
  body('interests')
    .optional()
    .isArray().withMessage('תחומי עניין חייבים להיות רשימה')
    .custom((value) => {
      if (value && value.length > 10) {
        throw new Error('ניתן להוסיף עד 10 תחומי עניין');
      }
      return true;
    }),
  validate
];

module.exports = {
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  courseValidation,
  summaryValidation,
  ratingValidation,
  forumPostValidation,
  forumRatingValidation,
  commentValidation,
  toolValidation,
  profileUpdateValidation,
  validate
};