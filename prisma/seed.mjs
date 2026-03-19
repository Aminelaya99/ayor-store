import pkg from '@prisma/client'
const { PrismaClient } = pkg

const prisma = new PrismaClient()

async function main() {
  await prisma.productSettings.create({
    data: {
      name: "LED Spoiler Tail Light",
      costPriceDzd: 2500,
      initialStock: 50,
    }
  })

  await prisma.order.createMany({
    data: [
      { customerName: "Ahmed", phone: "0555123456", wilaya: "Alger", product: "LED Spoiler Tail Light", totalPrice: 4500, status: "Delivered" },
      { customerName: "Youcef", phone: "0777123456", wilaya: "Oran", product: "LED Spoiler Tail Light", totalPrice: 4500, status: "Pending" },
      { customerName: "Amine", phone: "0666123456", wilaya: "Annaba", product: "LED Spoiler Tail Light", totalPrice: 4500, status: "Returned" },
    ]
  })

  await prisma.adExpense.create({
    data: {
      platform: "Facebook",
      spendUsd: 10,
      spendDzd: 2500,
    }
  })

  console.log("Seed data successfully inserted.")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
