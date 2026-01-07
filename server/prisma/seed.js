const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');

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

  // Load courses from JSON file
  const coursesPath = path.join(__dirname, '../data/courses.json');
  const coursesList = JSON.parse(fs.readFileSync(coursesPath, 'utf-8'));

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