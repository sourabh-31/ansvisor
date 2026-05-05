"use client";

import { useEffect } from "react";
import { useFontStore, FONT_OPTIONS } from "@/stores/use-font-store";

export function FontProvider() {
  const font = useFontStore((s) => s.font);

  useEffect(() => {
    const option = FONT_OPTIONS.find((o) => o.key === font);
    if (option) {
      document.documentElement.style.setProperty("--font-sans", option.family);
    }
  }, [font]);

  return null;
}
