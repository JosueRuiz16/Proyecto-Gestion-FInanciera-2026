import React, { useState } from 'react';
import { PlusCircle, RefreshCw, Trash2 } from 'lucide-react';
import { useFinancialSystem } from '../../app/providers/FinancialContext';
import { CashFlowActivity, CashFlowDirection } from '../../data/types/financial';
import { AcademicDefenseCard } from '../../components/common/AcademicDefenseCard';
import { formatCurrency } from '../../components/common/formatters';

export const CashFlowPage: React.FC = () => {
  const {
    state,
    comparisonPeriod,
    activePeriod,
    cashFlowResult,
    updateCashFlowInitialBalance,
    updateCashFlowEntry,
    addCashFlowEntry,
    removeCashFlowEntry,
    syncCashFlowInitialWithBalance,
  } = useFinancialSystem();

  const [concept, setConcept] = useState('');
  const [activity, setActivity] = useState<CashFlowActivity>('OPERACION');
  const [direction, setDirection] = useState<CashFlowDirection>('ENTRADA');
  const [amount, setAmount] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!concept.trim() || !amount) return;
    addCashFlowEntry({
      concept: concept.trim(),
      activity,
      direction,
      amount: Math.max(0, Number(amount)),
    });
    setConcept('');
    setAmount('');
  };

  const renderSection = (act: CashFlowActivity, title: string, netVal: number) => {
    const rows = state.cashFlowEntries.filter((e) => e.activity === act);
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3 bg-slate-900 text-white flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider">{title}</h3>
          <span
            className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${netVal >= 0
              ? 'bg-emerald-500/20 text-emerald-300'
              : 'bg-rose-500/20 text-rose-300'
              }`}
          >
            Flujo Neto: {formatCurrency(netVal)}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase text-slate-500">
                <th className="px-3 py-2">Concepto del Movimiento (Editable)</th>
                <th className="px-3 py-2 w-28">Tipo</th>
                <th className="px-3 py-2 text-right w-40">Monto (C$)</th>
                <th className="px-3 py-2 text-right w-12">Acción</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-4 text-center text-slate-400">
                    Sin movimientos registrados en esta actividad. Usa el formulario derecho para agregar.
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-3 py-1.5">
                      <input
                        type="text"
                        value={r.concept}
                        onChange={(e) =>
                          updateCashFlowEntry(r.id, { concept: e.target.value })
                        }
                        className="w-full font-medium text-slate-800 bg-transparent border border-transparent hover:border-slate-300 focus:border-blue-500 focus:bg-white rounded px-1.5 py-1"
                      />
                    </td>
                    <td className="px-3 py-1.5">
                      <select
                        value={r.direction}
                        onChange={(e) =>
                          updateCashFlowEntry(r.id, {
                            direction: e.target.value as CashFlowDirection,
                          })
                        }
                        className={`text-[11px] font-bold px-2 py-1 rounded-lg border ${r.direction === 'ENTRADA'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}
                      >
                        <option value="ENTRADA">ENTRADA (+)</option>
                        <option value="SALIDA">SALIDA (-)</option>
                      </select>
                    </td>
                    <td className="px-3 py-1.5 text-right">
                      <input
                        type="number"
                        min={0}
                        step="any"
                        value={r.amount}
                        onChange={(e) =>
                          updateCashFlowEntry(r.id, {
                            amount: Math.max(0, Number(e.target.value)),
                          })
                        }
                        className={`w-36 text-right font-bold rounded px-2 py-1 border ${r.direction === 'ENTRADA'
                          ? 'text-emerald-700 border-emerald-200 bg-emerald-50/30'
                          : 'text-rose-700 border-rose-200 bg-rose-50/30'
                          }`}
                      />
                    </td>
                    <td className="px-3 py-1.5 text-right">
                      <button
                        type="button"
                        onClick={() => removeCashFlowEntry(r.id)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                        title="Eliminar movimiento"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
            Módulo E • Unidad 3: Planeación Financiera
          </span>
          <h1 className="text-xl font-bold text-slate-900">
            Estado Consolidado de Flujos de Efectivo (Operación, Inversión y Financiamiento)
          </h1>
          <p className="text-xs text-slate-600">
            Todos los conceptos, tipos de flujo y montos son editables en línea y concilian el
            efectivo entre {comparisonPeriod.name} y {activePeriod.name}.
          </p>
        </div>

        <button
          type="button"
          onClick={syncCashFlowInitialWithBalance}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Sincronizar Saldo Inicial con Efectivo ({comparisonPeriod.name})</span>
        </button>
      </div>

      <AcademicDefenseCard
        moduleTitle="Estado de Flujo de Efectivo por Actividades"
        unitReference="Unidad 3: Planeación Financiera"
        codeFileLocation="src/core/finance/planningAndProforma.ts -> computeCashFlowStatement()"
        formulas={[
          {
            label: 'Flujos por Actividad (FEO, FEI, FEF)',
            formula: 'Flujo Neto Actividad = Σ Entradas de Efectivo - Σ Salidas de Efectivo',
            meaning:
              'Separa el efectivo generado por el giro del negocio (Operación), compra/venta de activos de largo plazo (Inversión) y deuda/capital (Financiamiento).',
          },
          {
            label: 'Variación Neta del Efectivo y Saldo Final',
            formula: 'Variación Neta = FEO + FEI + FEF | Saldo Final = Saldo Inicial + Variación Neta',
            meaning:
              'Concilia exactamente la variación de liquidez entre el Balance General inicial y el Balance General final.',
          },
        ]}
      />

      {/* Resumen superior de Flujos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 block">
            1. Flujo Operativo (FEO)
          </span>
          <p className="text-lg font-extrabold text-emerald-700 mt-1">
            {formatCurrency(cashFlowResult.netOperatingCashFlow)}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 block">
            2. Flujo Inversión (FEI)
          </span>
          <p className="text-lg font-extrabold text-amber-700 mt-1">
            {formatCurrency(cashFlowResult.netInvestingCashFlow)}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 block">
            3. Flujo Financiamiento (FEF)
          </span>
          <p className="text-lg font-extrabold text-indigo-700 mt-1">
            {formatCurrency(cashFlowResult.netFinancingCashFlow)}
          </p>
        </div>
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 shadow-sm">
          <span className="text-[11px] font-bold text-blue-800 block">
            (=) Aumento / Disminución Neta
          </span>
          <p className="text-lg font-extrabold text-blue-950 mt-1">
            {formatCurrency(cashFlowResult.netCashVariation)}
          </p>
        </div>
        <div className="bg-slate-900 text-white p-4 rounded-xl shadow-sm">
          <span className="text-[11px] font-bold text-emerald-300 block">
            (=) Efectivo al Final del Año
          </span>
          <p className="text-lg font-extrabold text-white mt-1">
            {formatCurrency(cashFlowResult.endingCashBalance)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          {renderSection(
            'OPERACION',
            '1. Actividades de Operación (Efectivo de operación, intereses e impuestos)',
            cashFlowResult.netOperatingCashFlow
          )}
          {renderSection(
            'INVERSION',
            '2. Actividades de Inversión (Adiciones de PPE, intangibles y préstamos relacionados)',
            cashFlowResult.netInvestingCashFlow
          )}
          {renderSection(
            'FINANCIAMIENTO',
            '3. Actividades de Financiamiento (Préstamos, documentos, acciones preferentes y dividendos)',
            cashFlowResult.netFinancingCashFlow
          )}
        </div>

        <div className="space-y-5">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900">
              Efectivo al Inicio del Año (C$)
            </h3>
            <input
              type="number"
              step="any"
              value={state.cashFlowInitialBalance}
              onChange={(e) => updateCashFlowInitialBalance(Number(e.target.value))}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-bold text-slate-900"
            />
            <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200">
              {cashFlowResult.interpretation}
            </p>
          </div>

          <form
            onSubmit={handleAdd}
            className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3"
          >
            <div className="flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Registrar Nuevo Movimiento de Efectivo
              </h3>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Concepto
              </label>
              <input
                type="text"
                required
                placeholder="Ej. Cobro de cartera o adquisición de equipo"
                value={concept}
                onChange={(e) => setConcept(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Actividad
                </label>
                <select
                  value={activity}
                  onChange={(e) => setActivity(e.target.value as CashFlowActivity)}
                  className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs"
                >
                  <option value="OPERACION">Operación</option>
                  <option value="INVERSION">Inversión</option>
                  <option value="FINANCIAMIENTO">Financiamiento</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Flujo
                </label>
                <select
                  value={direction}
                  onChange={(e) => setDirection(e.target.value as CashFlowDirection)}
                  className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs"
                >
                  <option value="ENTRADA">Entrada (+)</option>
                  <option value="SALIDA">Salida (-)</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Monto en Córdobas (C$)
              </label>
              <input
                type="number"
                step="any"
                required
                min={0}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors"
            >
              Agregar al Flujo de Efectivo
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
