import React, { useState } from 'react';
import { BookOpen, ChevronDown, ChevronUp, Code2 } from 'lucide-react';

interface FormulaItem {
  label: string;
  formula: string;
  meaning: string;
}

interface AcademicDefenseCardProps {
  moduleTitle: string;
  unitReference: string;
  codeFileLocation: string;
  formulas: FormulaItem[];
}

export const AcademicDefenseCard: React.FC<AcademicDefenseCardProps> = ({
  moduleTitle,
  unitReference,
  codeFileLocation,
  formulas,
}) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-indigo-50/70 border border-indigo-200 rounded-xl overflow-hidden mb-6">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-3.5 text-left hover:bg-indigo-100/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-600 text-white">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-700 block">
              Guía para Defensa Individual ({unitReference})
            </span>
            <h4 className="text-sm font-bold text-slate-900">
              Explicación de Fórmulas, Datos de Entrada y Ubicación en el Código: {moduleTitle}
            </h4>
          </div>
        </div>
        <div className="flex items-center gap-2 text-indigo-700 text-xs font-semibold">
          <span>{open ? 'Ocultar explicación' : 'Ver fórmulas y código'}</span>
          {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {open && (
        <div className="px-5 pb-5 pt-2 border-t border-indigo-200/80 space-y-4">
          <div className="flex items-center gap-2 text-xs bg-white px-3 py-2 rounded-lg border border-indigo-100 text-slate-700">
            <Code2 className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>
              <strong>Archivo del Motor Financiero que ejecuta este cálculo:</strong>{' '}
              <code className="font-mono text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">
                {codeFileLocation}
              </code>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {formulas.map((f, idx) => (
              <div
                key={idx}
                className="bg-white p-3.5 rounded-lg border border-indigo-100 shadow-sm"
              >
                <p className="text-xs font-bold text-indigo-900 mb-1">{f.label}</p>
                <p className="font-mono text-xs bg-slate-100 text-slate-800 px-2.5 py-1.5 rounded mb-2">
                  {f.formula}
                </p>
                <p className="text-xs text-slate-600 leading-relaxed">{f.meaning}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

