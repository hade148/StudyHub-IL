const nodemailer = require('nodemailer');

// Create transporter using environment variables
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

/**
 * Send welcome email to new user
 * @param {string} email - User's email address
 * @param {string} fullName - User's full name
 */
const sendWelcomeEmail = async (email, fullName) => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log('Email not configured, skipping welcome email to:', email);
    return false;
  }

  const transporter = createTransporter();

  const mailOptions = {
    from: `"StudyHub-IL" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'ברוכים הבאים ל-StudyHub-IL! 🎓',
    html: `
      <!DOCTYPE html>
      <html dir="rtl" lang="he">
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f5f5f5; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
          .header { background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; padding: 40px 30px; text-align: center; }
          .header h1 { margin: 0; font-size: 28px; }
          .header .emoji { font-size: 48px; margin-bottom: 16px; display: block; }
          .content { padding: 30px; }
          .content h2 { color: #1f2937; margin-bottom: 20px; }
          .feature { display: flex; align-items: center; gap: 12px; margin: 16px 0; padding: 12px; background: #f3f4f6; border-radius: 8px; }
          .feature-icon { font-size: 24px; }
          .btn { display: inline-block; background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; margin: 20px 0; }
          .footer { background: #f9fafb; padding: 20px 30px; text-align: center; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <span class="emoji">🎓</span>
            <h1>ברוכים הבאים ל-StudyHub-IL!</h1>
          </div>
          <div class="content">
            <h2>שלום ${fullName}! </h2>
            <p>אנחנו שמחים שהצטרפת לקהילה האקדמית שלנו. כעת יש לך גישה לכל התכונות הבאות:</p>
            
            <div class="feature">
              <span class="feature-icon"></span>
              <span>אלפי סיכומים איכותיים מכל המוסדות האקדמיים</span>
            </div>
            <div class="feature">
              <span class="feature-icon"></span>
              <span>פורום קהילתי לשאלות ודיונים</span>
            </div>
            <div class="feature">
              <span class="feature-icon"></span>
              <span>כלים חכמים ללמידה יעילה</span>
            </div>
            <div class="feature">
              <span class="feature-icon"></span>
              <span>מערכת הישגים ונקודות</span>
            </div>

            <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/dashboard" class="btn">התחל ללמוד עכשיו</a>
            
            <p>אם יש לך שאלות, אנחנו כאן לעזור!</p>
          </div>
          <div class="footer">
            <p>© 2025 StudyHub-IL. כל הזכויות שמורות.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Welcome email sent to:', email);
    return true;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return false;
  }
};

/**
 * Send password reset email
 * @param {string} email - User's email address
 * @param {string} fullName - User's full name
 * @param {string} resetToken - Password reset token
 */
const sendPasswordResetEmail = async (email, fullName, resetToken) => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log('Email not configured, skipping password reset email to:', email);
    return false;
  }

  const transporter = createTransporter();
  const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;

  const mailOptions = {
    from: `"StudyHub-IL" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'איפוס סיסמה - StudyHub-IL 🔐',
    html: `
      <!DOCTYPE html>
      <html dir="rtl" lang="he">
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f5f5f5; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
          .header { background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; padding: 40px 30px; text-align: center; }
          .header h1 { margin: 0; font-size: 24px; }
          .header .emoji { font-size: 48px; margin-bottom: 16px; display: block; }
          .content { padding: 30px; }
          .content h2 { color: #1f2937; margin-bottom: 20px; }
          .warning { background: #fef3c7; border: 1px solid #f59e0b; padding: 16px; border-radius: 8px; margin: 20px 0; }
          .warning-icon { font-size: 20px; margin-left: 8px; }
          .btn { display: inline-block; background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; margin: 20px 0; }
          .link-box { background: #f3f4f6; padding: 12px; border-radius: 8px; word-break: break-all; margin: 16px 0; }
          .footer { background: #f9fafb; padding: 20px 30px; text-align: center; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <span class="emoji">🔐</span>
            <h1>איפוס סיסמה</h1>
          </div>
          <div class="content">
            <h2>שלום ${fullName}!</h2>
            <p>קיבלנו בקשה לאיפוס הסיסמה שלך. לחץ על הכפתור למטה לאיפוס:</p>
            
            <a href="${resetUrl}" class="btn">איפוס סיסמה</a>
            
            <p>או העתק את הקישור הבא:</p>
            <div class="link-box">${resetUrl}</div>

            <div class="warning">
              <span class="warning-icon">⏱️</span>
              <strong>שים לב:</strong> הקישור יפוג תוקף בעוד 15 דקות.
            </div>
            
            <p>אם לא ביקשת לאפס את הסיסמה, התעלם ממייל זה.</p>
          </div>
          <div class="footer">
            <p>© 2025 StudyHub-IL. כל הזכויות שמורות.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Password reset email sent to:', email);
    return true;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return false;
  }
};

module.exports = {
  sendWelcomeEmail,
  sendPasswordResetEmail,
};
