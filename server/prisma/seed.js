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
    prisma.course.upsert({
      where: { courseCode: 'CS101' },
      update: {},
      create: {
        courseCode: 'CS101',
        courseName: 'מבוא למדעי המחשב',
        institution: 'אוניברסיטה עברית',
        semester: 'סמסטר א 2024',
      },
    }),
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
      where: { courseCode: 'PHYS101' },
      update: {},
      create: {
        courseCode: 'PHYS101',
        courseName: 'פיזיקה 1',
        institution: 'אוניברסיטת בר אילן',
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

  // Create sample ratings for summaries
  const ratings = [];
  
  // Add ratings for first summary (avg will be 4.5)
  ratings.push(
    await prisma.rating.create({
      data: {
        rating: 5,
        summaryId: summaries[0].id,
        userId: admin.id,
      },
    }),
    await prisma.rating.create({
      data: {
        rating: 4,
        summaryId: summaries[0].id,
        userId: student.id,
      },
    })
  );
  
  // Add rating for second summary (avg will be 5)
  ratings.push(
    await prisma.rating.create({
      data: {
        rating: 5,
        summaryId: summaries[1].id,
        userId: admin.id,
      },
    })
  );
  
  // Add rating for third summary (avg will be 4)
  ratings.push(
    await prisma.rating.create({
      data: {
        rating: 4,
        summaryId: summaries[2].id,
        userId: admin.id,
      },
    })
  );
  
  console.log('✅ Created ratings:', ratings.length);

  // Update avgRating for summaries
  await prisma.summary.update({
    where: { id: summaries[0].id },
    data: { avgRating: 4.5 },
  });
  await prisma.summary.update({
    where: { id: summaries[1].id },
    data: { avgRating: 5 },
  });
  await prisma.summary.update({
    where: { id: summaries[2].id },
    data: { avgRating: 4 },
  });
  console.log('✅ Updated average ratings');

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