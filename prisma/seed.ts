import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create demo user
  const hashedPassword = await bcrypt.hash('password123', 12);
  
  const demoUser = await prisma.user.upsert({
    where: { email: 'kelvinchebon90@gmail.com' },
    update: {},
    create: {
      email: 'kelvinchebon90@gmail.com',
      name: 'Kelvin',
      password: hashedPassword,
    },
  });

  console.log('✅ Demo user created:', demoUser.email);

  // Create demo categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { id: 'work-category' },
      update: {},
      create: {
        id: 'work-category',
        name: 'Work',
        color: '#3B82F6',
        userId: demoUser.id,
      },
    }),
    prisma.category.upsert({
      where: { id: 'personal-category' },
      update: {},
      create: {
        id: 'personal-category',
        name: 'Personal',
        color: '#10B981',
        userId: demoUser.id,
      },
    }),
    prisma.category.upsert({
      where: { id: 'health-category' },
      update: {},
      create: {
        id: 'health-category',
        name: 'Health',
        color: '#F59E0B',
        userId: demoUser.id,
      },
    }),
  ]);

  console.log('✅ Categories created:', categories.map(c => c.name));

  // Create demo tasks
  const tasks = await Promise.all([
    prisma.task.create({
      data: {
        title: 'Complete project documentation',
        description: 'Write comprehensive documentation for the new API endpoints',
        status: 'IN_PROGRESS',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        userId: demoUser.id,
        categoryId: categories[0].id, // Work
      },
    }),
    prisma.task.create({
      data: {
        title: 'Review pull requests',
        description: 'Review and provide feedback on pending pull requests',
        status: 'PENDING',
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        userId: demoUser.id,
        categoryId: categories[0].id, // Work
      },
    }),
    prisma.task.create({
      data: {
        title: 'Buy groceries',
        description: 'Get milk, bread, eggs, and vegetables for the week',
        status: 'PENDING',
        dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // Tomorrow
        userId: demoUser.id,
        categoryId: categories[1].id, // Personal
      },
    }),
    prisma.task.create({
      data: {
        title: 'Plan weekend trip',
        description: 'Research destinations and book accommodations',
        status: 'COMPLETED',
        userId: demoUser.id,
        categoryId: categories[1].id, // Personal
      },
    }),
    prisma.task.create({
      data: {
        title: 'Morning jog',
        description: '30-minute jog around the neighborhood',
        status: 'COMPLETED',
        userId: demoUser.id,
        categoryId: categories[2].id, // Health
      },
    }),
    prisma.task.create({
      data: {
        title: 'Doctor appointment',
        description: 'Annual health checkup',
        status: 'PENDING',
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
        userId: demoUser.id,
        categoryId: categories[2].id, // Health
      },
    }),
  ]);

  console.log('✅ Tasks created:', tasks.length);
  console.log('🎉 Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });