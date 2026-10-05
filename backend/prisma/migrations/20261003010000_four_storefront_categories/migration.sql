-- Reduce the catalogue to four categories: Skincare, Lip Care, Hair Care, Household.
-- Slugs (and so /category/<slug> URLs) are unchanged. products.category references categories.name
-- with ON UPDATE CASCADE, so renaming a category carries its products along.
-- Idempotent: each step is a no-op once applied.

-- 1. Rename (only if the new name isn't already taken).
UPDATE "categories" SET "name" = 'Skincare', "updatedAt" = CURRENT_TIMESTAMP
WHERE "slug" = 'skin-care-products' AND "name" <> 'Skincare'
  AND NOT EXISTS (SELECT 1 FROM "categories" WHERE "name" = 'Skincare');

UPDATE "categories" SET "name" = 'Hair Care', "updatedAt" = CURRENT_TIMESTAMP
WHERE "slug" = 'hair-care-products' AND "name" <> 'Hair Care'
  AND NOT EXISTS (SELECT 1 FROM "categories" WHERE "name" = 'Hair Care');

UPDATE "categories" SET "name" = 'Household', "updatedAt" = CURRENT_TIMESTAMP
WHERE "slug" = 'household-products' AND "name" <> 'Household'
  AND NOT EXISTS (SELECT 1 FROM "categories" WHERE "name" = 'Household');

-- Make sure all four exist and are visible (e.g. on a database that never had one of them).
INSERT INTO "categories" ("id", "name", "slug", "description", "isActive", "createdAt", "updatedAt") VALUES
  (gen_random_uuid(), 'Skincare',  'skin-care-products', 'Thoughtfully formulated skincare for every concern.', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'Lip Care',  'lip-care',           'Nourishing lip balms that moisturise, protect and soften lips.', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'Hair Care', 'hair-care-products', 'Herbal hair care rooted in nature.', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'Household', 'household-products', 'Effective, gentle formulas for a cleaner home.', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING; -- name and slug are both unique

UPDATE "categories" SET "isActive" = true, "updatedAt" = CURRENT_TIMESTAMP
WHERE "slug" IN ('skin-care-products', 'lip-care', 'hair-care-products', 'household-products') AND "isActive" = false;

-- 2. Soaps are skin-cleansing products: move them to Skincare, then drop the soap categories.
UPDATE "products" SET "category" = 'Skincare', "updatedAt" = CURRENT_TIMESTAMP
WHERE "category" IN (SELECT "name" FROM "categories" WHERE "slug" IN ('glycerin-soaps', 'cold-process-soaps'));

DELETE FROM "categories" WHERE "slug" IN ('glycerin-soaps', 'cold-process-soaps');

-- 3. "Uncategorized" is a system fallback (the API recreates it on demand when a product loses its
--    category), not a storefront category: drop it when empty, otherwise keep it hidden.
DELETE FROM "categories" c
WHERE c."slug" = 'uncategorized'
  AND NOT EXISTS (SELECT 1 FROM "products" p WHERE p."category" = c."name");

UPDATE "categories" SET "isActive" = false, "updatedAt" = CURRENT_TIMESTAMP
WHERE "slug" = 'uncategorized' AND "isActive" = true;
