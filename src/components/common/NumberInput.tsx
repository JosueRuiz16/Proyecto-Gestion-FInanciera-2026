import React, { useState } from 'react';

type Props = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'value'> & {
  value: number | string | undefined | null;
};

/** Formatea con separador de miles y hasta 4 decimales: 124 → "124", 38472.28 → "38,472.28". */
export function formatNumberDisplay(v: number | string | undefined | null): string {
  if (v === '' || v === null || v === undefined) return '';
  const n = Number(v);
  if (Number.isNaN(n)) return String(v);
  return n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 4 });
}

function sanitize(raw: string, allowNegative: boolean): string {
  let s = raw.replace(/,/g, '').replace(/[^\d.-]/g, '');
  const negative = allowNegative && s.startsWith('-');
  s = s.replace(/-/g, '');
  const firstDot = s.indexOf('.');
  if (firstDot !== -1) {
    s = s.slice(0, firstDot + 1) + s.slice(firstDot + 1).replace(/\./g, '');
  }
  // Quitar ceros a la izquierda: 0125 → 125 (pero conservar 0.5)
  s = s.replace(/^0+(?=\d)/, '');
  return (negative ? '-' : '') + s;
}

/**
 * Input numérico con formato de moneda/miles (ej. 38,472.28).
 * - Al escribir muestra el número crudo editable; al salir del campo lo formatea con comas.
 * - Mantiene el contrato de `onChange` (e.target.value llega como número limpio, p. ej. "38472.28").
 */
export const NumberInput: React.FC<Props> = ({
  value,
  onChange,
  onFocus,
  onBlur,
  min,
  className,
  placeholder,
  ...rest
}) => {
  const [draft, setDraft] = useState<string | null>(null);
  const allowNegative = !(min !== undefined && Number(min) >= 0);

  return (
    <input
      {...rest}
      type="text"
      inputMode="decimal"
      autoComplete="off"
      className={className}
      placeholder={placeholder ?? '0'}
      value={draft !== null ? draft : formatNumberDisplay(value)}
      onFocus={(e) => {
        const n = Number(value);
        setDraft(value === '' || value === undefined || value === null || Number.isNaN(n) ? '' : String(n));
        const el = e.currentTarget;
        requestAnimationFrame(() => {
          try {
            el.select();
          } catch {
            /* ignorar */
          }
        });
        onFocus?.(e);
      }}
      onChange={(e) => {
        const clean = sanitize(e.target.value, allowNegative);
        setDraft(clean);
        e.target.value = clean;
        onChange?.(e);
      }}
      onBlur={(e) => {
        setDraft(null);
        onBlur?.(e);
      }}
    />
  );
};
