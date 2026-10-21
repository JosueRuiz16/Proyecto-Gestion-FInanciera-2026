import { InventoryProduct, PersonalBudgetData } from '../../data/types/financial';

export interface PersonalCategorySummary {
  category: string;
  amount: number;
  percentageOfExpenses: number;
  percentageOfIncome: number;
}

export interface PersonalBudgetResult {
  totalIncome: number; // Total de ingresos (C$)
  totalExpenses: number; // Total de gastos (C$)
  fixedExpenses: number; // Gastos fijos (C$)
  variableExpenses: number; // Gastos variables (C$)
  availableBalance: number; // Saldo disponible = Total Ingresos - Total Gastos
  savingsCapacityPct: number; // Capacidad de ahorro (%) = (Saldo Disponible / Total Ingresos) * 100
  recommendedSavingsAmount: number; // Meta de ahorro según porcentaje meta
  meetsSavingsGoal: boolean;
  expensesByCategory: PersonalCategorySummary[];
  interpretation: string;
}

export interface ComputedInventoryItem extends InventoryProduct {
  finalStock: number; // Existencia final = Existencia inicial + Entradas - Salidas
  totalValue: number; // Valor del inventario = Existencia final * Costo unitario
  needsReorder: boolean; // Alerta de reposición: Existencia final <= Stock mínimo
  suggestedPurchaseUnits: number; // Unidades sugeridas para planeación de compras
  suggestedPurchaseCost: number; // Costo estimado de reposición (C$)
}

export interface InventorySummaryResult {
  items: ComputedInventoryItem[];
  totalUnitsInStock: number;
  totalInventoryValue: number;
  productsInReorderAlert: number;
  totalSuggestedPurchaseCost: number;
}

/**
 * Calcula los indicadores obligatorios del Módulo H: Presupuesto Personal (Independiente).
 * Fórmulas:
 * - Total Ingresos = Suma de ingresos del mes
 * - Total Gastos = Suma de gastos del mes
 * - Saldo Disponible = Total Ingresos - Total Gastos
 * - Capacidad de Ahorro (%) = (Saldo Disponible / Total Ingresos) * 100
 */
export function computePersonalBudget(data: PersonalBudgetData): PersonalBudgetResult {
  const incomes = data.transactions.filter((t) => t.type === 'INGRESO');
  const expenses = data.transactions.filter((t) => t.type === 'GASTO');

  const totalIncome = Number(
    incomes.reduce((acc, item) => acc + Number(item.amount || 0), 0).toFixed(2)
  );
  const totalExpenses = Number(
    expenses.reduce((acc, item) => acc + Number(item.amount || 0), 0).toFixed(2)
  );
  const fixedExpenses = Number(
    expenses
      .filter((e) => e.isFixed)
      .reduce((acc, item) => acc + Number(item.amount || 0), 0)
      .toFixed(2)
  );
  const variableExpenses = Number((totalExpenses - fixedExpenses).toFixed(2));

  const availableBalance = Number((totalIncome - totalExpenses).toFixed(2));
  const savingsCapacityPct =
    totalIncome > 0
      ? Number(((availableBalance / totalIncome) * 100).toFixed(2))
      : 0;

  const recommendedSavingsAmount = Number(
    ((totalIncome * data.savingsGoalPct) / 100).toFixed(2)
  );
  const meetsSavingsGoal = availableBalance >= recommendedSavingsAmount && totalIncome > 0;

  // Agrupación de gastos por categoría
  const categoryMap = new Map<string, number>();
  for (const exp of expenses) {
    const prev = categoryMap.get(exp.category) ?? 0;
    categoryMap.set(exp.category, prev + Number(exp.amount || 0));
  }

  const expensesByCategory: PersonalCategorySummary[] = Array.from(categoryMap.entries())
    .map(([category, amount]) => ({
      category,
      amount: Number(amount.toFixed(2)),
      percentageOfExpenses:
        totalExpenses > 0 ? Number(((amount / totalExpenses) * 100).toFixed(2)) : 0,
      percentageOfIncome:
        totalIncome > 0 ? Number(((amount / totalIncome) * 100).toFixed(2)) : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  const interpretation =
    availableBalance < 0
      ? `Déficit presupuestario personal de C$ ${Math.abs(
        availableBalance
      ).toLocaleString()}: los gastos superan a los ingresos mensuales.`
      : meetsSavingsGoal
        ? `Salud financiera óptima: el saldo disponible de C$ ${availableBalance.toLocaleString()} representa una capacidad de ahorro del ${savingsCapacityPct}%, superando la meta del ${data.savingsGoalPct}%.`
        : `Superávit moderado: dispones de C$ ${availableBalance.toLocaleString()} (${savingsCapacityPct}% de ahorro), aún por debajo de la meta propuesta del ${data.savingsGoalPct}%.`;

  return {
    totalIncome,
    totalExpenses,
    fixedExpenses,
    variableExpenses,
    availableBalance,
    savingsCapacityPct,
    recommendedSavingsAmount,
    meetsSavingsGoal,
    expensesByCategory,
    interpretation,
  };
}

/**
 * Calcula los indicadores obligatorios del Módulo I: Control Básico de Inventario.
 * Fórmulas obligatorias de la Guía GFO 2026:
 * - Existencia final = Existencia inicial + Entradas - Salidas
 * - Valor del inventario = Existencia final * Costo unitario
 * - Alerta de reposición cuando Existencia final <= Stock mínimo
 */
export function computeInventoryControl(
  products: InventoryProduct[]
): InventorySummaryResult {
  const items: ComputedInventoryItem[] = products.map((p) => {
    const finalStock = Number((p.initialStock + p.entries - p.exits).toFixed(2));
    const totalValue = Number((Math.max(0, finalStock) * p.unitCost).toFixed(2));
    const needsReorder = finalStock <= p.minStock;
    // Si está en o bajo el stock mínimo, sugiere reponer hasta alcanzar el doble del stock mínimo
    const targetOptimalStock = p.minStock * 2;
    const suggestedPurchaseUnits = needsReorder
      ? Math.max(0, Number((targetOptimalStock - finalStock).toFixed(2)))
      : 0;
    const suggestedPurchaseCost = Number(
      (suggestedPurchaseUnits * p.unitCost).toFixed(2)
    );

    return {
      ...p,
      finalStock,
      totalValue,
      needsReorder,
      suggestedPurchaseUnits,
      suggestedPurchaseCost,
    };
  });

  const totalUnitsInStock = Number(
    items.reduce((acc, i) => acc + i.finalStock, 0).toFixed(2)
  );
  const totalInventoryValue = Number(
    items.reduce((acc, i) => acc + i.totalValue, 0).toFixed(2)
  );
  const productsInReorderAlert = items.filter((i) => i.needsReorder).length;
  const totalSuggestedPurchaseCost = Number(
    items.reduce((acc, i) => acc + i.suggestedPurchaseCost, 0).toFixed(2)
  );

  return {
    items,
    totalUnitsInStock,
    totalInventoryValue,
    productsInReorderAlert,
    totalSuggestedPurchaseCost,
  };
}

