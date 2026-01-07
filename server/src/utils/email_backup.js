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
    from: `"StudyHub-IL | האקדמיה הישראלית" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'ברוכים הבאים למערכת StudyHub-IL',
    html: `
      <!DOCTYPE html>
      <html dir="rtl" lang="he">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: 'Segoe UI', Tahoma, Arial, sans-serif;
            direction: rtl;
            text-align: right;
            line-height: 1.8; 
            color: #1f2937; 
            background: linear-gradient(135deg, #eff6ff 0%, #f3e8ff 50%, #fef3c7 100%);
            margin: 0; 
            padding: 40px 20px;
          }
          .container { 
            max-width: 650px; 
            margin: 0 auto; 
            background: #ffffff;
            border-radius: 20px; 
            overflow: hidden; 
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.15);
          }
          .header { 
            background: linear-gradient(135deg, #1e40af 0%, #7c3aed 50%, #9333ea 100%);
            color: white; 
            padding: 50px 40px;
            text-align: center;
            position: relative;
            overflow: hidden;
          }
          .header::before {
            content: '';
            position: absolute;
            top: 0;
            right: 0;
            left: 0;
            bottom: 0;
            background: radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 0%, transparent 70%);
            pointer-events: none;
          }
          .header-icon { 
            width: 72px;
            height: 72px;
            margin: 0 auto 20px;
            background: rgba(255, 255, 255, 0.15);
            border-radius: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            z-index: 1;
            border: 2px solid rgba(255, 255, 255, 0.3);
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
          }
          .header-icon::before {
            content: '📚';
            font-size: 36px;
            display: block;
          }
          .header h1 { 
            margin: 0; 
            font-size: 36px; 
            font-weight: 700;
            position: relative;
            z-index: 1;
            text-shadow: 0 2px 20px rgba(0,0,0,0.15);
            letter-spacing: -0.5px;
          }
          .content { 
            padding: 50px 40px;
            background: white;
          }
          .greeting { 
            color: #111827;
            direction: rtl;
            text-align: right;
            margin-bottom: 20px;
            font-size: 24px;
            font-weight: 600;
          }
          .welcome-text {
            font-size: 16px;
            color: #374151;
            line-height: 1.8;
            direction: rtl;
            text-align: right;
            margin-bottom: 30px;
            padding: 24px 28px;
            background: linear-gradient(135deg, #f0f9ff 0%, #faf5ff 100%);
            border-radius: 12px;
            border-right: 4px solid #7c3aed;
          }
          .welcome-text strong {
            color: #111827;
            display: block;
            margin-bottom: 10px;
            font-size: 17px;
            font-weight: 600;
          }
          .section-title {
            font-size: 20px;
            font-weight: 700;
            color: #1f2937;
            margin-bottom: 24px;
            display: flex;
            align-items: center;
            gap: 12px;
          }
          .section-title::before {
            content: '';
            width: 4px;
            height: 24px;
            background: linear-gradient(135deg, #3b82f6, #8b5cf6);
            border-radius: 2px;
          }
          .features {
            margin: 30px 0 40px;
          }
          .feature { 
            display: flex;
            direction: rtl;
            text-align: right;
            align-items: flex-start; 
            gap: 16px; 
            margin-bottom: 16px; 
            padding: 20px 24px;
            background: #fafafa;
            border-radius: 12px;
            border: 1px solid #e5e7eb;
          }
          .feature-icon-wrapper { 
            width: 44px;
            height: 44px;
            min-width: 44px;
            background: linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%);
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 1px solid #c7d2fe;
            font-size: 22px;
          }
          .feature-text {
            flex: 1;
            direction: rtl;
            text-align: right;
          }
          .feature-title {
            font-weight: 600;
            color: #111827;
            margin-bottom: 6px;
            font-size: 16px;
            direction: rtl;
            text-align: right;
          }
          .feature-desc {
            color: #6b7280;
            font-size: 14px;
            line-height: 1.7;
            direction: rtl;
            text-align: right;
          }
          .btn { 
            display: block;
            background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #a855f7 100%);
            color: white !important; 
            padding: 20px 40px; 
            text-decoration: none; 
            border-radius: 16px; 
            margin: 35px 0;
            font-weight: 700;
            font-size: 18px;
            box-shadow: 0 12px 35px rgba(59, 130, 246, 0.35);
            text-align: center;
            transition: all 0.3s ease;
          }
          .tip-box {
            text-align: center;
            color: #6b7280;
            margin-top: 35px;
            padding: 24px;
            background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
            border-radius: 16px;
            border: 2px solid #e5e7eb;
            font-size: 15px;
          }
          .tip-icon {
            width: 32px;
            height: 32px;
            margin: 0 auto 12px;
            background: linear-gradient(135deg, #fef3c7, #fed7aa);
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .tip-icon svg {
            width: 18px;
            height: 18px;
            fill: #d97706;
          }
          .tip-box strong {
            color: #1f2937;
            font-weight: 600;
          }
          .footer { 
            background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
            padding: 40px; 
            text-align: center; 
            color: #6b7280; 
            font-size: 14px;
            border-top: 2px solid #e5e7eb;
          }
          .footer-title {
            font-weight: 600;
            color: #4b5563;
            margin-bottom: 12px;
            font-size: 15px;
          }
          .footer p {
            margin: 8px 0;
            color: #9ca3af;
            line-height: 1.6;
          }
          .footer-logo {
            margin-top: 24px;
            padding-top: 24px;
            border-top: 1px solid #e5e7eb;
          }
          .footer-logo p {
            font-size: 13px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="header-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 14L12 8M12 8L9 11M12 8L15 11" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M16 21L8 21C6.89543 21 6 20.1046 6 19L6 5C6 3.89543 6.89543 3 8 3L16 3C17.1046 3 18 3.89543 18 5L18 19C18 20.1046 17.1046 21 16 21Z" stroke="currentColor" stroke-width="2"/>
                <path d="M10 18L14 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </div>
            <h1>ברוכים הבאים ל-StudyHub-IL</h1>
          </div>
          <div class="content">
            <h2 class="greeting">שלום ${fullName}</h2>
            
            <div class="welcome-text">
              <strong>ברוך הבא למשפחת StudyHub-IL</strong>
              אנחנו נרגשים שהצטרפת אלינו. החשבון שלך מוכן ואתה יכול להתחיל להנות מכל התכונות שהפלטפורמה שלנו מציעה.
            </div>

            <div class="section-title">מה מחכה לך בפלטפורמה?</div>
            
            <div class="features">
              <div class="feature">
                <div class="feature-icon-wrapper">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 19.5C4 18.837 4.26339 18.2011 4.73223 17.7322C5.20107 17.2634 5.83696 17 6.5 17H20" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M6.5 2H20V22H6.5C5.83696 22 5.20107 21.7366 4.73223 21.2678C4.26339 20.7989 4 20.163 4 19.5V4.5C4 3.83696 4.26339 3.20107 4.73223 2.73223C5.20107 2.26339 5.83696 2 6.5 2Z" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <div class="feature-text">
                  <div class="feature-title">ספריית סיכומים ענקית</div>
                  <div class="feature-desc">אלפי סיכומים איכותיים מכל המוסדות האקדמיים בישראל, מדורגים ומסונפים לפי קורסים</div>
                </div>
              </div>
              
              <div class="feature">
                <div class="feature-icon-wrapper">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="#8b5cf6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <div class="feature-text">
                  <div class="feature-title">פורום קהילתי פעיל</div>
                  <div class="feature-desc">שאל שאלות, שתף ידע וקבל עזרה מסטודנטים וחונכים מנוסים מכל הארץ</div>
                </div>
              </div>
              
              <div class="feature">
                <div class="feature-icon-wrapper">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#a855f7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M2 17L12 22L22 17" stroke="#a855f7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M2 12L12 17L22 12" stroke="#a855f7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <div class="feature-text">
                  <div class="feature-title">כלים חכמים ללמידה</div>
                  <div class="feature-desc">מערכת כלים מתקדמת שתעזור לך ללמוד יעיל יותר ולהשיג ציונים גבוהים</div>
                </div>
              </div>
              
              <div class="feature">
                <div class="feature-icon-wrapper">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <div class="feature-text">
                  <div class="feature-title">מערכת הישגים ונקודות</div>
                  <div class="feature-desc">צבור נקודות, פתח הישגים והתקדם במסלול הלמידה שלך תוך מעקב אחר ההתפתחות</div>
                </div>
              </div>
            </div>

            <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/dashboard" class="btn">התחל ללמוד עכשיו</a>
            
            <div class="tip-box">
              <div class="tip-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2V6M12 18V22M4.93 4.93L7.76 7.76M16.24 16.24L19.07 19.07M2 12H6M18 12H22M4.93 19.07L7.76 16.24M16.24 7.76L19.07 4.93" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
                </svg>
              </div>
              <strong>טיפ להתחלה:</strong> התחל בעיון בסיכומים הפופולריים ביותר או שאל שאלה ראשונה בפורום הקהילתי
            </div>
          </div>
          <div class="footer">
            <div class="footer-title">צריך עזרה או יש שאלות?</div>
            <p>צוות התמיכה שלנו זמין עבורך בכל עת. אנחנו כאן כדי להבטיח שתקבל את החוויה הטובה ביותר.</p>
            <div class="footer-logo">
              <p><strong>© 2025 StudyHub-IL</strong> · כל הזכויות שמורות</p>
              <p>הפלטפורמה האקדמית המובילה בישראל</p>
            </div>
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
    subject: 'איפוס סיסמה - StudyHub-IL',
    html: `
      <!DOCTYPE html>
      <html dir="rtl" lang="he">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; 
            line-height: 1.6; 
            color: #1f2937; 
            background: linear-gradient(135deg, #eff6ff 0%, #f3e8ff 50%, #fef3c7 100%);
            margin: 0; 
            padding: 40px 20px;
          }
          .container { 
            max-width: 650px; 
            margin: 0 auto; 
            background: white;
            border-radius: 24px; 
            overflow: hidden; 
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          }
          .header { 
            background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #a855f7 100%);
            color: white; 
            padding: 60px 40px; 
            text-align: center;
            position: relative;
            overflow: hidden;
          }
          .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: radial-gradient(circle at 30% 50%, rgba(255,255,255,0.15) 0%, transparent 60%);
            animation: pulse 3s ease-in-out infinite;
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
          }
          .header-icon { 
            width: 80px;
            height: 80px;
            margin: 0 auto 20px;
            background: rgba(255, 255, 255, 0.2);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            z-index: 1;
          }
          .header-icon svg {
            width: 48px;
            height: 48px;
          }
          .header h1 { 
            margin: 0; 
            font-size: 32px; 
            font-weight: 700;
            position: relative;
            z-index: 1;
            text-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .content { 
            padding: 50px 40px;
            background: white;
          }
          .greeting { 
            color: #1f2937; 
            margin-bottom: 16px;
            font-size: 28px;
            font-weight: 700;
          }
          .intro {
            color: #6b7280;
            font-size: 16px;
            margin-bottom: 32px;
            line-height: 1.6;
          }
          .info-box {
            padding: 24px;
            background: linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%);
            border-radius: 16px;
            border-right: 4px solid #8b5cf6;
            margin: 30px 0;
            display: flex;
            gap: 16px;
          }
          .info-icon {
            width: 48px;
            height: 48px;
            min-width: 48px;
            background: white;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          }
          .info-icon svg {
            width: 28px;
            height: 28px;
          }
          .info-content p {
            margin: 0;
            color: #1e40af;
            font-size: 15px;
            line-height: 1.6;
          }
          .info-content p:first-child {
            font-weight: 600;
            margin-bottom: 8px;
          }
          .btn { 
            display: block;
            background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #a855f7 100%);
            color: white !important; 
            padding: 20px 48px; 
            text-decoration: none; 
            border-radius: 16px; 
            margin: 32px 0;
            font-weight: 700;
            font-size: 18px;
            box-shadow: 0 10px 30px rgba(139, 92, 246, 0.3);
            text-align: center;
            transition: all 0.3s ease;
          }
          .link-label { 
            font-size: 14px; 
            color: #9ca3af; 
            text-align: center; 
            margin: 16px 0 12px;
          }
          .link-box { 
            background: #f9fafb; 
            padding: 18px 20px; 
            border-radius: 12px; 
            word-break: break-all; 
            margin: 0 0 32px;
            border: 2px solid #e5e7eb;
            font-family: 'Courier New', monospace;
            font-size: 13px;
            color: #6b7280;
            line-height: 1.5;
          }
          .warning-box { 
            background: linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%);
            border: 2px solid #fbbf24; 
            border-radius: 16px; 
            padding: 24px;
            margin: 30px 0;
            display: flex;
            gap: 16px;
          }
          .warning-icon { 
            width: 48px;
            height: 48px;
            min-width: 48px;
            background: white;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          }
          .warning-icon svg {
            width: 28px;
            height: 28px;
          }
          .warning-content strong {
            color: #92400e;
            display: block;
            margin-bottom: 8px;
            font-size: 16px;
          }
          .warning-content p {
            color: #78350f;
            margin: 0;
            font-size: 15px;
            line-height: 1.6;
          }
          .security-box {
            margin-top: 32px;
            padding: 24px;
            background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
            border-radius: 16px;
            border: 2px solid #fecaca;
            display: flex;
            gap: 16px;
          }
          .security-icon {
            width: 48px;
            height: 48px;
            min-width: 48px;
            background: white;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          }
          .security-icon svg {
            width: 28px;
            height: 28px;
          }
          .security-content strong {
            display: block;
            font-weight: 700;
            color: #991b1b;
            margin-bottom: 8px;
            font-size: 16px;
          }
          .security-content p {
            color: #7f1d1d;
            font-size: 15px;
            margin: 0;
            line-height: 1.6;
          }
          .tip-box {
            text-align: center; 
            color: #6b7280; 
            margin-top: 32px; 
            padding: 24px; 
            background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
            border-radius: 16px; 
            font-size: 15px;
            border: 2px solid #e5e7eb;
          }
          .tip-icon {
            width: 48px;
            height: 48px;
            margin: 0 auto 12px;
            background: white;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          }
          .tip-icon svg {
            width: 28px;
            height: 28px;
          }
          .tip-box strong {
            color: #374151;
          }
          .footer { 
            background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
            padding: 40px; 
            text-align: center; 
            border-top: 2px solid #e5e7eb;
          }
          .footer-title {
            font-weight: 700;
            color: #1f2937;
            margin-bottom: 12px;
            font-size: 16px;
          }
          .footer p {
            margin: 8px 0;
            color: #6b7280;
            font-size: 14px;
          }
          .footer-logo {
            margin-top: 24px;
            padding-top: 24px;
            border-top: 1px solid #e5e7eb;
          }
          .footer-logo p:first-child {
            color: #374151;
            font-weight: 600;
          }
          .footer-logo p:last-child {
            color: #9ca3af;
            font-size: 13px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="header-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <h1>איפוס סיסמה</h1>
          </div>
          <div class="content">
            <div class="greeting">שלום ${fullName},</div>
            <p class="intro">קיבלנו בקשה לאיפוס הסיסמה עבור החשבון שלך ב-StudyHub-IL. לחץ על הכפתור למטה כדי ליצור סיסמה חדשה.</p>
            
            <div class="info-box">
              <div class="info-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="#8b5cf6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <line x1="16" y1="2" x2="16" y2="6" stroke="#8b5cf6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <line x1="8" y1="2" x2="8" y2="6" stroke="#8b5cf6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <line x1="3" y1="10" x2="21" y2="10" stroke="#8b5cf6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <div class="info-content">
                <p>בקשת איפוס סיסמה נשלחה</p>
                <p>לחץ על הכפתור למטה כדי ליצור סיסמה חדשה ומאובטחת לחשבון שלך</p>
              </div>
            </div>

            <a href="${resetUrl}" class="btn">אפס את הסיסמה שלי</a>
            
            <p class="link-label">או העתק את הקישור הבא לדפדפן:</p>
            <div class="link-box">${resetUrl}</div>

            <div class="warning-box">
              <div class="warning-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <line x1="12" y1="8" x2="12" y2="12" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <line x1="12" y1="16" x2="12.01" y2="16" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <div class="warning-content">
                <strong>חשוב לדעת</strong>
                <p>הקישור פעיל למשך <strong>15 דקות בלבד</strong>. לאחר תום התקופה, תצטרך לבקש קישור חדש לאיפוס הסיסמה.</p>
              </div>
            </div>

            <div class="security-box">
              <div class="security-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <div class="security-content">
                <strong>הודעת אבטחה</strong>
                <p><strong>לא ביקשת לאפס את הסיסמה?</strong><br>
אם לא ביקשת את השינוי הזה, אנא התעלם ממייל זה. החשבון שלך מאובטח והסיסמה הנוכחית תישאר בתוקף.</p>
              </div>
            </div>

            <div class="tip-box">
              <div class="tip-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2V6M12 18V22M4.93 4.93L7.76 7.76M16.24 16.24L19.07 19.07M2 12H6M18 12H22M4.93 19.07L7.76 16.24M16.24 7.76L19.07 4.93" stroke="#8b5cf6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <circle cx="12" cy="12" r="3" stroke="#8b5cf6" stroke-width="2"/>
                </svg>
              </div>
              <strong>טיפ אבטחה:</strong> בחר סיסמה חזקה המכילה לפחות 8 תווים, אותיות גדולות וקטנות, מספרים ותווים מיוחדים
            </div>
          </div>
          <div class="footer">
            <div class="footer-title">צריך עזרה או יש שאלות?</div>
            <p>צוות התמיכה שלנו זמין עבורך בכל עת. אנחנו כאן כדי להבטיח שתקבל את החוויה הטובה ביותר.</p>
            <div class="footer-logo">
              <p><strong>© 2025 StudyHub-IL</strong> · כל הזכויות שמורות</p>
              <p>הפלטפורמה האקדמית המובילה בישראל</p>
            </div>
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
