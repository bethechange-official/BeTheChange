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
    { name: "Skin Care Products", slug: "skin-care-products", description: "Botanical serums, cleansers, and moisturizers.", imageUrl: null },
    { name: "Glycerin Soaps", slug: "glycerin-soaps", description: "Gentle cleansing bars for everyday use.", imageUrl: null },
    { name: "Cold Process Soaps", slug: "cold-process-soaps", description: "Artisan handcrafted soap bars rich in natural oils.", imageUrl: null },
    { name: "Hair Care Products", slug: "hair-care-products", description: "Ayurvedic scalp oils, herbal cleansers, and follicle stimulants.", imageUrl: null },
    { name: "Household Products", slug: "household-products", description: "Non-toxic, bio-degradable eco-friendly cleaning liquid refills.", imageUrl: null },
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

  // Category name mapping from catalog JSON to DB category names
  const categoryMap: Record<string, string> = {
    "Household": "Household Products",
    "Skincare": "Skin Care Products",
    "Haircare": "Hair Care Products",
    "Glycerin Soaps": "Glycerin Soaps",
    "Cold Process Soaps": "Cold Process Soaps",
  };

  const catalogProducts = JSON.parse(
    require("fs").readFileSync(
      require("path").join(__dirname, "../../btc_website_catalog/data/products.json"),
      "utf-8"
    )
  );

  const BASE_IMAGE_URL = "https://api.bethechangeorga.com/uploads/products/";

  for (const p of catalogProducts) {
    const categoryName = categoryMap[p.category] ?? "Uncategorized";
    const imageUrl = `${BASE_IMAGE_URL}${p.slug}.webp`;

    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {
        name: p.name,
        price: p.price,
        shortDescription: p.shortDescription,
        description: p.description,
        benefits: p.benefits?.join("\n") ?? null,
        usageInstructions: p.howToUse || null,
        size: p.quantity,
        category: categoryName,
        stock: 100,
        isActive: true,
        images: {
          deleteMany: {},
          create: [{ url: imageUrl, altText: p.name, sortOrder: 0 }],
        },
      },
      create: {
        name: p.name,
        slug: p.slug,
        price: p.price,
        shortDescription: p.shortDescription,
        description: p.description,
        benefits: p.benefits?.join("\n") ?? null,
        usageInstructions: p.howToUse || null,
        size: p.quantity,
        category: categoryName,
        stock: 100,
        isActive: true,
        images: {
          create: [{ url: imageUrl, altText: p.name, sortOrder: 0 }],
        },
      },
    });
  }
  console.log(`Products seeded: ${catalogProducts.length}`);

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
