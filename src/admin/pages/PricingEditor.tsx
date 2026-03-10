import { useState, useEffect } from 'react';

interface PricingTier {
  id: number;
  type: string;
  key: string;
  label: string;
  description: string;
  pricePerPersonLow: number;
  pricePerPersonHigh: number;
  minimumHeadcount: number | null;
  includedCourses: number | null;
}

export function PricingEditor() {
  const [tiers, setTiers] = useState<PricingTier[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<PricingTier>>({});
  const [saving, setSaving] = useState(false);

  const fetchTiers = () => {
    fetch('/api/pricing').then((r) => r.json()).then(setTiers);
  };

  useEffect(() => { fetchTiers(); }, []);

  const mealTiers = tiers.filter((t) => t.type === 'meal');
  const barTiers = tiers.filter((t) => t.type === 'bar');

  const startEdit = (tier: PricingTier) => {
    setEditing(tier.key);
    setForm({ ...tier });
  };

  const cancelEdit = () => {
    setEditing(null);
    setForm({});
  };

  const save = async () => {
    if (!editing) return;
    setSaving(true);
    await fetch(`/api/pricing/${editing}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setSaving(false);
    setEditing(null);
    fetchTiers();
  };

  const renderTable = (title: string, items: PricingTier[], showMealFields: boolean) => (
    <div>
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">{title}</h2>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
            <tr>
              <th className="px-4 py-2 text-left">Label</th>
              <th className="px-4 py-2 text-left">Price Range (per person)</th>
              {showMealFields && <th className="px-4 py-2 text-center">Min Guests</th>}
              {showMealFields && <th className="px-4 py-2 text-center">Courses</th>}
              <th className="px-4 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.map((tier) => (
              <tr key={tier.key} className="hover:bg-gray-50">
                {editing === tier.key ? (
                  <>
                    <td className="px-4 py-3">
                      <input value={form.label || ''} onChange={(e) => setForm({ ...form, label: e.target.value })}
                        className="w-full rounded border border-gray-300 px-2 py-1 text-sm" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <span className="text-gray-400">$</span>
                        <input type="number" value={form.pricePerPersonLow ?? 0}
                          onChange={(e) => setForm({ ...form, pricePerPersonLow: Number(e.target.value) })}
                          className="w-16 rounded border border-gray-300 px-2 py-1 text-sm" />
                        <span className="text-gray-400">&ndash; $</span>
                        <input type="number" value={form.pricePerPersonHigh ?? 0}
                          onChange={(e) => setForm({ ...form, pricePerPersonHigh: Number(e.target.value) })}
                          className="w-16 rounded border border-gray-300 px-2 py-1 text-sm" />
                      </div>
                    </td>
                    {showMealFields && (
                      <td className="px-4 py-3 text-center">
                        <input type="number" value={form.minimumHeadcount ?? 0}
                          onChange={(e) => setForm({ ...form, minimumHeadcount: Number(e.target.value) })}
                          className="w-16 mx-auto rounded border border-gray-300 px-2 py-1 text-sm text-center" />
                      </td>
                    )}
                    {showMealFields && (
                      <td className="px-4 py-3 text-center">
                        <input type="number" value={form.includedCourses ?? 0}
                          onChange={(e) => setForm({ ...form, includedCourses: Number(e.target.value) })}
                          className="w-16 mx-auto rounded border border-gray-300 px-2 py-1 text-sm text-center" />
                      </td>
                    )}
                    <td className="px-4 py-3 text-right">
                      <button onClick={save} disabled={saving} className="text-green-600 hover:text-green-800 text-xs mr-3">Save</button>
                      <button onClick={cancelEdit} className="text-gray-500 hover:text-gray-900 text-xs">Cancel</button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{tier.label}</div>
                      <div className="text-xs text-gray-500">{tier.description}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {tier.pricePerPersonLow === 0 && tier.pricePerPersonHigh === 0
                        ? 'No cost'
                        : `$${tier.pricePerPersonLow} – $${tier.pricePerPersonHigh}`}
                    </td>
                    {showMealFields && <td className="px-4 py-3 text-center text-gray-700">{tier.minimumHeadcount ?? '—'}</td>}
                    {showMealFields && <td className="px-4 py-3 text-center text-gray-700">{tier.includedCourses ?? '—'}</td>}
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => startEdit(tier)} className="text-gray-500 hover:text-gray-900 text-xs">Edit</button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-bold text-gray-900">Pricing Editor</h1>
      {renderTable('Meal Types', mealTiers, true)}
      {renderTable('Bar Options', barTiers, false)}
    </div>
  );
}
