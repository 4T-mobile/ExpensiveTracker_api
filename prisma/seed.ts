import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  const defaultCategories = [
    { name: 'Food & Dining', icon: '🍔', color: '#FF6B6B' },
    { name: 'Transportation', icon: '🚗', color: '#4ECDC4' },
    { name: 'Study & Education', icon: '📚', color: '#45B7D1' },
    { name: 'Entertainment', icon: '🎮', color: '#FFA07A' },
    { name: 'Shopping', icon: '🛒', color: '#98D8C8' },
    { name: 'Utilities & Bills', icon: '💡', color: '#FFD93D' },
    { name: 'Healthcare', icon: '⚕️', color: '#6BCB77' },
    { name: 'Others', icon: '📌', color: '#95A5A6' },
  ];

  for (const category of defaultCategories) {
    const existing = await prisma.category.findFirst({
      where: {
        name: category.name,
        isDefault: true,
      },
    });

    if (!existing) {
      await prisma.category.create({
        data: {
          name: category.name,
          icon: category.icon,
          color: category.color,
          isDefault: true,
        },
      });
      console.log(`Created default category: ${category.name}`);
    } else {
      console.log(`Category ${category.name} already exists, skipping...`);
    }
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
