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
 * Validation rules for creating a forum post
 */
const forumPostValidation = [
  body('title')
    .trim()
    .notEmpty().withMessage('כותרת היא שדה חובה')
    .isLength({ min: 5 }).withMessage('כותרת חייבת להכיל לפחות 5 תווים'),
  body('content')
    .trim()
    .notEmpty().withMessage('תוכן הוא שדה חובה')
    .isLength({ min: 10 }).withMessage('תוכן חייב להכיל לפחות 10 תווים'),
  body('courseId')
    .notEmpty().withMessage('קורס הוא שדה חובה')
    .isInt({ min: 1 }).withMessage('מזהה קורס לא תקין'),
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

module.exports = {
  registerValidation,
  loginValidation,
  courseValidation,
  summaryValidation,
  ratingValidation,
  forumPostValidation,
  commentValidation,
  toolValidation,
  validate
};