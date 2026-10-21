import { FinancialSystemState } from '../types/financial';
import { createPersonalBudgetsByUser } from './personalBudgets';

/**
 * CASO DEMOSTRATIVO INTEGRAL (GFO IS2122 - 2026)
 * Empresa: Distribuidora Industrial del Pacífico, S.A. (Nicaragua - C$)
 * Períodos incluidos: 2024 (Base) y 2025 (Actual) + Proyección 2026
 * Nota académica: Todos los saldos cuadran exactamente con la ecuación contable
 * (Total Activos = Total Pasivos + Total Patrimonio) en ambos períodos:
 * - Año 2024: Total Activos = C$ 1,500,000 | Pasivos (C$ 620,000) + Patrimonio (C$ 880,000) = C$ 1,500,000
 * - Año 2025: Total Activos = C$ 1,800,000 | Pasivos (C$ 700,000) + Patrimonio (C$ 1,100,000) = C$ 1,800,000
 */
const BASE_DEMO_STATE: Omit<FinancialSystemState, 'personalBudgetsByUser'> = {
  company: {
    id: 'comp-01',
    name: 'Distribuidora Industrial del Pacífico, S.A.',
    sector: 'Comercialización y Manufactura Ligera',
    currency: 'C$',
    sharesOutstanding: 10000,
    marketPricePerShare: 185,
  },
  periods: [
    { id: '2024', name: 'Período 2024', year: 2024, taxRate: 30 },
    { id: '2025', name: 'Período 2025', year: 2025, taxRate: 30 },
  ],
  activePeriodId: '2025',
  comparisonPeriodId: '2024',
  accounts: [
    // ACTIVOS CORRIENTES
    {
      id: 'acc-101',
      code: '1101',
      name: 'Efectivo y Equivalentes de Efectivo',
      category: 'ACTIVO_CORRIENTE',
      subType: 'EFECTIVO',
      balances: { '2024': 180000, '2025': 240000 },
    },
    {
      id: 'acc-102',
      code: '1102',
      name: 'Cuentas por Cobrar Comerciales',
      category: 'ACTIVO_CORRIENTE',
      subType: 'CUENTAS_POR_COBRAR',
      balances: { '2024': 260000, '2025': 310000 },
    },
    {
      id: 'acc-103',
      code: '1103',
      name: 'Inventario de Mercaderías',
      category: 'ACTIVO_CORRIENTE',
      subType: 'INVENTARIO',
      balances: { '2024': 320000, '2025': 380000 },
    },
    {
      id: 'acc-104',
      code: '1104',
      name: 'Gastos Pagados por Anticipado',
      category: 'ACTIVO_CORRIENTE',
      subType: 'OTROS_ACTIVOS_CORRIENTES',
      balances: { '2024': 40000, '2025': 50000 },
    },
    // ACTIVOS NO CORRIENTES
    {
      id: 'acc-121',
      code: '1201',
      name: 'Propiedad, Planta y Equipo (Neto)',
      category: 'ACTIVO_NO_CORRIENTE',
      subType: 'ACTIVO_FIJO_NETO',
      balances: { '2024': 700000, '2025': 820000 },
    },

    // PASIVOS CORRIENTES
    {
      id: 'acc-201',
      code: '2101',
      name: 'Cuentas por Pagar a Proveedores',
      category: 'PASIVO_CORRIENTE',
      subType: 'CUENTAS_POR_PAGAR',
      balances: { '2024': 210000, '2025': 230000 },
    },
    {
      id: 'acc-202',
      code: '2102',
      name: 'Préstamos Bancarios de Corto Plazo',
      category: 'PASIVO_CORRIENTE',
      subType: 'DEUDA_CORTO_PLAZO',
      balances: { '2024': 110000, '2025': 120000 },
    },
    // PASIVOS NO CORRIENTES
    {
      id: 'acc-221',
      code: '2201',
      name: 'Préstamos Bancarios a Largo Plazo',
      category: 'PASIVO_NO_CORRIENTE',
      subType: 'DEUDA_LARGO_PLAZO',
      balances: { '2024': 300000, '2025': 350000 },
    },

    // PATRIMONIO
    {
      id: 'acc-301',
      code: '3101',
      name: 'Capital Social Suscrito y Pagado',
      category: 'PATRIMONIO',
      subType: 'CAPITAL_SOCIAL',
      balances: { '2024': 600000, '2025': 650000 },
    },
    {
      id: 'acc-302',
      code: '3102',
      name: 'Utilidades Retenidas y del Ejercicio',
      category: 'PATRIMONIO',
      subType: 'UTILIDADES_RETENIDAS',
      balances: { '2024': 280000, '2025': 450000 },
    },

    // ESTADO DE RESULTADOS
    {
      id: 'acc-401',
      code: '4101',
      name: 'Ventas Netas',
      category: 'INGRESO_OPERATIVO',
      subType: 'VENTAS_NETAS',
      balances: { '2024': 2100000, '2025': 2500000 },
    },
    {
      id: 'acc-501',
      code: '5101',
      name: 'Costo de los Bienes Vendidos (CBV)',
      category: 'COSTO_VENTAS',
      subType: 'COSTO_BIENES_VENDIDOS',
      balances: { '2024': 1260000, '2025': 1500000 },
    },
    {
      id: 'acc-601',
      code: '6101',
      name: 'Gastos de Ventas y Administración',
      category: 'GASTO_OPERATIVO',
      subType: 'GASTOS_VENTA_ADMIN',
      balances: { '2024': 380000, '2025': 420000 },
    },
    {
      id: 'acc-602',
      code: '6102',
      name: 'Gasto por Depreciación de Activos',
      category: 'GASTO_OPERATIVO',
      subType: 'GASTOS_DEPRECIACION',
      balances: { '2024': 70000, '2025': 80000 },
    },
    {
      id: 'acc-701',
      code: '7101',
      name: 'Gastos Financieros (Intereses Bancarios)',
      category: 'GASTO_FINANCIERO',
      subType: 'INTERESES_PAGADOS',
      balances: { '2024': 55000, '2025': 60000 },
    },
  ],

  // C-V-U y Apalancamiento coherentes con el Estado de Resultados 2025:
  // 10,000 unidades * C$ 250 = C$ 2,500,000 Ventas
  // 10,000 unidades * C$ 150 = C$ 1,500,000 Costo Variable Total
  // Costos Fijos Operativos = C$ 500,000 -> UAII = C$ 500,000 | Intereses = C$ 60,000
  cvuInput: {
    unitPrice: 250,
    unitVariableCost: 150,
    fixedOperatingCosts: 500000,
    currentUnitsSold: 10000,
    interestExpense: 60000,
    preferredDividends: 0,
    taxRate: 30,
    priceChangePct: 8,
    variableCostChangePct: 0,
    fixedCostChangePct: 0,
    volumeChangePct: 10,
  },

  // Estado de Flujo de Efectivo 2025 (Saldo Inicial = Efectivo 2024 = C$ 180,000 -> Saldo Final = C$ 240,000)
  cashFlowInitialBalance: 180000,
  cashFlowEntries: [
    {
      id: 'cf-1',
      concept: 'Cobros en efectivo a clientes por ventas',
      activity: 'OPERACION',
      direction: 'ENTRADA',
      amount: 2450000,
    },
    {
      id: 'cf-2',
      concept: 'Pagos en efectivo a proveedores de mercadería',
      activity: 'OPERACION',
      direction: 'SALIDA',
      amount: 1540000,
    },
    {
      id: 'cf-3',
      concept: 'Pago de gastos operativos, planilla y servicios',
      activity: 'OPERACION',
      direction: 'SALIDA',
      amount: 430000,
    },
    {
      id: 'cf-4',
      concept: 'Pago de intereses e impuestos sobre la renta',
      activity: 'OPERACION',
      direction: 'SALIDA',
      amount: 192000,
    },
    {
      id: 'cf-5',
      concept: 'Adquisición de maquinaria y equipo de reparto',
      activity: 'INVERSION',
      direction: 'SALIDA',
      amount: 200000,
    },
    {
      id: 'cf-6',
      concept: 'Desembolso de préstamo bancario a largo plazo',
      activity: 'FINANCIAMIENTO',
      direction: 'ENTRADA',
      amount: 60000,
    },
    {
      id: 'cf-7',
      concept: 'Aporte adicional de capital social de socios',
      activity: 'FINANCIAMIENTO',
      direction: 'ENTRADA',
      amount: 50000,
    },
    {
      id: 'cf-8',
      concept: 'Pago de dividendos en efectivo a socios',
      activity: 'FINANCIAMIENTO',
      direction: 'SALIDA',
      amount: 138000,
    },
  ],

  // Planeación Financiera y Presupuesto Maestro 2026
  masterBudget: {
    projectionName: 'Presupuesto Maestro y Proforma 2026',
    projectedUnitsToSell: 11500,
    projectedUnitPrice: 260,
    projectedUnitCost: 152,
    initialInventoryUnits: 2500,
    desiredEndingInventoryUnits: 2800,
    cashSalesPct: 85,
    collectionsFromPriorSales: 310000,
    cashPurchasesPct: 80,
    paymentsForPriorPurchases: 230000,
    fixedOperatingExpenses: 390000,
    variableOpExpensePct: 4,
    nonCashDepreciation: 90000,
    capexOutflow: 150000,
    interestPayment: 58000,
    dividendPayment: 120000,
    taxPayment: 165000,
    initialCashBalance: 240000,
    minimumCashRequired: 200000,
  },

  // Módulo Complementario H: Presupuesto Personal (Datos ficticios de demostración según Guía GFO 2026)
  personalBudget: {
    monthLabel: 'Octubre 2026 (Caso Ficticio Demostrativo)',
    savingsGoalPct: 20,
    transactions: [
      {
        id: 'pt-1',
        description: 'Salario Mensual Neto Profesional',
        category: 'Salario Principal',
        type: 'INGRESO',
        amount: 32000,
        isFixed: true,
      },
      {
        id: 'pt-2',
        description: 'Consultoría y Asesoría Financiera Independiente',
        category: 'Ingresos Extra',
        type: 'INGRESO',
        amount: 6500,
        isFixed: false,
      },
      {
        id: 'pt-3',
        description: 'Alquiler de Vivienda y Servicios Básicos (Agua, Luz, Internet)',
        category: 'Vivienda y Servicios',
        type: 'GASTO',
        amount: 10500,
        isFixed: true,
      },
      {
        id: 'pt-4',
        description: 'Supermercado y Alimentación Mensual',
        category: 'Alimentación',
        type: 'GASTO',
        amount: 8200,
        isFixed: true,
      },
      {
        id: 'pt-5',
        description: 'Combustible y Transporte Urbano',
        category: 'Transporte',
        type: 'GASTO',
        amount: 3400,
        isFixed: false,
      },
      {
        id: 'pt-6',
        description: 'Arancel Universitario, Libros y Materiales',
        category: 'Educación',
        type: 'GASTO',
        amount: 2800,
        isFixed: true,
      },
      {
        id: 'pt-7',
        description: 'Seguro Médico, Farmacia y Cuidado Personal',
        category: 'Salud',
        type: 'GASTO',
        amount: 1900,
        isFixed: false,
      },
      {
        id: 'pt-8',
        description: 'Recreación y Salidas de Fin de Semana',
        category: 'Recreación',
        type: 'GASTO',
        amount: 1600,
        isFixed: false,
      },
    ],
  },

  // Módulo Complementario I: Control Básico de Inventario
  inventoryProducts: [
    {
      id: 'inv-1',
      sku: 'IND-101',
      name: 'Bomba Centrífuga Trifásica 3HP',
      category: 'Equipos de Bombeo',
      initialStock: 45,
      entries: 60,
      exits: 72,
      unitCost: 4200,
      minStock: 25,
    },
    {
      id: 'inv-2',
      sku: 'IND-204',
      name: 'Motor Eléctrico Industrial 5HP',
      category: 'Motores Eléctricos',
      initialStock: 30,
      entries: 25,
      exits: 43,
      unitCost: 6800,
      minStock: 15, // Queda en 12 unidades -> Alerta de reposición activa
    },
    {
      id: 'inv-3',
      sku: 'IND-309',
      name: 'Tablero de Control Automatizado IP65',
      category: 'Automatización',
      initialStock: 20,
      entries: 35,
      exits: 28,
      unitCost: 3500,
      minStock: 15,
    },
    {
      id: 'inv-4',
      sku: 'IND-412',
      name: 'Kit de Válvulas de Presión en Acero Inoxidable',
      category: 'Accesorios Hidráulicos',
      initialStock: 80,
      entries: 40,
      exits: 102,
      unitCost: 950,
      minStock: 20, // Queda en 18 unidades -> Alerta de reposición activa
    },
  ],
};


/**
 * Estado inicial completo: datos empresariales compartidos + un presupuesto personal
 * independiente por cada usuario (ver src/data/seed/personalBudgets.ts).
 */
export const INITIAL_DEMO_STATE: FinancialSystemState = {
  ...BASE_DEMO_STATE,
  personalBudgetsByUser: createPersonalBudgetsByUser(BASE_DEMO_STATE.personalBudget),
};
