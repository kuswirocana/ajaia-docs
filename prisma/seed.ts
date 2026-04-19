import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const alice = await prisma.user.upsert({
    where: { email: 'alice@ajaia.dev' },
    update: {},
    create: { email: 'alice@ajaia.dev', name: 'Alice Chen' },
  })
  const bob = await prisma.user.upsert({
    where: { email: 'bob@ajaia.dev' },
    update: {},
    create: { email: 'bob@ajaia.dev', name: 'Bob Smith' },
  })
  console.log('Seeded users:', alice.email, bob.email)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
