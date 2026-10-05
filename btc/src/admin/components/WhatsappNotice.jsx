import { useState } from 'react';
import { MessageCircle, RefreshCw } from 'lucide-react';
import { adminOrderService } from '../../services/admin/orderService';

const STYLES = {
  SENT: 'bg-emerald-50 border-emerald-200 text-emerald-800',
  FAILED: 'bg-rose-50 border-rose-200 text-rose-800',
  NOT_CONFIGURED: 'bg-amber-50 border-amber-200 text-amber-800',
  NOT_SENT: 'bg-gray-50 border-gray-200 text-gray-700',
};

/** Shows whether the admin WhatsApp alert for this order went out, with a Resend button. */
export function WhatsappNotice({ order, onChange }) {
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  // No status = never attempted (e.g. orders placed before WhatsApp alerts existed).
  const status = order.whatsappStatus || 'NOT_SENT';

  const resend = async () => {
    setSending(true);
    setError('');
    try {
      const response = await adminOrderService.resendWhatsapp(order.id);
      onChange(response.data);
    } catch (err) {
      setError(err.message || 'Could not send WhatsApp notification');
      onChange({ whatsappStatus: /not set up/i.test(err.message || '') ? 'NOT_CONFIGURED' : 'FAILED', whatsappError: err.message });
    } finally {
      setSending(false);
    }
  };

  const label = {
    SENT: `Sent to admin WhatsApp${order.whatsappSentAt ? ` · ${new Date(order.whatsappSentAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}` : ''}`,
    FAILED: 'Failed to send',
    NOT_CONFIGURED: 'Not sent — WhatsApp not set up',
    NOT_SENT: 'WhatsApp alert not sent',
  }[status] || status;
  const action = { SENT: 'Resend', NOT_SENT: 'Send now' }[status] || 'Retry';

  return (
    <div className={`text-xs border rounded-lg px-3 py-2 max-w-xs ${STYLES[status] || STYLES.NOT_SENT}`}>
      <div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-1.5 font-semibold">
          <MessageCircle size={13} /> {label}
        </span>
        <button
          type="button"
          onClick={resend}
          disabled={sending}
          className="flex items-center gap-1 underline disabled:opacity-50 flex-shrink-0"
        >
          <RefreshCw size={11} className={sending ? 'animate-spin' : ''} /> {sending ? 'Sending…' : action}
        </button>
      </div>
      {(error || (status !== 'SENT' && order.whatsappError)) && (
        <p className="mt-1 font-normal break-words">{error || order.whatsappError}</p>
      )}
    </div>
  );
}
