import React, { useState } from 'react';
import {
  CheckCircle2,
  PlusCircle,
  AlertTriangle,
  RotateCcw,
  FilePlus2,
  Trash2,
  Calculator,
  Printer,
  Download,
  Zap,
  EyeOff,
} from 'lucide-react';
import { useFinancialSystem } from '../../app/providers/FinancialContext';
import { useAuth } from '../../app/providers/AuthContext';
import {
  AccountCategory,
  AccountSubType,
  FinancialAccountItem,
} from '../../data/types/financial';
import { AcademicDefenseCard } from '../../components/common/AcademicDefenseCard';
import { formatCurrency } from '../../components/common/formatters';
import {
  exportFinancialCaseExcel,
  openExecutiveReportPrintView,
} from '../../core/reports/executiveReportGenerator';
import { resolveEffectiveSubType } from '../../core/finance/statements';
import { NumberInput } from '../../components/common/NumberInput';

export const FinancialStatementsPage: React.FC = () => {
  const {
    state,
    comparisonPeriod,
    activePeriod,
    comparisonTotals,
    activeTotals,
    ratios,
    duPont,
    cvuAndLeverage,
    cashFlowResult,
    masterBudgetAndProforma,
    inventoryResult,
    updatePeriod,
    updateAccountBalance,
    updateAccountMeta,
    addAccount,
    removeAccount,
    updateCompanyInfo,
    syncInventoryWithBalanceSheet,
    syncAllModulesFromStatements,
    applyExtractedFinancialData,
    resetDemoData,
    clearForNewCase,
  } = useFinancialSystem();
  const { user } = useAuth();
  const [syncNotice, setSyncNotice] = useState<string>('');
  const [showQuickSolver, setShowQuickSolver] = useState<boolean>(false);
  const [quickSingleYear, setQuickSingleYear] = useState<boolean>(true);
  const [quickCompanyName, setQuickCompanyName] = useState<string>('Ejercicio de Defensa en Clase, S. A.');
  const [quickTaxRate, setQuickTaxRate] = useState<number>(30);
  const [quickUnitPrice, setQuickUnitPrice] = useState<number>(250);
  const [quickUnitVarCost, setQuickUnitVarCost] = useState<number>(150);
  const [quickRows, setQuickRows] = useState<
    Array<{
      code: string;
      name: string;
      category: AccountCategory;
      subType: AccountSubType;
      base: number;
      active: number;
    }>
  >([
    { code: '1101', name: 'Efectivo en Caja y Bancos', category: 'ACTIVO_CORRIENTE', subType: 'EFECTIVO', base: 80000, active: 100000 },
    { code: '1102', name: 'Cuentas por Cobrar Clientes', category: 'ACTIVO_CORRIENTE', subType: 'CUENTAS_POR_COBRAR', base: 120000, active: 150000 },
    { code: '1103', name: 'Inventarios', category: 'ACTIVO_CORRIENTE', subType: 'INVENTARIO', base: 160000, active: 200000 },
    { code: '1201', name: 'Propiedad, Planta y Equipo Neto', category: 'ACTIVO_NO_CORRIENTE', subType: 'ACTIVO_FIJO_NETO', base: 440000, active: 550000 },
    { code: '2101', name: 'Cuentas por Pagar Proveedores', category: 'PASIVO_CORRIENTE', subType: 'CUENTAS_POR_PAGAR', base: 100000, active: 120000 },
    { code: '2102', name: 'Préstamos Bancarios Corto Plazo', category: 'PASIVO_CORRIENTE', subType: 'DEUDA_CORTO_PLAZO', base: 80000, active: 100000 },
    { code: '2201', name: 'Deuda a Largo Plazo', category: 'PASIVO_NO_CORRIENTE', subType: 'DEUDA_LARGO_PLAZO', base: 220000, active: 280000 },
    { code: '3101', name: 'Capital Social', category: 'PATRIMONIO', subType: 'CAPITAL_SOCIAL', base: 250000, active: 300000 },
    { code: '3102', name: 'Utilidades Retenidas', category: 'PATRIMONIO', subType: 'UTILIDADES_RETENIDAS', base: 150000, active: 200000 },
    { code: '4101', name: 'Ventas Netas', category: 'INGRESO_OPERATIVO', subType: 'VENTAS_NETAS', base: 950000, active: 1200000 },
    { code: '5101', name: 'Costo de Ventas (CBV)', category: 'COSTO_VENTAS', subType: 'COSTO_BIENES_VENDIDOS', base: 570000, active: 720000 },
    { code: '6101', name: 'Gastos de Administración y Ventas', category: 'GASTO_OPERATIVO', subType: 'GASTOS_VENTA_ADMIN', base: 160000, active: 200000 },
    { code: '6102', name: 'Gastos de Depreciación', category: 'GASTO_OPERATIVO', subType: 'GASTOS_DEPRECIACION', base: 40000, active: 50000 },
    { code: '7101', name: 'Gastos Financieros (Intereses)', category: 'GASTO_FINANCIERO', subType: 'INTERESES_PAGADOS', base: 30000, active: 40000 },
  ]);

  const handleQuickZeroAll = () => {
    setQuickRows((prev) => prev.map((r) => ({ ...r, base: 0, active: 0 })));
  };

  const handleQuickBalanceEquity = () => {
    setQuickRows((prev) => {
      const sumActBase = prev
        .filter((r) => r.category === 'ACTIVO_CORRIENTE' || r.category === 'ACTIVO_NO_CORRIENTE')
        .reduce((s, r) => s + r.base, 0);
      const sumPasCapBase = prev
        .filter(
          (r) =>
            r.category === 'PASIVO_CORRIENTE' ||
            r.category === 'PASIVO_NO_CORRIENTE' ||
            (r.category === 'PATRIMONIO' && r.subType !== 'UTILIDADES_RETENIDAS')
        )
        .reduce((s, r) => s + r.base, 0);

      const sumActActive = prev
        .filter((r) => r.category === 'ACTIVO_CORRIENTE' || r.category === 'ACTIVO_NO_CORRIENTE')
        .reduce((s, r) => s + r.active, 0);
      const sumPasCapActive = prev
        .filter(
          (r) =>
            r.category === 'PASIVO_CORRIENTE' ||
            r.category === 'PASIVO_NO_CORRIENTE' ||
            (r.category === 'PATRIMONIO' && r.subType !== 'UTILIDADES_RETENIDAS')
        )
        .reduce((s, r) => s + r.active, 0);

      return prev.map((r) =>
        r.subType === 'UTILIDADES_RETENIDAS'
          ? {
              ...r,
              base: sumActBase - sumPasCapBase,
              active: sumActActive - sumPasCapActive,
            }
          : r
      );
    });
  };

  const handleApplyQuickExercise = () => {
    const baseId = comparisonPeriod.id;
    const actId = activePeriod.id;

    // Auto-cuadra Utilidades Retenidas si hay diferencia
    const sumActActive = quickRows
      .filter((r) => r.category === 'ACTIVO_CORRIENTE' || r.category === 'ACTIVO_NO_CORRIENTE')
      .reduce((s, r) => s + r.active, 0);
    const sumPasCapActive = quickRows
      .filter(
        (r) =>
          r.category === 'PASIVO_CORRIENTE' ||
          r.category === 'PASIVO_NO_CORRIENTE' ||
          (r.category === 'PATRIMONIO' && r.subType !== 'UTILIDADES_RETENIDAS')
      )
      .reduce((s, r) => s + r.active, 0);
    const neededRetainedActive = sumActActive - sumPasCapActive;

    const sumActBase = quickRows
      .filter((r) => r.category === 'ACTIVO_CORRIENTE' || r.category === 'ACTIVO_NO_CORRIENTE')
      .reduce((s, r) => s + (quickSingleYear ? Math.round(r.active * 0.9) : r.base), 0);
    const sumPasCapBase = quickRows
      .filter(
        (r) =>
          r.category === 'PASIVO_CORRIENTE' ||
          r.category === 'PASIVO_NO_CORRIENTE' ||
          (r.category === 'PATRIMONIO' && r.subType !== 'UTILIDADES_RETENIDAS')
      )
      .reduce((s, r) => s + (quickSingleYear ? Math.round(r.active * 0.9) : r.base), 0);
    const neededRetainedBase = sumActBase - sumPasCapBase;

    const accounts: FinancialAccountItem[] = quickRows.map((r, idx) => {
      const actVal =
        r.subType === 'UTILIDADES_RETENIDAS' ? neededRetainedActive : r.active;
      const baseVal =
        r.subType === 'UTILIDADES_RETENIDAS'
          ? neededRetainedBase
          : quickSingleYear
          ? Math.round(r.active * 0.9)
          : r.base;
      return {
        id: `acc-q-${idx + 1}`,
        code: r.code,
        name: r.name,
        category: r.category,
        subType: r.subType,
        balances: {
          [baseId]: baseVal,
          [actId]: actVal,
        },
      };
    });

    const sales = quickRows.find((r) => r.subType === 'VENTAS_NETAS')?.active || 100000;
    const gOp = quickRows
      .filter((r) => r.category === 'GASTO_OPERATIVO')
      .reduce((s, r) => s + r.active, 0);
    const fin = quickRows.find((r) => r.subType === 'INTERESES_PAGADOS')?.active || 0;
    const pUnit = quickUnitPrice > 0 ? quickUnitPrice : 250;
    const cvUnit = quickUnitVarCost >= 0 ? quickUnitVarCost : 150;
    const unitsSold = Math.max(1, Math.round(sales / pUnit));

    applyExtractedFinancialData({
      company: {
        ...state.company,
        name: quickCompanyName.trim() || 'Ejercicio Financiero en Clase, S. A.',
      },
      periods: [
        { ...comparisonPeriod, taxRate: quickTaxRate, taxAmount: null },
        { ...activePeriod, taxRate: quickTaxRate, taxAmount: null },
      ],
      accounts,
      cvuInput: {
        unitPrice: pUnit,
        unitVariableCost: cvUnit,
        fixedOperatingCosts: gOp,
        currentUnitsSold: unitsSold,
        interestExpense: fin,
        preferredDividends: 0,
        taxRate: quickTaxRate,
        priceChangePct: 10,
        variableCostChangePct: -5,
        fixedCostChangePct: 0,
        volumeChangePct: 15,
      },
    });
    setTimeout(() => {
      syncAllModulesFromStatements();
    }, 50);
    setShowQuickSolver(false);
    setSyncNotice('¡Ejercicio resuelto! Se cuadraron los Estados Financieros y se actualizaron los 9 módulos.');
    setTimeout(() => setSyncNotice(''), 4500);
  };

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

  const defaultCodePrefixMap: Record<AccountCategory, string> = {
    ACTIVO_CORRIENTE: '11',
    ACTIVO_NO_CORRIENTE: '12',
    PASIVO_CORRIENTE: '21',
    PASIVO_NO_CORRIENTE: '22',
    PATRIMONIO: '31',
    INGRESO_OPERATIVO: '41',
    COSTO_VENTAS: '51',
    GASTO_OPERATIVO: '61',
    GASTO_FINANCIERO: '71',
  };

  const handleCategoryChange = (cat: AccountCategory) => {
    setNewCategory(cat);
    const inferred = resolveEffectiveSubType({
      name: newName,
      category: cat,
      subType: defaultSubTypeMap[cat],
    });
    setNewSubType(inferred);
  };

  const handleNewNameChange = (val: string) => {
    setNewName(val);
    const inferred = resolveEffectiveSubType({
      name: val,
      category: newCategory,
      subType: defaultSubTypeMap[newCategory],
    });
    setNewSubType(inferred);
  };

  const handleAddAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const sameCategoryCount = state.accounts.filter((a) => a.category === newCategory).length + 1;
    const autoCode = `${defaultCodePrefixMap[newCategory]}${String(sameCategoryCount).padStart(2, '0')}`;
    const finalCode = newCode.trim() || autoCode;

    // Detectar si es cuenta correctora de activo (ej. Depreciación Acumulada o Incobrables)
    const normName = newName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
    const isContraAsset =
      (newCategory === 'ACTIVO_CORRIENTE' || newCategory === 'ACTIVO_NO_CORRIENTE') &&
      (normName.includes('depreciacion acumulada') ||
        normName.includes('amortizacion acumulada') ||
        normName.includes('incobrable') ||
        normName.includes('estimacion'));

    const rawBase = Number(newAmountBase) || 0;
    const rawActive = Number(newAmountActive) || 0;

    addAccount({
      code: finalCode,
      name: newName.trim(),
      category: newCategory,
      subType: resolveEffectiveSubType({
        name: newName.trim(),
        category: newCategory,
        subType: newSubType,
      }),
      balances: {
        [comparisonPeriod.id]: isContraAsset && rawBase > 0 ? -rawBase : rawBase,
        [activePeriod.id]: isContraAsset && rawActive > 0 ? -rawActive : rawActive,
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
              <NumberInput
                step="any"
                value={acc.balances[comparisonPeriod.id] ?? 0}
                onChange={(e) =>
                  updateAccountBalance(acc.id, comparisonPeriod.id, Number(e.target.value))
                }
                className="w-32 text-right bg-white border border-slate-300 rounded px-2 py-1 text-xs font-semibold text-slate-800 focus:border-blue-500 focus:outline-none"
              />
            </td>
            <td className="px-2 py-1.5 text-right">
              <NumberInput
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
            onClick={() => setShowQuickSolver((v) => !v)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold shadow-sm transition-colors border ${
              showQuickSolver
                ? 'bg-amber-500 text-white border-amber-500'
                : 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
            }`}
            title="Abrir u ocultar la plantilla rápida para capturar y resolver cualquier ejercicio dictado por el profesor en 30 segundos"
          >
            {showQuickSolver ? <EyeOff className="w-3.5 h-3.5" /> : <Zap className="w-3.5 h-3.5" />}
            <span>{showQuickSolver ? 'Ocultar Ejercicio Rápido' : '⚡ Resolver Ejercicio Rápido'}</span>
          </button>

          <button
            type="button"
            onClick={() => openExecutiveReportPrintView(reportPayload)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Generar Reporte (PDF)</span>
          </button>

          <button
            type="button"
            onClick={() => exportFinancialCaseExcel(reportPayload)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold shadow-sm transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar Excel</span>
          </button>

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

      {syncNotice && (
        <div className="px-4 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{syncNotice}</span>
        </div>
      )}

      {/* Panel Ocultable: Modo Ejercicio Rápido del Profesor (Captura en 30 segundos) */}
      {showQuickSolver && (
        <div className="bg-amber-50/70 border-2 border-amber-300 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-200 pb-3">
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-800 block">
                ⚡ Modo Ejercicio en Vivo (Ocultable)
              </span>
              <h2 className="text-sm font-bold text-slate-900">
                Captura Rápida de Ejercicio del Profesor (14 Cuentas Esenciales + C-V-U)
              </h2>
              <p className="text-xs text-slate-600">
                Ingresa solo los datos que dicte el profesor. El sistema calcula automáticamente Utilidades Retenidas para cuadrar el Balance y resuelve los 9 módulos.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleQuickZeroAll}
                className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-bold"
              >
                🧹 Poner Todo en Cero
              </button>
              <button
                type="button"
                onClick={handleQuickBalanceEquity}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold"
              >
                ⚖️ Cuadrar Utilidades Retenidas
              </button>
              <button
                type="button"
                onClick={() => setShowQuickSolver(false)}
                className="px-3 py-1.5 rounded-lg bg-white text-slate-600 border border-slate-300 text-xs font-semibold"
              >
                Ocultar
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 text-xs bg-white p-3.5 rounded-xl border border-amber-200">
            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">Nombre del Ejercicio / Empresa</label>
              <input
                type="text"
                value={quickCompanyName}
                onChange={(e) => setQuickCompanyName(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 font-semibold"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Modalidad de Datos</label>
              <select
                value={quickSingleYear ? '1' : '2'}
                onChange={(e) => setQuickSingleYear(e.target.value === '1')}
                className="w-full border border-amber-400 bg-amber-50 rounded-lg px-2.5 py-1.5 font-bold text-amber-900"
              >
                <option value="1">1 solo año dictado</option>
                <option value="2">2 años comparativos</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Tasa IR (%)</label>
              <NumberInput
                value={quickTaxRate}
                onChange={(e) => setQuickTaxRate(Number(e.target.value))}
                className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 font-semibold"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Precio Venta Unit. (P)</label>
              <NumberInput
                value={quickUnitPrice}
                onChange={(e) => setQuickUnitPrice(Number(e.target.value))}
                className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 font-semibold"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Costo Var. Unit. (CVu)</label>
              <NumberInput
                value={quickUnitVarCost}
                onChange={(e) => setQuickUnitVarCost(Number(e.target.value))}
                className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 font-semibold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs">
            {quickRows.map((row, idx) => (
              <div
                key={row.code}
                className="bg-white p-2.5 rounded-lg border border-slate-200 flex items-center justify-between gap-2"
              >
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-mono text-slate-400 block">{row.code} · {row.category}</span>
                  <span className="font-bold text-slate-800 truncate block">{row.name}</span>
                </div>
                {!quickSingleYear && (
                  <NumberInput
                    value={row.base}
                    onChange={(e) => {
                      const val = Number(e.target.value) || 0;
                      setQuickRows((prev) =>
                        prev.map((item, i) => (i === idx ? { ...item, base: val } : item))
                      );
                    }}
                    placeholder={comparisonPeriod.name}
                    className="w-24 text-right border border-slate-300 rounded px-2 py-1 font-mono text-xs"
                  />
                )}
                <NumberInput
                  value={row.active}
                  onChange={(e) => {
                    const val = Number(e.target.value) || 0;
                    setQuickRows((prev) =>
                      prev.map((item, i) => (i === idx ? { ...item, active: val } : item))
                    );
                  }}
                  placeholder={activePeriod.name}
                  className="w-28 text-right border border-blue-300 bg-blue-50/40 rounded px-2 py-1 font-mono font-bold text-blue-900 text-xs"
                />
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={handleApplyQuickExercise}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-md transition-colors"
            >
              🚀 Resolver Ejercicio, Cuadrar Balance y Actualizar los 9 Módulos
            </button>
          </div>
        </div>
      )}

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
            <NumberInput
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
            <NumberInput
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
            <NumberInput
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
                      <NumberInput
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
                      <NumberInput
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
                  Código Contable (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Auto (ej. 1105)"
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
                  onChange={(e) => handleNewNameChange(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Saldo {comparisonPeriod.name} (C$)
                </label>
                <NumberInput
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
                <NumberInput
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
