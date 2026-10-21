import React, { useState } from 'react';
import { PlusCircle, Trash2 } from 'lucide-react';
import { useFinancialSystem } from '../../app/providers/FinancialContext';
import { CashFlowActivity, CashFlowDirection } from '../../data/types/financial';
import { AcademicDefenseCard } from '../../components/common/AcademicDefenseCard';
import { formatCurrency } from '../../components/common/formatters';

export const CashFlowPage: React.FC = () => {
  const {
    state,
    cashFlowResult,
    updateCashFlowInitialBalance,
    addCashFlowEntry,
    removeCashFlowEntry,
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
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase text-slate-500">
              <th className="px-4 py-2">Concepto del Movimiento</th>
              <th className="px-4 py-2">Tipo</th>
              <th className="px-4 py-2 text-right">Monto (C$)</th>
              <th className="px-4 py-2 text-right">Acción</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-2 font-medium text-slate-800">{r.concept}</td>
                <td className="px-4 py-2">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${r.direction === 'ENTRADA'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                  >
                    {r.direction}
                  </span>
                </td>
                <td
                  className={`px-4 py-2 text-right font-bold ${r.direction === 'ENTRADA' ? 'text-emerald-700' : 'text-rose-700'
                    }`}
                >
                  {r.direction === 'ENTRADA' ? '+' : '-'}
                  {formatCurrency(r.amount)}
                </td>
                <td className="px-4 py-2 text-right">
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
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
          Módulo E • Unidad 3: Planeación Financiera
        </span>
        <h1 className="text-xl font-bold text-slate-900">
          Estado de Flujo de Efectivo (Operación, Inversión y Financiamiento)
        </h1>
        <p className="text-xs text-slate-600">
          Clasificación de entradas y salidas de efectivo, variación neta del período y
          conciliación con el saldo final de caja.
        </p>
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
              'Concilia exactamente la variación de liquidez entre el Balance General inicial (C$ 180,000) y el Balance General final (C$ 240,000).',
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
            (=) Variación Neta Efectivo
          </span>
          <p className="text-lg font-extrabold text-blue-950 mt-1">
            {formatCurrency(cashFlowResult.netCashVariation)}
          </p>
        </div>
        <div className="bg-slate-900 text-white p-4 rounded-xl shadow-sm">
          <span className="text-[11px] font-bold text-emerald-300 block">
            (=) Saldo Final de Caja
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
            '1. Actividades de Operación (Cobros a clientes, pagos a proveedores, gastos, IR)',
            cashFlowResult.netOperatingCashFlow
          )}
          {renderSection(
            'INVERSION',
            '2. Actividades de Inversión (Adquisición o venta de Propiedad, Planta y Equipo)',
            cashFlowResult.netInvestingCashFlow
          )}
          {renderSection(
            'FINANCIAMIENTO',
            '3. Actividades de Financiamiento (Préstamos, Capital Social y Dividendos)',
            cashFlowResult.netFinancingCashFlow
          )}
        </div>

        <div className="space-y-5">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900">
              Saldo Inicial de Efectivo (C$)
            </h3>
            <input
              type="number"
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
                Registrar Movimiento de Efectivo
              </h3>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Concepto
              </label>
              <input
                type="text"
                required
                placeholder="Ej. Cobro de cartera vencida"
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
                required
                min={1}
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

