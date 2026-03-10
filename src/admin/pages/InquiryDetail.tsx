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
  selectedDishes: unknown[];
  staff_notes: string;
  estimate_low: number | null;
  estimate_high: number | null;
  submitted_at: string;
}

const STATUSES = ['new', 'reviewed', 'confirmed', 'completed', 'cancelled'];

export function InquiryDetail({ id, onNavigate }: { id: string; onNavigate: (path: string) => void }) {
  const [inquiry, setInquiry] = useState<Inquiry | null>(null);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/inquiries/${id}`)
      .then((r) => r.json())
      .then((data) => { setInquiry(data); setNotes(data.staff_notes || ''); });
  }, [id]);

  const updateStatus = async (status: string) => {
    setSaving(true);
    const res = await fetch(`/api/inquiries/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
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
      body: JSON.stringify({ staff_notes: notes }),
    });
    const data = await res.json();
    setInquiry(data);
    setSaving(false);
  };

  if (!inquiry) return <p className="text-gray-400">Loading...</p>;

  const isBuyout = inquiry.catering_type === 'buyout';

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <button onClick={() => onNavigate('/inquiries')} className="text-sm text-gray-500 hover:text-gray-900 w-fit">
        &larr; Back to inquiries
      </button>

      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">
          {inquiry.first_name} {inquiry.last_name}
        </h1>
        <StatusBadge status={inquiry.status} />
      </div>

      <p className="text-sm text-gray-500">
        {isBuyout ? 'Restaurant Buyout' : 'To-Go Catering'} &middot; Submitted {new Date(inquiry.submitted_at).toLocaleString()}
      </p>

      {/* Status change */}
      <div className="flex items-center gap-2">
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
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div><span className="text-gray-500">Email:</span> <span className="text-gray-900">{inquiry.email}</span></div>
          <div><span className="text-gray-500">Phone:</span> <span className="text-gray-900">{inquiry.phone}</span></div>
          <div><span className="text-gray-500">Headcount:</span> <span className="text-gray-900">{inquiry.headcount}</span></div>
          {inquiry.company_name && <div><span className="text-gray-500">Company:</span> <span className="text-gray-900">{inquiry.company_name}</span></div>}
        </div>
      </div>

      {/* Event details */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">
          {isBuyout ? 'Event Details' : 'Pickup Details'}
        </h2>
        <div className="grid grid-cols-2 gap-3 text-sm">
          {isBuyout ? (
            <>
              {inquiry.event_date && <div><span className="text-gray-500">Date:</span> <span className="text-gray-900">{inquiry.event_date}</span></div>}
              {inquiry.event_time && <div><span className="text-gray-500">Time:</span> <span className="text-gray-900">{inquiry.event_time}</span></div>}
              {inquiry.meal_type && <div><span className="text-gray-500">Meal Type:</span> <span className="text-gray-900 capitalize">{inquiry.meal_type}</span></div>}
              {inquiry.bar_option && <div><span className="text-gray-500">Bar:</span> <span className="text-gray-900 capitalize">{inquiry.bar_option}</span></div>}
              {inquiry.event_description && <div className="col-span-2"><span className="text-gray-500">Description:</span> <span className="text-gray-900">{inquiry.event_description}</span></div>}
            </>
          ) : (
            <>
              {inquiry.preferred_pickup_date && <div><span className="text-gray-500">Pickup Date:</span> <span className="text-gray-900">{inquiry.preferred_pickup_date}</span></div>}
              {inquiry.preferred_pickup_time && <div><span className="text-gray-500">Pickup Time:</span> <span className="text-gray-900">{inquiry.preferred_pickup_time}</span></div>}
            </>
          )}
        </div>
      </div>

      {/* Selected dishes */}
      {inquiry.selectedDishes.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">Selected Dishes</h2>
          <div className="text-sm text-gray-700">
            <pre className="whitespace-pre-wrap font-sans">{JSON.stringify(inquiry.selectedDishes, null, 2)}</pre>
          </div>
        </div>
      )}

      {/* Estimates */}
      {(inquiry.estimate_low || inquiry.estimate_high) && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">Estimate</h2>
          <p className="text-sm text-gray-700">
            ${inquiry.estimate_low?.toLocaleString()} &ndash; ${inquiry.estimate_high?.toLocaleString()}
          </p>
        </div>
      )}

      {/* Special requests */}
      {inquiry.special_requests && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">Special Requests</h2>
          <p className="text-sm text-gray-700">{inquiry.special_requests}</p>
        </div>
      )}

      {/* Staff notes */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">Staff Notes</h2>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" placeholder="Add internal notes..." />
        <button onClick={saveNotes} disabled={saving}
          className="mt-2 px-4 py-2 rounded-lg text-sm bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50">
          {saving ? 'Saving...' : 'Save Notes'}
        </button>
      </div>
    </div>
  );
}
