import React, { useState } from 'react';
import { Calculator, Download, Eye, EyeOff, Printer } from 'lucide-react';
import { useFinancialSystem } from '../../app/providers/FinancialContext';
import { useAuth } from '../../app/providers/AuthContext';
import { AcademicDefenseCard } from '../../components/common/AcademicDefenseCard';
import { formatCurrency, formatPct } from '../../components/common/formatters';
import {
  exportFinancialCaseExcel,
  openExecutiveReportPrintView,
} from '../../core/reports/executiveReportGenerator';

export const FinancialAnalysisPage: React.FC = () => {
  const {
    state,
    comparisonPeriod,
    activePeriod,
    comparisonTotals,
    activeTotals,
    verticalHorizontal,
    ratios,
    duPont,
    cvuAndLeverage,
    cashFlowResult,
    masterBudgetAndProforma,
    inventoryResult,
  } = useFinancialSystem();
  const { user } = useAuth();

  const reportPayload = {
    state,
    activePeriod,
    comparisonPeriod,
    activeTotals,
    comparisonTotals,
    ratios,
    duPont,
    cvuAndLeverage,
    cashFlowResult,
    masterBudgetAndProforma,
    inventoryResult,
    authorName: user?.displayName,
  };

  const [activeTab, setActiveTab] = useState<'RATIOS' | 'VH' | 'DUPONT'>('RATIOS');
  const [showFormulas, setShowFormulas] = useState<boolean>(false);
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});

  const toggleCardFormula = (id: string) => {
    setExpandedCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const getRatioSubstitution = (id: string): string => {
    const t = activeTotals;
    const c = state.company;
    const upaVal =
      c.sharesOutstanding > 0 ? t.utilidadNeta / c.sharesOutstanding : 0;
    switch (id) {
      case 'liquidez_corriente':
        return `${formatCurrency(t.totalActivoCorriente)} ÷ ${formatCurrency(t.totalPasivoCorriente)}`;
      case 'prueba_acida':
        return `(${formatCurrency(t.totalActivoCorriente)} - ${formatCurrency(t.inventario)}) ÷ ${formatCurrency(t.totalPasivoCorriente)}`;
      case 'capital_trabajo':
        return `${formatCurrency(t.totalActivoCorriente)} - ${formatCurrency(t.totalPasivoCorriente)}`;
      case 'rotacion_inventario':
        return `${formatCurrency(t.costoBienesVendidos)} ÷ ${formatCurrency(t.inventario)}`;
      case 'periodo_cobro':
        return `(${formatCurrency(t.cuentasPorCobrar)} ÷ ${formatCurrency(t.ventasNetas)}) × 360`;
      case 'rotacion_activos':
        return `${formatCurrency(t.ventasNetas)} ÷ ${formatCurrency(t.totalActivos)}`;
      case 'indice_endeudamiento':
        return `(${formatCurrency(t.totalPasivos)} ÷ ${formatCurrency(t.totalActivos)}) × 100`;
      case 'deuda_patrimonio':
        return `${formatCurrency(t.totalPasivos)} ÷ ${formatCurrency(t.totalPatrimonio)}`;
      case 'cobertura_intereses':
        return `${formatCurrency(t.uaii)} ÷ ${formatCurrency(t.gastosFinancieros)}`;
      case 'margen_bruto':
        return `(${formatCurrency(t.utilidadBruta)} ÷ ${formatCurrency(t.ventasNetas)}) × 100`;
      case 'margen_operativo':
        return `(${formatCurrency(t.uaii)} ÷ ${formatCurrency(t.ventasNetas)}) × 100`;
      case 'margen_neto':
        return `(${formatCurrency(t.utilidadNeta)} ÷ ${formatCurrency(t.ventasNetas)}) × 100`;
      case 'roa':
        return `(${formatCurrency(t.utilidadNeta)} ÷ ${formatCurrency(t.totalActivos)}) × 100`;
      case 'roe':
        return `(${formatCurrency(t.utilidadNeta)} ÷ ${formatCurrency(t.totalPatrimonio)}) × 100`;
      case 'upa':
        return `${formatCurrency(t.utilidadNeta)} ÷ ${c.sharesOutstanding.toLocaleString()} acciones`;
      case 'razon_precio_utilidad':
        return `${formatCurrency(c.marketPricePerShare)} ÷ ${formatCurrency(upaVal)}`;
      default:
        return '';
    }
  };

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

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowFormulas((v) => !v)}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold shadow-sm transition-colors border ${
              showFormulas
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white text-indigo-700 border-indigo-200 hover:bg-indigo-50'
            }`}
            title="Mostrar u ocultar las fórmulas y la sustitución con los datos actuales para mantener la interfaz limpia"
          >
            {showFormulas ? <EyeOff className="w-3.5 h-3.5" /> : <Calculator className="w-3.5 h-3.5" />}
            <span>{showFormulas ? 'Ocultar Fórmulas y Sustitución' : 'Ver Fórmulas y Sustitución'}</span>
          </button>
          <button
            type="button"
            onClick={() => openExecutiveReportPrintView(reportPayload)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Generar Reporte</span>
          </button>
          <button
            type="button"
            onClick={() => exportFinancialCaseExcel(reportPayload)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold shadow-sm transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar Excel</span>
          </button>
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

                    const isFormulaVisible = showFormulas || Boolean(expandedCards[ratio.id]);
                    const substitutionText = getRatioSubstitution(ratio.id);

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
                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => toggleCardFormula(ratio.id)}
                                className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 inline-flex items-center gap-1"
                                title={isFormulaVisible ? 'Ocultar fórmula' : 'Ver fórmula y sustitución numérica'}
                              >
                                {isFormulaVisible ? <EyeOff className="w-2.5 h-2.5" /> : <Eye className="w-2.5 h-2.5" />}
                                <span>{isFormulaVisible ? 'Ocultar' : 'Fórmula'}</span>
                              </button>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeStyle}`}
                              >
                                {ratio.status}
                              </span>
                            </div>
                          </div>

                          <p className="text-xl font-extrabold text-blue-900 my-2">
                            {formattedVal}
                          </p>

                          {isFormulaVisible && (
                            <div className="mb-2.5 p-2.5 rounded-lg bg-indigo-50/80 border border-indigo-200/80 space-y-1 text-[11px]">
                              <div className="text-slate-700">
                                <span className="font-bold text-indigo-900">Fórmula: </span>
                                <span className="font-mono">{ratio.formula}</span>
                              </div>
                              {substitutionText && (
                                <div className="text-slate-800">
                                  <span className="font-bold text-emerald-800">Sustitución real: </span>
                                  <span className="font-mono font-semibold">{substitutionText} = {formattedVal}</span>
                                </div>
                              )}
                            </div>
                          )}
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

          {showFormulas && (
            <div className="p-4 rounded-xl bg-indigo-50/80 border border-indigo-200 space-y-2 text-xs">
              <h3 className="font-bold text-indigo-950">
                Sustitución Numérica Paso a Paso del Modelo DuPont ({activePeriod.name})
              </h3>
              <ul className="space-y-1.5 font-mono text-[11px] text-slate-800">
                <li>
                  <strong>1. Margen Neto:</strong> ({formatCurrency(activeTotals.utilidadNeta)} ÷ {formatCurrency(activeTotals.ventasNetas)}) × 100 = <strong>{formatPct(duPont.netProfitMarginPct)}</strong>
                </li>
                <li>
                  <strong>2. Rotación de Activos:</strong> {formatCurrency(activeTotals.ventasNetas)} ÷ {formatCurrency(activeTotals.totalActivos)} = <strong>{duPont.assetTurnover.toFixed(2)} veces</strong>
                </li>
                <li>
                  <strong>3. Multiplicador del Capital (MAF):</strong> {formatCurrency(activeTotals.totalActivos)} ÷ {formatCurrency(activeTotals.totalPatrimonio)} = <strong>{duPont.equityMultiplier.toFixed(2)} veces</strong>
                </li>
                <li>
                  <strong>4. ROE DuPont:</strong> {formatPct(duPont.netProfitMarginPct)} × {duPont.assetTurnover.toFixed(2)} × {duPont.equityMultiplier.toFixed(2)} = <strong>{formatPct(duPont.roeDuPontPct)}</strong>
                </li>
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

