export type DishCategory =
  | 'appetizer'
  | 'soup'
  | 'entree'
  | 'side'
  | 'noodles-rice'
  | 'dessert';

export type DietaryTag = 'vegetarian' | 'vegan' | 'gluten-free' | 'contains-nuts' | 'spicy';

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  category: DishCategory;
  pricePerPerson: number;
  isSignature: boolean;
  dietaryTags: DietaryTag[];
  available: boolean;
}
