import { useEffect, useMemo, useState } from 'react';
import { X, Search, Loader2, Package } from 'lucide-react';
import { adminProductService } from '../../services/admin/productService';
import { adminCategoryService } from '../../services/admin/categoryService';
import { adminCollectionService } from '../../services/admin/collectionService';

// The products API caps page size at 100, so walk every page to show the whole catalogue.
async function fetchAllProducts() {
  const all = [];
  for (let page = 1; ; page++) {
    const response = await adminProductService.getAll({ page, limit: 100, sort: 'name', order: 'asc' });
    all.push(...(response.data || []));
    if (page >= (response.pagination?.totalPages || 1)) return all;
  }
}

const KINDS = {
  // Every product must have a category: unticked products fall back to "Uncategorized".
  category: {
    field: 'category',
    save: (id, ids) => adminCategoryService.setProducts(id, ids),
    help: 'Tick the products that belong to this category. Each product has exactly one category.',
  },
  // Collections are optional: unticked products simply leave the collection.
  collection: {
    field: 'collection',
    save: (id, ids) => adminCollectionService.setProducts(id, ids),
    help: 'Tick the products that belong to this collection. A product can be in one collection at a time.',
  },
};

/** Pick which products belong to a category or collection (`kind`). */
export function AssignProductsModal({ kind, group, onClose, onSaved }) {
  const { field, save, help } = KINDS[kind];
  const isFallbackCategory = kind === 'category' && group.slug === 'uncategorized';

  const [products, setProducts] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [search, setSearch] = useState('');
  const [showSelectedOnly, setShowSelectedOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    fetchAllProducts()
      .then((list) => {
        if (!active) return;
        setProducts(list);
        setSelected(new Set(list.filter((p) => p[field] === group.name).map((p) => p.id)));
      })
      .catch((err) => active && setError(err.message || 'Failed to load products'))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [field, group.name]);

  const isMember = (p) => p[field] === group.name;
  // In "Uncategorized", current members can't be unticked: there is no other category to send them to.
  const isLocked = (p) => isFallbackCategory && isMember(p);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((p) =>
      (!showSelectedOnly || selected.has(p.id)) &&
      (!q || p.name.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q) || p.collection?.toLowerCase().includes(q)));
  }, [products, search, showSelectedOnly, selected]);

  const toggle = (p) => setSelected((prev) => {
    const next = new Set(prev);
    if (next.has(p.id)) { if (!isLocked(p)) next.delete(p.id); } else next.add(p.id);
    return next;
  });

  const allVisibleSelected = visible.length > 0 && visible.every((p) => selected.has(p.id));
  const toggleAllVisible = () => setSelected((prev) => {
    const next = new Set(prev);
    visible.forEach((p) => {
      if (!allVisibleSelected) next.add(p.id);
      else if (!isLocked(p)) next.delete(p.id);
    });
    return next;
  });

  const movingIn = products.filter((p) => selected.has(p.id) && p[field] && !isMember(p));
  const leaving = products.filter((p) => isMember(p) && !selected.has(p.id));

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const response = await save(group.id, [...selected]);
      onSaved(response.data);
    } catch (err) {
      setError(err.message || 'Failed to save products');
      setSaving(false);
    }
  };

  const noun = (n) => `${n} product${n === 1 ? '' : 's'}`;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs" role="dialog" aria-modal="true" aria-label={`Manage products in ${group.name}`}>
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-gray-100">
        <div className="p-5 border-b border-gray-100 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold font-serif text-gray-900">Products in “{group.name}”</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {isFallbackCategory
                ? 'Products land here when they have no other category. Tick a product to move it here; to move one out, assign it to another category.'
                : help}
            </p>
          </div>
          <button onClick={onClose} disabled={saving} className="text-gray-400 hover:text-gray-700 p-1" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="px-5 py-3 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products by name, category or collection…"
              className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-8 pr-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-gray-900"
            />
          </div>
          <label className="flex items-center gap-2 text-xs text-gray-600 select-none">
            <input type="checkbox" checked={showSelectedOnly} onChange={(e) => setShowSelectedOnly(e.target.checked)} />
            Selected only
          </label>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-xs text-gray-500">
              <Loader2 size={16} className="animate-spin" /> Loading products…
            </div>
          ) : visible.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-xs text-gray-400">
              <Package size={22} />
              {products.length === 0 ? 'No products yet. Add products first.' : 'No products match your search.'}
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              <li className="px-5 py-2 bg-gray-50/70">
                <label className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500 cursor-pointer">
                  <input type="checkbox" checked={allVisibleSelected} onChange={toggleAllVisible} />
                  Select all {search || showSelectedOnly ? 'shown' : ''} ({visible.length})
                </label>
              </li>
              {visible.map((p) => {
                const elsewhere = p[field] && !isMember(p);
                const locked = isLocked(p);
                return (
                  <li key={p.id}>
                    <label className={`flex items-center gap-3 px-5 py-2.5 hover:bg-gray-50 ${locked ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                      <input
                        type="checkbox"
                        checked={selected.has(p.id)}
                        onChange={() => toggle(p)}
                        disabled={locked}
                        aria-label={p.name}
                        title={locked ? 'Assign this product to another category to move it out' : undefined}
                      />
                      <div className="w-9 h-9 rounded bg-gray-100 overflow-hidden flex-shrink-0">
                        {p.images?.[0] && <img src={p.images[0]} alt="" className="w-full h-full object-cover" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{p.name}</p>
                        <p className="text-[11px] text-gray-500">
                          {kind === 'collection' ? `${p.category} · ` : ''}₹{Number(p.price).toLocaleString('en-IN')}
                          {!p.isActive && <span className="ml-1.5 text-gray-400">(inactive)</span>}
                        </p>
                      </div>
                      {elsewhere && (
                        <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-0.5 flex-shrink-0">
                          In {p[field]}
                        </span>
                      )}
                    </label>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="p-4 border-t border-gray-100 flex flex-col gap-3">
          {movingIn.length > 0 && (
            <p className="text-[11px] text-amber-700">
              {noun(movingIn.length)} will be moved here from another {kind}.
            </p>
          )}
          {kind === 'category' && leaving.length > 0 && (
            <p className="text-[11px] text-amber-700">
              {noun(leaving.length)} will be moved to “Uncategorized”.
            </p>
          )}
          {error && <p role="alert" className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">{error}</p>}
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs text-gray-600"><strong className="text-gray-900">{selected.size}</strong> selected</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-gray-700 hover:bg-gray-100 rounded-lg disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || loading}
                className="px-5 py-2 text-xs font-semibold uppercase tracking-wider text-white bg-gray-900 hover:bg-black rounded-lg shadow-xs disabled:opacity-50"
              >
                {saving ? 'Saving…' : 'Save Products'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
