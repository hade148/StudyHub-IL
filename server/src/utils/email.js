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
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            direction: rtl;
            text-align: right;
            line-height: 1.8; 
            color: #1f2937; 
            background: #f3f4f6;
            margin: 0; 
            padding: 40px 20px;
          }
          .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background: #ffffff;
            border-radius: 16px; 
            overflow: hidden; 
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
          }
          .header { 
            background: linear-gradient(135deg, #1e40af 0%, #7c3aed 50%, #9333ea 100%);
            color: white; 
            padding: 45px 35px;
            text-align: center;
          }
          .header-icon { 
            font-size: 48px;
            margin-bottom: 16px;
            display: block;
          }
          .header h1 { 
            margin: 0; 
            font-size: 28px; 
            font-weight: 600;
          }
          .content { 
            padding: 40px 35px;
            background: white;
            direction: rtl;
            text-align: right;
          }
          .greeting { 
            color: #111827;
            margin-bottom: 18px;
            font-size: 22px;
            font-weight: 600;
          }
          .intro-text {
            font-size: 16px;
            color: #374151;
            line-height: 1.8;
            margin-bottom: 28px;
            padding: 22px 26px;
            background: linear-gradient(to left, #f0f9ff, #faf5ff);
            border-radius: 10px;
            border-right: 4px solid #7c3aed;
          }
          .intro-text strong {
            color: #111827;
            display: block;
            margin-bottom: 8px;
            font-size: 17px;
          }
          .section-title {
            font-size: 18px;
            font-weight: 600;
            color: #111827;
            margin: 28px 0 20px;
            padding-right: 12px;
            border-right: 4px solid #7c3aed;
          }
          .feature { 
            display: table;
            width: 100%;
            margin-bottom: 14px; 
            padding: 18px 22px;
            background: #fafafa;
            border-radius: 10px;
            border: 1px solid #e5e7eb;
          }
          .feature-icon { 
            display: table-cell;
            width: 50px;
            vertical-align: top;
            text-align: center;
            font-size: 28px;
            padding-left: 16px;
          }
          .feature-content {
            display: table-cell;
            vertical-align: top;
            direction: rtl;
            text-align: right;
          }
          .feature-title {
            font-weight: 600;
            color: #111827;
            margin-bottom: 4px;
            font-size: 16px;
          }
          .feature-desc {
            color: #6b7280;
            font-size: 14px;
            line-height: 1.6;
          }
          .btn { 
            display: block;
            background: linear-gradient(135deg, #1e40af 0%, #7c3aed 100%);
            color: #ffffff !important; 
            padding: 15px 36px;
            text-decoration: none; 
            border-radius: 10px; 
            margin: 28px 0;
            font-weight: 600;
            font-size: 16px;
            text-align: center;
            box-shadow: 0 6px 20px rgba(30, 64, 175, 0.25);
          }
          .note-box {
            margin: 24px 0;
            padding: 20px 24px;
            background: linear-gradient(to left, #f0f9ff, #faf5ff);
            border-radius: 10px;
            border: 1px solid #c7d2fe;
            text-align: center;
          }
          .note-icon {
            font-size: 24px;
            margin-bottom: 8px;
            display: block;
          }
          .note-box strong {
            color: #111827;
            font-size: 15px;
            font-weight: 600;
          }
          .note-box p {
            color: #6b7280;
            font-size: 14px;
            margin-top: 6px;
            line-height: 1.6;
          }
          .footer { 
            background: #f9fafb;
            padding: 32px 35px;
            text-align: center; 
            border-top: 1px solid #e5e7eb;
          }
          .footer-title {
            font-weight: 600;
            color: #374151;
            margin-bottom: 10px;
            font-size: 15px;
          }
          .footer p {
            margin: 6px 0;
            color: #6b7280;
            font-size: 14px;
            line-height: 1.6;
          }
          .footer-logo {
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
          }
          .footer-logo p {
            font-size: 13px;
            color: #9ca3af;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <span class="header-icon">📚</span>
            <h1>ברוכים הבאים למערכת StudyHub-IL</h1>
          </div>
          <div class="content">
            <div class="greeting">שלום ${fullName},</div>
            
            <div class="intro-text">
              <strong>הצטרפותך לפלטפורמה הושלמה בהצלחה</strong>
              אנו שמחים לברך אותך על הצטרפותך למערכת StudyHub-IL, הפלטפורמה האקדמית המובילה בישראל. החשבון שלך מאומת ופעיל, ואתה יכול כעת להתחיל ליהנות מכלל השירותים והתכונות המתקדמות שהמערכת מציעה.
            </div>

            <div class="section-title">שירותים ותכונות עיקריים</div>
            
            <div class="feature">
              <div class="feature-icon">📖</div>
              <div class="feature-content">
                <div class="feature-title">ספריית סיכומים אקדמית</div>
                <div class="feature-desc">גישה לאלפי סיכומים איכותיים מכל המוסדות האקדמיים בישראל, מסודרים ומדורגים לפי קורסים ותחומי לימוד</div>
              </div>
            </div>
            
            <div class="feature">
              <div class="feature-icon">💬</div>
              <div class="feature-content">
                <div class="feature-title">פורום קהילתי מקצועי</div>
                <div class="feature-desc">שיתוף ידע וקבלת עזרה מקהילת סטודנטים וחונכים מנוסים מכל רחבי הארץ</div>
              </div>
            </div>
            
            <div class="feature">
              <div class="feature-icon">🛠️</div>
              <div class="feature-content">
                <div class="feature-title">כלים לימודיים מתקדמים</div>
                <div class="feature-desc">מערכת כלים חכמה שתסייע לך ללמוד בצורה יעילה ומקצועית להשגת תוצאות מיטביות</div>
              </div>
            </div>
            
            <div class="feature">
              <div class="feature-icon">⭐</div>
              <div class="feature-content">
                <div class="feature-title">מערכת מעקב והישגים</div>
                <div class="feature-desc">צבירת נקודות, פתיחת הישגים ומעקב מתמיד אחר התקדמותך האקדמית</div>
              </div>
            </div>

            <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/dashboard" class="btn">כניסה לחשבון האישי</a>
            
            <div class="note-box">
              <span class="note-icon">💡</span>
              <strong>המלצה להתחלה</strong>
              <p>מומלץ להתחיל בעיון בסיכומים הפופולריים ביותר בתחום הלימודים שלך, או לפתוח שיח ראשון בפורום הקהילתי</p>
            </div>
          </div>
          <div class="footer">
            <div class="footer-title">תמיכה ושירות</div>
            <p>צוות התמיכה המקצועי שלנו עומד לרשותך בכל עת לסיוע ומענה על שאלות</p>
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
    from: `"StudyHub-IL | האקדמיה הישראלית" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'בקשה לאיפוס סיסמה - StudyHub-IL',
    html: `
      <!DOCTYPE html>
      <html dir="rtl" lang="he">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            direction: rtl;
            text-align: right;
            line-height: 1.8; 
            color: #1f2937; 
            background: #f3f4f6;
            margin: 0; 
            padding: 40px 20px;
          }
          .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background: #ffffff;
            border-radius: 16px; 
            overflow: hidden; 
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
          }
          .header { 
            background: linear-gradient(135deg, #1e40af 0%, #7c3aed 50%, #9333ea 100%);
            color: white; 
            padding: 45px 35px;
            text-align: center;
          }
          .header-icon { 
            font-size: 48px;
            margin-bottom: 16px;
            display: block;
          }
          .header h1 { 
            margin: 0; 
            font-size: 28px; 
            font-weight: 600;
          }
          .content { 
            padding: 40px 35px;
            background: white;
            direction: rtl;
            text-align: right;
          }
          .greeting { 
            color: #111827;
            margin-bottom: 18px;
            font-size: 22px;
            font-weight: 600;
          }
          .intro-text {
            font-size: 16px;
            color: #374151;
            line-height: 1.8;
            margin-bottom: 24px;
          }
          .info-box {
            padding: 20px 24px;
            background: linear-gradient(to left, #dbeafe, #e0e7ff);
            border-radius: 10px;
            border-right: 4px solid #7c3aed;
            margin: 24px 0;
          }
          .info-icon {
            font-size: 24px;
            margin-bottom: 8px;
            display: block;
          }
          .info-box p {
            margin: 0;
            color: #1e40af;
            font-size: 15px;
            line-height: 1.7;
          }
          .info-box p strong {
            display: block;
            margin-bottom: 6px;
            font-weight: 600;
          }
          .btn { 
            display: block;
            background: linear-gradient(135deg, #1e40af 0%, #7c3aed 100%);
            color: #ffffff !important; 
            padding: 16px 40px;
            text-decoration: none; 
            border-radius: 10px; 
            margin: 26px 0;
            font-weight: 600;
            font-size: 16px;
            text-align: center;
            box-shadow: 0 6px 20px rgba(30, 64, 175, 0.25);
          }
          .link-label { 
            font-size: 14px; 
            color: #9ca3af; 
            text-align: center; 
            margin: 14px 0 10px;
          }
          .link-box { 
            background: #f9fafb; 
            padding: 16px 20px; 
            border-radius: 8px; 
            word-break: break-all; 
            margin: 0 0 26px;
            border: 1px solid #e5e7eb;
            font-family: 'Courier New', monospace;
            font-size: 13px;
            color: #6b7280;
            line-height: 1.6;
            direction: ltr;
            text-align: left;
          }
          .warning-box { 
            background: linear-gradient(to left, #fef3c7, #fed7aa);
            border: 1px solid #fbbf24; 
            border-radius: 10px; 
            padding: 20px 24px;
            margin: 24px 0;
          }
          .warning-icon { 
            font-size: 24px;
            margin-bottom: 8px;
            display: block;
          }
          .warning-box strong {
            color: #92400e;
            display: block;
            margin-bottom: 8px;
            font-size: 16px;
            font-weight: 600;
          }
          .warning-box p {
            color: #78350f;
            margin: 0;
            font-size: 15px;
            line-height: 1.7;
          }
          .security-box {
            margin-top: 28px;
            padding: 20px 24px;
            background: linear-gradient(to left, #fef2f2, #fee2e2);
            border-radius: 10px;
            border: 1px solid #fecaca;
          }
          .security-icon {
            font-size: 24px;
            margin-bottom: 8px;
            display: block;
          }
          .security-box strong {
            display: block;
            font-weight: 600;
            color: #991b1b;
            margin-bottom: 8px;
            font-size: 16px;
          }
          .security-box p {
            color: #7f1d1d;
            font-size: 15px;
            margin: 0;
            line-height: 1.7;
          }
          .tip-box {
            margin: 24px 0;
            padding: 20px 24px;
            background: linear-gradient(to left, #f0f9ff, #faf5ff);
            border-radius: 10px;
            border: 1px solid #c7d2fe;
            text-align: center;
          }
          .tip-icon {
            font-size: 24px;
            margin-bottom: 8px;
            display: block;
          }
          .tip-box strong {
            color: #111827;
            font-size: 15px;
            font-weight: 600;
          }
          .tip-box p {
            color: #6b7280;
            font-size: 14px;
            margin-top: 6px;
            line-height: 1.6;
          }
          .footer { 
            background: #f9fafb;
            padding: 32px 35px;
            text-align: center; 
            border-top: 1px solid #e5e7eb;
          }
          .footer-title {
            font-weight: 600;
            color: #374151;
            margin-bottom: 10px;
            font-size: 15px;
          }
          .footer p {
            margin: 6px 0;
            color: #6b7280;
            font-size: 14px;
            line-height: 1.6;
          }
          .footer-logo {
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
          }
          .footer-logo p {
            font-size: 13px;
            color: #9ca3af;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <span class="header-icon">🔐</span>
            <h1>בקשה לאיפוס סיסמה</h1>
          </div>
          <div class="content">
            <div class="greeting">שלום ${fullName},</div>
            <p class="intro-text">התקבלה בקשה לאיפוס הסיסמה עבור חשבונך במערכת StudyHub-IL. לצורך יצירת סיסמה חדשה, נא ללחוץ על הכפתור למטה.</p>
            
            <div class="info-box">
              <span class="info-icon">📧</span>
              <p>
                <strong>פעולה נדרשת</strong>
                לחץ על הכפתור למטה כדי ליצור סיסמה חדשה ומאובטחת לחשבון שלך במערכת
              </p>
            </div>

            <a href="${resetUrl}" class="btn">איפוס סיסמה</a>
            
            <p class="link-label">או העתק את הקישור הבא לדפדפן:</p>
            <div class="link-box">${resetUrl}</div>

            <div class="warning-box">
              <span class="warning-icon">⏱️</span>
              <strong>הגבלת זמן</strong>
              <p>קישור זה תקף למשך <strong>15 דקות בלבד</strong>. לאחר תום התקופה, יהיה צורך לבקש קישור חדש לאיפוס הסיסמה.</p>
            </div>

            <div class="security-box">
              <span class="security-icon">🛡️</span>
              <strong>הודעת אבטחה חשובה</strong>
              <p><strong>האם לא ביקשת לאפס את הסיסמה?</strong><br>
במידה ולא ביקשת שינוי זה, אנא התעלם ממייל זה. חשבונך מאובטח והסיסמה הנוכחית תישאר בתוקף ללא כל שינוי.</p>
            </div>

            <div class="tip-box">
              <span class="tip-icon">💡</span>
              <strong>המלצה לאבטחה</strong>
              <p>מומלץ לבחור סיסמה חזקה המכילה לפחות 8 תווים, הכוללת אותיות גדולות וקטנות, מספרים ותווים מיוחדים</p>
            </div>
          </div>
          <div class="footer">
            <div class="footer-title">תמיכה ושירות</div>
            <p>צוות התמיכה המקצועי שלנו עומד לרשותך בכל עת לסיוע ומענה על שאלות</p>
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
