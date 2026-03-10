export type CateringType = 'buyout' | 'togo';

export type MealType = 'tasting' | 'family-style' | 'buffet' | 'small-bites';
export type BarOption = 'cash-bar' | 'open-bar' | 'pairings' | 'none';

export interface BuyoutFormData {
  eventDate: string;
  eventTime: string;
  headcount: number;
  companyName: string;
  eventDescription: string;
  mealType: MealType | null;
  barOption: BarOption | null;
}

export interface ToGoFormData {
  headcount: number;
  selectedDishes: SelectedDish[];
  preferredPickupDate: string;
  preferredPickupTime: string;
}

export interface SelectedDish {
  dishId: string;
  quantity: number;
}

export interface ContactData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialRequests: string;
}

export interface FormState {
  cateringType: CateringType | null;
  currentStep: number;
  buyoutData: BuyoutFormData;
  togoData: ToGoFormData;
  contactData: ContactData;
  submittedAt: string | null;
}
