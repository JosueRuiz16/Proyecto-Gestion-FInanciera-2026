import { CashFlowEntry, MasterBudgetInput } from '../../data/types/financial';
import { ComputedStatementTotals } from './statements';

export interface CashFlowStatementResult {
  operatingInflows: number;
  operatingOutflows: number;
  netOperatingCashFlow: number;

  investingInflows: number;
  investingOutflows: number;
  netInvestingCashFlow: number;

  financingInflows: number;
  financingOutflows: number;
  netFinancingCashFlow: number;

  netCashVariation: number; // Variación neta del efectivo = FEO + FEI + FEF
  initialCashBalance: number;
  endingCashBalance: number; // Saldo final = Saldo inicial + Variación neta
  interpretation: string;
}

export interface MasterBudgetAndProformaResult {
  // 1. Presupuesto de Ventas
  projectedSalesRevenue: number;
  cashCollectionsFromCurrentSales: number;
  endingAccountsReceivable: number;
  totalCashCollections: number;

  // 2. Presupuesto de Compras y Costo de Bienes Vendidos (CBV)
  requiredUnitsToBuyOrProduce: number; // Ventas proyectadas + Inv. Final Deseado - Inv. Inicial
  totalPurchasesCost: number; // Unidades a comprar * Costo unitario proyectado
  costOfGoodsSoldProjected: number; // Unidades a vender * Costo unitario proyectado
  endingInventoryValue: number; // Inv. Final Deseado * Costo unitario proyectado
  cashPaymentsForCurrentPurchases: number;
  endingAccountsPayable: number;
  totalCashPaymentsToSuppliers: number;

  // 3. Presupuesto de Gastos Operativos
  variableOperatingExpenses: number;
  fixedOperatingExpenses: number;
  totalOperatingExpensesWithDepreciation: number;
  cashOperatingExpenses: number; // Excluye depreciación por ser partida no monetaria

  // 4. Presupuesto de Caja (Flujo de Caja Proyectado)
  totalCashInflows: number;
  totalCashOutflows: number;
  netCashFlowBeforeFinancing: number;
  projectedEndingCashBalance: number;
  minimumCashRequired: number;
  cashSurplusOrDeficit: number; // Saldo Final Proyectado - Efectivo Mínimo Requerido
  externalFinancingRequired: number; // Si hay déficit respecto al mínimo requerido

  // 5. Estado de Resultados Proforma
  proformaGrossProfit: number;
  proformaUaii: number;
  proformaUai: number;
  proformaTaxes: number;
  proformaNetIncome: number;
  proformaNetMarginPct: number;

  // 6. Balance General Proforma (Integrado con el período base)
  proformaTotalCurrentAssets: number;
  proformaNetFixedAssets: number;
  proformaTotalAssets: number;
  proformaTotalLiabilities: number;
  proformaTotalEquity: number;
}

/**
 * Calcula el Estado de Flujo de Efectivo clasificado en Actividades de Operación,
 * Inversión y Financiamiento (Módulo E).
 */
export function computeCashFlowStatement(
  entries: CashFlowEntry[],
  initialCashBalance: number
): CashFlowStatementResult {
  const sum = (
    act: CashFlowEntry['activity'],
    dir: CashFlowEntry['direction']
  ) =>
    entries
      .filter((e) => e.activity === act && e.direction === dir)
      .reduce((acc, item) => acc + Number(item.amount || 0), 0);

  const operatingInflows = sum('OPERACION', 'ENTRADA');
  const operatingOutflows = sum('OPERACION', 'SALIDA');
  const netOperatingCashFlow = Number((operatingInflows - operatingOutflows).toFixed(2));

  const investingInflows = sum('INVERSION', 'ENTRADA');
  const investingOutflows = sum('INVERSION', 'SALIDA');
  const netInvestingCashFlow = Number((investingInflows - investingOutflows).toFixed(2));

  const financingInflows = sum('FINANCIAMIENTO', 'ENTRADA');
  const financingOutflows = sum('FINANCIAMIENTO', 'SALIDA');
  const netFinancingCashFlow = Number((financingInflows - financingOutflows).toFixed(2));

  const netCashVariation = Number(
    (netOperatingCashFlow + netInvestingCashFlow + netFinancingCashFlow).toFixed(2)
  );
  const endingCashBalance = Number((initialCashBalance + netCashVariation).toFixed(2));

  const interpretation =
    netOperatingCashFlow > 0
      ? `La operación principal genera un flujo positivo de C$ ${netOperatingCashFlow.toLocaleString()}, permitiendo cubrir inversiones y servicio de deuda con una variación neta total de C$ ${netCashVariation.toLocaleString()}.`
      : `Atención: las actividades operativas presentan una salida neta de C$ ${Math.abs(
        netOperatingCashFlow
      ).toLocaleString()}, lo que exige revisar políticas de cobro y control de gastos.`;

  return {
    operatingInflows,
    operatingOutflows,
    netOperatingCashFlow,
    investingInflows,
    investingOutflows,
    netInvestingCashFlow,
    financingInflows,
    financingOutflows,
    netFinancingCashFlow,
    netCashVariation,
    initialCashBalance,
    endingCashBalance,
    interpretation,
  };
}

/**
 * Calcula el Presupuesto Maestro (Ventas, Compras, Costo de Bienes Vendidos, Gastos Operativos,
 * Presupuesto de Caja) y genera los Estados Financieros Proforma (Módulos F y G).
 */
export function computeMasterBudgetAndProforma(
  input: MasterBudgetInput,
  basePeriodTotals: ComputedStatementTotals,
  taxRatePct: number
): MasterBudgetAndProformaResult {
  // 1. Presupuesto de Ventas y Cobros
  const projectedSalesRevenue = Number(
    (input.projectedUnitsToSell * input.projectedUnitPrice).toFixed(2)
  );
  const cashSalesRatio = input.cashSalesPct / 100;
  const cashCollectionsFromCurrentSales = Number(
    (projectedSalesRevenue * cashSalesRatio).toFixed(2)
  );
  const endingAccountsReceivable = Number(
    (projectedSalesRevenue * (1 - cashSalesRatio)).toFixed(2)
  );
  const totalCashCollections = Number(
    (cashCollectionsFromCurrentSales + input.collectionsFromPriorSales).toFixed(2)
  );

  // 2. Presupuesto de Compras y Costo de Bienes Vendidos (CBV)
  const requiredUnitsRaw =
    input.projectedUnitsToSell +
    input.desiredEndingInventoryUnits -
    input.initialInventoryUnits;
  const requiredUnitsToBuyOrProduce = Math.max(0, Number(requiredUnitsRaw.toFixed(2)));

  const totalPurchasesCost = Number(
    (requiredUnitsToBuyOrProduce * input.projectedUnitCost).toFixed(2)
  );
  const costOfGoodsSoldProjected = Number(
    (input.projectedUnitsToSell * input.projectedUnitCost).toFixed(2)
  );
  const endingInventoryValue = Number(
    (input.desiredEndingInventoryUnits * input.projectedUnitCost).toFixed(2)
  );

  const cashPurchasesRatio = input.cashPurchasesPct / 100;
  const cashPaymentsForCurrentPurchases = Number(
    (totalPurchasesCost * cashPurchasesRatio).toFixed(2)
  );
  const endingAccountsPayable = Number(
    (totalPurchasesCost * (1 - cashPurchasesRatio)).toFixed(2)
  );
  const totalCashPaymentsToSuppliers = Number(
    (cashPaymentsForCurrentPurchases + input.paymentsForPriorPurchases).toFixed(2)
  );

  // 3. Presupuesto de Gastos Operativos
  const variableOperatingExpenses = Number(
    ((projectedSalesRevenue * input.variableOpExpensePct) / 100).toFixed(2)
  );
  const fixedOperatingExpenses = Number(input.fixedOperatingExpenses.toFixed(2));
  const cashOperatingExpenses = Number(
    (variableOperatingExpenses + fixedOperatingExpenses).toFixed(2)
  );
  const totalOperatingExpensesWithDepreciation = Number(
    (cashOperatingExpenses + input.nonCashDepreciation).toFixed(2)
  );

  // 4. Presupuesto de Caja
  const totalCashInflows = totalCashCollections;
  const totalCashOutflows = Number(
    (
      totalCashPaymentsToSuppliers +
      cashOperatingExpenses +
      input.capexOutflow +
      input.interestPayment +
      input.taxPayment +
      input.dividendPayment
    ).toFixed(2)
  );
  const netCashFlowBeforeFinancing = Number(
    (totalCashInflows - totalCashOutflows).toFixed(2)
  );
  const projectedEndingCashBalance = Number(
    (input.initialCashBalance + netCashFlowBeforeFinancing).toFixed(2)
  );
  const cashSurplusOrDeficit = Number(
    (projectedEndingCashBalance - input.minimumCashRequired).toFixed(2)
  );
  const externalFinancingRequired =
    cashSurplusOrDeficit < 0 ? Math.abs(cashSurplusOrDeficit) : 0;

  // 5. Estado de Resultados Proforma
  const proformaGrossProfit = Number(
    (projectedSalesRevenue - costOfGoodsSoldProjected).toFixed(2)
  );
  const proformaUaii = Number(
    (proformaGrossProfit - totalOperatingExpensesWithDepreciation).toFixed(2)
  );
  const proformaUai = Number((proformaUaii - input.interestPayment).toFixed(2));
  const proformaTaxes =
    proformaUai > 0 ? Number(((proformaUai * taxRatePct) / 100).toFixed(2)) : 0;
  const proformaNetIncome = Number((proformaUai - proformaTaxes).toFixed(2));
  const proformaNetMarginPct =
    projectedSalesRevenue > 0
      ? Number(((proformaNetIncome / projectedSalesRevenue) * 100).toFixed(2))
      : 0;

  // 6. Balance General Proforma Simplificado
  const effectiveCashInBalance = Math.max(
    projectedEndingCashBalance,
    input.minimumCashRequired
  );
  const proformaTotalCurrentAssets = Number(
    (
      effectiveCashInBalance +
      endingAccountsReceivable +
      endingInventoryValue +
      basePeriodTotals.otrosActivosCorrientes
    ).toFixed(2)
  );
  const proformaNetFixedAssets = Number(
    (
      basePeriodTotals.totalActivoNoCorriente +
      input.capexOutflow -
      input.nonCashDepreciation
    ).toFixed(2)
  );
  const proformaTotalAssets = Number(
    (proformaTotalCurrentAssets + proformaNetFixedAssets).toFixed(2)
  );

  const proformaTotalLiabilities = Number(
    (
      endingAccountsPayable +
      basePeriodTotals.deudaCortoPlazo +
      externalFinancingRequired +
      basePeriodTotals.totalPasivoNoCorriente
    ).toFixed(2)
  );
  const proformaTotalEquity = Number(
    (
      basePeriodTotals.totalPatrimonio +
      proformaNetIncome -
      input.dividendPayment
    ).toFixed(2)
  );

  return {
    projectedSalesRevenue,
    cashCollectionsFromCurrentSales,
    endingAccountsReceivable,
    totalCashCollections,
    requiredUnitsToBuyOrProduce,
    totalPurchasesCost,
    costOfGoodsSoldProjected,
    endingInventoryValue,
    cashPaymentsForCurrentPurchases,
    endingAccountsPayable,
    totalCashPaymentsToSuppliers,
    variableOperatingExpenses,
    fixedOperatingExpenses,
    totalOperatingExpensesWithDepreciation,
    cashOperatingExpenses,
    totalCashInflows,
    totalCashOutflows,
    netCashFlowBeforeFinancing,
    projectedEndingCashBalance,
    minimumCashRequired: input.minimumCashRequired,
    cashSurplusOrDeficit,
    externalFinancingRequired,
    proformaGrossProfit,
    proformaUaii,
    proformaUai,
    proformaTaxes,
    proformaNetIncome,
    proformaNetMarginPct,
    proformaTotalCurrentAssets,
    proformaNetFixedAssets,
    proformaTotalAssets,
    proformaTotalLiabilities,
    proformaTotalEquity,
  };
}

