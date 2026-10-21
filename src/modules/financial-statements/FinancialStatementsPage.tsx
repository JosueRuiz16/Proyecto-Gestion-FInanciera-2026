import React, { useState } from 'react';
import { CheckCircle2, PlusCircle, AlertTriangle } from 'lucide-react';
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
    updateAccountBalance,
    addAccount,
    updateCompanyInfo,
  } = useFinancialSystem();

  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState<AccountCategory>('ACTIVO_CORRIENTE');
  const [newAmountBase, setNewAmountBase] = useState('0');
  const [newAmountActive, setNewAmountActive] = useState('0');

  const handleAddAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim() || !newName.trim()) return;

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

    addAccount({
      code: newCode.trim(),
      name: newName.trim(),
      category: newCategory,
      subType: defaultSubTypeMap[newCategory],
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
          <td colSpan={4} className="px-4 py-2 text-xs font-bold uppercase text-slate-700">
            {title}
          </td>
        </tr>
        {rows.map((acc) => (
          <tr key={acc.id} className="border-b border-slate-100 hover:bg-slate-50/80">
            <td className="px-4 py-2 text-xs font-mono text-slate-500">{acc.code}</td>
            <td className="px-4 py-2 text-xs font-medium text-slate-800">{acc.name}</td>
            <td className="px-4 py-2 text-right">
              <input
                type="number"
                value={acc.balances[comparisonPeriod.id] ?? 0}
                onChange={(e) =>
                  updateAccountBalance(acc.id, comparisonPeriod.id, Number(e.target.value))
                }
                className="w-32 text-right bg-white border border-slate-300 rounded px-2 py-1 text-xs font-semibold text-slate-800 focus:border-blue-500 focus:outline-none"
              />
            </td>
            <td className="px-4 py-2 text-right">
              <input
                type="number"
                value={acc.balances[activePeriod.id] ?? 0}
                onChange={(e) =>
                  updateAccountBalance(acc.id, activePeriod.id, Number(e.target.value))
                }
                className="w-32 text-right bg-blue-50/50 border border-blue-300 rounded px-2 py-1 text-xs font-bold text-blue-900 focus:border-blue-600 focus:outline-none"
              />
            </td>
          </tr>
        ))}
      </>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
            Módulo A • Unidad 2
          </span>
          <h1 className="text-xl font-bold text-slate-900">
            Estados Financieros (Balance General y Estado de Resultados)
          </h1>
          <p className="text-xs text-slate-600">
            Edita cualquier saldo en tiempo real para observar cómo impacta automáticamente
            el resto de los módulos del sistema.
          </p>
        </div>

        {/* Parámetros bursátiles para Razones de Mercado */}
        <div className="flex flex-wrap items-center gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
          <div>
            <label className="block text-[11px] font-medium text-slate-500">
              Acciones en Circulación
            </label>
            <input
              type="number"
              min={1}
              value={state.company.sharesOutstanding}
              onChange={(e) =>
                updateCompanyInfo({ sharesOutstanding: Math.max(1, Number(e.target.value)) })
              }
              className="w-28 border border-slate-300 rounded px-2 py-1 text-xs font-semibold"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-slate-500">
              Precio Mercado / Acción (C$)
            </label>
            <input
              type="number"
              min={0}
              value={state.company.marketPricePerShare}
              onChange={(e) =>
                updateCompanyInfo({ marketPricePerShare: Math.max(0, Number(e.target.value)) })
              }
              className="w-28 border border-slate-300 rounded px-2 py-1 text-xs font-semibold"
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
            formula: 'Utilidad Neta = (UAII - Gastos Financieros) × (1 - Tasa IR)',
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
              <h2 className="text-sm font-bold">1. Balance General (Estado de Situación Financiera)</h2>
              <p className="text-[11px] text-slate-300">Valores expresados en Córdobas (C$)</p>
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
                  <th className="px-4 py-2.5">Código</th>
                  <th className="px-4 py-2.5">Cuenta Contable</th>
                  <th className="px-4 py-2.5 text-right">{comparisonPeriod.name} (C$)</th>
                  <th className="px-4 py-2.5 text-right text-blue-700">{activePeriod.name} (C$)</th>
                </tr>
              </thead>
              <tbody>
                {renderCategoryRows('ACTIVO_CORRIENTE', 'Activos Corrientes (Circulantes)')}
                <tr className="bg-blue-50/40 font-bold text-xs border-b border-slate-200">
                  <td colSpan={2} className="px-4 py-2 text-slate-800">
                    Subtotal Activo Corriente
                  </td>
                  <td className="px-4 py-2 text-right">
                    {formatCurrency(comparisonTotals.totalActivoCorriente)}
                  </td>
                  <td className="px-4 py-2 text-right text-blue-800">
                    {formatCurrency(activeTotals.totalActivoCorriente)}
                  </td>
                </tr>

                {renderCategoryRows('ACTIVO_NO_CORRIENTE', 'Activos No Corrientes (Fijos)')}
                <tr className="bg-blue-600 text-white font-bold text-xs">
                  <td colSpan={2} className="px-4 py-2.5">
                    TOTAL ACTIVOS
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    {formatCurrency(comparisonTotals.totalActivos)}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    {formatCurrency(activeTotals.totalActivos)}
                  </td>
                </tr>

                {renderCategoryRows('PASIVO_CORRIENTE', 'Pasivos Corrientes (Corto Plazo)')}
                <tr className="bg-slate-50 font-bold text-xs border-b border-slate-200">
                  <td colSpan={2} className="px-4 py-2 text-slate-800">
                    Subtotal Pasivo Corriente
                  </td>
                  <td className="px-4 py-2 text-right">
                    {formatCurrency(comparisonTotals.totalPasivoCorriente)}
                  </td>
                  <td className="px-4 py-2 text-right text-blue-800">
                    {formatCurrency(activeTotals.totalPasivoCorriente)}
                  </td>
                </tr>

                {renderCategoryRows('PASIVO_NO_CORRIENTE', 'Pasivos No Corrientes (Largo Plazo)')}
                <tr className="bg-slate-100 font-bold text-xs border-b border-slate-200">
                  <td colSpan={2} className="px-4 py-2 text-slate-900">
                    TOTAL PASIVOS
                  </td>
                  <td className="px-4 py-2 text-right">
                    {formatCurrency(comparisonTotals.totalPasivos)}
                  </td>
                  <td className="px-4 py-2 text-right text-blue-900">
                    {formatCurrency(activeTotals.totalPasivos)}
                  </td>
                </tr>

                {renderCategoryRows('PATRIMONIO', 'Patrimonio / Capital Contable')}
                <tr className="bg-slate-100 font-bold text-xs border-b border-slate-200">
                  <td colSpan={2} className="px-4 py-2 text-slate-900">
                    TOTAL PATRIMONIO
                  </td>
                  <td className="px-4 py-2 text-right">
                    {formatCurrency(comparisonTotals.totalPatrimonio)}
                  </td>
                  <td className="px-4 py-2 text-right text-blue-900">
                    {formatCurrency(activeTotals.totalPatrimonio)}
                  </td>
                </tr>

                <tr className="bg-slate-900 text-white font-bold text-xs">
                  <td colSpan={2} className="px-4 py-2.5">
                    TOTAL PASIVO + PATRIMONIO
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    {formatCurrency(comparisonTotals.totalPasivoMasPatrimonio)}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    {formatCurrency(activeTotals.totalPasivoMasPatrimonio)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* ESTADO DE RESULTADOS Y AGREGAR CUENTA */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 bg-slate-900 text-white">
              <h2 className="text-sm font-bold">2. Estado de Resultados (Pérdidas y Ganancias)</h2>
              <p className="text-[11px] text-slate-300">
                Determinación de Utilidad Bruta, UAII (EBIT) y Utilidad Neta (Tasa IR:{' '}
                {activePeriod.taxRate}%)
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase text-slate-500">
                    <th className="px-4 py-2.5">Código</th>
                    <th className="px-4 py-2.5">Rubro / Cuenta</th>
                    <th className="px-4 py-2.5 text-right">{comparisonPeriod.name} (C$)</th>
                    <th className="px-4 py-2.5 text-right text-blue-700">{activePeriod.name} (C$)</th>
                  </tr>
                </thead>
                <tbody>
                  {renderCategoryRows('INGRESO_OPERATIVO', 'Ingresos Operativos')}
                  {renderCategoryRows('COSTO_VENTAS', 'Costo de los Bienes Vendidos')}
                  <tr className="bg-blue-50/60 font-bold text-xs border-y border-blue-200">
                    <td colSpan={2} className="px-4 py-2 text-blue-950">
                      (=) UTILIDAD BRUTA EN VENTAS
                    </td>
                    <td className="px-4 py-2 text-right">
                      {formatCurrency(comparisonTotals.utilidadBruta)}
                    </td>
                    <td className="px-4 py-2 text-right text-blue-900">
                      {formatCurrency(activeTotals.utilidadBruta)}
                    </td>
                  </tr>

                  {renderCategoryRows('GASTO_OPERATIVO', 'Gastos de Operación')}
                  <tr className="bg-indigo-50 font-bold text-xs border-y border-indigo-200">
                    <td colSpan={2} className="px-4 py-2 text-indigo-950">
                      (=) UTILIDAD OPERATIVA (UAII / EBIT)
                    </td>
                    <td className="px-4 py-2 text-right">
                      {formatCurrency(comparisonTotals.uaii)}
                    </td>
                    <td className="px-4 py-2 text-right text-indigo-900">
                      {formatCurrency(activeTotals.uaii)}
                    </td>
                  </tr>

                  {renderCategoryRows('GASTO_FINANCIERO', 'Costo Integral de Financiamiento')}
                  <tr className="bg-slate-50 font-bold text-xs border-t border-slate-200">
                    <td colSpan={2} className="px-4 py-2 text-slate-800">
                      (=) Utilidad Antes de Impuestos (UAI / EBT)
                    </td>
                    <td className="px-4 py-2 text-right">
                      {formatCurrency(comparisonTotals.uai)}
                    </td>
                    <td className="px-4 py-2 text-right">
                      {formatCurrency(activeTotals.uai)}
                    </td>
                  </tr>
                  <tr className="bg-slate-50 text-xs border-b border-slate-200">
                    <td colSpan={2} className="px-4 py-2 text-slate-600">
                      (-) Impuesto sobre la Renta ({activePeriod.taxRate}%)
                    </td>
                    <td className="px-4 py-2 text-right text-rose-700">
                      {formatCurrency(comparisonTotals.impuestos)}
                    </td>
                    <td className="px-4 py-2 text-right text-rose-700">
                      {formatCurrency(activeTotals.impuestos)}
                    </td>
                  </tr>
                  <tr className="bg-emerald-700 text-white font-bold text-xs">
                    <td colSpan={2} className="px-4 py-3">
                      (=) UTILIDAD NETA DEL EJERCICIO
                    </td>
                    <td className="px-4 py-3 text-right">
                      {formatCurrency(comparisonTotals.utilidadNeta)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {formatCurrency(activeTotals.utilidadNeta)}
                    </td>
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
                  placeholder="Ej. 1105"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Clasificación
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as AccountCategory)}
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
              <div className="sm:col-span-2">
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

