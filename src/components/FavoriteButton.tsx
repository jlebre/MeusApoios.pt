"use client";

import { useFavorites } from "@/hooks/useFavorites";

export default function FavoriteButton({
  fundId,
  fundName,
  size = "sm",
}: {
  fundId: string;
  fundName?: string;
  size?: "sm" | "md";
}) {
  const { isFavorite, toggle, loaded } = useFavorites();
  if (!loaded) return null;

  const saved = isFavorite(fundId);
  const label = fundName ?? "apoio";

  return (
    <button
      type="button"
      onClick={() => toggle(fundId)}
      aria-label={saved ? `Remover ${label} dos favoritos` : `Guardar ${label} nos favoritos`}
      title={saved ? "Remover dos favoritos" : "Guardar nos favoritos"}
      className={`shrink-0 rounded-full transition-colors ${
        size === "md" ? "p-2 text-xl" : "p-1.5 text-base"
      } ${
        saved
          ? "text-clay hover:text-clay/60"
          : "text-ink/25 hover:text-clay/70"
      }`}
    >
      {saved ? "★" : "☆"}
    </button>
  );
}
