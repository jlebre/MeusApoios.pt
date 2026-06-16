"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "meusapoios_favorites_v1";

export function useFavorites() {
  const [ids, setIds] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setIds(JSON.parse(raw));
    } catch {
      // localStorage indisponível (modo privado com bloqueio, SSR, etc.)
    }
    setLoaded(true);
  }, []);

  const toggle = useCallback((id: string) => {
    setIds((prev) => {
      const next = prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id];
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  const isFavorite = useCallback(
    (id: string) => ids.includes(id),
    [ids]
  );

  return { ids, toggle, isFavorite, loaded };
}
