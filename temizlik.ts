import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  console.log('Temizlik basliyor...')
  try { await prisma.orderItem.deleteMany() } catch(e) {}
  try { await prisma.order.deleteMany() } catch(e) {}
  try { await prisma.productVariant.deleteMany() } catch(e) {}
  try { await prisma.product.deleteMany() } catch(e) {}
  try { await prisma.vendor.deleteMany() } catch(e) {}
  
  const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } })
  if (admin) {
    await prisma.vendor.create({
      data: { userId: admin.id, storeName: 'MatbaaGross', status: 'APPROVED' }
    })
    console.log('Muazzam Temizlik Tamamlandi! MatbaaGross magazasi hazir! 😎')
  }
}
main().catch(console.error).finally(() => prisma.$disconnect())
