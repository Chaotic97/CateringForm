import { useState, useEffect } from 'react';
import { MenuItemForm } from '../components/MenuItemForm';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  category: string;
  pricePerPerson: number;
  isSignature: boolean;
  isPremium: boolean;
  dietaryTags: string[];
  allergens: string[];
  available: boolean;
  sortOrder: number;
}

const CATEGORY_LABELS: Record<string, string> = {
  appetizer: 'Appetizers',
  soup: 'Soups',
  entree: 'Entrées',
  side: 'Sides',
  'noodles-rice': 'Noodles & Rice',
  dessert: 'Desserts',
};

const CATEGORY_ORDER = ['appetizer', 'soup', 'entree', 'side', 'noodles-rice', 'dessert'];

export function MenuManager() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [editing, setEditing] = useState<MenuItem | null>(null);
  const [showForm, setShowForm] = useState(false);

  const fetchItems = () => {
    fetch('/api/menu').then((r) => r.json()).then(setItems);
  };

  useEffect(() => { fetchItems(); }, []);

  const handleSave = async (data: Omit<MenuItem, 'sortOrder'>) => {
    const isEdit = editing !== null;
    const url = isEdit ? `/api/menu/${data.id}` : '/api/menu';
    const method = isEdit ? 'PUT' : 'POST';

    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    setShowForm(false);
    setEditing(null);
    fetchItems();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this dish?')) return;
    await fetch(`/api/menu/${id}`, { method: 'DELETE' });
    fetchItems();
  };

  const toggleAvailable = async (item: MenuItem) => {
    await fetch(`/api/menu/${item.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ available: !item.available }),
    });
    fetchItems();
  };

  const grouped = CATEGORY_ORDER.map((cat) => ({
    category: cat,
    label: CATEGORY_LABELS[cat] || cat,
    items: items.filter((i) => i.category === cat),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Menu Manager</h1>
        <button onClick={() => { setEditing(null); setShowForm(true); }}
          className="px-4 py-2 rounded-lg text-sm bg-gray-900 text-white hover:bg-gray-800">
          Add Dish
        </button>
      </div>

      {grouped.map((group) => (
        <div key={group.category}>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">{group.label}</h2>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                <tr>
                  <th className="px-4 py-2 text-left">Name</th>
                  <th className="px-4 py-2 text-left">Price</th>
                  <th className="px-4 py-2 text-center">Signature</th>
                  <th className="px-4 py-2 text-center">Available</th>
                  <th className="px-4 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {group.items.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{item.name}</div>
                      <div className="text-xs text-gray-500">{item.description}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-700">${item.pricePerPerson}</td>
                    <td className="px-4 py-3 text-center">{item.isSignature ? '★' : ''}</td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => toggleAvailable(item)}
                        className={`w-8 h-5 rounded-full relative transition-colors ${item.available ? 'bg-green-500' : 'bg-gray-300'}`}>
                        <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${item.available ? 'left-3.5' : 'left-0.5'}`} />
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => { setEditing(item); setShowForm(true); }} className="text-gray-500 hover:text-gray-900 text-xs mr-3">Edit</button>
                      <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-700 text-xs">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      {showForm && (
        <MenuItemForm
          item={editing}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditing(null); }}
        />
      )}
    </div>
  );
}
