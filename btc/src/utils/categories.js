// Display order for categories, by slug: matches the header nav (SKINCARE, LIP CARE, HAIR CARE, HOUSEHOLD).
// Categories not listed here (e.g. ones added later in admin) follow, alphabetically.
export const CATEGORY_ORDER = ['skin-care-products', 'lip-care', 'hair-care-products', 'household-products'];

// Retired category URLs → where their products live now (soaps were merged into Skincare).
export const LEGACY_CATEGORY_REDIRECTS = {
  'glycerin-soaps': 'skin-care-products',
  'cold-process-soaps': 'skin-care-products',
};

const rank = (slug) => {
  const i = CATEGORY_ORDER.indexOf(slug);
  return i === -1 ? CATEGORY_ORDER.length : i;
};

export const sortCategories = (list) =>
  [...list].sort((a, b) => rank(a.slug) - rank(b.slug) || a.name.localeCompare(b.name));
