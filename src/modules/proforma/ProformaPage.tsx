import React from 'react';
import { useFinancialSystem } from '../../app/providers/FinancialContext';
import { AcademicDefenseCard } from '../../components/common/AcademicDefenseCard';
import { formatCurrency, formatPct } from '../../components/common/formatters';

export const ProformaPage: React.FC = () => {
  const {
    state,
    activePeriod,
    activeTotals,
    masterBudgetAndProforma: pf,
    duPont,
    cvuAndLeverage,
  } = useFinancialSystem();

  const b = state.masterBudget;

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
          Módulo G • Unidad 3: Planeación Financiera
        </span>
        <h1 className="text-xl font-bold text-slate-900">
          Estados Financieros Proforma e Informe Ejecutivo Integrado
        </h1>
        <p className="text-xs text-slate-600">
          Proyección del Estado de Resultados y Balance General comparando el período real (
          {activePeriod.name}) frente al escenario proyectado ({b.projectionName}).
        </p>
      </div>

      <AcademicDefenseCard
        moduleTitle="Estados Financieros Proforma e Integración para Decisiones"
        unitReference="Unidad 3: Planeación Financiera"
        codeFileLocation="src/core/finance/planningAndProforma.ts -> computeMasterBudgetAndProforma()"
        formulas={[
          {
            label: 'Estado de Resultados Proforma',
            formula: 'Utilidad Neta Proforma = (Ventas Proy. - CBV Proy. - Gastos Op. Proy. - Intereses) × (1 - IR)',
            meaning:
              'Sintetiza la rentabilidad futura esperada si se cumplen las metas del Presupuesto Maestro.',
          },
          {
            label: 'Balance General Proforma',
            formula: 'Integra Caja Final, Cuentas por Cobrar Finales, Inventario Final, CAPEX y Utilidades Retenidas',
            meaning:
              'Permite verificar la solidez patrimonial futura y detectar si se requerirá financiamiento adicional.',
          },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Estado de Resultados Proforma Comparativo */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 bg-slate-900 text-white">
            <h2 className="text-sm font-bold">
              1. Estado de Resultados Proforma Comparativo
            </h2>
            <p className="text-[11px] text-slate-300">
              Real ({activePeriod.name}) vs Proyectado ({b.projectionName})
            </p>
          </div>
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase text-slate-600">
                <th className="px-4 py-2.5">Rubro</th>
                <th className="px-4 py-2.5 text-right">Real {activePeriod.name}</th>
                <th className="px-4 py-2.5 text-right text-emerald-700">Proforma Proy.</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100">
                <td className="px-4 py-2 font-medium">Ventas Netas</td>
                <td className="px-4 py-2 text-right">
                  {formatCurrency(activeTotals.ventasNetas)}
                </td>
                <td className="px-4 py-2 text-right font-bold text-emerald-800">
                  {formatCurrency(pf.projectedSalesRevenue)}
                </td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="px-4 py-2 text-slate-600">(-) Costo de Bienes Vendidos</td>
                <td className="px-4 py-2 text-right">
                  {formatCurrency(activeTotals.costoBienesVendidos)}
                </td>
                <td className="px-4 py-2 text-right">
                  {formatCurrency(pf.costOfGoodsSoldProjected)}
                </td>
              </tr>
              <tr className="border-b border-slate-200 bg-slate-50 font-bold">
                <td className="px-4 py-2">(=) Utilidad Bruta</td>
                <td className="px-4 py-2 text-right">
                  {formatCurrency(activeTotals.utilidadBruta)}
                </td>
                <td className="px-4 py-2 text-right text-emerald-900">
                  {formatCurrency(pf.proformaGrossProfit)}
                </td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="px-4 py-2 text-slate-600">
                  (-) Gastos Operativos (incluye depreciación)
                </td>
                <td className="px-4 py-2 text-right">
                  {formatCurrency(activeTotals.totalGastosOperativos)}
                </td>
                <td className="px-4 py-2 text-right">
                  {formatCurrency(pf.totalOperatingExpensesWithDepreciation)}
                </td>
              </tr>
              <tr className="border-b border-indigo-200 bg-indigo-50/60 font-bold text-indigo-950">
                <td className="px-4 py-2">(=) Utilidad Operativa (UAII)</td>
                <td className="px-4 py-2 text-right">
                  {formatCurrency(activeTotals.uaii)}
                </td>
                <td className="px-4 py-2 text-right">
                  {formatCurrency(pf.proformaUaii)}
                </td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="px-4 py-2 text-slate-600">(-) Gastos Financieros (Intereses)</td>
                <td className="px-4 py-2 text-right">
                  {formatCurrency(activeTotals.gastosFinancieros)}
                </td>
                <td className="px-4 py-2 text-right">
                  {formatCurrency(b.interestPayment)}
                </td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="px-4 py-2 text-slate-600">
                  (-) Impuesto sobre la Renta ({activePeriod.taxRate}%)
                </td>
                <td className="px-4 py-2 text-right">
                  {formatCurrency(activeTotals.impuestos)}
                </td>
                <td className="px-4 py-2 text-right">
                  {formatCurrency(pf.proformaTaxes)}
                </td>
              </tr>
              <tr className="bg-emerald-700 text-white font-bold">
                <td className="px-4 py-3">(=) UTILIDAD NETA</td>
                <td className="px-4 py-3 text-right">
                  {formatCurrency(activeTotals.utilidadNeta)}
                </td>
                <td className="px-4 py-3 text-right">
                  {formatCurrency(pf.proformaNetIncome)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Balance Proforma y Dictamen Integrado */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 bg-slate-900 text-white">
              <h2 className="text-sm font-bold">
                2. Estructura Patrimonial Proforma Consolidada
              </h2>
            </div>
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase text-slate-600">
                  <th className="px-4 py-2.5">Masa Patrimonial</th>
                  <th className="px-4 py-2.5 text-right">Real {activePeriod.name}</th>
                  <th className="px-4 py-2.5 text-right text-blue-700">Proforma Proy.</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-100">
                  <td className="px-4 py-2 font-medium">Total Activo Corriente</td>
                  <td className="px-4 py-2 text-right">
                    {formatCurrency(activeTotals.totalActivoCorriente)}
                  </td>
                  <td className="px-4 py-2 text-right font-semibold">
                    {formatCurrency(pf.proformaTotalCurrentAssets)}
                  </td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="px-4 py-2 font-medium">Total Activo No Corriente (Neto)</td>
                  <td className="px-4 py-2 text-right">
                    {formatCurrency(activeTotals.totalActivoNoCorriente)}
                  </td>
                  <td className="px-4 py-2 text-right font-semibold">
                    {formatCurrency(pf.proformaNetFixedAssets)}
                  </td>
                </tr>
                <tr className="border-b border-blue-200 bg-blue-50 font-bold text-blue-950">
                  <td className="px-4 py-2.5">TOTAL ACTIVOS PROYECTADOS</td>
                  <td className="px-4 py-2.5 text-right">
                    {formatCurrency(activeTotals.totalActivos)}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    {formatCurrency(pf.proformaTotalAssets)}
                  </td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="px-4 py-2 font-medium">Total Pasivos Proyectados</td>
                  <td className="px-4 py-2 text-right">
                    {formatCurrency(activeTotals.totalPasivos)}
                  </td>
                  <td className="px-4 py-2 text-right font-semibold">
                    {formatCurrency(pf.proformaTotalLiabilities)}
                  </td>
                </tr>
                <tr className="border-b border-slate-200 font-bold">
                  <td className="px-4 py-2">Patrimonio Proyectado (incl. Utilidad Retenida)</td>
                  <td className="px-4 py-2 text-right">
                    {formatCurrency(activeTotals.totalPatrimonio)}
                  </td>
                  <td className="px-4 py-2 text-right text-emerald-800">
                    {formatCurrency(pf.proformaTotalEquity)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900">
              Dictamen Financiero Integrado para Toma de Decisiones
            </h3>
            <p className="text-xs text-slate-700 leading-relaxed">
              1. <strong>Crecimiento de Utilidades:</strong> La proyección muestra un paso de
              una Utilidad Neta de <strong>{formatCurrency(activeTotals.utilidadNeta)}</strong>{' '}
              a <strong>{formatCurrency(pf.proformaNetIncome)}</strong> (Margen Neto Proforma:{' '}
              <strong>{formatPct(pf.proformaNetMarginPct)}</strong>).
            </p>
            <p className="text-xs text-slate-700 leading-relaxed">
              2. <strong>Solvencia de Caja:</strong> El Presupuesto de Caja proyecta un saldo
              final de <strong>{formatCurrency(pf.projectedEndingCashBalance)}</strong> frente
              a un mínimo requerido de{' '}
              <strong>{formatCurrency(pf.minimumCashRequired)}</strong>.
            </p>
            <p className="text-xs text-slate-700 leading-relaxed">
              3. <strong>Respaldo Operativo (C-V-U y DuPont):</strong> Con un ROE actual de{' '}
              <strong>{formatPct(duPont.roeDuPontPct)}</strong> y un margen de seguridad sobre
              el punto de equilibrio de{' '}
              <strong>{formatPct(cvuAndLeverage.safetyMarginPct)}</strong>, la empresa cuenta
              con holgura financiera para ejecutar su plan de expansión e inversión en activo
              fijo.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

