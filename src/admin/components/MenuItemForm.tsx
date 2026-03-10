import { useState } from 'react';

interface MenuItemFormData {
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
}

interface MenuItemFormProps {
  item?: MenuItemFormData | null;
  onSave: (data: MenuItemFormData) => void;
  onCancel: () => void;
}

const CATEGORIES = ['appetizer', 'soup', 'entree', 'side', 'noodles-rice', 'dessert'];
const DIETARY_OPTIONS = ['vegetarian', 'vegan', 'gluten-free', 'contains-nuts', 'spicy'];
const ALLERGEN_OPTIONS = ['shellfish', 'dairy', 'soy', 'eggs', 'wheat', 'peanuts', 'tree-nuts', 'sesame', 'fish'];

export function MenuItemForm({ item, onSave, onCancel }: MenuItemFormProps) {
  const [id, setId] = useState(item?.id || '');
  const [name, setName] = useState(item?.name || '');
  const [description, setDescription] = useState(item?.description || '');
  const [category, setCategory] = useState(item?.category || 'appetizer');
  const [pricePerPerson, setPricePerPerson] = useState(item?.pricePerPerson ?? 0);
  const [isSignature, setIsSignature] = useState(item?.isSignature || false);
  const [isPremium, setIsPremium] = useState(item?.isPremium || false);
  const [dietaryTags, setDietaryTags] = useState<string[]>(item?.dietaryTags || []);
  const [allergens, setAllergens] = useState<string[]>(item?.allergens || []);
  const [available, setAvailable] = useState(item?.available !== false);

  const isEdit = !!item;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ id, name, description, category, pricePerPerson, isSignature, isPremium, dietaryTags, allergens, available });
  };

  const toggleTag = (tag: string, list: string[], setter: (v: string[]) => void) => {
    setter(list.includes(tag) ? list.filter((t) => t !== tag) : [...list, tag]);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 flex flex-col gap-4">
        <h2 className="text-lg font-bold">{isEdit ? 'Edit Dish' : 'Add Dish'}</h2>

        <div className="grid gap-3 grid-cols-2">
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-xs font-medium text-gray-600 mb-1">ID</label>
            <input value={id} onChange={(e) => setId(e.target.value)} disabled={isEdit} required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm disabled:bg-gray-100" />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} required
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
        </div>

        <div className="grid gap-3 grid-cols-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Price/Person</label>
            <input type="number" step="0.01" min="0" value={pricePerPerson}
              onChange={(e) => setPricePerPerson(Number(e.target.value))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          </div>
          <label className="flex items-center gap-2 text-sm pt-5">
            <input type="checkbox" checked={isSignature} onChange={(e) => setIsSignature(e.target.checked)} />
            Signature
          </label>
          <label className="flex items-center gap-2 text-sm pt-5">
            <input type="checkbox" checked={isPremium} onChange={(e) => setIsPremium(e.target.checked)} />
            Premium
          </label>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Dietary Tags</label>
          <div className="flex flex-wrap gap-2">
            {DIETARY_OPTIONS.map((tag) => (
              <button key={tag} type="button" onClick={() => toggleTag(tag, dietaryTags, setDietaryTags)}
                className={`px-2.5 py-1 rounded-full text-xs border ${dietaryTags.includes(tag) ? 'bg-green-100 border-green-400 text-green-800' : 'border-gray-300 text-gray-600'}`}>
                {tag}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Allergens</label>
          <div className="flex flex-wrap gap-2">
            {ALLERGEN_OPTIONS.map((a) => (
              <button key={a} type="button" onClick={() => toggleTag(a, allergens, setAllergens)}
                className={`px-2.5 py-1 rounded-full text-xs border ${allergens.includes(a) ? 'bg-red-100 border-red-400 text-red-800' : 'border-gray-300 text-gray-600'}`}>
                {a}
              </button>
            ))}
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={available} onChange={(e) => setAvailable(e.target.checked)} />
          Available
        </label>

        <div className="flex gap-3 justify-end pt-2">
          <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100">
            Cancel
          </button>
          <button type="submit" className="px-4 py-2 rounded-lg text-sm bg-gray-900 text-white hover:bg-gray-800">
            {isEdit ? 'Update' : 'Create'}
          </button>
        </div>
      </form>
    </div>
  );
}
