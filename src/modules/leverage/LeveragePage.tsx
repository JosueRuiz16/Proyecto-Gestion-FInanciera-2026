import React from 'react';
import { RefreshCw } from 'lucide-react';
import { useFinancialSystem } from '../../app/providers/FinancialContext';
import { AcademicDefenseCard } from '../../components/common/AcademicDefenseCard';
import { formatCurrency } from '../../components/common/formatters';

export const LeveragePage: React.FC = () => {
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
            Módulo D • Unidad 2
          </span>
          <h1 className="text-xl font-bold text-slate-900">
            Apalancamiento Operativo (GAO), Financiero (GAF) y Total (GAT)
          </h1>
          <p className="text-xs text-slate-600">
            Evaluación del efecto multiplicador de los costos fijos operativos y los cargos
            financieros fijos sobre las utilidades.
          </p>
        </div>

        <button
          type="button"
          onClick={syncCvuWithIncomeStatement}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Cargar datos del Estado de Resultados ({activePeriod.name})</span>
        </button>
      </div>

      <AcademicDefenseCard
        moduleTitle="Grados de Apalancamiento (GAO, GAF y GAT)"
        unitReference="Unidad 2: Análisis Financiero"
        codeFileLocation="src/core/finance/cvuAndLeverage.ts -> computeCvuAndLeverage()"
        formulas={[
          {
            label: 'Grado de Apalancamiento Operativo (GAO)',
            formula: 'GAO = Margen de Contribución Total / UAII = [Q(P - CVu)] / [Q(P - CVu) - CF]',
            meaning:
              'Mide la sensibilidad de la Utilidad Operativa (UAII) ante una variación porcentual en el volumen de ventas.',
          },
          {
            label: 'Grado de Apalancamiento Financiero (GAF)',
            formula: 'GAF = UAII / [UAII - Intereses - (Dividendos Preferentes / (1 - Tasa IR))]',
            meaning:
              'Mide la sensibilidad de la Utilidad por Acción (UPA) ante cambios porcentuales en la Utilidad Operativa (UAII).',
          },
          {
            label: 'Grado de Apalancamiento Total o Combinado (GAT)',
            formula: 'GAT = GAO × GAF',
            meaning:
              'Mide el efecto combinado de los costos fijos operativos y financieros sobre la rentabilidad final de los socios ante variaciones en ventas.',
          },
          {
            label: 'Criterio de Riesgo',
            formula: 'Mayor Apalancamiento = Mayor amplificación de ganancias (y de pérdidas si caen las ventas)',
            meaning:
              'Un GAT elevado amplifica fuertemente la utilidad cuando las ventas suben, pero incrementa el riesgo si las ventas disminuyen.',
          },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Entradas requeridas */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900">
            Datos Operativos y Financieros de Entrada
          </h2>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-medium text-slate-600 mb-1">
                Unidades Vendidas (Q)
              </label>
              <input
                type="number"
                value={cvu.currentUnitsSold}
                onChange={(e) =>
                  updateCvuInput({ currentUnitsSold: Number(e.target.value) })
                }
                className="w-full border border-slate-300 rounded-lg px-3 py-1.5 font-semibold"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-medium text-slate-600 mb-1">
                  Precio Venta (C$)
                </label>
                <input
                  type="number"
                  value={cvu.unitPrice}
                  onChange={(e) => updateCvuInput({ unitPrice: Number(e.target.value) })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-1.5 font-semibold"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-600 mb-1">
                  Costo Var. Unit. (C$)
                </label>
                <input
                  type="number"
                  value={cvu.unitVariableCost}
                  onChange={(e) =>
                    updateCvuInput({ unitVariableCost: Number(e.target.value) })
                  }
                  className="w-full border border-slate-300 rounded-lg px-3 py-1.5 font-semibold"
                />
              </div>
            </div>
            <div>
              <label className="block font-medium text-slate-600 mb-1">
                Costos Fijos Operativos (CF en C$)
              </label>
              <input
                type="number"
                value={cvu.fixedOperatingCosts}
                onChange={(e) =>
                  updateCvuInput({ fixedOperatingCosts: Number(e.target.value) })
                }
                className="w-full border border-slate-300 rounded-lg px-3 py-1.5 font-semibold"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-600 mb-1">
                Intereses Financieros Anuales (I en C$)
              </label>
              <input
                type="number"
                value={cvu.interestExpense}
                onChange={(e) =>
                  updateCvuInput({ interestExpense: Number(e.target.value) })
                }
                className="w-full border border-slate-300 rounded-lg px-3 py-1.5 font-semibold"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-600 mb-1">
                Dividendos Preferentes (DP en C$)
              </label>
              <input
                type="number"
                value={cvu.preferredDividends}
                onChange={(e) =>
                  updateCvuInput({ preferredDividends: Number(e.target.value) })
                }
                className="w-full border border-slate-300 rounded-lg px-3 py-1.5 font-semibold"
              />
            </div>
          </div>
        </div>

        {/* Cascada del Estado de Resultados de Apalancamiento y Tarjetas GAO/GAF/GAT */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-xl border border-blue-200 shadow-sm">
              <span className="text-xs font-bold uppercase text-blue-700">
                1. Apalancamiento Operativo
              </span>
              <p className="text-3xl font-extrabold text-blue-900 my-2">
                {cvuAndLeverage.gao !== null ? `${cvuAndLeverage.gao.toFixed(2)} veces` : 'N/D'}
              </p>
              <p className="text-xs text-slate-600 leading-relaxed">
                {cvuAndLeverage.gaoInterpretation}
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-indigo-200 shadow-sm">
              <span className="text-xs font-bold uppercase text-indigo-700">
                2. Apalancamiento Financiero
              </span>
              <p className="text-3xl font-extrabold text-indigo-900 my-2">
                {cvuAndLeverage.gaf !== null ? `${cvuAndLeverage.gaf.toFixed(2)} veces` : 'N/D'}
              </p>
              <p className="text-xs text-slate-600 leading-relaxed">
                {cvuAndLeverage.gafInterpretation}
              </p>
            </div>

            <div className="bg-slate-900 text-white p-5 rounded-xl shadow-md">
              <span className="text-xs font-bold uppercase text-emerald-300">
                3. Apalancamiento Total (GAT)
              </span>
              <p className="text-3xl font-extrabold text-white my-2">
                {cvuAndLeverage.gat !== null ? `${cvuAndLeverage.gat.toFixed(2)} veces` : 'N/D'}
              </p>
              <p className="text-xs text-slate-300 leading-relaxed">
                {cvuAndLeverage.gatInterpretation}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 bg-slate-900 text-white">
              <h3 className="text-sm font-bold">
                Estructura Analítica para el Cálculo de GAO, GAF y GAT
              </h3>
            </div>
            <table className="w-full text-left border-collapse text-xs">
              <tbody>
                <tr className="border-b border-slate-100">
                  <td className="px-4 py-2.5 font-medium">
                    Ingresos por Ventas ({cvu.currentUnitsSold.toLocaleString()} unid. ×{' '}
                    {formatCurrency(cvu.unitPrice)})
                  </td>
                  <td className="px-4 py-2.5 text-right font-semibold">
                    {formatCurrency(cvuAndLeverage.currentRevenue)}
                  </td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="px-4 py-2.5 text-slate-600">
                    (-) Costos Variables Totales ({cvu.currentUnitsSold.toLocaleString()} unid. ×{' '}
                    {formatCurrency(cvu.unitVariableCost)})
                  </td>
                  <td className="px-4 py-2.5 text-right text-rose-700">
                    {formatCurrency(cvuAndLeverage.currentTotalVariableCost)}
                  </td>
                </tr>
                <tr className="border-b border-blue-200 bg-blue-50/60 font-bold text-blue-950">
                  <td className="px-4 py-2.5">(=) MARGEN DE CONTRIBUCIÓN TOTAL (MC)</td>
                  <td className="px-4 py-2.5 text-right">
                    {formatCurrency(cvuAndLeverage.currentTotalContributionMargin)}
                  </td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="px-4 py-2.5 text-slate-600">
                    (-) Costos y Gastos Fijos Operativos (CF)
                  </td>
                  <td className="px-4 py-2.5 text-right text-rose-700">
                    {formatCurrency(cvu.fixedOperatingCosts)}
                  </td>
                </tr>
                <tr className="border-b border-indigo-200 bg-indigo-50/70 font-bold text-indigo-950">
                  <td className="px-4 py-2.5">
                    (=) UTILIDAD ANTES DE INTERESES E IMPUESTOS (UAII / EBIT)
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    {formatCurrency(cvuAndLeverage.currentUaii)}
                  </td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="px-4 py-2.5 text-slate-600">
                    (-) Intereses Financieros Anuales (I)
                  </td>
                  <td className="px-4 py-2.5 text-right text-rose-700">
                    {formatCurrency(cvu.interestExpense)}
                  </td>
                </tr>
                <tr className="border-b border-slate-200 font-bold">
                  <td className="px-4 py-2.5">(=) Utilidad Antes de Impuestos (UAI)</td>
                  <td className="px-4 py-2.5 text-right">
                    {formatCurrency(cvuAndLeverage.currentUai)}
                  </td>
                </tr>
                <tr className="bg-emerald-700 text-white font-bold">
                  <td className="px-4 py-3">
                    (=) UTILIDAD NETA DISPONIBLE PARA ACCIONISTAS ORDINARIOS
                  </td>
                  <td className="px-4 py-3 text-right">
                    {formatCurrency(cvuAndLeverage.currentNetIncome)}
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

