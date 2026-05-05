"use client";

import { useEffect } from "react";
import type { User } from "@supabase/supabase-js";
import { useAuthStore } from "@/stores/use-auth-store";

interface AuthProviderProps {
  user: User | null;
}

export function AuthProvider({ user }: AuthProviderProps) {
  const { setUser, setLoading } = useAuthStore();

  useEffect(() => {
    setUser(user);
    setLoading(false);
  }, [user, setUser, setLoading]);

  return null;
}
