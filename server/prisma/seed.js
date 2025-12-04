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

  // Create Courses
  const courses = await Promise.all([
    // האוניברסיטה העברית
    prisma.course.upsert({
      where: { courseCode: 'CS101' },
      update: {},
      create: {
        courseCode: 'CS101',
        courseName: 'מבוא למדעי המחשב',
        institution: 'האוניברסיטה העברית',
        semester: 'סמסטר א 2024',
      },
    }),
    prisma.course.upsert({
      where: { courseCode: 'COGN201' },
      update: {},
      create: {
        courseCode: 'COGN201',
        courseName: 'מבוא למדעי הקוגניציה',
        institution: 'האוניברסיטה העברית',
        semester: 'סמסטר ב 2024',
      },
    }),
    prisma.course.upsert({
      where: { courseCode: 'LING101' },
      update: {},
      create: {
        courseCode: 'LING101',
        courseName: 'מבוא לבלשנות',
        institution: 'האוניברסיטה העברית',
        semester: 'סמסטר א 2024',
      },
    }),
    // הטכניון
    prisma.course.upsert({
      where: { courseCode: 'CS202' },
      update: {},
      create: {
        courseCode: 'CS202',
        courseName: 'מבני נתונים',
        institution: 'הטכניון',
        semester: 'סמסטר ב 2024',
      },
    }),
    prisma.course.upsert({
      where: { courseCode: 'EE101' },
      update: {},
      create: {
        courseCode: 'EE101',
        courseName: 'מעגלים חשמליים 1',
        institution: 'הטכניון',
        semester: 'סמסטר א 2024',
      },
    }),
    prisma.course.upsert({
      where: { courseCode: 'ME203' },
      update: {},
      create: {
        courseCode: 'ME203',
        courseName: 'מכניקת מוצקים',
        institution: 'הטכניון',
        semester: 'סמסטר ב 2024',
      },
    }),
    // אוניברסיטת תל אביב
    prisma.course.upsert({
      where: { courseCode: 'CS301' },
      update: {},
      create: {
        courseCode: 'CS301',
        courseName: 'אלגוריתמים',
        institution: 'אוניברסיטת תל אביב',
        semester: 'סמסטר א 2024',
      },
    }),
    prisma.course.upsert({
      where: { courseCode: 'ECON101' },
      update: {},
      create: {
        courseCode: 'ECON101',
        courseName: 'מבוא לכלכלה',
        institution: 'אוניברסיטת תל אביב',
        semester: 'סמסטר א 2024',
      },
    }),
    prisma.course.upsert({
      where: { courseCode: 'LAW101' },
      update: {},
      create: {
        courseCode: 'LAW101',
        courseName: 'מבוא למשפט',
        institution: 'אוניברסיטת תל אביב',
        semester: 'סמסטר ב 2024',
      },
    }),
    // אוניברסיטת בן גוריון
    prisma.course.upsert({
      where: { courseCode: 'MATH101' },
      update: {},
      create: {
        courseCode: 'MATH101',
        courseName: 'חשבון אינפיניטסימלי 1',
        institution: 'אוניברסיטת בן גוריון',
        semester: 'סמסטר א 2024',
      },
    }),
    prisma.course.upsert({
      where: { courseCode: 'CHEM101' },
      update: {},
      create: {
        courseCode: 'CHEM101',
        courseName: 'כימיה כללית',
        institution: 'אוניברסיטת בן גוריון',
        semester: 'סמסטר א 2024',
      },
    }),
    prisma.course.upsert({
      where: { courseCode: 'ENV201' },
      update: {},
      create: {
        courseCode: 'ENV201',
        courseName: 'מבוא למדעי הסביבה',
        institution: 'אוניברסיטת בן גוריון',
        semester: 'סמסטר ב 2024',
      },
    }),
    // אוניברסיטת בר אילן
    prisma.course.upsert({
      where: { courseCode: 'PHYS101' },
      update: {},
      create: {
        courseCode: 'PHYS101',
        courseName: 'פיזיקה 1',
        institution: 'אוניברסיטת בר אילן',
        semester: 'סמסטר א 2024',
      },
    }),
    prisma.course.upsert({
      where: { courseCode: 'PSYC101' },
      update: {},
      create: {
        courseCode: 'PSYC101',
        courseName: 'מבוא לפסיכולוגיה',
        institution: 'אוניברסיטת בר אילן',
        semester: 'סמסטר א 2024',
      },
    }),
    prisma.course.upsert({
      where: { courseCode: 'HIST201' },
      update: {},
      create: {
        courseCode: 'HIST201',
        courseName: 'תולדות עם ישראל',
        institution: 'אוניברסיטת בר אילן',
        semester: 'סמסטר ב 2024',
      },
    }),
    // אוניברסיטת חיפה
    prisma.course.upsert({
      where: { courseCode: 'BIO101' },
      update: {},
      create: {
        courseCode: 'BIO101',
        courseName: 'מבוא לביולוגיה',
        institution: 'אוניברסיטת חיפה',
        semester: 'סמסטר א 2024',
      },
    }),
    prisma.course.upsert({
      where: { courseCode: 'STAT201' },
      update: {},
      create: {
        courseCode: 'STAT201',
        courseName: 'סטטיסטיקה',
        institution: 'אוניברסיטת חיפה',
        semester: 'סמסטר ב 2024',
      },
    }),
    // מכללת תל אביב יפו
    prisma.course.upsert({
      where: { courseCode: 'CS110' },
      update: {},
      create: {
        courseCode: 'CS110',
        courseName: 'יסודות התכנות',
        institution: 'מכללת תל אביב יפו',
        semester: 'סמסטר א 2024',
      },
    }),
    prisma.course.upsert({
      where: { courseCode: 'BA101' },
      update: {},
      create: {
        courseCode: 'BA101',
        courseName: 'מבוא למנהל עסקים',
        institution: 'מכללת תל אביב יפו',
        semester: 'סמסטר א 2024',
      },
    }),
  ]);
  console.log('✅ Created courses:', courses.length);

  // Create Summaries
  const summaries = await Promise.all([
    prisma.summary.create({
      data: {
        title: 'סיכום מבוא למדעי המחשב - פרקים 1-5',
        description: 'סיכום מקיף של השיעורים הראשונים בקורס',
        filePath: 'uploads/cs101-summary-1.pdf',
        courseId: courses[0].id,  // CS101 - האוניברסיטה העברית
        uploadedById: student.id,
      },
    }),
    prisma.summary.create({
      data: {
        title: 'מדריך שלם למבני נתונים',
        description: 'כולל דוגמאות קוד ותרגילים',
        filePath: 'uploads/cs202-guide.pdf',
        courseId: courses[3].id,  // CS202 - הטכניון
        uploadedById: student.id,
      },
    }),
    prisma.summary.create({
      data: {
        title: 'אלגוריתמי מיון - סיכום מלא',
        description: 'Bubble Sort, Quick Sort, Merge Sort',
        filePath: 'uploads/cs301-sorting.pdf',
        courseId: courses[6].id,  // CS301 - אוניברסיטת תל אביב
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