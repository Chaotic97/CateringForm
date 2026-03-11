import { useState, useEffect } from 'react';

interface RentalFee {
  dayOfWeek: number;
  dayLabel: string;
  fee: number;
}

interface RecommendedTier {
  maxHeadcount: number;
  count: number;
}

type RecommendedDishes = Record<string, RecommendedTier[]>;

const CATEGORY_LABELS: Record<string, string> = {
  appetizer: 'Appetizers',
  soup: 'Soups',
  entree: 'Entrées',
  side: 'Sides',
  'noodles-rice': 'Noodles & Rice',
  dessert: 'Desserts',
};

const CATEGORY_ORDER = ['appetizer', 'soup', 'entree', 'side', 'noodles-rice', 'dessert'];

export function Settings() {
  const [buyoutDesc, setBuyoutDesc] = useState('');
  const [togoDesc, setTogoDesc] = useState('');
  const [generalDesc, setGeneralDesc] = useState('');
  const [categoryLabels, setCategoryLabels] = useState<Record<string, string>>({ ...CATEGORY_LABELS });
  const [recommended, setRecommended] = useState<RecommendedDishes>({});
  const [rentalFees, setRentalFees] = useState<RentalFee[]>([]);
  const [saving, setSaving] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/settings', { credentials: 'same-origin' }).then((r) => r.json()),
      fetch('/api/settings/rental-fees', { credentials: 'same-origin' }).then((r) => r.json()),
    ]).then(([settings, fees]: [Record<string, string>, RentalFee[]]) => {
      setBuyoutDesc(settings.buyout_description || '');
      setTogoDesc(settings.togo_description || '');
      setGeneralDesc(settings.general_description || '');
      try {
        setCategoryLabels(settings.category_labels ? { ...CATEGORY_LABELS, ...JSON.parse(settings.category_labels) } : { ...CATEGORY_LABELS });
      } catch { setCategoryLabels({ ...CATEGORY_LABELS }); }
      try {
        setRecommended(settings.recommended_dishes ? JSON.parse(settings.recommended_dishes) : {});
      } catch { setRecommended({}); }
      setRentalFees(fees);
    });
  }, []);

  const flash = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(null), 2000);
  };

  const saveDescription = async (key: string, value: string) => {
    setSaving(key);
    await fetch(`/api/settings/${key}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({ value }),
    });
    setSaving(null);
    flash('Saved');
  };

  const saveRecommended = async () => {
    setSaving('recommended');
    await fetch('/api/settings/recommended_dishes', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({ value: JSON.stringify(recommended) }),
    });
    setSaving(null);
    flash('Recommended dishes saved');
  };

  const saveRentalFee = async (dayOfWeek: number, fee: number) => {
    setSaving(`rental-${dayOfWeek}`);
    await fetch(`/api/settings/rental-fees/${dayOfWeek}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({ fee }),
    });
    setSaving(null);
    flash('Rental fee saved');
  };

  const updateTier = (category: string, tierIndex: number, field: 'maxHeadcount' | 'count', value: number) => {
    setRecommended((prev) => {
      const tiers = [...(prev[category] || [])];
      tiers[tierIndex] = { ...tiers[tierIndex], [field]: value };
      return { ...prev, [category]: tiers };
    });
  };

  const addTier = (category: string) => {
    setRecommended((prev) => {
      const tiers = [...(prev[category] || [])];
      const lastMax = tiers.length > 0 ? tiers[tiers.length - 1].maxHeadcount : 0;
      tiers.push({ maxHeadcount: lastMax + 20, count: tiers.length > 0 ? tiers[tiers.length - 1].count + 1 : 1 });
      return { ...prev, [category]: tiers };
    });
  };

  const removeTier = (category: string, tierIndex: number) => {
    setRecommended((prev) => {
      const tiers = [...(prev[category] || [])];
      tiers.splice(tierIndex, 1);
      return { ...prev, [category]: tiers };
    });
  };

  return (
    <div className="flex flex-col gap-8 max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>

      {message && (
        <div className="bg-green-50 text-green-700 text-sm px-4 py-2 rounded-lg border border-green-200">
          {message}
        </div>
      )}

      {/* Welcome Page Descriptions */}
      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Welcome Page Descriptions</h2>
        <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Restaurant Buyout</label>
            <textarea
              value={buyoutDesc}
              onChange={(e) => setBuyoutDesc(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
            <button
              onClick={() => saveDescription('buyout_description', buyoutDesc)}
              disabled={saving === 'buyout_description'}
              className="mt-1 text-xs text-white bg-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-800 disabled:opacity-50"
            >
              {saving === 'buyout_description' ? 'Saving...' : 'Save'}
            </button>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">To-Go Catering</label>
            <textarea
              value={togoDesc}
              onChange={(e) => setTogoDesc(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
            <button
              onClick={() => saveDescription('togo_description', togoDesc)}
              disabled={saving === 'togo_description'}
              className="mt-1 text-xs text-white bg-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-800 disabled:opacity-50"
            >
              {saving === 'togo_description' ? 'Saving...' : 'Save'}
            </button>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Contact Our Team</label>
            <textarea
              value={generalDesc}
              onChange={(e) => setGeneralDesc(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
            <button
              onClick={() => saveDescription('general_description', generalDesc)}
              disabled={saving === 'general_description'}
              className="mt-1 text-xs text-white bg-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-800 disabled:opacity-50"
            >
              {saving === 'general_description' ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </section>

      {/* Category Names */}
      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Menu Category Names</h2>
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="px-4 py-2 text-left">Category Key</th>
                <th className="px-4 py-2 text-left">Display Name</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {CATEGORY_ORDER.map((cat) => (
                <tr key={cat} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-500 text-xs font-mono">{cat}</td>
                  <td className="px-4 py-3">
                    <input
                      value={categoryLabels[cat] || ''}
                      onChange={(e) => setCategoryLabels((prev) => ({ ...prev, [cat]: e.target.value }))}
                      className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button
          onClick={async () => {
            setSaving('category_labels');
            await fetch('/api/settings/category_labels', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'same-origin',
              body: JSON.stringify({ value: JSON.stringify(categoryLabels) }),
            });
            setSaving(null);
            flash('Category names saved');
          }}
          disabled={saving === 'category_labels'}
          className="self-start text-sm text-white bg-gray-900 px-4 py-2 rounded-lg hover:bg-gray-800 disabled:opacity-50"
        >
          {saving === 'category_labels' ? 'Saving...' : 'Save Category Names'}
        </button>
      </section>

      {/* Rental Fees */}
      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Venue Rental Fees</h2>
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="px-4 py-2 text-left">Day</th>
                <th className="px-4 py-2 text-left">Fee</th>
                <th className="px-4 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rentalFees.map((fee) => (
                <tr key={fee.dayOfWeek} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{fee.dayLabel}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <span className="text-gray-400">$</span>
                      <input
                        type="number"
                        value={fee.fee}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setRentalFees((prev) => prev.map((f) => f.dayOfWeek === fee.dayOfWeek ? { ...f, fee: val } : f));
                        }}
                        className="w-24 rounded border border-gray-300 px-2 py-1 text-sm"
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => saveRentalFee(fee.dayOfWeek, fee.fee)}
                      disabled={saving === `rental-${fee.dayOfWeek}`}
                      className="text-xs text-green-600 hover:text-green-800 disabled:opacity-50"
                    >
                      {saving === `rental-${fee.dayOfWeek}` ? 'Saving...' : 'Save'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Recommended Dishes */}
      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Recommended Dish Counts</h2>
        <p className="text-xs text-gray-500 -mt-2">
          Set how many dishes to recommend per category based on guest count. Each tier applies to headcounts up to its max.
        </p>
        <div className="flex flex-col gap-4">
          {CATEGORY_ORDER.map((category) => (
            <div key={category} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900">{CATEGORY_LABELS[category]}</h3>
                <button
                  onClick={() => addTier(category)}
                  className="text-xs text-gray-500 hover:text-gray-900"
                >
                  + Add tier
                </button>
              </div>
              {(recommended[category] || []).length === 0 ? (
                <p className="text-xs text-gray-400">No tiers configured</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {(recommended[category] || []).map((tier, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm">
                      <span className="text-gray-500 text-xs w-24">Up to</span>
                      <input
                        type="number"
                        value={tier.maxHeadcount}
                        onChange={(e) => updateTier(category, i, 'maxHeadcount', Number(e.target.value))}
                        className="w-16 rounded border border-gray-300 px-2 py-1 text-sm text-center"
                      />
                      <span className="text-gray-500 text-xs">guests →</span>
                      <input
                        type="number"
                        value={tier.count}
                        onChange={(e) => updateTier(category, i, 'count', Number(e.target.value))}
                        className="w-14 rounded border border-gray-300 px-2 py-1 text-sm text-center"
                      />
                      <span className="text-gray-500 text-xs">dishes</span>
                      <button
                        onClick={() => removeTier(category, i)}
                        className="text-xs text-red-400 hover:text-red-600 ml-auto"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
        <button
          onClick={saveRecommended}
          disabled={saving === 'recommended'}
          className="self-start text-sm text-white bg-gray-900 px-4 py-2 rounded-lg hover:bg-gray-800 disabled:opacity-50"
        >
          {saving === 'recommended' ? 'Saving...' : 'Save Recommended Dishes'}
        </button>
      </section>
    </div>
  );
}
