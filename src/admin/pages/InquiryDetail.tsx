import { useState, useEffect } from 'react';
import { StatusBadge } from '../components/StatusBadge';

interface Inquiry {
  id: number;
  catering_type: string;
  status: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  special_requests: string;
  event_date: string | null;
  event_time: string | null;
  headcount: number;
  company_name: string | null;
  event_description: string | null;
  meal_type: string | null;
  bar_option: string | null;
  preferred_pickup_date: string | null;
  preferred_pickup_time: string | null;
  selectedDishes: (string | { dishId: string; quantity: number })[];
  staff_notes: string;
  estimate_low: number | null;
  estimate_high: number | null;
  submitted: boolean;
  submitted_at: string;
}

interface MenuItem {
  id: string;
  name: string;
  category: string;
  pricePerPerson: number;
}

const STATUSES = ['new', 'reviewed', 'confirmed', 'completed', 'cancelled'];

const MEAL_TYPE_LABELS: Record<string, string> = {
  'tasting': 'Tasting Menu',
  'family-style': 'Family Style',
  'buffet': 'Buffet Spread',
  'small-bites': 'Small Bites',
};

const BAR_OPTION_LABELS: Record<string, string> = {
  'cash-bar': 'Cash Bar',
  'open-bar': 'Open Bar',
  'pairings': 'Drink Pairings',
  'none': 'No Bar Service',
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-2 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-900">{value}</span>
    </div>
  );
}

export function InquiryDetail({ id, onNavigate }: { id: string; onNavigate: (path: string) => void }) {
  const [inquiry, setInquiry] = useState<Inquiry | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/inquiries/${id}`, { credentials: 'include' })
      .then((r) => r.json())
      .then((data) => { setInquiry(data); setNotes(data.staff_notes || ''); });
    fetch('/api/menu')
      .then((r) => r.json())
      .then(setMenuItems);
  }, [id]);

  const updateStatus = async (status: string) => {
    setSaving(true);
    const res = await fetch(`/api/inquiries/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    setInquiry(data);
    setSaving(false);
  };

  const saveNotes = async () => {
    setSaving(true);
    const res = await fetch(`/api/inquiries/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ staff_notes: notes }),
    });
    const data = await res.json();
    setInquiry(data);
    setSaving(false);
  };

  if (!inquiry) return <p className="text-gray-400">Loading...</p>;

  const isBuyout = inquiry.catering_type === 'buyout';
  const isGeneral = inquiry.catering_type === 'general';
  const menuItemMap = new Map(menuItems.map((m) => [m.id, m]));

  // Resolve dish names from IDs
  const resolvedDishes = inquiry.selectedDishes.map((dish) => {
    if (typeof dish === 'string') {
      // Buyout: array of dish IDs
      const item = menuItemMap.get(dish);
      return { name: item?.name ?? dish, quantity: null, price: item?.pricePerPerson ?? null };
    }
    // To-go: { dishId, quantity }
    const item = menuItemMap.get(dish.dishId);
    return { name: item?.name ?? dish.dishId, quantity: dish.quantity, price: item?.pricePerPerson ?? null };
  });

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <button onClick={() => onNavigate('/inquiries')} className="text-sm text-gray-500 hover:text-gray-900 w-fit flex items-center gap-1">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back to inquiries
      </button>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">
              {inquiry.first_name} {inquiry.last_name}
            </h1>
            <StatusBadge status={inquiry.status} />
            {!inquiry.submitted && (
              <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700 border border-amber-200">
                Draft
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {isBuyout ? 'Restaurant Buyout' : isGeneral ? 'General Inquiry' : 'To-Go Catering'}
            {' '}&middot;{' '}
            {inquiry.submitted ? 'Submitted' : 'Started'} {new Date(inquiry.submitted_at).toLocaleString()}
          </p>
        </div>
        <span className="text-sm text-gray-400 font-mono">#{inquiry.id}</span>
      </div>

      {/* Status change */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm text-gray-500">Status:</span>
        {STATUSES.map((s) => (
          <button key={s} onClick={() => updateStatus(s)} disabled={saving || inquiry.status === s}
            className={`px-3 py-1 rounded-lg text-xs font-medium capitalize border transition-colors ${
              inquiry.status === s ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-300 text-gray-600 hover:bg-gray-100'
            } disabled:opacity-50`}>
            {s}
          </button>
        ))}
      </div>

      {/* Contact info */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">Contact</h2>
        <div className="flex flex-col">
          <InfoRow label="Email" value={inquiry.email} />
          <InfoRow label="Phone" value={inquiry.phone || '—'} />
          {!isGeneral && <InfoRow label="Headcount" value={`${inquiry.headcount} ${inquiry.headcount === 1 ? 'person' : 'people'}`} />}
          {inquiry.company_name && <InfoRow label="Company" value={inquiry.company_name} />}
        </div>
      </div>

      {/* Event / Pickup details */}
      {!isGeneral && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">
            {isBuyout ? 'Event Details' : 'Pickup Details'}
          </h2>
          <div className="flex flex-col">
            {isBuyout ? (
              <>
                {inquiry.event_date && <InfoRow label="Date" value={inquiry.event_date} />}
                {inquiry.event_time && <InfoRow label="Time" value={inquiry.event_time} />}
                {inquiry.meal_type && <InfoRow label="Meal Type" value={MEAL_TYPE_LABELS[inquiry.meal_type] ?? inquiry.meal_type} />}
                {inquiry.bar_option && <InfoRow label="Bar Option" value={BAR_OPTION_LABELS[inquiry.bar_option] ?? inquiry.bar_option} />}
                {inquiry.event_description && (
                  <div className="pt-3 mt-1 border-t border-gray-100">
                    <span className="text-sm text-gray-500">Description</span>
                    <p className="text-sm text-gray-900 mt-1">{inquiry.event_description}</p>
                  </div>
                )}
              </>
            ) : (
              <>
                {inquiry.preferred_pickup_date && <InfoRow label="Pickup Date" value={inquiry.preferred_pickup_date} />}
                {inquiry.preferred_pickup_time && <InfoRow label="Pickup Time" value={inquiry.preferred_pickup_time} />}
              </>
            )}
          </div>
        </div>
      )}

      {/* Selected dishes */}
      {resolvedDishes.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">Selected Dishes</h2>
          <div className="flex flex-col divide-y divide-gray-100">
            {resolvedDishes.map((dish, i) => (
              <div key={i} className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-900">{dish.name}</span>
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  {dish.quantity != null && (
                    <span>&times; {dish.quantity}</span>
                  )}
                  {dish.price != null && (
                    <span className="text-gray-400">{formatCurrency(dish.price)}/pp</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Estimates */}
      {(inquiry.estimate_low != null || inquiry.estimate_high != null) && (inquiry.estimate_low || inquiry.estimate_high) && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">Estimate</h2>
          <p className="text-lg font-semibold text-gray-900">
            {inquiry.estimate_low != null && inquiry.estimate_high != null && inquiry.estimate_low !== inquiry.estimate_high
              ? `${formatCurrency(inquiry.estimate_low)} – ${formatCurrency(inquiry.estimate_high)}`
              : formatCurrency(inquiry.estimate_low ?? inquiry.estimate_high ?? 0)
            }
          </p>
        </div>
      )}

      {/* Special requests */}
      {inquiry.special_requests && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">
            {isGeneral ? 'Message' : 'Special Requests'}
          </h2>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{inquiry.special_requests}</p>
        </div>
      )}

      {/* Staff notes */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">Staff Notes</h2>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-400" placeholder="Add internal notes..." />
        <button onClick={saveNotes} disabled={saving}
          className="mt-2 px-4 py-2 rounded-lg text-sm bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50 transition-colors">
          {saving ? 'Saving...' : 'Save Notes'}
        </button>
      </div>
    </div>
  );
}
