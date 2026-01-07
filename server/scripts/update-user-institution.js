const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Script to update user institution
 * Usage: node scripts/update-user-institution.js <email> <institution>
 * Example: node scripts/update-user-institution.js user@example.com "המרכז האקדמי לב"
 */

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log('Usage: node scripts/update-user-institution.js <email> <institution>');
    console.log('Example: node scripts/update-user-institution.js user@example.com "המרכז האקדמי לב"');
    process.exit(1);
  }

  const [email, institution] = args;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, fullName: true, email: true, institution: true }
    });

    if (!user) {
      console.error(`❌ User not found: ${email}`);
      process.exit(1);
    }

    console.log(`Found user: ${user.fullName} (${user.email})`);
    console.log(`Current institution: ${user.institution || 'None'}`);
    console.log(`New institution: ${institution}`);

    const updated = await prisma.user.update({
      where: { email },
      data: { institution },
      select: { id: true, fullName: true, email: true, institution: true }
    });

    console.log('✅ User updated successfully!');
    console.log(updated);
  } catch (error) {
    console.error('❌ Error updating user:', error);
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error('❌ Script failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
