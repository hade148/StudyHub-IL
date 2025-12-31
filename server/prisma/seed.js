const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Hash password for demo users
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

  // Create Student User
  const student = await prisma.user.upsert({
    where: { email: 'student@studyhub.local' },
    update: {},
    create: {
      fullName: 'יוסי כהן',
      email: 'student@studyhub.local',
      passwordHash: hashedPassword,
      role: 'USER',
    },
  });
  console.log('✅ Created student user:', student.email);

  // List of institutions
  const institutions = [
    'האוניברסיטה העברית בירושלים',
    'אוניברסיטת תל אביב',
    'אוניברסיטת בן־גוריון בנגב',
    'הטכניון – מכון טכנולוגי לישראל',
    'אוניברסיטת חיפה',
    'אוניברסיטת בר־אילן',
    'מכון ויצמן למדע',
    'האוניברסיטה הפתוחה',
    'אוניברסיטת רייכמן',
    'המרכז האקדמי לב (JCT)',
    'המכללה האקדמית תל אביב–יפו',
    'המכללה האקדמית ספיר',
    'המכללה האקדמית עמק יזרעאל',
    'המכללה האקדמית אחוה',
    'המכללה האקדמית אשקלון',
    'המכללה האקדמית נתניה',
    'המכללה האקדמית כנרת',
    'המכללה האקדמית להנדסה סמי שמעון (SCE)',
    'מכללת HIT – מכון טכנולוגי חולון',
    'מכללת אורט בראודה',
    'הקריה האקדמית אונו',
  ];

  // List of CS courses
  const coursesList = [
    { code: 'CS101', name: 'מבוא למדעי המחשב' },
    { code: 'CS102', name: 'תכנות מונחה עצמים' },
    { code: 'CS201', name: 'מבני נתונים' },
    { code: 'CS202', name: 'אלגוריתמים וניתוח סיבוכיות' },
    { code: 'MATH101', name: 'מתמטיקה בדידה' },
    { code: 'MATH102', name: 'אלגברה לינארית' },
    { code: 'MATH103', name: 'חשבון דיפרנציאלי ואינטגרלי' },
    { code: 'CS301', name: 'מערכות הפעלה' },
    { code: 'CS302', name: 'בסיסי נתונים' },
    { code: 'CS303', name: 'רשתות מחשבים' },
    { code: 'CS304', name: 'קומפיילרים' },
    { code: 'CS305', name: 'הנדסת תוכנה' },
    { code: 'CS306', name: 'אבטחת מידע' },
    { code: 'CS401', name: 'תכנות מתקדם' },
    { code: 'CS402', name: 'פיתוח מערכות מבוזרות' },
    { code: 'CS403', name: 'פיתוח Web' },
    { code: 'CS404', name: 'פיתוח אפליקציות' },
    { code: 'CS405', name: 'תכנות מקבילי' },
    { code: 'CS501', name: 'בינה מלאכותית' },
    { code: 'CS502', name: 'למידת מכונה' },
    { code: 'CS503', name: 'מדעי הנתונים' },
  ];

  // Create courses for each institution
  // Note: For initial seeding, we create courses for the first 5 institutions to keep seed data manageable.
  // In production, admins can add courses for specific institutions as needed through the admin interface.
  const selectedInstitutions = institutions.slice(0, 5);
  const courses = [];
  
  for (const institution of selectedInstitutions) {
    for (const course of coursesList) {
      // Create unique course code by combining course code and institution
      // Using institution index to avoid collisions with similar institution names
      const institutionIndex = institutions.indexOf(institution);
      const uniqueCourseCode = `${course.code}-INST${institutionIndex}`;
      
      const createdCourse = await prisma.course.upsert({
        where: { courseCode: uniqueCourseCode },
        update: {},
        create: {
          courseCode: uniqueCourseCode,
          courseName: course.name,
          institution: institution,
          semester: 'סמסטר א 2024',
        },
      });
      courses.push(createdCourse);
    }
  }
  console.log('✅ Created courses:', courses.length);

  // Create Summaries
  const summaries = await Promise.all([
    prisma.summary.create({
      data: {
        title: 'סיכום מבוא למדעי המחשב - פרקים 1-5',
        description: 'סיכום מקיף של השיעורים הראשונים בקורס',
        filePath: 'uploads/cs101-summary-1.pdf',
        courseId: courses[0].id,
        uploadedById: student.id,
      },
    }),
    prisma.summary.create({
      data: {
        title: 'מדריך שלם למבני נתונים',
        description: 'כולל דוגמאות קוד ותרגילים',
        filePath: 'uploads/cs202-guide.pdf',
        courseId: courses[1].id,
        uploadedById: student.id,
      },
    }),
    prisma.summary.create({
      data: {
        title: 'אלגוריתמי מיון - סיכום מלא',
        description: 'Bubble Sort, Quick Sort, Merge Sort',
        filePath: 'uploads/cs301-sorting.pdf',
        courseId: courses[2].id,
        uploadedById: student.id,
      },
    }),
  ]);
  console.log('✅ Created summaries:', summaries.length);

  // Create Forum Posts
  const forumPosts = await Promise.all([
    prisma.forumPost.create({
      data: {
        title: 'שאלה לגבי רקורסיה',
        content: 'מישהו יכול להסביר רקורסיה בצורה פשוטה?',
        courseId: courses[0].id,
        authorId: student.id,
      },
    }),
    prisma.forumPost.create({
      data: {
        title: 'איך מממשים Linked List?',
        content: 'אני מתקשה להבין את המימוש של רשימה מקושרת',
        courseId: courses[1].id,
        authorId: student.id,
      },
    }),
  ]);
  console.log('✅ Created forum posts:', forumPosts.length);

  // Create Tools
  const tools = await Promise.all([
    prisma.tool.create({
      data: {
        title: 'Visual Studio Code',
        url: 'https://code.visualstudio.com',
        description: 'עורך קוד מומלץ',
        category: 'IDE',
        addedById: admin.id,
      },
    }),
    prisma.tool.create({
      data: {
        title: 'GitHub Student Pack',
        url: 'https://education.github.com/pack',
        description: 'כלים חינם לסטודנטים',
        category: 'Resources',
        addedById: admin.id,
      },
    }),
  ]);
  console.log('✅ Created tools:', tools.length);

  console.log('🎉 Seed completed successfully!');
  console.log('\n📧 Demo users:');
  console.log('   Admin: admin@studyhub.local / password123');
  console.log('   Student: student@studyhub.local / password123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });