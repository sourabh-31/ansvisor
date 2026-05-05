import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Brand } from "@/types";

interface BrandStore {
  brands: Brand[];
  activeBrandId: string | null;
  setBrands: (brands: Brand[]) => void;
  addBrand: (brand: Brand) => void;
  updateBrand: (id: string, updates: Partial<Brand>) => void;
  removeBrand: (id: string) => void;
  setActiveBrand: (id: string) => void;
  getActiveBrand: () => Brand | null;
}

export const useBrandStore = create<BrandStore>()(
  persist(
    (set, get) => ({
      brands: [],
      activeBrandId: null,

      setBrands: (brands) =>
        set({
          brands,
          activeBrandId:
            brands.length > 0 ? (get().activeBrandId ?? brands[0].id) : null,
        }),

      addBrand: (brand) =>
        set((state) => ({
          brands: [...state.brands, brand],
          activeBrandId: state.activeBrandId ?? brand.id,
        })),

      updateBrand: (id, updates) =>
        set((state) => ({
          brands: state.brands.map((b) =>
            b.id === id ? { ...b, ...updates } : b
          ),
        })),

      removeBrand: (id) =>
        set((state) => {
          const remaining = state.brands.filter((b) => b.id !== id);
          return {
            brands: remaining,
            activeBrandId:
              state.activeBrandId === id
                ? (remaining[0]?.id ?? null)
                : state.activeBrandId,
          };
        }),

      setActiveBrand: (id) => set({ activeBrandId: id }),

      getActiveBrand: () => {
        const { brands, activeBrandId } = get();
        return brands.find((b) => b.id === activeBrandId) ?? null;
      },
    }),
    {
      name: "brand-store",
      partialize: (state) => ({
        activeBrandId: state.activeBrandId,
        brands: state.brands,
      }),
    }
  )
);
