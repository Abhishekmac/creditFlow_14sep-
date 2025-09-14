import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Users missing a hash (null or empty), but having a legacy password value
  const users = await prisma.user.findMany({
    where: {
      AND: [
        { OR: [{ passwordHash: null }, { passwordHash: '' }] },
        { password: { not: null } },
      ],
    },
    select: { id: true, password: true },
  })

  for (const u of users) {
    const plain = u.password as string
    const hashed = await bcrypt.hash(plain, 10)

    await prisma.user.update({
      where: { id: u.id },
      data: { passwordHash: hashed },
    })

    console.log(`Backfilled user ${u.id}`)
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
