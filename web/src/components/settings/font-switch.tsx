"use client";

import { useSyncExternalStore, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useFontStore, FONT_OPTIONS } from "@/stores/use-font-store";
import { Type } from "lucide-react";

const emptySubscribe = () => () => {};

export function FontSwitch() {
  const { font, setFont } = useFontStore();
  const mounted = useSyncExternalStore(
    emptySubscribe,
    useCallback(() => true, []),
    useCallback(() => false, []),
  );

  if (!mounted) {
    return (
      <div className="flex flex-wrap gap-2">
        {FONT_OPTIONS.map((opt) => (
          <div
            key={opt.key}
            className="rounded-md bg-muted/50 px-4 py-2 text-sm text-muted-foreground"
          >
            {opt.label}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {FONT_OPTIONS.map((opt) => (
        <Button
          key={opt.key}
          variant={font === opt.key ? "secondary" : "ghost"}
          size="sm"
          className={cn("gap-2", font === opt.key && "shadow-sm")}
          onClick={() => setFont(opt.key)}
        >
          <Type className="h-4 w-4" />
          {opt.label}
        </Button>
      ))}
    </div>
  );
}
