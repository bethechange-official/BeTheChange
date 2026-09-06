import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { env } from "../src/config/env";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  if (!env.SEED_ADMIN_EMAIL || !env.SEED_ADMIN_PASSWORD) {
    throw new Error("SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD are required when seeding");
  }

  const adminPasswordHash = await bcrypt.hash(env.SEED_ADMIN_PASSWORD, 12);

  const admin = await prisma.admin.upsert({
    where: { email: env.SEED_ADMIN_EMAIL },
    update: { passwordHash: adminPasswordHash },
    create: {
      email: env.SEED_ADMIN_EMAIL,
      name: "BTC Administrator",
      passwordHash: adminPasswordHash,
      role: "SUPER_ADMIN",
      isActive: true,
    },
  });

  console.log("Admin user created:", admin.email);

  const categories = [
    { name: "Uncategorized", slug: "uncategorized", description: "Products awaiting categorization.", imageUrl: null },
    { name: "Skin Care Products", slug: "skin-care-products", description: "Botanical serums, cleansers, and moisturizers.", imageUrl: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&q=80" },
    { name: "Glycerin Soaps", slug: "glycerin-soaps", description: "Gentle cleansing bars for everyday use.", imageUrl: null },
    { name: "Cold Process Soaps", slug: "cold-process-soaps", description: "Artisan handcrafted soap bars rich in natural oils.", imageUrl: "https://images.unsplash.com/photo-1607006344380-b6775a0824a7?w=600&q=80" },
    { name: "Hair Care Products", slug: "hair-care-products", description: "Ayurvedic scalp oils, herbal cleansers, and follicle stimulants.", imageUrl: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&q=80" },
    { name: "Household Products", slug: "household-products", description: "Non-toxic, bio-degradable eco-friendly cleaning liquid refills.", imageUrl: "https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?w=600&q=80" },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: { ...cat, isActive: true },
    });
  }
  console.log("Categories seeded");

  const collections = [
    { name: "Best Sellers", slug: "best-sellers", description: "Our top rated products loved by thousands.", imageUrl: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=600&q=80" },
    { name: "New Arrivals", slug: "new-arrivals", description: "Freshly formulated plant-based releases.", imageUrl: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=600&q=80" },
    { name: "Summer Care", slug: "summer-care", description: "Lightweight gel hydrators and high-SPF sunscreens.", imageUrl: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=600&q=80" },
    { name: "Acne Care", slug: "acne-care", description: "Targeted salicylic acid & tea tree spot treatments.", imageUrl: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=600&q=80" },
    { name: "Sensitive Skin", slug: "sensitive-skin", description: "Fragrance-free, hypoallergenic gentle rituals.", imageUrl: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&q=80" },
    { name: "Gift Combos", slug: "gift-combos", description: "Curated self-care ritual box sets.", imageUrl: "https://images.unsplash.com/photo-1512290900673-7002ff01da91?w=600&q=80" },
  ];

  for (const col of collections) {
    await prisma.collection.upsert({
      where: { slug: col.slug },
      update: {},
      create: { ...col, isActive: true },
    });
  }
  console.log("Collections seeded");

  const settings = [
    { key: "storeName", value: "Be The Change (BTC)" },
    { key: "storeEmail", value: "contact@bethechange.com" },
    { key: "storePhone", value: "+91 98765 43210" },
    { key: "storeAddress", value: "12 Botanical Avenue, Jubilee Hills, Hyderabad, Telangana 500033" },
    { key: "shippingFee", value: "50" },
    { key: "freeShippingThreshold", value: "999" },
    { key: "lowStockAlertThreshold", value: "5" },
    { key: "currency", value: "INR" },
  ];

  for (const setting of settings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    });
  }
  console.log("Settings seeded");

  console.log("Seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
