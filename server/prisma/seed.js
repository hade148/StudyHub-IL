const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Hash password for admin user
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Create Admin User
  const admin = await prisma.user.upsert({
    where: { email: 'admin@studyhub.local' },
    update: {},
    create: {
      fullName: 'מנהל המערכת',
      email: 'admin@studyhub.local',
      passwordHash: hashedPassword,
      role: 'ADMIN',
    },
  });
  console.log('✅ Created admin user:', admin.email);

  // List of CS courses - comprehensive list for Computer Science programs
  const coursesList = [
    // Foundation Courses (קורסי יסוד)
    'מבוא למדעי המחשב',
    'תכנות מונחה עצמים',
    'מבני נתונים',
    'אלגוריתמים וניתוח סיבוכיות',
    'מתמטיקה דיסקרטית',
    'אלגברה לינארית',
    'חדו"א / חשבון דיפרנציאלי ואינטגרלי',
    // Systems Courses (קורסי מערכות)
    'מערכות הפעלה',
    'בסיסי נתונים',
    'רשתות מחשבים',
    'קומפיילרים',
    'הנדסת תוכנה',
    'אבטחת מידע',
    // Programming & Technology Courses (קורסי תכנות וטכנולוגיה)
    'תכנות מתקדם',
    'פיתוח מערכות מבוזרות',
    'פיתוח Web',
    'פיתוח אפליקציות',
    'תכנות מקבילי',
    // Advanced/Enrichment Courses (קורסי העשרה / מתקדמים)
    'בינה מלאכותית',
    'למידת מכונה',
    'מדעי הנתונים',
  ];

  // Create courses from coursesList - one course per entry without duplication
  for (let i = 0; i < coursesList.length; i++) {
    const courseName = coursesList[i];
    const courseCode = `COURSE${(i + 1).toString().padStart(2, '0')}`;
    
    await prisma.course.upsert({
      where: { courseCode: courseCode },
      update: {},
      create: {
        courseCode: courseCode,
        courseName: courseName,
        institution: 'כללי', // Generic institution
        semester: 'כל סמסטר',
      },
    });
  }
  
  console.log('✅ Created courses:', coursesList.length);

  console.log('🎉 Seed completed successfully!');
  console.log('\n📧 Admin user:');
  console.log('   Email: admin@studyhub.local');
  console.log('   Password: password123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });