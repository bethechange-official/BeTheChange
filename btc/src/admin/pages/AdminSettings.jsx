import { useState, useEffect } from 'react';
import { Save, CheckCircle2, Store, Truck, ShieldAlert } from 'lucide-react';
import { AdminLayout } from '../components/AdminLayout';
import { adminStorage } from '../utils/localStorageHelpers';

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    storeName: 'Be The Change (BTC)',
    storeEmail: 'contact@bethechange.com',
    storePhone: '+91 98765 43210',
    storeAddress: '12 Botanical Avenue, Jubilee Hills, Hyderabad, Telangana 500033',
    shippingFee: 50,
    freeShippingThreshold: 999,
    lowStockAlertThreshold: 5,
    currency: 'INR'
  });

  const [toastMsg, setToastMsg] = useState('');

  useEffect(() => {
    setSettings(adminStorage.getSettings());
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    adminStorage.saveSettings(settings);
    setToastMsg('Store settings saved successfully!');
    setTimeout(() => setToastMsg(''), 3000);
  };

  return (
    <AdminLayout title="Store Settings">
      <div className="max-w-4xl mx-auto">
        {toastMsg && (
          <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 size={16} />
            <span>{toastMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* General Store Information */}
          <div className="bg-white border border-gray-200/80 rounded-xl p-6 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
              <Store size={18} className="text-gray-700" />
              <h3 className="text-base font-bold text-gray-900 font-serif">General Store Information</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">Store Name *</label>
                <input
                  type="text"
                  required
                  value={settings.storeName}
                  onChange={(e) => setSettings(prev => ({ ...prev, storeName: e.target.value }))}
                  className="w-full bg-gray-50 border border-gray-200 focus:border-gray-900 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">Store Email *</label>
                <input
                  type="email"
                  required
                  value={settings.storeEmail}
                  onChange={(e) => setSettings(prev => ({ ...prev, storeEmail: e.target.value }))}
                  className="w-full bg-gray-50 border border-gray-200 focus:border-gray-900 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">Store Phone *</label>
                <input
                  type="text"
                  required
                  value={settings.storePhone}
                  onChange={(e) => setSettings(prev => ({ ...prev, storePhone: e.target.value }))}
                  className="w-full bg-gray-50 border border-gray-200 focus:border-gray-900 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">Currency Code</label>
                <input
                  type="text"
                  required
                  value={settings.currency}
                  onChange={(e) => setSettings(prev => ({ ...prev, currency: e.target.value }))}
                  className="w-full bg-gray-50 border border-gray-200 focus:border-gray-900 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none font-mono text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">Store Address</label>
              <textarea
                rows={2}
                value={settings.storeAddress}
                onChange={(e) => setSettings(prev => ({ ...prev, storeAddress: e.target.value }))}
                className="w-full bg-gray-50 border border-gray-200 focus:border-gray-900 rounded-lg p-3 text-xs text-gray-900 focus:outline-none"
              />
            </div>
          </div>

          {/* Shipping & Fulfillment */}
          <div className="bg-white border border-gray-200/80 rounded-xl p-6 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
              <Truck size={18} className="text-gray-700" />
              <h3 className="text-base font-bold text-gray-900 font-serif">Shipping & Logistics Config</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">Flat Shipping Fee (₹)</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={settings.shippingFee}
                  onChange={(e) => setSettings(prev => ({ ...prev, shippingFee: Number(e.target.value) }))}
                  className="w-full bg-gray-50 border border-gray-200 focus:border-gray-900 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">Free Shipping Minimum Amount (₹)</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={settings.freeShippingThreshold}
                  onChange={(e) => setSettings(prev => ({ ...prev, freeShippingThreshold: Number(e.target.value) }))}
                  className="w-full bg-gray-50 border border-gray-200 focus:border-gray-900 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Inventory Alerts Config */}
          <div className="bg-white border border-gray-200/80 rounded-xl p-6 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
              <ShieldAlert size={18} className="text-gray-700" />
              <h3 className="text-base font-bold text-gray-900 font-serif">Inventory & System Alerts</h3>
            </div>

            <div className="max-w-xs">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">Low Stock Alert Quantity</label>
              <input
                type="number"
                required
                min="1"
                value={settings.lowStockAlertThreshold}
                onChange={(e) => setSettings(prev => ({ ...prev, lowStockAlertThreshold: Number(e.target.value) }))}
                className="w-full bg-gray-50 border border-gray-200 focus:border-gray-900 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none"
              />
              <p className="text-[10px] text-gray-400 mt-1">Products with stock at or below this count will trigger dashboard warnings.</p>
            </div>
          </div>

          {/* Save Action */}
          <div className="flex items-center justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-2 bg-gray-900 hover:bg-black text-white px-6 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all shadow-md active:scale-[0.99]"
            >
              <Save size={16} />
              <span>Save Settings</span>
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
