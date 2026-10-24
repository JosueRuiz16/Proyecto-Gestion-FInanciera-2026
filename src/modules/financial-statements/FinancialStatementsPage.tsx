import React, { useState } from 'react';
import {
  CheckCircle2,
  PlusCircle,
  AlertTriangle,
  RotateCcw,
  FilePlus2,
  Trash2,
  Calculator,
} from 'lucide-react';
import { useFinancialSystem } from '../../app/providers/FinancialContext';
import { AccountCategory, AccountSubType } from '../../data/types/financial';
import { AcademicDefenseCard } from '../../components/common/AcademicDefenseCard';
import { formatCurrency } from '../../components/common/formatters';

export const FinancialStatementsPage: React.FC = () => {
  const {
    state,
    comparisonPeriod,
    activePeriod,
    comparisonTotals,
    activeTotals,
    updatePeriod,
    updateAccountBalance,
    updateAccountMeta,
    addAccount,
    removeAccount,
    updateCompanyInfo,
    resetDemoData,
    clearForNewCase,
  } = useFinancialSystem();

  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState<AccountCategory>('ACTIVO_CORRIENTE');
  const [newSubType, setNewSubType] = useState<AccountSubType>('OTROS_ACTIVOS_CORRIENTES');
  const [newAmountBase, setNewAmountBase] = useState('0');
  const [newAmountActive, setNewAmountActive] = useState('0');

  const defaultSubTypeMap: Record<AccountCategory, AccountSubType> = {
    ACTIVO_CORRIENTE: 'OTROS_ACTIVOS_CORRIENTES',
    ACTIVO_NO_CORRIENTE: 'ACTIVO_FIJO_NETO',
    PASIVO_CORRIENTE: 'CUENTAS_POR_PAGAR',
    PASIVO_NO_CORRIENTE: 'DEUDA_LARGO_PLAZO',
    PATRIMONIO: 'UTILIDADES_RETENIDAS',
    INGRESO_OPERATIVO: 'VENTAS_NETAS',
    COSTO_VENTAS: 'COSTO_BIENES_VENDIDOS',
    GASTO_OPERATIVO: 'GASTOS_VENTA_ADMIN',
    GASTO_FINANCIERO: 'INTERESES_PAGADOS',
  };

  const handleCategoryChange = (cat: AccountCategory) => {
    setNewCategory(cat);
    setNewSubType(defaultSubTypeMap[cat]);
  };

  const handleAddAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim() || !newName.trim()) return;

    addAccount({
      code: newCode.trim(),
      name: newName.trim(),
      category: newCategory,
      subType: newSubType,
      balances: {
        [comparisonPeriod.id]: Number(newAmountBase) || 0,
        [activePeriod.id]: Number(newAmountActive) || 0,
      },
    });
    setNewCode('');
    setNewName('');
    setNewAmountBase('0');
    setNewAmountActive('0');
  };

  const renderCategoryRows = (category: AccountCategory, title: string) => {
    const rows = state.accounts.filter((a) => a.category === category);
    return (
      <>
        <tr className="bg-slate-100/80">
          <td colSpan={5} className="px-3 py-2 text-xs font-bold uppercase text-slate-700">
            {title}
          </td>
        </tr>
        {rows.map((acc) => (
          <tr key={acc.id} className="border-b border-slate-100 hover:bg-slate-50/80">
            <td className="px-2 py-1.5 w-16">
              <input
                type="text"
                value={acc.code}
                onChange={(e) => updateAccountMeta(acc.id, { code: e.target.value })}
                className="w-14 font-mono text-[11px] text-slate-600 bg-transparent border border-transparent hover:border-slate-300 focus:border-blue-500 focus:bg-white rounded px-1 py-0.5"
              />
            </td>
            <td className="px-2 py-1.5">
              <input
                type="text"
                value={acc.name}
                onChange={(e) => updateAccountMeta(acc.id, { name: e.target.value })}
                className="w-full text-xs font-medium text-slate-800 bg-transparent border border-transparent hover:border-slate-300 focus:border-blue-500 focus:bg-white rounded px-1.5 py-0.5"
              />
            </td>
            <td className="px-2 py-1.5 text-right">
              <input
                type="number"
                step="any"
                value={acc.balances[comparisonPeriod.id] ?? 0}
                onChange={(e) =>
                  updateAccountBalance(acc.id, comparisonPeriod.id, Number(e.target.value))
                }
                className="w-32 text-right bg-white border border-slate-300 rounded px-2 py-1 text-xs font-semibold text-slate-800 focus:border-blue-500 focus:outline-none"
              />
            </td>
            <td className="px-2 py-1.5 text-right">
              <input
                type="number"
                step="any"
                value={acc.balances[activePeriod.id] ?? 0}
                onChange={(e) =>
                  updateAccountBalance(acc.id, activePeriod.id, Number(e.target.value))
                }
                className="w-32 text-right bg-blue-50/50 border border-blue-300 rounded px-2 py-1 text-xs font-bold text-blue-900 focus:border-blue-600 focus:outline-none"
              />
            </td>
            <td className="px-2 py-1.5 text-center w-8">
              <button
                type="button"
                onClick={() => removeAccount(acc.id)}
                title="Eliminar cuenta"
                className="text-slate-400 hover:text-rose-600 p-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </td>
          </tr>
        ))}
      </>
    );
  };

  return (
    <div className="space-y-6">
      {/* Encabezado y Botones de Carga de Ejemplo / Nuevo Caso */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
            Módulo A • Unidad 2
          </span>
          <h1 className="text-xl font-bold text-slate-900">
            Estados Financieros Consolidados (Balance General y Estado de Resultados)
          </h1>
          <p className="text-xs text-slate-600">
            Todos los datos (empresa, períodos, cuentas, montos e impuestos) son editables en
            tiempo real y alimentan automáticamente todos los módulos.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              if (
                window.confirm(
                  '¿Cargar todos los datos del Ejemplo del PDF (Corporación Agrícola, S. A. y subsidiarias 2023-2024) en todos los módulos?'
                )
              ) {
                resetDemoData();
              }
            }}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Cargar Ejemplo PDF (Agrícola 2023–2024)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (
                window.confirm(
                  '¿Limpiar todas las cifras para ingresar otra empresa o ejercicio desde cero?'
                )
              ) {
                clearForNewCase();
              }
            }}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-bold shadow-sm transition-colors"
          >
            <FilePlus2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Limpiar / Llenar Otro Caso</span>
          </button>
        </div>
      </div>

      {/* Panel Editable de Datos Generales de la Empresa, Períodos y Mercado */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Datos Editables de la Empresa, Períodos e Indicadores Bursátiles
          </h2>
          <span className="text-[11px] text-slate-500">
            Puedes modificar el nombre de la empresa, años o moneda para cualquier otro caso
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3 text-xs">
          <div className="sm:col-span-2">
            <label className="block text-[11px] font-medium text-slate-500 mb-1">
              Nombre de la Empresa
            </label>
            <input
              type="text"
              value={state.company.name}
              onChange={(e) => updateCompanyInfo({ name: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-[11px] font-medium text-slate-500 mb-1">
              Sector / Actividad Principal
            </label>
            <input
              type="text"
              value={state.company.sector}
              onChange={(e) => updateCompanyInfo({ sector: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1">
              Etiqueta Período Base
            </label>
            <input
              type="text"
              value={comparisonPeriod.name}
              onChange={(e) =>
                updatePeriod(comparisonPeriod.id, { name: e.target.value })
              }
              className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1">
              Etiqueta Período Activo
            </label>
            <input
              type="text"
              value={activePeriod.name}
              onChange={(e) => updatePeriod(activePeriod.id, { name: e.target.value })}
              className="w-full border border-blue-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-blue-900"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1">
              Tasa IR (%)
            </label>
            <input
              type="number"
              min={0}
              max={100}
              step="any"
              value={activePeriod.taxRate}
              onChange={(e) => {
                const rate = Math.max(0, Number(e.target.value));
                updatePeriod(activePeriod.id, { taxRate: rate });
                updatePeriod(comparisonPeriod.id, { taxRate: rate });
              }}
              className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1">
              Acciones Comunes (Nota 34)
            </label>
            <input
              type="number"
              min={1}
              value={state.company.sharesOutstanding}
              onChange={(e) =>
                updateCompanyInfo({
                  sharesOutstanding: Math.max(1, Number(e.target.value)),
                })
              }
              className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1">
              Precio / Valor Acción (C$)
            </label>
            <input
              type="number"
              min={0}
              step="any"
              value={state.company.marketPricePerShare}
              onChange={(e) =>
                updateCompanyInfo({
                  marketPricePerShare: Math.max(0, Number(e.target.value)),
                })
              }
              className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1">
              Moneda
            </label>
            <input
              type="text"
              value={state.company.currency}
              onChange={(e) => updateCompanyInfo({ currency: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold"
            />
          </div>
        </div>
      </div>

      <AcademicDefenseCard
        moduleTitle="Balance General y Estado de Resultados"
        unitReference="Unidad 2: Análisis Financiero"
        codeFileLocation="src/core/finance/statements.ts -> computeFinancialStatements()"
        formulas={[
          {
            label: 'Ecuación Contable Fundamental (Balance General)',
            formula: 'Total Activos = Total Pasivos + Total Patrimonio',
            meaning:
              'Todo recurso económico que posee la empresa (Activo) ha sido financiado por acreedores (Pasivo) o por los propietarios (Patrimonio).',
          },
          {
            label: 'Utilidad Bruta y Utilidad Operativa (UAII / EBIT)',
            formula: 'Utilidad Bruta = Ventas - CBV | UAII = Utilidad Bruta - Gastos Operativos',
            meaning:
              'Mide la ganancia generada exclusivamente por el giro principal del negocio antes de costos financieros e impuestos.',
          },
          {
            label: 'Utilidad Neta del Ejercicio',
            formula: 'Utilidad Neta = UAI - Provisión para el Impuesto sobre la Renta',
            meaning:
              'Representa el beneficio residual neto disponible para los accionistas que alimenta el ROE, la UPA y el Sistema DuPont.',
          },
          {
            label: 'Integración con los demás Módulos',
            formula: 'Estados Financieros -> Análisis, Razones, DuPont, C-V-U, Apalancamiento y Proforma',
            meaning:
              'Ningún indicador se guarda de forma estática; al cambiar una cuenta aquí, se recalculan en cascada todos los módulos dependientes.',
          },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* BALANCE GENERAL */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold">1. Balance General Consolidado</h2>
              <p className="text-[11px] text-slate-300">
                Valores expresados en {state.company.currency} (Edita cualquier cuenta o monto)
              </p>
            </div>
            {activeTotals.estaCuadrado ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                <CheckCircle2 className="w-3.5 h-3.5" /> Cuadrado
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-500/20 text-rose-300 border border-rose-400/30">
                <AlertTriangle className="w-3.5 h-3.5" /> Descuadre:{' '}
                {formatCurrency(activeTotals.diferenciaCuadre)}
              </span>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase text-slate-500">
                  <th className="px-2 py-2.5">Cód.</th>
                  <th className="px-2 py-2.5">Cuenta Contable</th>
                  <th className="px-2 py-2.5 text-right">{comparisonPeriod.name} (C$)</th>
                  <th className="px-2 py-2.5 text-right text-blue-700">{activePeriod.name} (C$)</th>
                  <th className="px-2 py-2.5 text-center"></th>
                </tr>
              </thead>
              <tbody>
                {renderCategoryRows('ACTIVO_CORRIENTE', 'Activos Corrientes (Circulantes)')}
                <tr className="bg-blue-50/40 font-bold text-xs border-b border-slate-200">
                  <td colSpan={2} className="px-3 py-2 text-slate-800">
                    Total Activo Corriente
                  </td>
                  <td className="px-2 py-2 text-right">
                    {formatCurrency(comparisonTotals.totalActivoCorriente)}
                  </td>
                  <td className="px-2 py-2 text-right text-blue-800">
                    {formatCurrency(activeTotals.totalActivoCorriente)}
                  </td>
                  <td></td>
                </tr>

                {renderCategoryRows('ACTIVO_NO_CORRIENTE', 'Activos No Corrientes (Fijos y Otros)')}
                <tr className="bg-blue-50/40 font-bold text-xs border-b border-slate-200">
                  <td colSpan={2} className="px-3 py-2 text-slate-800">
                    Total Activo No Corriente
                  </td>
                  <td className="px-2 py-2 text-right">
                    {formatCurrency(comparisonTotals.totalActivoNoCorriente)}
                  </td>
                  <td className="px-2 py-2 text-right text-blue-800">
                    {formatCurrency(activeTotals.totalActivoNoCorriente)}
                  </td>
                  <td></td>
                </tr>
                <tr className="bg-blue-600 text-white font-bold text-xs">
                  <td colSpan={2} className="px-3 py-2.5">
                    TOTAL ACTIVOS
                  </td>
                  <td className="px-2 py-2.5 text-right">
                    {formatCurrency(comparisonTotals.totalActivos)}
                  </td>
                  <td className="px-2 py-2.5 text-right">
                    {formatCurrency(activeTotals.totalActivos)}
                  </td>
                  <td></td>
                </tr>

                {renderCategoryRows('PASIVO_CORRIENTE', 'Pasivos Corrientes (Corto Plazo)')}
                <tr className="bg-slate-50 font-bold text-xs border-b border-slate-200">
                  <td colSpan={2} className="px-3 py-2 text-slate-800">
                    Total Pasivo Corriente
                  </td>
                  <td className="px-2 py-2 text-right">
                    {formatCurrency(comparisonTotals.totalPasivoCorriente)}
                  </td>
                  <td className="px-2 py-2 text-right text-blue-800">
                    {formatCurrency(activeTotals.totalPasivoCorriente)}
                  </td>
                  <td></td>
                </tr>

                {renderCategoryRows('PASIVO_NO_CORRIENTE', 'Pasivos No Corrientes (Largo Plazo)')}
                <tr className="bg-slate-50 font-bold text-xs border-b border-slate-200">
                  <td colSpan={2} className="px-3 py-2 text-slate-800">
                    Total Pasivo No Corriente
                  </td>
                  <td className="px-2 py-2 text-right">
                    {formatCurrency(comparisonTotals.totalPasivoNoCorriente)}
                  </td>
                  <td className="px-2 py-2 text-right text-blue-800">
                    {formatCurrency(activeTotals.totalPasivoNoCorriente)}
                  </td>
                  <td></td>
                </tr>
                <tr className="bg-slate-100 font-bold text-xs border-b border-slate-200">
                  <td colSpan={2} className="px-3 py-2 text-slate-900">
                    TOTAL PASIVOS
                  </td>
                  <td className="px-2 py-2 text-right">
                    {formatCurrency(comparisonTotals.totalPasivos)}
                  </td>
                  <td className="px-2 py-2 text-right text-blue-900">
                    {formatCurrency(activeTotals.totalPasivos)}
                  </td>
                  <td></td>
                </tr>

                {renderCategoryRows('PATRIMONIO', 'Patrimonio / Capital Contable')}
                <tr className="bg-slate-100 font-bold text-xs border-b border-slate-200">
                  <td colSpan={2} className="px-3 py-2 text-slate-900">
                    TOTAL PATRIMONIO
                  </td>
                  <td className="px-2 py-2 text-right">
                    {formatCurrency(comparisonTotals.totalPatrimonio)}
                  </td>
                  <td className="px-2 py-2 text-right text-blue-900">
                    {formatCurrency(activeTotals.totalPatrimonio)}
                  </td>
                  <td></td>
                </tr>

                <tr className="bg-slate-900 text-white font-bold text-xs">
                  <td colSpan={2} className="px-3 py-2.5">
                    TOTAL PASIVOS Y PATRIMONIO
                  </td>
                  <td className="px-2 py-2.5 text-right">
                    {formatCurrency(comparisonTotals.totalPasivoMasPatrimonio)}
                  </td>
                  <td className="px-2 py-2.5 text-right">
                    {formatCurrency(activeTotals.totalPasivoMasPatrimonio)}
                  </td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* ESTADO DE RESULTADOS Y AGREGAR CUENTA */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-sm font-bold">
                  2. Estado Consolidado del Resultado Integral
                </h2>
                <p className="text-[11px] text-slate-300">
                  Utilidad Bruta, UAII (EBIT), UAI (EBT) y Utilidad (Pérdida) Neta
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  updatePeriod(comparisonPeriod.id, { taxAmount: null });
                  updatePeriod(activePeriod.id, { taxAmount: null });
                }}
                title="Calcular Impuesto sobre la Renta automáticamente como UAI × Tasa IR (%)"
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[11px] font-semibold text-emerald-300 border border-white/15"
              >
                <Calculator className="w-3.5 h-3.5" />
                <span>Calcular IR por {activePeriod.taxRate}%</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase text-slate-500">
                    <th className="px-2 py-2.5">Cód.</th>
                    <th className="px-2 py-2.5">Rubro / Cuenta</th>
                    <th className="px-2 py-2.5 text-right">{comparisonPeriod.name} (C$)</th>
                    <th className="px-2 py-2.5 text-right text-blue-700">{activePeriod.name} (C$)</th>
                    <th className="px-2 py-2.5 text-center"></th>
                  </tr>
                </thead>
                <tbody>
                  {renderCategoryRows('INGRESO_OPERATIVO', 'Ingresos Operativos')}
                  {renderCategoryRows('COSTO_VENTAS', 'Costo de Ventas')}
                  <tr className="bg-blue-50/60 font-bold text-xs border-y border-blue-200">
                    <td colSpan={2} className="px-3 py-2 text-blue-950">
                      (=) UTILIDAD BRUTA EN VENTAS
                    </td>
                    <td className="px-2 py-2 text-right">
                      {formatCurrency(comparisonTotals.utilidadBruta)}
                    </td>
                    <td className="px-2 py-2 text-right text-blue-900">
                      {formatCurrency(activeTotals.utilidadBruta)}
                    </td>
                    <td></td>
                  </tr>

                  {renderCategoryRows('GASTO_OPERATIVO', 'Gastos de Operación (y Otros Ingresos/Gastos Op.)')}
                  <tr className="bg-indigo-50 font-bold text-xs border-y border-indigo-200">
                    <td colSpan={2} className="px-3 py-2 text-indigo-950">
                      (=) UTILIDAD OPERATIVA (UAII / EBIT)
                    </td>
                    <td className="px-2 py-2 text-right">
                      {formatCurrency(comparisonTotals.uaii)}
                    </td>
                    <td className="px-2 py-2 text-right text-indigo-900">
                      {formatCurrency(activeTotals.uaii)}
                    </td>
                    <td></td>
                  </tr>

                  {renderCategoryRows('GASTO_FINANCIERO', 'Costo Integral de Financiamiento y Asociadas')}
                  <tr className="bg-slate-50 font-bold text-xs border-t border-slate-200">
                    <td colSpan={2} className="px-3 py-2 text-slate-800">
                      (=) Utilidad antes del Impuesto sobre la Renta (UAI / EBT)
                    </td>
                    <td className="px-2 py-2 text-right">
                      {formatCurrency(comparisonTotals.uai)}
                    </td>
                    <td className="px-2 py-2 text-right">
                      {formatCurrency(activeTotals.uai)}
                    </td>
                    <td></td>
                  </tr>
                  <tr className="bg-slate-50 text-xs border-b border-slate-200">
                    <td colSpan={2} className="px-3 py-2 text-slate-700 font-medium">
                      (-) Provisión para el Impuesto sobre la Renta (Nota 33 / Editable)
                    </td>
                    <td className="px-2 py-1.5 text-right">
                      <input
                        type="number"
                        step="any"
                        value={comparisonTotals.impuestos}
                        onChange={(e) =>
                          updatePeriod(comparisonPeriod.id, {
                            taxAmount: Number(e.target.value),
                          })
                        }
                        className="w-32 text-right bg-white border border-rose-300 rounded px-2 py-1 text-xs font-semibold text-rose-700 focus:border-rose-500 focus:outline-none"
                      />
                    </td>
                    <td className="px-2 py-1.5 text-right">
                      <input
                        type="number"
                        step="any"
                        value={activeTotals.impuestos}
                        onChange={(e) =>
                          updatePeriod(activePeriod.id, {
                            taxAmount: Number(e.target.value),
                          })
                        }
                        className="w-32 text-right bg-rose-50/40 border border-rose-300 rounded px-2 py-1 text-xs font-bold text-rose-800 focus:border-rose-600 focus:outline-none"
                      />
                    </td>
                    <td></td>
                  </tr>
                  <tr className="bg-emerald-700 text-white font-bold text-xs">
                    <td colSpan={2} className="px-3 py-3">
                      (=) UTILIDAD (PÉRDIDA) NETA DEL EJERCICIO
                    </td>
                    <td className="px-2 py-3 text-right">
                      {formatCurrency(comparisonTotals.utilidadNeta)}
                    </td>
                    <td className="px-2 py-3 text-right">
                      {formatCurrency(activeTotals.utilidadNeta)}
                    </td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Formulario para agregar nueva cuenta al catálogo */}
          <form
            onSubmit={handleAddAccount}
            className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4"
          >
            <div className="flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Registrar Nueva Cuenta en los Estados Financieros
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Código Contable
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. 1109"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Clasificación Principal
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => handleCategoryChange(e.target.value as AccountCategory)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs"
                >
                  <option value="ACTIVO_CORRIENTE">Activo Corriente</option>
                  <option value="ACTIVO_NO_CORRIENTE">Activo No Corriente</option>
                  <option value="PASIVO_CORRIENTE">Pasivo Corriente</option>
                  <option value="PASIVO_NO_CORRIENTE">Pasivo No Corriente</option>
                  <option value="PATRIMONIO">Patrimonio</option>
                  <option value="INGRESO_OPERATIVO">Ingreso Operativo</option>
                  <option value="COSTO_VENTAS">Costo de Ventas</option>
                  <option value="GASTO_OPERATIVO">Gasto Operativo</option>
                  <option value="GASTO_FINANCIERO">Gasto Financiero</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Sub-tipo para Razones Financieras
                </label>
                <select
                  value={newSubType}
                  onChange={(e) => setNewSubType(e.target.value as AccountSubType)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs"
                >
                  <option value="EFECTIVO">Efectivo y Equivalentes</option>
                  <option value="CUENTAS_POR_COBRAR">Cuentas por Cobrar</option>
                  <option value="INVENTARIO">Inventario</option>
                  <option value="OTROS_ACTIVOS_CORRIENTES">Otros Activos Corrientes</option>
                  <option value="ACTIVO_FIJO_NETO">Activo No Corriente / Fijo</option>
                  <option value="CUENTAS_POR_PAGAR">Proveedores y Cuentas por Pagar CP</option>
                  <option value="DEUDA_CORTO_PLAZO">Préstamos / Deuda Corto Plazo</option>
                  <option value="DEUDA_LARGO_PLAZO">Pasivo No Corriente / Largo Plazo</option>
                  <option value="CAPITAL_SOCIAL">Capital Social</option>
                  <option value="UTILIDADES_RETENIDAS">Reservas y Utilidades Retenidas</option>
                  <option value="VENTAS_NETAS">Ventas Netas</option>
                  <option value="COSTO_BIENES_VENDIDOS">Costo de Ventas (CBV)</option>
                  <option value="GASTOS_VENTA_ADMIN">Gastos de Operación</option>
                  <option value="GASTOS_DEPRECIACION">Depreciación Operativa</option>
                  <option value="INTERESES_PAGADOS">Gastos / Costos Financieros</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Nombre de la Cuenta
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Inversiones Temporales"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Saldo {comparisonPeriod.name} (C$)
                </label>
                <input
                  type="number"
                  step="any"
                  value={newAmountBase}
                  onChange={(e) => setNewAmountBase(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Saldo {activePeriod.name} (C$)
                </label>
                <input
                  type="number"
                  step="any"
                  value={newAmountActive}
                  onChange={(e) => setNewAmountActive(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors"
            >
              Agregar Cuenta al Catálogo
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
