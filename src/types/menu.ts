export type DishCategory =
  | 'appetizer'
  | 'soup'
  | 'entree'
  | 'side'
  | 'noodles-rice'
  | 'dessert';

export type DietaryTag = 'vegetarian' | 'vegan' | 'gluten-free' | 'contains-nuts' | 'spicy';

export type Allergen =
  | 'shellfish'
  | 'dairy'
  | 'soy'
  | 'eggs'
  | 'wheat'
  | 'peanuts'
  | 'tree-nuts'
  | 'sesame'
  | 'fish';

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  category: DishCategory;
  pricePerPerson: number;
  isSignature: boolean;
  isPremium?: boolean;
  dietaryTags: DietaryTag[];
  allergens: Allergen[];
  available: boolean;
}
