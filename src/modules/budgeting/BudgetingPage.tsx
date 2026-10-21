import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Boxes } from 'lucide-react';
import { useFinancialSystem } from '../../app/providers/FinancialContext';
import { AcademicDefenseCard } from '../../components/common/AcademicDefenseCard';
import { formatCurrency, formatNumber } from '../../components/common/formatters';

export const BudgetingPage: React.FC = () => {
  const {
    state,
    masterBudgetAndProforma: mb,
    inventoryResult,
    updateMasterBudget,
  } = useFinancialSystem();

  const b = state.masterBudget;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
            Módulo F • Unidad 3: Planeación Financiera
          </span>
          <h1 className="text-xl font-bold text-slate-900">
            Presupuesto Maestro, Operativo y Presupuesto de Caja
          </h1>
          <p className="text-xs text-slate-600">
            Cédulas presupuestarias integradas: Ventas, Compras, Costo de Bienes Vendidos,
            Gastos de Operación y Flujo de Caja Proyectado.
          </p>
        </div>

        <Link
          to="/finanzas/proforma"
          className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-sm transition-colors"
        >
          Ver Estados Proforma Resultantes →
        </Link>
      </div>

      {/* Vínculo con el módulo de Inventario (Requisito 7.2 Guía GFO 2026) */}
      {inventoryResult.productsInReorderAlert > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <div className="text-xs text-amber-900">
              <strong>Integración Inventario → Planeación de Compras:</strong> El módulo de
              Control de Inventario reporta{' '}
              <strong>{inventoryResult.productsInReorderAlert} productos</strong> bajo stock
              mínimo, sugiriendo una compra prioritaria por{' '}
              <strong>{formatCurrency(inventoryResult.totalSuggestedPurchaseCost)}</strong>.
            </div>
          </div>
          <Link
            to="/inventario"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold"
          >
            <Boxes className="w-3.5 h-3.5" />
            <span>Revisar Alertas de Inventario</span>
          </Link>
        </div>
      )}

      <AcademicDefenseCard
        moduleTitle="Presupuesto Maestro (Ventas, Compras, CBV, Gastos Operativos y Caja)"
        unitReference="Unidad 3: Planeación Financiera"
        codeFileLocation="src/core/finance/planningAndProforma.ts -> computeMasterBudgetAndProforma()"
        formulas={[
          {
            label: '1. Presupuesto de Ventas y Cobros',
            formula: 'Ventas Proyectadas = Unidades a Vender × Precio Proyectado',
            meaning:
              'Punto de partida de todo el Presupuesto Maestro; separa cobros al contado y cuentas por cobrar finales.',
          },
          {
            label: '2. Presupuesto de Compras y Costo de Bienes Vendidos (CBV)',
            formula: 'Unidades a Comprar = Unidades a Vender + Inv. Final Deseado - Inv. Inicial',
            meaning:
              'Determina cuántas unidades deben adquirirse y cuánto costarán, alimentando también el CBV proyectado.',
          },
          {
            label: '3. Presupuesto de Gastos Operativos',
            formula: 'Gastos Op. Caja = Gastos Fijos + (% Variable × Ventas) [Sin depreciación]',
            meaning:
              'Distingue entre el gasto contable total (que va al Estado de Resultados Proforma) y el desembolso real en efectivo.',
          },
          {
            label: '4. Presupuesto de Caja y Financiamiento Requerido',
            formula: 'Saldo Final = Saldo Inicial + Entradas de Caja - Salidas de Caja',
            meaning:
              'Permite anticipar excedentes de liquidez o necesidades de financiamiento externo frente al efectivo mínimo requerido.',
          },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Panel de Supuestos de Planificación */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900">
            Supuestos de Planificación ({b.projectionName})
          </h2>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-medium text-slate-600 mb-1">
                Unidades a Vender
              </label>
              <input
                type="number"
                value={b.projectedUnitsToSell}
                onChange={(e) =>
                  updateMasterBudget({ projectedUnitsToSell: Number(e.target.value) })
                }
                className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 font-semibold"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-600 mb-1">
                Precio Venta (C$)
              </label>
              <input
                type="number"
                value={b.projectedUnitPrice}
                onChange={(e) =>
                  updateMasterBudget({ projectedUnitPrice: Number(e.target.value) })
                }
                className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 font-semibold"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-600 mb-1">
                Costo Unit. Compra (C$)
              </label>
              <input
                type="number"
                value={b.projectedUnitCost}
                onChange={(e) =>
                  updateMasterBudget({ projectedUnitCost: Number(e.target.value) })
                }
                className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 font-semibold"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-600 mb-1">
                % Ventas Contado
              </label>
              <input
                type="number"
                min={0}
                max={100}
                value={b.cashSalesPct}
                onChange={(e) =>
                  updateMasterBudget({ cashSalesPct: Number(e.target.value) })
                }
                className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 font-semibold"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-600 mb-1">
                Inv. Inicial (Unid.)
              </label>
              <input
                type="number"
                value={b.initialInventoryUnits}
                onChange={(e) =>
                  updateMasterBudget({ initialInventoryUnits: Number(e.target.value) })
                }
                className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 font-semibold"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-600 mb-1">
                Inv. Final Deseado (Unid.)
              </label>
              <input
                type="number"
                value={b.desiredEndingInventoryUnits}
                onChange={(e) =>
                  updateMasterBudget({
                    desiredEndingInventoryUnits: Number(e.target.value),
                  })
                }
                className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 font-semibold"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-600 mb-1">
                % Compras Contado
              </label>
              <input
                type="number"
                min={0}
                max={100}
                value={b.cashPurchasesPct}
                onChange={(e) =>
                  updateMasterBudget({ cashPurchasesPct: Number(e.target.value) })
                }
                className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 font-semibold"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-600 mb-1">
                Gastos Op. Fijos (C$)
              </label>
              <input
                type="number"
                value={b.fixedOperatingExpenses}
                onChange={(e) =>
                  updateMasterBudget({ fixedOperatingExpenses: Number(e.target.value) })
                }
                className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 font-semibold"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-600 mb-1">
                Inversión CAPEX (C$)
              </label>
              <input
                type="number"
                value={b.capexOutflow}
                onChange={(e) =>
                  updateMasterBudget({ capexOutflow: Number(e.target.value) })
                }
                className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 font-semibold"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-600 mb-1">
                Efectivo Mínimo Req. (C$)
              </label>
              <input
                type="number"
                value={b.minimumCashRequired}
                onChange={(e) =>
                  updateMasterBudget({ minimumCashRequired: Number(e.target.value) })
                }
                className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 font-semibold"
              />
            </div>
          </div>
        </div>

        {/* Cédulas Presupuestarias Calculadas */}
        <div className="lg:col-span-2 space-y-5">
          {/* Cédulas Operativas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2 text-xs">
              <h3 className="font-bold text-blue-900 border-b border-slate-100 pb-1.5">
                1. Presupuesto de Ventas y Cobros
              </h3>
              <div className="flex justify-between">
                <span className="text-slate-600">Ventas Totales Proyectadas:</span>
                <strong className="text-slate-900">
                  {formatCurrency(mb.projectedSalesRevenue)}
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">
                  Cobros Ventas Contado ({b.cashSalesPct}%):
                </span>
                <strong>{formatCurrency(mb.cashCollectionsFromCurrentSales)}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">(+) Cobros Cartera Anterior:</span>
                <strong>{formatCurrency(b.collectionsFromPriorSales)}</strong>
              </div>
              <div className="flex justify-between pt-1.5 border-t border-slate-100 font-bold text-emerald-700">
                <span>Total Entradas por Cobros:</span>
                <span>{formatCurrency(mb.totalCashCollections)}</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2 text-xs">
              <h3 className="font-bold text-indigo-900 border-b border-slate-100 pb-1.5">
                2. Presupuesto de Compras y CBV
              </h3>
              <div className="flex justify-between">
                <span className="text-slate-600">Unidades Requeridas a Comprar:</span>
                <strong>{formatNumber(mb.requiredUnitsToBuyOrProduce, 0)} unid.</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Presupuesto Total de Compras:</span>
                <strong>{formatCurrency(mb.totalPurchasesCost)}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Costo de Bienes Vendidos (CBV):</span>
                <strong>{formatCurrency(mb.costOfGoodsSoldProjected)}</strong>
              </div>
              <div className="flex justify-between pt-1.5 border-t border-slate-100 font-bold text-rose-700">
                <span>Total Salidas por Pago a Proveedores:</span>
                <span>{formatCurrency(mb.totalCashPaymentsToSuppliers)}</span>
              </div>
            </div>
          </div>

          {/* Presupuesto de Gastos Operativos */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-xs">
            <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-2 mb-2">
              3. Presupuesto de Gastos de Operación
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <span className="text-slate-500 block">Gastos Variables ({b.variableOpExpensePct}%):</span>
                <strong className="text-sm">
                  {formatCurrency(mb.variableOperatingExpenses)}
                </strong>
              </div>
              <div>
                <span className="text-slate-500 block">Gastos Fijos Operativos:</span>
                <strong className="text-sm">
                  {formatCurrency(mb.fixedOperatingExpenses)}
                </strong>
              </div>
              <div>
                <span className="text-slate-500 block">Depreciación (No Caja):</span>
                <strong className="text-sm">
                  {formatCurrency(b.nonCashDepreciation)}
                </strong>
              </div>
              <div>
                <span className="text-blue-700 font-semibold block">
                  Desembolso Efectivo Op.:
                </span>
                <strong className="text-sm text-blue-900">
                  {formatCurrency(mb.cashOperatingExpenses)}
                </strong>
              </div>
            </div>
          </div>

          {/* Presupuesto de Caja (Cash Budget) */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold">
                4. Presupuesto de Caja (Flujo de Efectivo Proyectado)
              </h3>
              <span className="text-xs text-emerald-300 font-bold">
                Saldo Proyectado: {formatCurrency(mb.projectedEndingCashBalance)}
              </span>
            </div>
            <table className="w-full text-left border-collapse text-xs">
              <tbody>
                <tr className="border-b border-slate-100">
                  <td className="px-4 py-2 font-medium">(+) Total Entradas de Efectivo (Cobros)</td>
                  <td className="px-4 py-2 text-right font-bold text-emerald-700">
                    {formatCurrency(mb.totalCashInflows)}
                  </td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="px-4 py-2 font-medium">
                    (-) Total Salidas de Efectivo (Proveedores, Gastos Op., CAPEX, Intereses, IR, Dividendos)
                  </td>
                  <td className="px-4 py-2 text-right font-bold text-rose-700">
                    {formatCurrency(mb.totalCashOutflows)}
                  </td>
                </tr>
                <tr className="border-b border-slate-200 bg-slate-50 font-bold">
                  <td className="px-4 py-2">(=) Flujo Neto de Efectivo del Período</td>
                  <td className="px-4 py-2 text-right">
                    {formatCurrency(mb.netCashFlowBeforeFinancing)}
                  </td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="px-4 py-2">(+) Saldo Inicial de Caja</td>
                  <td className="px-4 py-2 text-right">
                    {formatCurrency(b.initialCashBalance)}
                  </td>
                </tr>
                <tr className="border-b border-blue-200 bg-blue-50 font-bold text-blue-950">
                  <td className="px-4 py-2.5">(=) SALDO FINAL DE EFECTIVO PROYECTADO</td>
                  <td className="px-4 py-2.5 text-right">
                    {formatCurrency(mb.projectedEndingCashBalance)}
                  </td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="px-4 py-2 text-slate-600">(-) Efectivo Mínimo Requerido</td>
                  <td className="px-4 py-2 text-right">
                    {formatCurrency(mb.minimumCashRequired)}
                  </td>
                </tr>
                <tr
                  className={`font-bold ${mb.cashSurplusOrDeficit >= 0
                      ? 'bg-emerald-700 text-white'
                      : 'bg-rose-700 text-white'
                    }`}
                >
                  <td className="px-4 py-2.5">
                    {mb.cashSurplusOrDeficit >= 0
                      ? '(=) EXCEDENTE DE CAJA DISPONIBLE PARA INVERSIÓN'
                      : '(=) DÉFICIT DE CAJA (FINANCIAMIENTO EXTERNO REQUERIDO)'}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    {formatCurrency(mb.cashSurplusOrDeficit)}
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

