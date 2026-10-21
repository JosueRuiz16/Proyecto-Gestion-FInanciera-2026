import React from 'react';
import { RefreshCw } from 'lucide-react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useFinancialSystem } from '../../app/providers/FinancialContext';
import { AcademicDefenseCard } from '../../components/common/AcademicDefenseCard';
import { formatCurrency, formatNumber, formatPct } from '../../components/common/formatters';

export const BreakEvenPage: React.FC = () => {
  const {
    state,
    activePeriod,
    cvuAndLeverage,
    updateCvuInput,
    syncCvuWithIncomeStatement,
  } = useFinancialSystem();

  const cvu = state.cvuInput;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
            Módulo C • Unidad 2
          </span>
          <h1 className="text-xl font-bold text-slate-900">
            Punto de Equilibrio y Relación Costo-Volumen-Utilidad (C-V-U)
          </h1>
          <p className="text-xs text-slate-600">
            Determinación del Margen de Contribución, Punto de Equilibrio en Unidades y
            Monetario, y Simulación de Escenarios.
          </p>
        </div>

        <button
          type="button"
          onClick={syncCvuWithIncomeStatement}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Sincronizar con Estado de Resultados ({activePeriod.name})</span>
        </button>
      </div>

      <AcademicDefenseCard
        moduleTitle="Punto de Equilibrio y Modelo Costo-Volumen-Utilidad (C-V-U)"
        unitReference="Unidad 2: Análisis Financiero"
        codeFileLocation="src/core/finance/cvuAndLeverage.ts -> computeCvuAndLeverage()"
        formulas={[
          {
            label: 'Margen de Contribución Unitario (MCu) y Razón MC (%)',
            formula: 'MCu = Precio Venta (P) - Costo Variable Unitario (CVu) | %MC = (MCu / P) × 100',
            meaning:
              'Representa cuánto aporta cada unidad vendida para cubrir los costos fijos operativos y luego generar utilidad operativa (UAII).',
          },
          {
            label: 'Punto de Equilibrio en Unidades (PEq)',
            formula: 'PE (unidades) = Costos Fijos Totales (CF) / (P - CVu)',
            meaning:
              'Cantidad exacta de unidades donde los Ingresos Totales igualan a los Costos Totales (UAII = C$ 0.00).',
          },
          {
            label: 'Punto de Equilibrio Monetario (PE C$)',
            formula: 'PE (C$) = Costos Fijos Totales (CF) / Razón de Margen de Contribución',
            meaning:
              'Nivel de facturación en Córdobas necesario para no perder ni ganar en la operación.',
          },
          {
            label: 'Análisis de Sensibilidad (Escenarios C-V-U)',
            formula: 'UAII Simulada = [(P_nuevo - CVu_nuevo) × Q_nuevo] - CF_nuevo',
            meaning:
              'Permite evaluar el impacto inmediato de subir/bajar precios, variar costos variables o modificar costos fijos.',
          },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulario de Variables Base y Escenarios */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-5">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              1. Parámetros Operativos Base
            </h2>
            <p className="text-[11px] text-slate-500">
              Variables del producto o mezcla promedio
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Precio de Venta Unitario (P en C$)
              </label>
              <input
                type="number"
                min={1}
                value={cvu.unitPrice}
                onChange={(e) => updateCvuInput({ unitPrice: Number(e.target.value) })}
                className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Costo Variable Unitario (CVu en C$)
              </label>
              <input
                type="number"
                min={0}
                value={cvu.unitVariableCost}
                onChange={(e) =>
                  updateCvuInput({ unitVariableCost: Number(e.target.value) })
                }
                className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Costos y Gastos Fijos Operativos (CF en C$)
              </label>
              <input
                type="number"
                min={0}
                value={cvu.fixedOperatingCosts}
                onChange={(e) =>
                  updateCvuInput({ fixedOperatingCosts: Number(e.target.value) })
                }
                className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Volumen Actual de Ventas (Q en unidades)
              </label>
              <input
                type="number"
                min={0}
                value={cvu.currentUnitsSold}
                onChange={(e) =>
                  updateCvuInput({ currentUnitsSold: Number(e.target.value) })
                }
                className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-semibold"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 space-y-3">
            <h3 className="text-xs font-bold uppercase text-indigo-700">
              2. Simulador de Cambios en Variables C-V-U (%)
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Δ Precio (%)
                </label>
                <input
                  type="number"
                  value={cvu.priceChangePct}
                  onChange={(e) =>
                    updateCvuInput({ priceChangePct: Number(e.target.value) })
                  }
                  className="w-full border border-indigo-200 bg-indigo-50/40 rounded-lg px-2.5 py-1.5 text-xs font-bold"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Δ Costo Variable (%)
                </label>
                <input
                  type="number"
                  value={cvu.variableCostChangePct}
                  onChange={(e) =>
                    updateCvuInput({ variableCostChangePct: Number(e.target.value) })
                  }
                  className="w-full border border-indigo-200 bg-indigo-50/40 rounded-lg px-2.5 py-1.5 text-xs font-bold"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Δ Costos Fijos (%)
                </label>
                <input
                  type="number"
                  value={cvu.fixedCostChangePct}
                  onChange={(e) =>
                    updateCvuInput({ fixedCostChangePct: Number(e.target.value) })
                  }
                  className="w-full border border-indigo-200 bg-indigo-50/40 rounded-lg px-2.5 py-1.5 text-xs font-bold"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Δ Volumen Q (%)
                </label>
                <input
                  type="number"
                  value={cvu.volumeChangePct}
                  onChange={(e) =>
                    updateCvuInput({ volumeChangePct: Number(e.target.value) })
                  }
                  className="w-full border border-indigo-200 bg-indigo-50/40 rounded-lg px-2.5 py-1.5 text-xs font-bold"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Resultados y Gráfico de Punto de Equilibrio */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs font-medium text-slate-500">
                Margen Contribución Unitario
              </span>
              <p className="text-xl font-extrabold text-slate-900 mt-1">
                {formatCurrency(cvuAndLeverage.unitContributionMargin)} / unid.
              </p>
              <span className="text-xs font-semibold text-blue-600">
                Razón MC: {formatPct(cvuAndLeverage.contributionMarginRatioPct)}
              </span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-blue-200 shadow-sm">
              <span className="text-xs font-medium text-slate-500">
                Punto de Equilibrio (Unidades)
              </span>
              <p className="text-xl font-extrabold text-blue-700 mt-1">
                {cvuAndLeverage.breakEvenUnits !== null
                  ? `${formatNumber(cvuAndLeverage.breakEvenUnits, 2)} unidades`
                  : 'Inalcanzable (MC <= 0)'}
              </p>
              <span className="text-xs font-semibold text-slate-600">
                Margen Seguridad: {formatNumber(cvuAndLeverage.safetyMarginUnits, 0)} unid. (
                {formatPct(cvuAndLeverage.safetyMarginPct)})
              </span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-sm">
              <span className="text-xs font-medium text-slate-500">
                Punto de Equilibrio Monetario
              </span>
              <p className="text-xl font-extrabold text-emerald-700 mt-1">
                {formatCurrency(cvuAndLeverage.breakEvenRevenue)}
              </p>
              <span className="text-xs font-semibold text-slate-600">
                UAII Actual: {formatCurrency(cvuAndLeverage.currentUaii)}
              </span>
            </div>
          </div>

          {/* Gráfica de Punto de Equilibrio */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-1">
              Gráfica de Punto de Equilibrio (Ingresos vs Costos Totales y Fijos)
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              El cruce entre Ventas (azul) y Costos Totales (rojo) marca el Punto de
              Equilibrio ({formatNumber(cvuAndLeverage.breakEvenUnits, 0)} unidades /{' '}
              {formatCurrency(cvuAndLeverage.breakEvenRevenue)}).
            </p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={cvuAndLeverage.chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="units"
                    tick={{ fontSize: 11 }}
                    label={{ value: 'Unidades', position: 'insideBottomRight', offset: -5 }}
                  />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(val: number) => formatCurrency(val)} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line
                    type="monotone"
                    dataKey="ventas"
                    name="Ventas Totales (C$)"
                    stroke="#2563eb"
                    strokeWidth={2.5}
                  />
                  <Line
                    type="monotone"
                    dataKey="costosTotales"
                    name="Costos Totales (CF + CV)"
                    stroke="#e11d48"
                    strokeWidth={2.5}
                  />
                  <Line
                    type="monotone"
                    dataKey="costosFijos"
                    name="Costos Fijos (CF)"
                    stroke="#64748b"
                    strokeDasharray="5 5"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Tabla comparativa de Escenario Base vs Escenario Simulado */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 bg-indigo-950 text-white">
              <h3 className="text-sm font-bold">
                Comparativa de Análisis de Escenarios C-V-U (Base vs Simulado)
              </h3>
            </div>
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase text-slate-600">
                  <th className="px-4 py-2.5">Indicador C-V-U</th>
                  <th className="px-4 py-2.5 text-right">Escenario Base</th>
                  <th className="px-4 py-2.5 text-right text-indigo-700">
                    Escenario Simulado
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-100">
                  <td className="px-4 py-2 font-medium">Precio Unitario / Costo Variable Unit.</td>
                  <td className="px-4 py-2 text-right">
                    {formatCurrency(cvu.unitPrice)} / {formatCurrency(cvu.unitVariableCost)}
                  </td>
                  <td className="px-4 py-2 text-right font-semibold text-indigo-900">
                    {formatCurrency(cvuAndLeverage.simulatedPrice)} /{' '}
                    {formatCurrency(cvuAndLeverage.simulatedVariableCost)}
                  </td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="px-4 py-2 font-medium">Margen de Contribución Unitario</td>
                  <td className="px-4 py-2 text-right">
                    {formatCurrency(cvuAndLeverage.unitContributionMargin)}
                  </td>
                  <td className="px-4 py-2 text-right font-semibold text-indigo-900">
                    {formatCurrency(cvuAndLeverage.simulatedUnitCM)}
                  </td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="px-4 py-2 font-medium">Punto de Equilibrio en Unidades</td>
                  <td className="px-4 py-2 text-right">
                    {formatNumber(cvuAndLeverage.breakEvenUnits)} unidades
                  </td>
                  <td className="px-4 py-2 text-right font-semibold text-indigo-900">
                    {formatNumber(cvuAndLeverage.simulatedBreakEvenUnits)} unidades
                  </td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="px-4 py-2 font-medium">Punto de Equilibrio Monetario</td>
                  <td className="px-4 py-2 text-right">
                    {formatCurrency(cvuAndLeverage.breakEvenRevenue)}
                  </td>
                  <td className="px-4 py-2 text-right font-semibold text-indigo-900">
                    {formatCurrency(cvuAndLeverage.simulatedBreakEvenRevenue)}
                  </td>
                </tr>
                <tr className="bg-indigo-50/70 font-bold">
                  <td className="px-4 py-2.5 text-indigo-950">
                    Utilidad Operativa Proyectada (UAII)
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    {formatCurrency(cvuAndLeverage.currentUaii)}
                  </td>
                  <td className="px-4 py-2.5 text-right text-indigo-900">
                    {formatCurrency(cvuAndLeverage.simulatedUaii)} (
                    {cvuAndLeverage.uaiiVariationPct !== null
                      ? `${cvuAndLeverage.uaiiVariationPct >= 0 ? '+' : ''}${formatPct(
                        cvuAndLeverage.uaiiVariationPct
                      )}`
                      : 'N/D'}
                    )
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

