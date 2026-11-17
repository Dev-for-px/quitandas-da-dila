"use client";
import { Minus, Plus } from "lucide-react";

export function Quantidade({ valor, onChange, min = 1 }: { valor: number; onChange: (n: number) => void; min?: number }) {
  return (
    <div className="inline-flex items-center rounded-pill border border-linha bg-papel">
      <button type="button" aria-label="Diminuir" onClick={() => onChange(Math.max(min, valor - 1))} className="flex h-11 w-11 items-center justify-center text-terra"><Minus size={20} /></button>
      <span aria-live="polite" className="w-8 text-center text-lg font-semibold">{valor}</span>
      <button type="button" aria-label="Aumentar" onClick={() => onChange(valor + 1)} className="flex h-11 w-11 items-center justify-center text-terra"><Plus size={20} /></button>
    </div>
  );
}
