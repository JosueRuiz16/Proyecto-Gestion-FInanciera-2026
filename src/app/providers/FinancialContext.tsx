import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  CashFlowEntry,
  CvuLeverageInput,
  FinancialAccountItem,
  FinancialPeriod,
  FinancialSystemState,
  InventoryProduct,
  MasterBudgetInput,
  PersonalBudgetData,
  PersonalTransaction,
} from '../../data/types/financial';
import { FinancialRepository } from '../../data/repositories/financialRepository';
import { createEmptyPersonalBudget } from '../../data/seed/personalBudgets';
import {
  ComputedStatementTotals,
  computeFinancialStatements,
} from '../../core/finance/statements';
import {
  DuPontAnalysisResult,
  FinancialRatioResult,
  VerticalHorizontalRow,
  computeDuPontAnalysis,
  computeFinancialRatios,
  computeVerticalAndHorizontalAnalysis,
} from '../../core/finance/analysis';
import {
  CvuAndLeverageResult,
  computeCvuAndLeverage,
} from '../../core/finance/cvuAndLeverage';
import {
  CashFlowStatementResult,
  MasterBudgetAndProformaResult,
  computeCashFlowStatement,
  computeMasterBudgetAndProforma,
} from '../../core/finance/planningAndProforma';
import {
  InventorySummaryResult,
  PersonalBudgetResult,
  computeInventoryControl,
  computePersonalBudget,
} from '../../core/finance/complementaryModules';
import {
  CashConversionCycleResult,
  computeCashConversionCycle,
} from '../../core/finance/cashConversionCycle';
import { ExtractedFinancialPatch } from '../../core/ai/financialAiService';

interface FinancialContextValue {
  state: FinancialSystemState;
  activePeriod: FinancialPeriod;
  comparisonPeriod: FinancialPeriod;
  // Resultados pre-calculados y sincronizados reactivamente
  activeTotals: ComputedStatementTotals;
  comparisonTotals: ComputedStatementTotals;
  verticalHorizontal: VerticalHorizontalRow[];
  ratios: FinancialRatioResult[];
  duPont: DuPontAnalysisResult;
  cvuAndLeverage: CvuAndLeverageResult;
  cashFlowResult: CashFlowStatementResult;
  cashConversionCycle: CashConversionCycleResult;
  comparisonCashConversionCycle: CashConversionCycleResult;
  masterBudgetAndProforma: MasterBudgetAndProformaResult;
  personalBudgetResult: PersonalBudgetResult;
  inventoryResult: InventorySummaryResult;

  // Acciones de actualización
  setActivePeriodId: (id: string) => void;
  setComparisonPeriodId: (id: string) => void;
  updatePeriod: (periodId: string, patch: Partial<FinancialPeriod>) => void;
  updateAccountBalance: (accountId: string, periodId: string, amount: number) => void;
  updateAccountMeta: (
    accountId: string,
    patch: Partial<Pick<FinancialAccountItem, 'code' | 'name' | 'category' | 'subType'>>
  ) => void;
  addAccount: (account: Omit<FinancialAccountItem, 'id'>) => void;
  removeAccount: (accountId: string) => void;
  updateCompanyInfo: (patch: Partial<FinancialSystemState['company']>) => void;
  updateCvuInput: (patch: Partial<CvuLeverageInput>) => void;
  syncCvuWithIncomeStatement: () => void;
  updateCashFlowInitialBalance: (amount: number) => void;
  updateCashFlowEntry: (id: string, patch: Partial<Omit<CashFlowEntry, 'id'>>) => void;
  addCashFlowEntry: (entry: Omit<CashFlowEntry, 'id'>) => void;
  removeCashFlowEntry: (id: string) => void;
  syncCashFlowInitialWithBalance: () => void;
  updateMasterBudget: (patch: Partial<MasterBudgetInput>) => void;
  syncMasterBudgetWithBalance: () => void;
  addPersonalTransaction: (tx: Omit<PersonalTransaction, 'id'>) => void;
  removePersonalTransaction: (id: string) => void;
  updatePersonalSavingsGoal: (pct: number) => void;
  updateInventoryProduct: (id: string, patch: Partial<InventoryProduct>) => void;
  addInventoryProduct: (prod: Omit<InventoryProduct, 'id'>) => void;
  removeInventoryProduct: (id: string) => void;
  syncInventoryWithBalanceSheet: () => void;
  /** Si está activo, cualquier cambio en cuentas (Módulo A) actualiza en cascada C-V-U, Apalancamiento, Flujo y Proforma. */
  autoSyncCascade: boolean;
  setAutoSyncCascade: (enabled: boolean) => void;
  /** Cuadra automáticamente Activo = Pasivo + Patrimonio en ambos períodos ajustando Utilidades Retenidas / Capital. */
  autoBalanceSheet: () => string;
  /** Sincroniza de una sola vez los módulos C, D, E, F y G a partir de los Estados Financieros actuales. */
  syncAllModulesFromStatements: () => void;
  /** Autorellena uno o todos los módulos financieros a partir de la extracción de IA de documentos. */
  applyExtractedFinancialData: (patch: ExtractedFinancialPatch) => void;
  /** Carga el ejemplo completo del PDF (Corporación Agrícola, S. A. y subsidiarias 2023-2024). */
  resetDemoData: () => void;
  /** Limpia todos los módulos para llenar cualquier otro caso o empresa desde cero. */
  clearForNewCase: () => void;
}

const FinancialContext = createContext<FinancialContextValue | null>(null);

export const FinancialProvider: React.FC<{
  children: React.ReactNode;
  /** Usuario autenticado: determina qué presupuesto personal se muestra y edita. */
  userId: string;
  userDisplayName: string;
}> = ({ children, userId, userDisplayName }) => {
  const [rawState, setState] = useState<FinancialSystemState>(() =>
    FinancialRepository.loadState()
  );
  const [autoSyncCascade, setAutoSyncCascade] = useState<boolean>(true);

  useEffect(() => {
    FinancialRepository.saveState(rawState);
  }, [rawState]);

  // Presupuesto personal del usuario activo (los datos empresariales son compartidos).
  const personalBudget = useMemo(
    () =>
      rawState.personalBudgetsByUser?.[userId] ??
      createEmptyPersonalBudget(userDisplayName),
    [rawState.personalBudgetsByUser, userId, userDisplayName]
  );

  // Vista que consumen las pantallas: state.personalBudget = presupuesto del usuario activo.
  const state = useMemo<FinancialSystemState>(
    () => ({ ...rawState, personalBudget }),
    [rawState, personalBudget]
  );

  /** Aplica un cambio únicamente al presupuesto personal del usuario activo. */
  const updateMyPersonalBudget = (
    change: (current: PersonalBudgetData) => PersonalBudgetData
  ) => {
    setState((prev) => {
      const current =
        prev.personalBudgetsByUser?.[userId] ?? createEmptyPersonalBudget(userDisplayName);
      return {
        ...prev,
        personalBudgetsByUser: { ...prev.personalBudgetsByUser, [userId]: change(current) },
      };
    });
  };

  const activePeriod = useMemo(
    () =>
      state.periods.find((p) => p.id === state.activePeriodId) ?? state.periods[0],
    [state.periods, state.activePeriodId]
  );

  const comparisonPeriod = useMemo(
    () =>
      state.periods.find((p) => p.id === state.comparisonPeriodId) ??
      state.periods[0],
    [state.periods, state.comparisonPeriodId]
  );

  const activeTotals = useMemo(
    () => computeFinancialStatements(state.accounts, activePeriod),
    [state.accounts, activePeriod]
  );

  const comparisonTotals = useMemo(
    () => computeFinancialStatements(state.accounts, comparisonPeriod),
    [state.accounts, comparisonPeriod]
  );

  const verticalHorizontal = useMemo(
    () =>
      computeVerticalAndHorizontalAnalysis(
        state.accounts,
        comparisonTotals,
        activeTotals
      ),
    [state.accounts, comparisonTotals, activeTotals]
  );

  const ratios = useMemo(
    () => computeFinancialRatios(activeTotals, state.company),
    [activeTotals, state.company]
  );

  const duPont = useMemo(() => computeDuPontAnalysis(activeTotals), [activeTotals]);

  const cvuAndLeverage = useMemo(
    () => computeCvuAndLeverage(state.cvuInput),
    [state.cvuInput]
  );

  const cashFlowResult = useMemo(
    () =>
      computeCashFlowStatement(
        state.cashFlowEntries,
        state.cashFlowInitialBalance
      ),
    [state.cashFlowEntries, state.cashFlowInitialBalance]
  );

  const cashConversionCycle = useMemo(
    () => computeCashConversionCycle(activeTotals),
    [activeTotals]
  );

  const comparisonCashConversionCycle = useMemo(
    () => computeCashConversionCycle(comparisonTotals),
    [comparisonTotals]
  );

  const masterBudgetAndProforma = useMemo(
    () =>
      computeMasterBudgetAndProforma(
        state.masterBudget,
        activeTotals,
        activePeriod.taxRate
      ),
    [state.masterBudget, activeTotals, activePeriod.taxRate]
  );

  const personalBudgetResult = useMemo(
    () => computePersonalBudget(state.personalBudget),
    [state.personalBudget]
  );

  const inventoryResult = useMemo(
    () => computeInventoryControl(state.inventoryProducts),
    [state.inventoryProducts]
  );

  // Acciones
  const setActivePeriodId = (id: string) =>
    setState((prev) => ({ ...prev, activePeriodId: id }));

  const setComparisonPeriodId = (id: string) =>
    setState((prev) => ({ ...prev, comparisonPeriodId: id }));

  const updatePeriod = (periodId: string, patch: Partial<FinancialPeriod>) => {
    setState((prev) => ({
      ...prev,
      periods: prev.periods.map((p) => (p.id === periodId ? { ...p, ...patch } : p)),
    }));
  };

  /**
   * Construye los datos en cascada de C-V-U, Apalancamiento, Flujo de Efectivo (NIC 7)
   * y Presupuesto Maestro a partir de un catálogo de cuentas actualizado.
   */
  const computeCascadedState = (
    prev: FinancialSystemState,
    nextAccounts: FinancialAccountItem[]
  ): FinancialSystemState => {
    const actPeriod =
      prev.periods.find((p) => p.id === prev.activePeriodId) ?? prev.periods[0];
    const compPeriod =
      prev.periods.find((p) => p.id === prev.comparisonPeriodId) ?? prev.periods[0];

    const actT = computeFinancialStatements(nextAccounts, actPeriod);
    const compT = computeFinancialStatements(nextAccounts, compPeriod);

    // 1. Cascada hacia C-V-U y Apalancamiento (Módulos C y D)
    const basePrice = prev.cvuInput.unitPrice > 0 ? prev.cvuInput.unitPrice : 1500;
    const units =
      actT.ventasNetas > 0
        ? Math.max(1, Math.round(actT.ventasNetas / basePrice))
        : prev.cvuInput.currentUnitsSold > 0
        ? prev.cvuInput.currentUnitsSold
        : 1000;
    const unitPrice =
      actT.ventasNetas > 0 ? Number((actT.ventasNetas / units).toFixed(2)) : basePrice;
    const unitVariableCost =
      actT.costoBienesVendidos > 0
        ? Number((actT.costoBienesVendidos / units).toFixed(2))
        : Number((unitPrice * 0.6).toFixed(2));

    const nextCvuInput: CvuLeverageInput = {
      ...prev.cvuInput,
      unitPrice,
      unitVariableCost,
      fixedOperatingCosts: actT.totalGastosOperativos,
      currentUnitsSold: units,
      interestExpense: actT.gastosFinancieros,
      taxRate: actPeriod.taxRate,
    };

    // 2. Cascada hacia Flujo de Efectivo NIC 7 (Módulo E) para que cuadre con Efectivo final
    const nextCashFlowEntries: CashFlowEntry[] = [];
    const pushCf = (
      id: string,
      concept: string,
      activity: CashFlowEntry['activity'],
      direction: CashFlowEntry['direction'],
      amount: number
    ) => {
      if (Math.round(amount) > 0) {
        nextCashFlowEntries.push({
          id,
          concept,
          activity,
          direction,
          amount: Math.round(amount),
        });
      }
    };

    if (actT.utilidadNeta >= 0) {
      pushCf('cf-auto-1', 'Utilidad neta del ejercicio', 'OPERACION', 'ENTRADA', actT.utilidadNeta);
    } else {
      pushCf('cf-auto-1', 'Pérdida neta del ejercicio', 'OPERACION', 'SALIDA', Math.abs(actT.utilidadNeta));
    }
    pushCf('cf-auto-2', ' (+) Depreciación y amortización del ejercicio', 'OPERACION', 'ENTRADA', actT.gastosDepreciacion);

    const deltaCxC = actT.cuentasPorCobrar - compT.cuentasPorCobrar;
    if (deltaCxC !== 0) {
      pushCf(
        'cf-auto-3',
        deltaCxC > 0 ? 'Incremento en cuentas por cobrar (uso)' : 'Disminución en cuentas por cobrar (fuente)',
        'OPERACION',
        deltaCxC > 0 ? 'SALIDA' : 'ENTRADA',
        Math.abs(deltaCxC)
      );
    }

    const deltaInv = actT.inventario - compT.inventario;
    if (deltaInv !== 0) {
      pushCf(
        'cf-auto-4',
        deltaInv > 0 ? 'Incremento en inventarios (uso)' : 'Disminución en inventarios (fuente)',
        'OPERACION',
        deltaInv > 0 ? 'SALIDA' : 'ENTRADA',
        Math.abs(deltaInv)
      );
    }

    const deltaOtrosAct = actT.otrosActivosCorrientes - compT.otrosActivosCorrientes;
    if (deltaOtrosAct !== 0) {
      pushCf(
        'cf-auto-5',
        deltaOtrosAct > 0 ? 'Incremento en otros activos corrientes' : 'Disminución en otros activos corrientes',
        'OPERACION',
        deltaOtrosAct > 0 ? 'SALIDA' : 'ENTRADA',
        Math.abs(deltaOtrosAct)
      );
    }

    const deltaCxP = actT.cuentasPorPagar - compT.cuentasPorPagar;
    if (deltaCxP !== 0) {
      pushCf(
        'cf-auto-6',
        deltaCxP > 0 ? 'Incremento en cuentas por pagar comerciales' : 'Pago neto de cuentas por pagar comerciales',
        'OPERACION',
        deltaCxP > 0 ? 'ENTRADA' : 'SALIDA',
        Math.abs(deltaCxP)
      );
    }

    const deltaFijoBruto =
      actT.totalActivoNoCorriente - compT.totalActivoNoCorriente + actT.gastosDepreciacion;
    if (deltaFijoBruto !== 0) {
      pushCf(
        'cf-auto-7',
        deltaFijoBruto > 0 ? 'Adquisición de propiedad, planta y equipo (CAPEX)' : 'Desinversión en activos no corrientes',
        'INVERSION',
        deltaFijoBruto > 0 ? 'SALIDA' : 'ENTRADA',
        Math.abs(deltaFijoBruto)
      );
    }

    const deltaDeudaCP = actT.deudaCortoPlazo - compT.deudaCortoPlazo;
    if (deltaDeudaCP !== 0) {
      pushCf(
        'cf-auto-8',
        deltaDeudaCP > 0 ? 'Obtención neta de préstamos de corto plazo' : 'Amortización de préstamos de corto plazo',
        'FINANCIAMIENTO',
        deltaDeudaCP > 0 ? 'ENTRADA' : 'SALIDA',
        Math.abs(deltaDeudaCP)
      );
    }

    const deltaDeudaLP = actT.totalPasivoNoCorriente - compT.totalPasivoNoCorriente;
    if (deltaDeudaLP !== 0) {
      pushCf(
        'cf-auto-9',
        deltaDeudaLP > 0 ? 'Obtención de financiamiento a largo plazo' : 'Pago de deuda a largo plazo',
        'FINANCIAMIENTO',
        deltaDeudaLP > 0 ? 'ENTRADA' : 'SALIDA',
        Math.abs(deltaDeudaLP)
      );
    }

    const deltaPatrimonioSinUtilidad =
      actT.totalPatrimonio - compT.totalPatrimonio - actT.utilidadNeta;
    if (deltaPatrimonioSinUtilidad !== 0) {
      pushCf(
        'cf-auto-10',
        deltaPatrimonioSinUtilidad > 0 ? 'Aportes de capital / ajustes patrimoniales' : 'Pago de dividendos y movimientos patrimoniales',
        'FINANCIAMIENTO',
        deltaPatrimonioSinUtilidad > 0 ? 'ENTRADA' : 'SALIDA',
        Math.abs(deltaPatrimonioSinUtilidad)
      );
    }

    // 3. Cascada hacia Presupuesto Maestro y Proforma (Módulos F y G)
    const nextMasterBudget: MasterBudgetInput = {
      ...prev.masterBudget,
      projectedUnitsToSell: Math.max(1, Math.round(units * 1.08)),
      projectedUnitPrice: Number((unitPrice * 1.04).toFixed(2)),
      projectedUnitCost: Number((unitVariableCost * 1.02).toFixed(2)),
      collectionsFromPriorSales: actT.cuentasPorCobrar,
      paymentsForPriorPurchases: actT.cuentasPorPagar,
      fixedOperatingExpenses: Math.max(
        0,
        actT.totalGastosOperativos - actT.gastosDepreciacion
      ),
      nonCashDepreciation: actT.gastosDepreciacion,
      interestPayment: actT.gastosFinancieros,
      taxPayment: Math.max(0, actT.impuestos),
      initialCashBalance: actT.efectivo,
    };

    return {
      ...prev,
      accounts: nextAccounts,
      cvuInput: nextCvuInput,
      cashFlowInitialBalance: compT.efectivo,
      cashFlowEntries:
        nextCashFlowEntries.length > 0 ? nextCashFlowEntries : prev.cashFlowEntries,
      masterBudget: nextMasterBudget,
    };
  };

  const updateAccountBalance = (
    accountId: string,
    periodId: string,
    amount: number
  ) => {
    setState((prev) => {
      const nextAccounts = prev.accounts.map((acc) =>
        acc.id === accountId
          ? {
              ...acc,
              balances: { ...acc.balances, [periodId]: Number(amount) || 0 },
            }
          : acc
      );
      return autoSyncCascade
        ? computeCascadedState(prev, nextAccounts)
        : { ...prev, accounts: nextAccounts };
    });
  };

  const updateAccountMeta = (
    accountId: string,
    patch: Partial<Pick<FinancialAccountItem, 'code' | 'name' | 'category' | 'subType'>>
  ) => {
    setState((prev) => {
      const nextAccounts = prev.accounts.map((acc) =>
        acc.id === accountId ? { ...acc, ...patch } : acc
      );
      return autoSyncCascade
        ? computeCascadedState(prev, nextAccounts)
        : { ...prev, accounts: nextAccounts };
    });
  };

  const addAccount = (account: Omit<FinancialAccountItem, 'id'>) => {
    const id = `acc-${Date.now()}`;
    setState((prev) => {
      const nextAccounts = [...prev.accounts, { ...account, id }];
      return autoSyncCascade
        ? computeCascadedState(prev, nextAccounts)
        : { ...prev, accounts: nextAccounts };
    });
  };

  const removeAccount = (accountId: string) => {
    setState((prev) => {
      const nextAccounts = prev.accounts.filter((acc) => acc.id !== accountId);
      return autoSyncCascade
        ? computeCascadedState(prev, nextAccounts)
        : { ...prev, accounts: nextAccounts };
    });
  };

  const autoBalanceSheet = (): string => {
    let targetName = 'Utilidades Retenidas';
    setState((prev) => {
      const actPeriod =
        prev.periods.find((p) => p.id === prev.activePeriodId) ?? prev.periods[0];
      const compPeriod =
        prev.periods.find((p) => p.id === prev.comparisonPeriodId) ?? prev.periods[0];

      const actT = computeFinancialStatements(prev.accounts, actPeriod);
      const compT = computeFinancialStatements(prev.accounts, compPeriod);

      const equityAccounts = prev.accounts.filter((a) => a.category === 'PATRIMONIO');
      const targetAcc =
        equityAccounts.find((a) => a.subType === 'UTILIDADES_RETENIDAS') ??
        equityAccounts[equityAccounts.length - 1];

      let nextAccounts: FinancialAccountItem[];
      if (targetAcc) {
        targetName = targetAcc.name;
        nextAccounts = prev.accounts.map((acc) =>
          acc.id === targetAcc.id
            ? {
                ...acc,
                balances: {
                  ...acc.balances,
                  [compPeriod.id]:
                    (acc.balances[compPeriod.id] ?? 0) + compT.diferenciaCuadre,
                  [actPeriod.id]:
                    (acc.balances[actPeriod.id] ?? 0) + actT.diferenciaCuadre,
                },
              }
            : acc
        );
      } else {
        nextAccounts = [
          ...prev.accounts,
          {
            id: `acc-eq-${Date.now()}`,
            code: '3102',
            name: 'Utilidades Retenidas (Ajuste de Cuadre)',
            category: 'PATRIMONIO',
            subType: 'UTILIDADES_RETENIDAS',
            balances: {
              [compPeriod.id]: compT.diferenciaCuadre,
              [actPeriod.id]: actT.diferenciaCuadre,
            },
          },
        ];
      }

      return computeCascadedState(prev, nextAccounts);
    });
    return targetName;
  };

  const syncAllModulesFromStatements = () => {
    setState((prev) => computeCascadedState(prev, prev.accounts));
  };

  const updateCompanyInfo = (patch: Partial<FinancialSystemState['company']>) => {
    setState((prev) => ({
      ...prev,
      company: { ...prev.company, ...patch },
    }));
  };

  const updateCvuInput = (patch: Partial<CvuLeverageInput>) => {
    setState((prev) => ({
      ...prev,
      cvuInput: { ...prev.cvuInput, ...patch },
    }));
  };

  /**
   * Reutilización de datos: Sincroniza los costos fijos, costos variables, precio e intereses
   * del módulo C-V-U y Apalancamiento con el Estado de Resultados del período activo.
   */
  const syncCvuWithIncomeStatement = () => {
    const units =
      state.cvuInput.currentUnitsSold > 0 ? state.cvuInput.currentUnitsSold : 1000000;
    const unitPrice = Number((activeTotals.ventasNetas / units).toFixed(2));
    const unitVariableCost = Number((activeTotals.costoBienesVendidos / units).toFixed(2));
    setState((prev) => ({
      ...prev,
      cvuInput: {
        ...prev.cvuInput,
        currentUnitsSold: units,
        unitPrice,
        unitVariableCost,
        fixedOperatingCosts: activeTotals.totalGastosOperativos,
        interestExpense: activeTotals.gastosFinancieros,
        taxRate: activePeriod.taxRate,
      },
    }));
  };

  const updateCashFlowInitialBalance = (amount: number) => {
    setState((prev) => ({ ...prev, cashFlowInitialBalance: Number(amount) || 0 }));
  };

  const updateCashFlowEntry = (
    id: string,
    patch: Partial<Omit<CashFlowEntry, 'id'>>
  ) => {
    setState((prev) => ({
      ...prev,
      cashFlowEntries: prev.cashFlowEntries.map((e) =>
        e.id === id ? { ...e, ...patch } : e
      ),
    }));
  };

  const addCashFlowEntry = (entry: Omit<CashFlowEntry, 'id'>) => {
    const id = `cf-${Date.now()}`;
    setState((prev) => ({
      ...prev,
      cashFlowEntries: [...prev.cashFlowEntries, { ...entry, id }],
    }));
  };

  const removeCashFlowEntry = (id: string) => {
    setState((prev) => ({
      ...prev,
      cashFlowEntries: prev.cashFlowEntries.filter((e) => e.id !== id),
    }));
  };

  const syncCashFlowInitialWithBalance = () => {
    setState((prev) => ({
      ...prev,
      cashFlowInitialBalance: comparisonTotals.efectivo,
    }));
  };

  const updateMasterBudget = (patch: Partial<MasterBudgetInput>) => {
    setState((prev) => ({
      ...prev,
      masterBudget: { ...prev.masterBudget, ...patch },
    }));
  };

  const syncMasterBudgetWithBalance = () => {
    setState((prev) => ({
      ...prev,
      masterBudget: {
        ...prev.masterBudget,
        initialCashBalance: activeTotals.efectivo,
        collectionsFromPriorSales: activeTotals.cuentasPorCobrar,
        paymentsForPriorPurchases: activeTotals.cuentasPorPagar,
      },
    }));
  };

  const addPersonalTransaction = (tx: Omit<PersonalTransaction, 'id'>) => {
    const id = `pt-${Date.now()}`;
    updateMyPersonalBudget((pb) => ({
      ...pb,
      transactions: [...pb.transactions, { ...tx, id }],
    }));
  };

  const removePersonalTransaction = (id: string) => {
    updateMyPersonalBudget((pb) => ({
      ...pb,
      transactions: pb.transactions.filter((t) => t.id !== id),
    }));
  };

  const updatePersonalSavingsGoal = (pct: number) => {
    updateMyPersonalBudget((pb) => ({
      ...pb,
      savingsGoalPct: Math.max(0, Math.min(100, Number(pct) || 0)),
    }));
  };

  const updateInventoryProduct = (id: string, patch: Partial<InventoryProduct>) => {
    setState((prev) => ({
      ...prev,
      inventoryProducts: prev.inventoryProducts.map((p) =>
        p.id === id ? { ...p, ...patch } : p
      ),
    }));
  };

  const addInventoryProduct = (prod: Omit<InventoryProduct, 'id'>) => {
    const id = `inv-${Date.now()}`;
    setState((prev) => ({
      ...prev,
      inventoryProducts: [...prev.inventoryProducts, { ...prod, id }],
    }));
  };

  const removeInventoryProduct = (id: string) => {
    setState((prev) => ({
      ...prev,
      inventoryProducts: prev.inventoryProducts.filter((p) => p.id !== id),
    }));
  };

  /**
   * Sincroniza el Valor Total del Inventario (Módulo I) hacia la cuenta de Inventario
   * del Balance General (Módulo A) en el período activo.
   */
  const syncInventoryWithBalanceSheet = () => {
    setState((prev) => ({
      ...prev,
      accounts: prev.accounts.map((acc) =>
        acc.subType === 'INVENTARIO'
          ? {
            ...acc,
            balances: {
              ...acc.balances,
              [activePeriod.id]: inventoryResult.totalInventoryValue,
            },
          }
          : acc
      ),
    }));
  };

  const applyExtractedFinancialData = (patch: ExtractedFinancialPatch) => {
    setState((prev) => ({
      ...prev,
      ...(patch.company ? { company: { ...prev.company, ...patch.company } } : {}),
      ...(patch.periods && patch.periods.length > 0 ? { periods: patch.periods } : {}),
      ...(patch.activePeriodId ? { activePeriodId: patch.activePeriodId } : {}),
      ...(patch.comparisonPeriodId ? { comparisonPeriodId: patch.comparisonPeriodId } : {}),
      ...(patch.accounts && patch.accounts.length > 0 ? { accounts: patch.accounts } : {}),
      ...(patch.cvuInput ? { cvuInput: { ...prev.cvuInput, ...patch.cvuInput } } : {}),
      ...(patch.cashFlowInitialBalance !== undefined
        ? { cashFlowInitialBalance: patch.cashFlowInitialBalance }
        : {}),
      ...(patch.cashFlowEntries && patch.cashFlowEntries.length > 0
        ? { cashFlowEntries: patch.cashFlowEntries }
        : {}),
      ...(patch.masterBudget
        ? { masterBudget: { ...prev.masterBudget, ...patch.masterBudget } }
        : {}),
      ...(patch.inventoryProducts && patch.inventoryProducts.length > 0
        ? { inventoryProducts: patch.inventoryProducts }
        : {}),
    }));
  };

  const resetDemoData = () => {
    const fresh = FinancialRepository.resetToDemoState(rawState.personalBudgetsByUser);
    setState(fresh);
  };

  const clearForNewCase = () => {
    const blank = FinancialRepository.resetToBlankCase(rawState.personalBudgetsByUser);
    setState(blank);
  };

  return (
    <FinancialContext.Provider
      value={{
        state,
        activePeriod,
        comparisonPeriod,
        activeTotals,
        comparisonTotals,
        verticalHorizontal,
        ratios,
        duPont,
        cvuAndLeverage,
        cashFlowResult,
        cashConversionCycle,
        comparisonCashConversionCycle,
        masterBudgetAndProforma,
        personalBudgetResult,
        inventoryResult,
        setActivePeriodId,
        setComparisonPeriodId,
        updatePeriod,
        updateAccountBalance,
        updateAccountMeta,
        addAccount,
        removeAccount,
        updateCompanyInfo,
        updateCvuInput,
        syncCvuWithIncomeStatement,
        updateCashFlowInitialBalance,
        updateCashFlowEntry,
        addCashFlowEntry,
        removeCashFlowEntry,
        syncCashFlowInitialWithBalance,
        updateMasterBudget,
        syncMasterBudgetWithBalance,
        addPersonalTransaction,
        removePersonalTransaction,
        updatePersonalSavingsGoal,
        updateInventoryProduct,
        addInventoryProduct,
        removeInventoryProduct,
        syncInventoryWithBalanceSheet,
        autoSyncCascade,
        setAutoSyncCascade,
        autoBalanceSheet,
        syncAllModulesFromStatements,
        applyExtractedFinancialData,
        resetDemoData,
        clearForNewCase,
      }}
    >
      {children}
    </FinancialContext.Provider>
  );
};

export function useFinancialSystem(): FinancialContextValue {
  const ctx = useContext(FinancialContext);
  if (!ctx) {
    throw new Error('useFinancialSystem debe usarse dentro de un FinancialProvider');
  }
  return ctx;
}
