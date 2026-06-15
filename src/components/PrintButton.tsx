"use client";

export default function PrintButton() {
  return (
    <button className="btn-primary text-sm" onClick={() => window.print()}>
      Guardar como PDF / Imprimir
    </button>
  );
}
