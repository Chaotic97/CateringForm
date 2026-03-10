import { useApi } from '../hooks/useApi';
import { StatusBadge } from '../components/StatusBadge';

interface InquiryRow {
  id: number;
  catering_type: string;
  status: string;
  first_name: string;
  last_name: string;
  email: string;
  headcount: number;
  submitted_at: string;
}

interface InquiryListResponse {
  inquiries: InquiryRow[];
  total: number;
}

export function Dashboard({ onNavigate }: { onNavigate: (path: string) => void }) {
  const { data: stats } = useApi<Record<string, number>>('/api/inquiries/stats');
  const { data: recent } = useApi<InquiryListResponse>('/api/inquiries?page=1');

  const statCards = [
    { key: 'new', label: 'New', color: 'bg-blue-500' },
    { key: 'reviewed', label: 'Reviewed', color: 'bg-yellow-500' },
    { key: 'confirmed', label: 'Confirmed', color: 'bg-green-500' },
    { key: 'completed', label: 'Completed', color: 'bg-gray-500' },
  ];

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

      {/* Status cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <button key={card.key} onClick={() => onNavigate(`/inquiries?status=${card.key}`)}
            className="bg-white rounded-xl border border-gray-200 p-5 text-left hover:shadow-sm transition-shadow">
            <div className={`w-2 h-2 rounded-full ${card.color} mb-3`} />
            <p className="text-2xl font-bold text-gray-900">{stats?.[card.key] ?? 0}</p>
            <p className="text-sm text-gray-500 mt-1">{card.label}</p>
          </button>
        ))}
      </div>

      {/* Recent inquiries */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Inquiries</h2>
          <button onClick={() => onNavigate('/inquiries')} className="text-sm text-gray-500 hover:text-gray-900">
            View all
          </button>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Type</th>
                <th className="px-4 py-3 text-left">Headcount</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Submitted</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recent?.inquiries.slice(0, 5).map((inq) => (
                <tr key={inq.id} onClick={() => onNavigate(`/inquiries/${inq.id}`)}
                  className="hover:bg-gray-50 cursor-pointer">
                  <td className="px-4 py-3 font-medium text-gray-900">{inq.first_name} {inq.last_name}</td>
                  <td className="px-4 py-3 capitalize text-gray-600">{inq.catering_type === 'buyout' ? 'Buyout' : 'To-Go'}</td>
                  <td className="px-4 py-3 text-gray-600">{inq.headcount}</td>
                  <td className="px-4 py-3"><StatusBadge status={inq.status} /></td>
                  <td className="px-4 py-3 text-gray-500">{new Date(inq.submitted_at).toLocaleDateString()}</td>
                </tr>
              ))}
              {(!recent || recent.inquiries.length === 0) && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">No inquiries yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
