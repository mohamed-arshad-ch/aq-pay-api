const { PrismaClient } = require('@prisma/client');
const { hashPassword } = require('../src/utils/authUtils');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  try {
    // Admin user details
    const adminData = {
      email: 'mac@admin.com',
      password: 'Mcodev@123',
      firstName: 'Mac',
      lastName: 'Hadams',
      phoneNumber: '9847274569',
      role: 'ADMIN',
      userRoleNumber: 1000
    };

    // Check if admin user already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminData.email }
    });

    if (existingAdmin) {
      console.log('⚠️  Admin user already exists with email:', adminData.email);
      console.log('   Skipping admin user creation...');
    } else {
      // Hash the password
      const hashedPassword = await hashPassword(adminData.password);

      // Create admin user
      const adminUser = await prisma.user.create({
        data: {
          email: adminData.email.toLowerCase(),
          password: hashedPassword,
          firstName: adminData.firstName,
          lastName: adminData.lastName,
          phoneNumber: adminData.phoneNumber,
          role: adminData.role,
          isPortalAccess: true,
          userRoleNumber: 1000 // Admin gets automatic portal access
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phoneNumber: true,
          role: true,
          isPortalAccess: true,
          createdAt: true
        }
      });

      console.log('✅ Admin user created successfully:');
      console.log('   ID:', adminUser.id);
      console.log('   Email:', adminUser.email);
      console.log('   Name:', `${adminUser.firstName} ${adminUser.lastName}`);
      console.log('   Phone:', adminUser.phoneNumber);
      console.log('   Role:', adminUser.role);
      console.log('   Portal Access:', adminUser.isPortalAccess);
      console.log('   Created At:', adminUser.createdAt);

      // Create wallet for admin user
      const adminWallet = await prisma.wallet.create({
        data: {
          userId: adminUser.id,
          balance: 0.00
        },
        select: {
          id: true,
          balance: true,
          createdAt: true
        }
      });

      console.log('✅ Admin wallet created successfully:');
      console.log('   Wallet ID:', adminWallet.id);
      console.log('   Balance:', adminWallet.balance);
      console.log('   Created At:', adminWallet.createdAt);
    }

    console.log('🎉 Database seeding completed successfully!');

  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 