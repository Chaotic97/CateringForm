import { useState, useEffect } from 'react';
import type { MenuItem } from '../types/menu';
import { MENU_ITEMS, CATEGORY_LABELS, CATEGORY_ORDER } from '../config/menu-items';

let cachedItems: MenuItem[] | null = null;

export function useMenuItems() {
  const [items, setItems] = useState<MenuItem[]>(cachedItems ?? MENU_ITEMS);
  const [loading, setLoading] = useState(!cachedItems);

  useEffect(() => {
    if (cachedItems) return;
    fetch('/api/menu')
      .then((res) => res.json())
      .then((data: MenuItem[]) => {
        cachedItems = data;
        setItems(data);
      })
      .catch(() => {
        // Fallback to hardcoded items
        cachedItems = MENU_ITEMS;
      })
      .finally(() => setLoading(false));
  }, []);

  return { items, loading, CATEGORY_LABELS, CATEGORY_ORDER };
}
