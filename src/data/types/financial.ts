/**
 * MODELOS DE DATOS DEL SISTEMA DE ANÁLISIS Y PLANEACIÓN FINANCIERA (IS2122)
 * Representa las entidades del modelo relacional y las estructuras del motor financiero.
 */

export type AccountCategory =
  | 'ACTIVO_CORRIENTE'
  | 'ACTIVO_NO_CORRIENTE'
  | 'PASIVO_CORRIENTE'
  | 'PASIVO_NO_CORRIENTE'
  | 'PATRIMONIO'
  | 'INGRESO_OPERATIVO'
  | 'COSTO_VENTAS'
  | 'GASTO_OPERATIVO'
  | 'GASTO_FINANCIERO';

export type AccountSubType =
  | 'EFECTIVO'
  | 'CUENTAS_POR_COBRAR'
  | 'INVENTARIO'
  | 'OTROS_ACTIVOS_CORRIENTES'
  | 'ACTIVO_FIJO_NETO'
  | 'CUENTAS_POR_PAGAR'
  | 'DEUDA_CORTO_PLAZO'
  | 'DEUDA_LARGO_PLAZO'
  | 'CAPITAL_SOCIAL'
  | 'UTILIDADES_RETENIDAS'
  | 'VENTAS_NETAS'
  | 'COSTO_BIENES_VENDIDOS'
  | 'GASTOS_VENTA_ADMIN'
  | 'GASTOS_DEPRECIACION'
  | 'INTERESES_PAGADOS';

export interface FinancialAccountItem {
  id: string;
  code: string;
  name: string;
  category: AccountCategory;
  subType: AccountSubType;
  /** Montos indexados por ID de período (ej. { '2024': 500000, '2025': 620000 }) */
  balances: Record<string, number>;
}

export interface FinancialPeriod {
  id: string;
  name: string; // '2023', '2024'
  year: number;
  taxRate: number; // Porcentaje ej. 30 para 30%
  /**
   * Monto explícito de Provisión para Impuesto sobre la Renta (C$).
   * Si se define (ej. en estados auditados con pago mínimo definitivo o impuesto diferido),
   * se utiliza este valor exacto; si es undefined/null, se calcula como UAI * (taxRate / 100).
   */
  taxAmount?: number | null;
}

export interface CompanyProfile {
  id: string;
  name: string;
  sector: string;
  currency: string; // 'C$'
  sharesOutstanding: number;
  marketPricePerShare: number;
}

/**
 * Datos para Punto de Equilibrio (C-V-U) y Apalancamiento (GAO, GAF, GAT)
 */
export interface CvuLeverageInput {
  unitPrice: number; // Precio de venta unitario (C$)
  unitVariableCost: number; // Costo variable unitario (C$)
  fixedOperatingCosts: number; // Costos y gastos fijos operativos totales (C$)
  currentUnitsSold: number; // Volumen actual de ventas (unidades)
  interestExpense: number; // Intereses financieros anuales (C$)
  preferredDividends: number; // Dividendos preferentes (C$)
  taxRate: number; // Tasa impositiva (%)
  /** Simulación de cambios en variables C-V-U (%) */
  priceChangePct: number;
  variableCostChangePct: number;
  fixedCostChangePct: number;
  volumeChangePct: number;
}

/**
 * Movimientos para el Estado de Flujo de Efectivo
 */
export type CashFlowActivity = 'OPERACION' | 'INVERSION' | 'FINANCIAMIENTO';
export type CashFlowDirection = 'ENTRADA' | 'SALIDA';

export interface CashFlowEntry {
  id: string;
  concept: string;
  activity: CashFlowActivity;
  direction: CashFlowDirection;
  amount: number;
}

/**
 * Supuestos de Planeación Financiera y Presupuesto Maestro (Unidad 3)
 */
export interface MasterBudgetInput {
  projectionName: string;
  projectedUnitsToSell: number; // Unidades proyectadas a vender
  projectedUnitPrice: number; // Precio de venta proyectado (C$)
  projectedUnitCost: number; // Costo unitario de compra/producción (C$)
  initialInventoryUnits: number; // Inventario inicial en unidades
  desiredEndingInventoryUnits: number; // Inventario final deseado en unidades
  cashSalesPct: number; // % de ventas al contado (el resto se cobra en cuentas por cobrar)
  collectionsFromPriorSales: number; // Cobros de clientes del período anterior (C$)
  cashPurchasesPct: number; // % de compras pagadas al contado
  paymentsForPriorPurchases: number; // Pagos a proveedores del período anterior (C$)
  fixedOperatingExpenses: number; // Gastos operativos fijos proyectados (C$)
  variableOpExpensePct: number; // Comisiones y gastos variables (% sobre ventas)
  nonCashDepreciation: number; // Depreciación proyectada (no salida de efectivo) (C$)
  capexOutflow: number; // Desembolso por compra de activo fijo / inversión (C$)
  interestPayment: number; // Pago de intereses proyectado (C$)
  dividendPayment: number; // Pago de dividendos proyectado (C$)
  taxPayment: number; // Pago de impuestos en efectivo (C$)
  initialCashBalance: number; // Saldo inicial de caja (C$)
  minimumCashRequired: number; // Efectivo mínimo requerido para operar (C$)
}

/**
 * Módulo Complementario Obligatorio H: Presupuesto Personal (Independiente)
 */
export interface PersonalTransaction {
  id: string;
  description: string;
  category: string;
  type: 'INGRESO' | 'GASTO';
  amount: number;
  isFixed: boolean;
}

export interface PersonalBudgetData {
  monthLabel: string;
  savingsGoalPct: number; // Meta de ahorro sugerida (% de ingresos)
  transactions: PersonalTransaction[];
}

/**
 * Módulo Complementario Obligatorio I: Control Básico de Inventario
 */
export interface InventoryProduct {
  id: string;
  sku: string;
  name: string;
  category: string;
  initialStock: number;
  entries: number;
  exits: number;
  unitCost: number;
  minStock: number;
}

export interface FinancialSystemState {
  company: CompanyProfile;
  periods: FinancialPeriod[];
  activePeriodId: string;
  comparisonPeriodId: string;
  accounts: FinancialAccountItem[];
  cvuInput: CvuLeverageInput;
  cashFlowInitialBalance: number;
  cashFlowEntries: CashFlowEntry[];
  masterBudget: MasterBudgetInput;
  /** Presupuesto personal del usuario activo (vista derivada en el contexto). */
  personalBudget: PersonalBudgetData;
  /** Presupuestos personales independientes, indexados por ID de usuario. */
  personalBudgetsByUser: Record<string, PersonalBudgetData>;
  inventoryProducts: InventoryProduct[];
}

