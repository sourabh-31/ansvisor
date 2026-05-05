"use client";

import { useSyncExternalStore, useCallback } from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

const emptySubscribe = () => () => {};

export function ThemeSwitch() {
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    emptySubscribe,
    useCallback(() => true, []),
    useCallback(() => false, []),
  );

  if (!mounted) {
    return (
      <div className="flex rounded-lg border bg-muted p-1">
        <div className="flex-1 rounded-md bg-muted/50 py-2 text-center text-sm text-muted-foreground">
          Light
        </div>
        <div className="flex-1 rounded-md py-2 text-center text-sm text-muted-foreground">
          Dark
        </div>
      </div>
    );
  }

  return (
    <div className="flex rounded-lg border bg-muted p-1">
      <Button
        variant={theme === "light" ? "secondary" : "ghost"}
        size="sm"
        className={cn("flex-1 gap-2", theme === "light" && "shadow-sm")}
        onClick={() => setTheme("light")}
      >
        <Sun className="h-4 w-4" />
        Light
      </Button>
      <Button
        variant={theme === "dark" ? "secondary" : "ghost"}
        size="sm"
        className={cn("flex-1 gap-2", theme === "dark" && "shadow-sm")}
        onClick={() => setTheme("dark")}
      >
        <Moon className="h-4 w-4" />
        Dark
      </Button>
    </div>
  );
}
