"use client";

import { useEffect } from "react";
import { useBrandStore } from "@/stores/use-brand-store";
import type { Brand } from "@/types";

interface BrandLoaderProps {
  brands: Brand[];
}

/**
 * Hydrates the brand store with server-fetched brands on mount.
 * Placed in the dashboard layout so brands are always available.
 */
export function BrandLoader({ brands }: BrandLoaderProps) {
  const setBrands = useBrandStore((s) => s.setBrands);

  useEffect(() => {
    setBrands(brands);
  }, [brands, setBrands]);

  return null;
}
