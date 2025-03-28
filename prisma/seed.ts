// prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create a test user
  const user = await prisma.user.create({
    data: {
      email: 'test@example.com',
      password: 'password123', // This should be hashed in a real application
    },
  });

  // Create posts with the user as author
  await prisma.post.createMany({
    data: [
      {
        title: 'Welcome to the Blog',
        content: 'This is the first post!',
        authorId: user.id,
      },
      {
        title: 'Second Post',
        content: 'Here is some more content.',
        authorId: user.id,
      },
      {
        title: 'Prisma + PostgreSQL',
        content: 'Using Prisma with PostgreSQL is awesome.',
        authorId: user.id,
      },
    ],
  });

  console.log('✅ Seeded data!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
