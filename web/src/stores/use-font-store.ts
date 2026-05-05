import { create } from "zustand";
import { persist } from "zustand/middleware";

export type FontKey = "geist" | "inter" | "jakarta";

interface FontStore {
  font: FontKey;
  setFont: (font: FontKey) => void;
}

export const FONT_OPTIONS: { key: FontKey; label: string; family: string }[] = [
  { key: "geist", label: "Geist", family: "'Geist', ui-sans-serif, system-ui, sans-serif" },
  { key: "inter", label: "Inter", family: "'Inter', ui-sans-serif, system-ui, sans-serif" },
  { key: "jakarta", label: "Plus Jakarta Sans", family: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif" },
];

export const useFontStore = create<FontStore>()(
  persist(
    (set) => ({
      font: "inter",
      setFont: (font) => set({ font }),
    }),
    {
      name: "font-store",
    }
  )
);
