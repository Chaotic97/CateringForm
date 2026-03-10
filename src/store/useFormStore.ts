import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CateringType, BuyoutFormData, ToGoFormData, ContactData, MealType, BarOption } from '../types/form';
import type { SelectedDish } from '../types/form';

interface FormStore {
  cateringType: CateringType | null;
  currentStep: number;
  buyoutData: BuyoutFormData;
  togoData: ToGoFormData;
  contactData: ContactData;
  submittedAt: string | null;

  // Actions
  setCateringType: (type: CateringType) => void;
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  updateBuyoutEvent: (data: Partial<BuyoutFormData>) => void;
  updateBuyoutMenu: (mealType: MealType, barOption: BarOption) => void;
  updateToGo: (data: Partial<ToGoFormData>) => void;
  toggleDish: (dishId: string, headcount: number) => void;
  updateContact: (data: Partial<ContactData>) => void;
  submit: () => void;
  reset: () => void;
}

const initialBuyout: BuyoutFormData = {
  eventDate: '',
  eventTime: '',
  headcount: 20,
  companyName: '',
  eventDescription: '',
  mealType: null,
  barOption: null,
};

const initialToGo: ToGoFormData = {
  headcount: 10,
  selectedDishes: [],
  preferredPickupDate: '',
  preferredPickupTime: '',
};

const initialContact: ContactData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  specialRequests: '',
};

export const useFormStore = create<FormStore>()(
  persist(
    (set) => ({
      cateringType: null,
      currentStep: 0,
      buyoutData: { ...initialBuyout },
      togoData: { ...initialToGo },
      contactData: { ...initialContact },
      submittedAt: null,

      setCateringType: (type) => set({ cateringType: type, currentStep: 1 }),

      setStep: (step) => set({ currentStep: step }),

      nextStep: () => set((state) => ({ currentStep: state.currentStep + 1 })),

      prevStep: () =>
        set((state) => ({
          currentStep: Math.max(0, state.currentStep - 1),
        })),

      updateBuyoutEvent: (data) =>
        set((state) => ({
          buyoutData: { ...state.buyoutData, ...data },
        })),

      updateBuyoutMenu: (mealType, barOption) =>
        set((state) => ({
          buyoutData: { ...state.buyoutData, mealType, barOption },
        })),

      updateToGo: (data) =>
        set((state) => ({
          togoData: { ...state.togoData, ...data },
        })),

      toggleDish: (dishId, headcount) =>
        set((state) => {
          const existing = state.togoData.selectedDishes.find(
            (d: SelectedDish) => d.dishId === dishId
          );
          const selectedDishes = existing
            ? state.togoData.selectedDishes.filter((d: SelectedDish) => d.dishId !== dishId)
            : [...state.togoData.selectedDishes, { dishId, quantity: headcount }];
          return {
            togoData: { ...state.togoData, selectedDishes },
          };
        }),

      updateContact: (data) =>
        set((state) => ({
          contactData: { ...state.contactData, ...data },
        })),

      submit: () => set({ submittedAt: new Date().toISOString() }),

      reset: () =>
        set({
          cateringType: null,
          currentStep: 0,
          buyoutData: { ...initialBuyout },
          togoData: { ...initialToGo },
          contactData: { ...initialContact },
          submittedAt: null,
        }),
    }),
    {
      name: 'sumbar-catering-form',
      storage: {
        getItem: (name) => {
          const str = sessionStorage.getItem(name);
          return str ? JSON.parse(str) : null;
        },
        setItem: (name, value) => {
          sessionStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: (name) => {
          sessionStorage.removeItem(name);
        },
      },
    }
  )
);
