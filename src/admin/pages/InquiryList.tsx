import { useState, useEffect } from 'react';
import { StatusBadge } from '../components/StatusBadge';

interface InquiryRow {
  id: number;
  catering_type: string;
  status: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  headcount: number;
  submitted: boolean;
  submitted_at: string;
}

interface InquiryListResponse {
  inquiries: InquiryRow[];
  total: number;
  page: number;
  totalPages: number;
}

const STATUSES = ['all', 'new', 'reviewed', 'confirmed', 'completed', 'cancelled'];

export function InquiryList({ onNavigate, initialStatus }: { onNavigate: (path: string) => void; initialStatus?: string }) {
  const [status, setStatus] = useState(initialStatus || 'all');
  const [page, setPage] = useState(1);
  const [data, setData] = useState<InquiryListResponse | null>(null);

  useEffect(() => {
    const params = new URLSearchParams();
    if (status !== 'all') params.set('status', status);
    params.set('page', String(page));
    fetch(`/api/inquiries?${params}`)
      .then((r) => r.json())
      .then(setData);
  }, [status, page]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-gray-900">Inquiries</h1>

      {/* Filter tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit">
        {STATUSES.map((s) => (
          <button key={s} onClick={() => { setStatus(s); setPage(1); }}
            className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-colors ${
              status === s ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}>
            {s}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
            <tr>
              <th className="px-4 py-3 text-left">#</th>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Type</th>
              <th className="px-4 py-3 text-left">Guests</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Submitted</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data?.inquiries.map((inq) => (
              <tr key={inq.id} onClick={() => onNavigate(`/inquiries/${inq.id}`)}
                className="hover:bg-gray-50 cursor-pointer">
                <td className="px-4 py-3 text-gray-400">{inq.id}</td>
                <td className="px-4 py-3 font-medium text-gray-900">{inq.first_name} {inq.last_name}</td>
                <td className="px-4 py-3 text-gray-600">{inq.email}</td>
                <td className="px-4 py-3 text-gray-600">
                  {inq.catering_type === 'buyout' ? 'Buyout' : inq.catering_type === 'general' ? 'General' : 'To-Go'}
                  {!inq.submitted && <span className="ml-1.5 text-xs text-amber-600">(Draft)</span>}
                </td>
                <td className="px-4 py-3 text-gray-600">{inq.headcount}</td>
                <td className="px-4 py-3"><StatusBadge status={inq.status} /></td>
                <td className="px-4 py-3 text-gray-500">{new Date(inq.submitted_at).toLocaleDateString()}</td>
              </tr>
            ))}
            {data && data.inquiries.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">No inquiries found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center gap-2 justify-center">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
            className="px-3 py-1.5 rounded-lg text-sm border border-gray-300 disabled:opacity-30">
            Prev
          </button>
          <span className="text-sm text-gray-500">Page {page} of {data.totalPages}</span>
          <button onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))} disabled={page === data.totalPages}
            className="px-3 py-1.5 rounded-lg text-sm border border-gray-300 disabled:opacity-30">
            Next
          </button>
        </div>
      )}
    </div>
  );
}
