import { useState, useEffect } from 'react';
import type { MenuItem } from '../types/menu';
import { MENU_ITEMS, CATEGORY_ORDER } from '../config/menu-items';
import { useSiteSettings, DEFAULT_CATEGORY_LABELS } from './useSiteSettings';

let cachedItems: MenuItem[] | null = null;

export function useMenuItems() {
  const [items, setItems] = useState<MenuItem[]>(cachedItems ?? MENU_ITEMS);
  const [loading, setLoading] = useState(!cachedItems);
  const { categoryLabels } = useSiteSettings();

  useEffect(() => {
    if (cachedItems) return;
    fetch('/api/menu')
      .then((res) => res.json())
      .then((data: MenuItem[]) => {
        cachedItems = data;
        setItems(data);
      })
      .catch(() => {
        cachedItems = MENU_ITEMS;
      })
      .finally(() => setLoading(false));
  }, []);

  return { items, loading, CATEGORY_LABELS: categoryLabels, CATEGORY_ORDER };
}

// Re-export for places that need the static defaults
export { DEFAULT_CATEGORY_LABELS };
