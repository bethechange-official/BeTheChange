-- Add the "Lip Care" category (replacing the old "Body Care" nav entry) and move lip products into it.
-- Idempotent: safe to run against databases that already have the category.

INSERT INTO "categories" ("id", "name", "slug", "description", "imageUrl", "isActive", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'Lip Care',
  'lip-care',
  'Nourishing lip balms that moisturise, protect and soften lips.',
  NULL,
  true,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON CONFLICT DO NOTHING; -- name and slug are both unique

-- Whole-word match on "lip", "lips" or "lipstick" (so "Strawberry Lip Balm" moves, "Tulip Soap" or "Lipid Serum" do not).
UPDATE "products"
SET "category" = 'Lip Care', "updatedAt" = CURRENT_TIMESTAMP
WHERE "name" ~* '\mlip(s|stick)?\M'
  AND "category" <> 'Lip Care';
