import { useState, useEffect, useCallback } from 'react';
import {
  Plus, Edit2, Trash2, X, CheckCircle2, Loader2, Upload, Image as ImageIcon,
  ArrowUp, ArrowDown, Eye, EyeOff, ExternalLink, CalendarClock, GalleryHorizontalEnd,
} from 'lucide-react';
import { AdminLayout } from '../components/AdminLayout';
import { ConfirmModal } from '../components/ConfirmModal';
import { adminApi } from '../../services/admin/api';
import { categoryService } from '../../services/categoryService';

const emptyForm = {
  imageUrl: '',
  linkUrl: '',
  title: '',
  subtitle: '',
  ctaLabel: '',
  isActive: true,
  startsAt: '',
  endsAt: '',
};

// <input type="datetime-local"> works in local time without a zone; the API stores ISO (UTC).
const isoToLocalInput = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};
const localInputToIso = (value) => (value ? new Date(value).toISOString() : null);

const formatDate = (iso) => new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

const slideStatus = (slide, now = Date.now()) => {
  if (!slide.isActive) return { label: 'Hidden', className: 'bg-gray-100 text-gray-600 border-gray-200' };
  if (slide.startsAt && new Date(slide.startsAt).getTime() > now) return { label: 'Scheduled', className: 'bg-amber-50 text-amber-700 border-amber-200' };
  if (slide.endsAt && new Date(slide.endsAt).getTime() <= now) return { label: 'Expired', className: 'bg-rose-50 text-rose-700 border-rose-200' };
  return { label: 'Live', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
};

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const CUSTOM_LINK = '__custom';

const inputClass = 'w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-gray-900';
const labelClass = 'block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1';

export default function AdminSliders() {
  const [slides, setSlides] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [categories, setCategories] = useState([]);
  const [linkChoice, setLinkChoice] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const flash = (message) => {
    setToast(message);
    setTimeout(() => setToast(''), 3000);
  };

  const fetchSlides = useCallback(async () => {
    try {
      const response = await adminApi.getBanners();
      if (response.success) setSlides(response.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load sliders');
    } finally {
      setInitialLoading(false);
    }
  }, []);

  useEffect(() => { fetchSlides(); }, [fetchSlides]);

  useEffect(() => {
    categoryService.getCategories()
      .then(res => { if (res.success) setCategories((res.data || []).filter(c => c.slug !== 'uncategorized')); })
      .catch(() => {});
  }, []);

  const linkOptions = [
    { value: '/shop', label: 'Shop all products' },
    ...categories.map(c => ({ value: `/category/${c.slug}`, label: `Category: ${c.name}` })),
    { value: '/about', label: 'Our story page' },
    { value: '/contact', label: 'Contact page' },
  ];

  const choiceForLink = (url) => (!url ? '' : linkOptions.some(o => o.value === url) ? url : CUSTOM_LINK);

  const handleLinkChoice = (value) => {
    setLinkChoice(value);
    if (value !== CUSTOM_LINK) setForm(prev => ({ ...prev, linkUrl: value }));
    else setForm(prev => ({ ...prev, linkUrl: '' }));
  };

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setLinkChoice('');
    setShowUrlInput(false);
    setFormError('');
    setModalOpen(true);
  };

  const openEdit = (slide) => {
    setEditing(slide);
    setForm({
      imageUrl: slide.imageUrl,
      linkUrl: slide.linkUrl || '',
      title: slide.title || '',
      subtitle: slide.subtitle || '',
      ctaLabel: slide.ctaLabel || '',
      isActive: slide.isActive,
      startsAt: isoToLocalInput(slide.startsAt),
      endsAt: isoToLocalInput(slide.endsAt),
    });
    setLinkChoice(choiceForLink(slide.linkUrl));
    setShowUrlInput(false);
    setFormError('');
    setModalOpen(true);
  };

  const uploadFile = async (file) => {
    if (!file) return;
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setFormError('Please choose a JPG, PNG, WebP or GIF image.');
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setFormError(`This image is ${(file.size / 1024 / 1024).toFixed(1)} MB. Please use an image of 10 MB or less.`);
      return;
    }
    setUploading(true);
    setFormError('');
    try {
      const response = await adminApi.uploadImages([file]);
      const url = response.data?.images?.[0]?.url;
      if (url) setForm(prev => ({ ...prev, imageUrl: url }));
    } catch (err) {
      setFormError(err.message || 'Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleUpload = (event) => {
    uploadFile(event.target.files?.[0]);
    event.target.value = '';
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragOver(false);
    uploadFile(event.dataTransfer.files?.[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.imageUrl) {
      setFormError('Please upload a banner image.');
      return;
    }
    if (linkChoice === CUSTOM_LINK && !form.linkUrl.trim()) {
      setFormError('Please enter the custom link, or choose "No link".');
      return;
    }
    setBusy(true);
    setFormError('');
    const payload = {
      imageUrl: form.imageUrl.trim(),
      linkUrl: form.linkUrl.trim() || null,
      title: form.title.trim() || null,
      subtitle: form.subtitle.trim() || null,
      ctaLabel: form.ctaLabel.trim() || null,
      isActive: form.isActive,
      startsAt: localInputToIso(form.startsAt),
      endsAt: localInputToIso(form.endsAt),
    };
    try {
      const response = editing
        ? await adminApi.updateBanner(editing.id, payload)
        : await adminApi.createBanner(payload);
      if (response.success) {
        setModalOpen(false);
        flash(editing ? 'Slider updated.' : 'Slider added.');
        fetchSlides();
      } else {
        setFormError(response.errors?.[0]?.message || response.message);
      }
    } catch (err) {
      setFormError(err.message || 'Save failed');
    } finally {
      setBusy(false);
    }
  };

  const toggleActive = async (slide) => {
    setBusy(true);
    try {
      await adminApi.updateBanner(slide.id, { isActive: !slide.isActive });
      flash(slide.isActive ? 'Slider hidden from the homepage.' : 'Slider is visible on the homepage.');
      fetchSlides();
    } catch (err) {
      setError(err.message || 'Update failed');
    } finally {
      setBusy(false);
    }
  };

  const move = async (index, direction) => {
    const target = index + direction;
    if (target < 0 || target >= slides.length) return;
    const next = [...slides];
    [next[index], next[target]] = [next[target], next[index]];
    setSlides(next);
    setBusy(true);
    try {
      const response = await adminApi.reorderBanners(next.map(s => s.id));
      if (response.success) setSlides(response.data);
    } catch (err) {
      setError(err.message || 'Reorder failed');
      fetchSlides();
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setBusy(true);
    try {
      await adminApi.deleteBanner(deleteTarget.id);
      setSlides(prev => prev.filter(s => s.id !== deleteTarget.id));
      flash('Slider deleted.');
    } catch (err) {
      setError(err.message || 'Delete failed');
    } finally {
      setBusy(false);
      setDeleteTarget(null);
    }
  };

  const liveCount = slides.filter(s => slideStatus(s).label === 'Live').length;

  return (
    <AdminLayout title="Home Page Sliders">
      {error && (
        <div className="mb-6 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2">
          <X size={16} className="flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {toast && (
        <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span>{toast}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <p className="text-sm text-gray-600">
            Ad banners shown in the slider at the top of the homepage. <strong>{liveCount}</strong> live now.
          </p>
          <p className="text-xs text-gray-400 mt-1">Recommended image size: 1200 × 600 px (2:1), JPG/PNG/WebP up to 10 MB. Keep key text near the centre.</p>
        </div>
        <button
          onClick={openAdd}
          className="inline-flex items-center justify-center gap-2 bg-gray-900 hover:bg-black text-white px-4 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all shadow-xs shrink-0"
        >
          <Plus size={16} />
          <span>Add Slider</span>
        </button>
      </div>

      {initialLoading ? (
        <div className="py-20 flex justify-center text-gray-400"><Loader2 className="animate-spin" /></div>
      ) : slides.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-300 rounded-xl py-16 px-6 text-center">
          <GalleryHorizontalEnd size={32} className="mx-auto text-gray-300 mb-3" />
          <h3 className="font-serif text-lg font-bold text-gray-900">No sliders yet</h3>
          <p className="text-xs text-gray-500 mt-1 mb-5">Add your first ad banner and it will appear at the top of the homepage.</p>
          <button onClick={openAdd} className="inline-flex items-center gap-2 bg-gray-900 text-white px-4 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider">
            <Plus size={15} /> Add Slider
          </button>
        </div>
      ) : (
        <ul className="space-y-4">
          {slides.map((slide, index) => {
            const status = slideStatus(slide);
            return (
              <li key={slide.id} className="bg-white border border-gray-200/80 rounded-xl shadow-2xs p-4 flex flex-col md:flex-row gap-4 md:items-center">
                <div className="flex md:flex-col gap-1 shrink-0 order-last md:order-first">
                  <button onClick={() => move(index, -1)} disabled={busy || index === 0} title="Move up" className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-900 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-600 transition-colors">
                    <ArrowUp size={14} />
                  </button>
                  <button onClick={() => move(index, 1)} disabled={busy || index === slides.length - 1} title="Move down" className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-900 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-600 transition-colors">
                    <ArrowDown size={14} />
                  </button>
                </div>

                <div className="relative w-full md:w-72 aspect-[2/1] rounded-lg overflow-hidden bg-gray-100 shrink-0">
                  <img src={slide.imageUrl} alt={slide.title || 'Slider'} className="w-full h-full object-cover" />
                  <span className="absolute top-2 left-2 bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded">#{index + 1}</span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${status.className}`}>{status.label}</span>
                  </div>
                  <h3 className="font-serif text-base font-bold text-gray-900 truncate">{slide.title || <span className="text-gray-400 font-normal italic">No headline (image only)</span>}</h3>
                  {slide.subtitle && <p className="text-xs text-gray-500 truncate">{slide.subtitle}</p>}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-[11px] text-gray-500">
                    {slide.linkUrl ? (
                      <span className="inline-flex items-center gap-1 truncate max-w-full"><ExternalLink size={12} /> {slide.linkUrl}</span>
                    ) : (
                      <span className="text-gray-400">No link</span>
                    )}
                    {(slide.startsAt || slide.endsAt) && (
                      <span className="inline-flex items-center gap-1">
                        <CalendarClock size={12} />
                        {slide.startsAt ? formatDate(slide.startsAt) : 'Now'} → {slide.endsAt ? formatDate(slide.endsAt) : 'No end'}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => toggleActive(slide)} disabled={busy} title={slide.isActive ? 'Hide' : 'Show'} className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-900 hover:text-white transition-colors disabled:opacity-50">
                    {slide.isActive ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                  <button onClick={() => openEdit(slide)} disabled={busy} title="Edit" className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-900 hover:text-white transition-colors disabled:opacity-50">
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => setDeleteTarget(slide)} disabled={busy} title="Delete" className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-rose-600 hover:text-white transition-colors disabled:opacity-50">
                    <Trash2 size={14} />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* Add / Edit modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[92vh] overflow-y-auto p-6 shadow-2xl border border-gray-100 relative">
            <button onClick={() => setModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 p-1" aria-label="Close">
              <X size={18} />
            </button>
            <h3 className="text-lg font-bold font-serif text-gray-900 mb-4">{editing ? 'Edit Slider' : 'Add Slider'}</h3>

            {formError && <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-lg text-xs">{formError}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className={labelClass}>Banner image *</label>
                <label
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  className={`group/drop relative block aspect-[2/1] rounded-lg border-2 border-dashed overflow-hidden cursor-pointer transition-colors ${
                    dragOver ? 'border-gray-900 bg-gray-100' : form.imageUrl ? 'border-transparent' : 'border-gray-300 bg-gray-50 hover:border-gray-500'
                  } ${uploading ? 'pointer-events-none' : ''}`}
                >
                  <input type="file" accept={ACCEPTED_TYPES.join(',')} className="hidden" onChange={handleUpload} />
                  {form.imageUrl ? (
                    <>
                      <img src={form.imageUrl} alt="" className="w-full h-full object-cover" />
                      <span className="absolute inset-0 bg-black/0 group-hover/drop:bg-black/45 transition-colors flex items-center justify-center">
                        <span className="opacity-0 group-hover/drop:opacity-100 transition-opacity inline-flex items-center gap-1.5 bg-white text-gray-900 text-xs font-semibold px-3 py-1.5 rounded-lg">
                          <Upload size={13} /> Replace image
                        </span>
                      </span>
                    </>
                  ) : (
                    <span className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
                      <Upload size={22} className="text-gray-400 mb-2" />
                      <span className="text-sm font-semibold text-gray-800">Click to upload from your computer</span>
                      <span className="text-[11px] text-gray-500 mt-0.5">or drag &amp; drop an image here</span>
                      <span className="text-[10px] text-gray-400 mt-2">JPG, PNG, WebP or GIF · up to 10 MB · best at 1200 × 600 px (2:1)</span>
                    </span>
                  )}
                  {uploading && (
                    <span className="absolute inset-0 bg-white/80 flex items-center justify-center gap-2 text-xs font-semibold text-gray-700">
                      <Loader2 size={16} className="animate-spin" /> Uploading…
                    </span>
                  )}
                </label>

                <div className="flex items-center justify-between mt-2">
                  <button type="button" onClick={() => setShowUrlInput(v => !v)} className="text-[11px] text-gray-500 hover:text-gray-900 underline">
                    {showUrlInput ? 'Hide image URL' : 'Use an image URL instead'}
                  </button>
                  {form.imageUrl && (
                    <button type="button" onClick={() => setForm(prev => ({ ...prev, imageUrl: '' }))} className="text-[11px] font-semibold text-gray-500 hover:text-rose-600">
                      Remove image
                    </button>
                  )}
                </div>
                {showUrlInput && (
                  <input
                    type="text"
                    value={form.imageUrl}
                    onChange={(e) => setForm(prev => ({ ...prev, imageUrl: e.target.value }))}
                    placeholder="https://…"
                    className={`${inputClass} mt-2 text-xs`}
                  />
                )}
              </div>

              <div>
                <label className={labelClass}>When clicked, go to</label>
                <select value={linkChoice} onChange={(e) => handleLinkChoice(e.target.value)} className={inputClass}>
                  <option value="">No link (banner is not clickable)</option>
                  {linkOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  <option value={CUSTOM_LINK}>Custom link…</option>
                </select>
                {linkChoice === CUSTOM_LINK && (
                  <>
                    <input
                      type="text"
                      value={form.linkUrl}
                      onChange={(e) => setForm(prev => ({ ...prev, linkUrl: e.target.value }))}
                      placeholder="/product/vitamin-c-brightening-serum or https://instagram.com/…"
                      className={`${inputClass} mt-2`}
                    />
                    <p className="text-[10px] text-gray-400 mt-1">A page on this site (starts with /) or a full web address (starts with https://).</p>
                  </>
                )}
              </div>

              <details className="group border border-gray-200 rounded-lg" open={Boolean(form.title || form.subtitle || form.ctaLabel)}>
                <summary className="cursor-pointer select-none px-3 py-2 text-xs font-semibold uppercase tracking-wider text-gray-700">
                  Text over the image (optional)
                </summary>
                <div className="px-3 pb-3 space-y-3">
                  <p className="text-[10px] text-gray-400">Leave empty if the text is already part of your banner design.</p>
                  <div>
                    <label className={labelClass}>Headline</label>
                    <input type="text" maxLength={120} value={form.title} onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))} placeholder="e.g. Festive Sale — 20% off" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Subtext</label>
                    <input type="text" maxLength={250} value={form.subtitle} onChange={(e) => setForm(prev => ({ ...prev, subtitle: e.target.value }))} placeholder="e.g. On all skincare, this week only" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Button text</label>
                    <input type="text" maxLength={40} value={form.ctaLabel} onChange={(e) => setForm(prev => ({ ...prev, ctaLabel: e.target.value }))} placeholder="e.g. Shop now" className={inputClass} />
                  </div>
                </div>
              </details>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Start showing</label>
                  <input type="datetime-local" value={form.startsAt} onChange={(e) => setForm(prev => ({ ...prev, startsAt: e.target.value }))} className={`${inputClass} text-xs`} />
                </div>
                <div>
                  <label className={labelClass}>Stop showing</label>
                  <input type="datetime-local" value={form.endsAt} onChange={(e) => setForm(prev => ({ ...prev, endsAt: e.target.value }))} className={`${inputClass} text-xs`} />
                </div>
                <p className="sm:col-span-2 text-[10px] text-gray-400 -mt-1">Optional. Leave empty to show it until you hide or delete it.</p>
              </div>

              <label className="flex items-center gap-2 text-sm text-gray-800 cursor-pointer">
                <input type="checkbox" checked={form.isActive} onChange={(e) => setForm(prev => ({ ...prev, isActive: e.target.checked }))} className="w-4 h-4 accent-gray-900" />
                Show on homepage
              </label>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-gray-700 hover:bg-gray-100 rounded-lg">
                  Cancel
                </button>
                <button type="submit" disabled={busy || uploading} className="px-5 py-2 text-xs font-semibold uppercase tracking-wider text-white bg-gray-900 hover:bg-black rounded-lg shadow-xs disabled:opacity-50 inline-flex items-center gap-2">
                  {busy && <Loader2 size={14} className="animate-spin" />}
                  {editing ? 'Save Changes' : 'Add Slider'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Delete Slider"
        message={`Delete ${deleteTarget?.title ? `"${deleteTarget.title}"` : 'this slider'}? This cannot be undone.`}
        confirmText="Delete"
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
        loading={busy}
      />
    </AdminLayout>
  );
}
