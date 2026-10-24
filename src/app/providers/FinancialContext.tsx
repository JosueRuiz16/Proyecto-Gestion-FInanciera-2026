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

  const updateAccountBalance = (
    accountId: string,
    periodId: string,
    amount: number
  ) => {
    setState((prev) => ({
      ...prev,
      accounts: prev.accounts.map((acc) =>
        acc.id === accountId
          ? {
            ...acc,
            balances: { ...acc.balances, [periodId]: Number(amount) || 0 },
          }
          : acc
      ),
    }));
  };

  const updateAccountMeta = (
    accountId: string,
    patch: Partial<Pick<FinancialAccountItem, 'code' | 'name' | 'category' | 'subType'>>
  ) => {
    setState((prev) => ({
      ...prev,
      accounts: prev.accounts.map((acc) =>
        acc.id === accountId ? { ...acc, ...patch } : acc
      ),
    }));
  };

  const addAccount = (account: Omit<FinancialAccountItem, 'id'>) => {
    const id = `acc-${Date.now()}`;
    setState((prev) => ({
      ...prev,
      accounts: [...prev.accounts, { ...account, id }],
    }));
  };

  const removeAccount = (accountId: string) => {
    setState((prev) => ({
      ...prev,
      accounts: prev.accounts.filter((acc) => acc.id !== accountId),
    }));
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
