import React, { useState } from 'react';
import { useFinancialSystem } from '../../app/providers/FinancialContext';
import { AcademicDefenseCard } from '../../components/common/AcademicDefenseCard';
import { formatCurrency, formatPct } from '../../components/common/formatters';

export const FinancialAnalysisPage: React.FC = () => {
  const {
    comparisonPeriod,
    activePeriod,
    verticalHorizontal,
    ratios,
    duPont,
  } = useFinancialSystem();

  const [activeTab, setActiveTab] = useState<'RATIOS' | 'VH' | 'DUPONT'>('RATIOS');

  const groups: Array<{
    key: 'LIQUIDEZ' | 'ACTIVIDAD' | 'ENDEUDAMIENTO' | 'RENTABILIDAD' | 'MERCADO';
    title: string;
  }> = [
      { key: 'LIQUIDEZ', title: '1. Razones de Liquidez' },
      { key: 'ACTIVIDAD', title: '2. Razones de Actividad (Eficiencia Operativa)' },
      { key: 'ENDEUDAMIENTO', title: '3. Razones de Endeudamiento (Apalancamiento / Solvencia)' },
      { key: 'RENTABILIDAD', title: '4. Razones de Rentabilidad' },
      { key: 'MERCADO', title: '5. Razones de Mercado' },
    ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
            Módulo B • Unidad 2
          </span>
          <h1 className="text-xl font-bold text-slate-900">
            Análisis Financiero, Razones y Sistema DuPont
          </h1>
          <p className="text-xs text-slate-600">
            Resultados calculados automáticamente a partir de los Estados Financieros de{' '}
            {comparisonPeriod.name} y {activePeriod.name}.
          </p>
        </div>

        <div className="flex rounded-xl bg-slate-200 p-1 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('RATIOS')}
            className={`px-3.5 py-2 rounded-lg transition-colors ${activeTab === 'RATIOS'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
              }`}
          >
            Razones Financieras (5 Grupos)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('VH')}
            className={`px-3.5 py-2 rounded-lg transition-colors ${activeTab === 'VH'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
              }`}
          >
            Análisis Vertical y Horizontal
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('DUPONT')}
            className={`px-3.5 py-2 rounded-lg transition-colors ${activeTab === 'DUPONT'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
              }`}
          >
            Sistema DuPont
          </button>
        </div>
      </div>

      <AcademicDefenseCard
        moduleTitle="Análisis Vertical, Horizontal, Razones Financieras y DuPont"
        unitReference="Unidad 2: Análisis Financiero"
        codeFileLocation="src/core/finance/analysis.ts -> computeFinancialRatios() & computeDuPontAnalysis()"
        formulas={[
          {
            label: 'Análisis Vertical (% Integral)',
            formula: '% Vertical = (Monto de la Cuenta / Total Activos o Ventas Netas) × 100',
            meaning:
              'Determina el peso estructural de cada partida dentro del Balance General (base Total Activos) o del Estado de Resultados (base Ventas Netas).',
          },
          {
            label: 'Análisis Horizontal (Variación Absoluta y Relativa)',
            formula: 'Δ C$ = Actual - Base | Δ % = ((Actual - Base) / Base) × 100',
            meaning:
              'Evalúa la tendencia y crecimiento o decrecimiento de cada cuenta entre dos períodos consecutivos.',
          },
          {
            label: 'Razones Financieras con Unidades Explícitas',
            formula: 'Liquidez (veces/C$), Actividad (veces/días), Deuda (%/veces), Rentabilidad (%)',
            meaning:
              'Cumple la sección 7.2 de la Guía GFO 2026 mostrando unidades exactas y criterio de interpretación automático.',
          },
          {
            label: 'Identidad DuPont de 3 Factores',
            formula: 'ROE = Margen de Utilidad Neta (%) × Rotación de Activos (veces) × Multiplicador del Capital (veces)',
            meaning:
              'Descompone la rentabilidad de los socios en eficiencia operativa (margen), eficiencia en uso de activos (rotación) y apalancamiento financiero.',
          },
        ]}
      />

      {activeTab === 'RATIOS' && (
        <div className="space-y-6">
          {groups.map((grp) => {
            const list = ratios.filter((r) => r.group === grp.key);
            return (
              <div
                key={grp.key}
                className="bg-white rounded-xl border border-slate-200 shadow-sm p-5"
              >
                <h2 className="text-sm font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">
                  {grp.title}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {list.map((ratio) => {
                    const badgeStyle =
                      ratio.status === 'OPTIMO'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : ratio.status === 'PRECAUCION'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200';

                    const formattedVal =
                      ratio.value === null
                        ? 'N/D'
                        : ratio.unit === 'C$'
                          ? formatCurrency(ratio.value)
                          : `${ratio.value.toFixed(2)} ${ratio.unit}`;

                    return (
                      <div
                        key={ratio.id}
                        className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h3 className="text-xs font-bold text-slate-900">
                              {ratio.name}
                            </h3>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeStyle}`}
                            >
                              {ratio.status}
                            </span>
                          </div>
                          <p className="text-[11px] font-mono text-slate-500 mb-2">
                            {ratio.formula}
                          </p>
                          <p className="text-xl font-extrabold text-blue-900 mb-2">
                            {formattedVal}
                          </p>
                        </div>
                        <div>
                          <p className="text-[11px] text-slate-600 leading-relaxed bg-white p-2.5 rounded-lg border border-slate-200/80">
                            {ratio.interpretation}
                          </p>
                          <span className="block text-[10px] text-slate-400 mt-1.5">
                            Referencia académica: {ratio.benchmark}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'VH' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 bg-slate-900 text-white">
            <h2 className="text-sm font-bold">
              Matriz de Análisis Vertical y Horizontal ({comparisonPeriod.name} vs{' '}
              {activePeriod.name})
            </h2>
            <p className="text-[11px] text-slate-300">
              Base Vertical: Total Activos para cuentas de Balance • Ventas Netas para Estado
              de Resultados
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase text-slate-600">
                  <th className="px-4 py-3">Código</th>
                  <th className="px-4 py-3">Cuenta</th>
                  <th className="px-4 py-3 text-right">{comparisonPeriod.name}</th>
                  <th className="px-4 py-3 text-right">Vert. Base (%)</th>
                  <th className="px-4 py-3 text-right">{activePeriod.name}</th>
                  <th className="px-4 py-3 text-right">Vert. Actual (%)</th>
                  <th className="px-4 py-3 text-right">Horiz. Abs. (C$)</th>
                  <th className="px-4 py-3 text-right">Horiz. Rel. (%)</th>
                </tr>
              </thead>
              <tbody>
                {verticalHorizontal.map((row) => (
                  <tr
                    key={row.accountId}
                    className="border-b border-slate-100 hover:bg-slate-50 text-xs"
                  >
                    <td className="px-4 py-2 font-mono text-slate-500">{row.code}</td>
                    <td className="px-4 py-2 font-medium text-slate-900">{row.name}</td>
                    <td className="px-4 py-2 text-right">
                      {formatCurrency(row.baseValue)}
                    </td>
                    <td className="px-4 py-2 text-right font-semibold text-slate-600">
                      {formatPct(row.verticalBasePct)}
                    </td>
                    <td className="px-4 py-2 text-right font-semibold text-blue-900">
                      {formatCurrency(row.currentValue)}
                    </td>
                    <td className="px-4 py-2 text-right font-semibold text-blue-700">
                      {formatPct(row.verticalCurrentPct)}
                    </td>
                    <td
                      className={`px-4 py-2 text-right font-bold ${row.horizontalAbsChange >= 0 ? 'text-emerald-700' : 'text-rose-700'
                        }`}
                    >
                      {row.horizontalAbsChange >= 0 ? '+' : ''}
                      {formatCurrency(row.horizontalAbsChange)}
                    </td>
                    <td
                      className={`px-4 py-2 text-right font-bold ${(row.horizontalRelChangePct ?? 0) >= 0
                          ? 'text-emerald-700'
                          : 'text-rose-700'
                        }`}
                    >
                      {row.horizontalRelChangePct !== null
                        ? `${row.horizontalRelChangePct >= 0 ? '+' : ''}${formatPct(
                          row.horizontalRelChangePct
                        )}`
                        : 'N/D'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'DUPONT' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Sistema de Análisis DuPont ({activePeriod.name})
            </h2>
            <p className="text-xs text-slate-500">
              Descomposición estructural del Rendimiento sobre los Activos (ROA) y el
              Rendimiento sobre el Patrimonio (ROE).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-center">
            <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-center">
              <span className="text-[11px] font-bold uppercase text-blue-700 block">
                1. Margen Utilidad Neta
              </span>
              <p className="text-2xl font-extrabold text-blue-950 my-1">
                {formatPct(duPont.netProfitMarginPct)}
              </p>
              <span className="text-[11px] text-slate-600">Utilidad Neta / Ventas</span>
            </div>

            <div className="text-center font-extrabold text-xl text-slate-400">×</div>

            <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200 text-center">
              <span className="text-[11px] font-bold uppercase text-indigo-700 block">
                2. Rotación Activos Totales
              </span>
              <p className="text-2xl font-extrabold text-indigo-950 my-1">
                {duPont.assetTurnover.toFixed(2)} veces
              </p>
              <span className="text-[11px] text-slate-600">Ventas / Activos Totales</span>
            </div>

            <div className="text-center font-extrabold text-xl text-slate-400">=</div>

            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
              <span className="text-[11px] font-bold uppercase text-emerald-700 block">
                ROA / RSI (DuPont)
              </span>
              <p className="text-2xl font-extrabold text-emerald-950 my-1">
                {formatPct(duPont.roaDuPontPct)}
              </p>
              <span className="text-[11px] text-slate-600">Rendimiento Operativo</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-center pt-4 border-t border-slate-100">
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
              <span className="text-[11px] font-bold uppercase text-emerald-700 block">
                ROA / RSI (DuPont)
              </span>
              <p className="text-2xl font-extrabold text-emerald-950 my-1">
                {formatPct(duPont.roaDuPontPct)}
              </p>
              <span className="text-[11px] text-slate-600">Margen × Rotación</span>
            </div>

            <div className="text-center font-extrabold text-xl text-slate-400">×</div>

            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-center">
              <span className="text-[11px] font-bold uppercase text-amber-800 block">
                3. Multiplicador Capital (MAF)
              </span>
              <p className="text-2xl font-extrabold text-amber-950 my-1">
                {duPont.equityMultiplier.toFixed(2)} veces
              </p>
              <span className="text-[11px] text-slate-600">Activos / Patrimonio</span>
            </div>

            <div className="text-center font-extrabold text-xl text-slate-400">=</div>

            <div className="p-4 rounded-xl bg-slate-900 text-white text-center shadow-md">
              <span className="text-[11px] font-bold uppercase text-blue-300 block">
                ROE (Rendimiento s/ Patrimonio)
              </span>
              <p className="text-2xl font-extrabold text-white my-1">
                {formatPct(duPont.roeDuPontPct)}
              </p>
              <span className="text-[11px] text-slate-300">Rentabilidad del Accionista</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed">
            <strong>Interpretación Ejecutiva DuPont:</strong> {duPont.interpretation}
          </div>
        </div>
      )}
    </div>
  );
};

