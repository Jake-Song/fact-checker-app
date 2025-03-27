// prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.post.createMany({
    data: [
      {
        title: 'Welcome to the Blog',
        content: 'This is the first post!',
      },
      {
        title: 'Second Post',
        content: 'Here is some more content.',
      },
      {
        title: 'Prisma + PostgreSQL',
        content: 'Using Prisma with PostgreSQL is awesome.',
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
  .finally(() => {
    prisma.$disconnect();
  });
