import { FinancialSystemState } from '../types/financial';
import { createPersonalBudgetsByUser } from './personalBudgets';

/**
 * CASO OFICIAL DEL PDF (GFO IS2122 - 2026)
 * Empresa: Corporación Agrícola, S. A. y subsidiarias
 * (compañía nicaragüense, subsidiaria de Grain Hill Corporation, S. A.)
 * Fuente: Informe de los Auditores Independientes (PwC) y Estados Financieros Consolidados
 * al 31 de diciembre de 2024 y 2023 (expresados en Córdobas - C$).
 *
 * Verificación de Cuadre Contable Exacto (Página 8 del PDF):
 * - Año 2023:
 *   Activo Corriente = C$ 3,130,400,003 | Activo No Corriente = C$ 2,159,324,100 -> Total Activos = C$ 5,289,724,103
 *   Pasivo Corriente = C$ 3,694,159,909 | Pasivo No Corriente = C$ 764,857,847   -> Total Pasivos = C$ 4,459,017,756
 *   Total Patrimonio = C$ 830,706,347   | Total Pasivos + Patrimonio             = C$ 5,289,724,103 (Cuadre = C$ 0.00)
 *
 * - Año 2024:
 *   Activo Corriente = C$ 4,196,014,499 | Activo No Corriente = C$ 2,132,118,197 -> Total Activos = C$ 6,328,132,696
 *   Pasivo Corriente = C$ 4,366,612,852 | Pasivo No Corriente = C$ 961,298,153   -> Total Pasivos = C$ 5,327,911,005
 *   Total Patrimonio = C$ 1,000,221,691 | Total Pasivos + Patrimonio             = C$ 6,328,132,696 (Cuadre = C$ 0.00)
 */
const BASE_AGRICOLA_PDF_STATE: Omit<FinancialSystemState, 'personalBudgetsByUser'> = {
  company: {
    id: 'comp-agricola-ni',
    name: 'Corporación Agrícola, S. A. y subsidiarias',
    sector: 'Agroindustria • Procesamiento y Comercialización de Arroz, Sal y Consumo Masivo',
    currency: 'C$',
    // Nota 34 (pág. 67): 476,176 acciones comunes con valor nominal de C$ 1,000 c/u (Valor patrimonial ~C$ 2,100.53)
    sharesOutstanding: 476176,
    marketPricePerShare: 2100.53,
  },
  periods: [
    {
      id: '2023',
      name: 'Año 2023',
      year: 2023,
      taxRate: 30,
      // Nota 33 (pág. 9 y 64): Provisión IR 2023 C$ 458,130,322 (incluye ajuste fiscal 2019-2022 y pago mínimo definitivo)
      taxAmount: 458130322,
    },
    {
      id: '2024',
      name: 'Año 2024',
      year: 2024,
      taxRate: 30,
      // Nota 33 (pág. 9 y 64): Provisión IR 2024 C$ 91,567,028 (Corriente C$ 85,896,591 + Diferido C$ 5,670,437)
      taxAmount: 91567028,
    },
  ],
  activePeriodId: '2024',
  comparisonPeriodId: '2023',
  accounts: [
    // =========================================================================
    // ACTIVOS CORRIENTES (Balance General Consolidado - Pág. 8 del PDF)
    // =========================================================================
    {
      id: 'acc-101',
      code: '1101',
      name: 'Efectivo en caja y bancos (Nota 7)',
      category: 'ACTIVO_CORRIENTE',
      subType: 'EFECTIVO',
      balances: { '2023': 70837459, '2024': 284636118 },
    },
    {
      id: 'acc-102',
      code: '1102',
      name: 'Cuentas por cobrar a clientes, neto (Nota 8)',
      category: 'ACTIVO_CORRIENTE',
      subType: 'CUENTAS_POR_COBRAR',
      balances: { '2023': 919245520, '2024': 1160810469 },
    },
    {
      id: 'acc-103',
      code: '1103',
      name: 'Activos mantenidos para la venta (Nota 9 y 36)',
      category: 'ACTIVO_CORRIENTE',
      subType: 'OTROS_ACTIVOS_CORRIENTES',
      balances: { '2023': 139540598, '2024': 133374515 },
    },
    {
      id: 'acc-104',
      code: '1104',
      name: 'Activo financiero a costo amortizado CP',
      category: 'ACTIVO_CORRIENTE',
      subType: 'OTROS_ACTIVOS_CORRIENTES',
      balances: { '2023': 0, '2024': 3160677 },
    },
    {
      id: 'acc-105',
      code: '1105',
      name: 'Otros activos financieros a costo amortizado CP (Nota 10)',
      category: 'ACTIVO_CORRIENTE',
      subType: 'OTROS_ACTIVOS_CORRIENTES',
      balances: { '2023': 345894825, '2024': 509964388 },
    },
    {
      id: 'acc-106',
      code: '1106',
      name: 'Cuentas y doc. por cobrar a partes relacionadas CP (Nota 11)',
      category: 'ACTIVO_CORRIENTE',
      subType: 'CUENTAS_POR_COBRAR',
      balances: { '2023': 474203132, '2024': 482736490 },
    },
    {
      id: 'acc-107',
      code: '1107',
      name: 'Inventarios, neto (Nota 12)',
      category: 'ACTIVO_CORRIENTE',
      subType: 'INVENTARIO',
      balances: { '2023': 1180606300, '2024': 1621305239 },
    },
    {
      id: 'acc-108',
      code: '1108',
      name: 'Otros activos corrientes (Nota 18)',
      category: 'ACTIVO_CORRIENTE',
      subType: 'OTROS_ACTIVOS_CORRIENTES',
      balances: { '2023': 72169, '2024': 26603 },
    },

    // =========================================================================
    // ACTIVOS NO CORRIENTES (Balance General Consolidado - Pág. 8 del PDF)
    // =========================================================================
    {
      id: 'acc-121',
      code: '1201',
      name: 'Cuentas y doc. por cobrar a partes relacionadas LP (Nota 11)',
      category: 'ACTIVO_NO_CORRIENTE',
      subType: 'ACTIVO_FIJO_NETO',
      balances: { '2023': 225357135, '2024': 228273402 },
    },
    {
      id: 'acc-122',
      code: '1202',
      name: 'Otros activos financieros a costo amortizado LP (Nota 10)',
      category: 'ACTIVO_NO_CORRIENTE',
      subType: 'ACTIVO_FIJO_NETO',
      balances: { '2023': 8167247, '2024': 1216866 },
    },
    {
      id: 'acc-123',
      code: '1203',
      name: 'Inversiones bajo método de participación (Nota 13)',
      category: 'ACTIVO_NO_CORRIENTE',
      subType: 'ACTIVO_FIJO_NETO',
      balances: { '2023': 12519114, '2024': 15104274 },
    },
    {
      id: 'acc-124',
      code: '1204',
      name: 'Activos financieros a valor razonable con cambios en ORI (Nota 14)',
      category: 'ACTIVO_NO_CORRIENTE',
      subType: 'ACTIVO_FIJO_NETO',
      balances: { '2023': 256514034, '2024': 256514034 },
    },
    {
      id: 'acc-125',
      code: '1205',
      name: 'Propiedad, planta y equipos, neto (Nota 15)',
      category: 'ACTIVO_NO_CORRIENTE',
      subType: 'ACTIVO_FIJO_NETO',
      balances: { '2023': 1598740842, '2024': 1571088222 },
    },
    {
      id: 'acc-126',
      code: '1206',
      name: 'Activos por derecho de uso (Nota 16)',
      category: 'ACTIVO_NO_CORRIENTE',
      subType: 'ACTIVO_FIJO_NETO',
      balances: { '2023': 19141180, '2024': 20460361 },
    },
    {
      id: 'acc-127',
      code: '1207',
      name: 'Activos intangibles, neto (Nota 17)',
      category: 'ACTIVO_NO_CORRIENTE',
      subType: 'ACTIVO_FIJO_NETO',
      balances: { '2023': 16378500, '2024': 6320510 },
    },
    {
      id: 'acc-128',
      code: '1208',
      name: 'Otros activos no corrientes (Nota 18)',
      category: 'ACTIVO_NO_CORRIENTE',
      subType: 'ACTIVO_FIJO_NETO',
      balances: { '2023': 22506048, '2024': 33140528 },
    },

    // =========================================================================
    // PASIVOS CORRIENTES (Balance General Consolidado - Pág. 8 del PDF)
    // =========================================================================
    {
      id: 'acc-201',
      code: '2101',
      name: 'Préstamos por pagar corto plazo (Nota 19)',
      category: 'PASIVO_CORRIENTE',
      subType: 'DEUDA_CORTO_PLAZO',
      balances: { '2023': 1725890504, '2024': 1762614697 },
    },
    {
      id: 'acc-202',
      code: '2102',
      name: 'Documentos por pagar corto plazo (Nota 20)',
      category: 'PASIVO_CORRIENTE',
      subType: 'DEUDA_CORTO_PLAZO',
      balances: { '2023': 386390267, '2024': 359864099 },
    },
    {
      id: 'acc-203',
      code: '2103',
      name: 'Cuentas y doc. por pagar a partes relacionadas CP (Nota 11)',
      category: 'PASIVO_CORRIENTE',
      subType: 'CUENTAS_POR_PAGAR',
      balances: { '2023': 513755625, '2024': 868126830 },
    },
    {
      id: 'acc-204',
      code: '2104',
      name: 'Proveedores comerciales',
      category: 'PASIVO_CORRIENTE',
      subType: 'CUENTAS_POR_PAGAR',
      balances: { '2023': 404590181, '2024': 1039869493 },
    },
    {
      id: 'acc-205',
      code: '2105',
      name: 'Pasivo por arrendamiento corto plazo (Nota 16)',
      category: 'PASIVO_CORRIENTE',
      subType: 'DEUDA_CORTO_PLAZO',
      balances: { '2023': 13058258, '2024': 12283446 },
    },
    {
      id: 'acc-206',
      code: '2106',
      name: 'Impuesto sobre la renta por pagar (Nota 33)',
      category: 'PASIVO_CORRIENTE',
      subType: 'CUENTAS_POR_PAGAR',
      balances: { '2023': 437257071, '2024': 148959541 },
    },
    {
      id: 'acc-207',
      code: '2107',
      name: 'Cuentas por pagar y gastos acumulados (Nota 21)',
      category: 'PASIVO_CORRIENTE',
      subType: 'CUENTAS_POR_PAGAR',
      balances: { '2023': 213218003, '2024': 174894746 },
    },

    // =========================================================================
    // PASIVOS NO CORRIENTES (Balance General Consolidado - Pág. 8 del PDF)
    // =========================================================================
    {
      id: 'acc-221',
      code: '2201',
      name: 'Préstamos por pagar largo plazo (Nota 19)',
      category: 'PASIVO_NO_CORRIENTE',
      subType: 'DEUDA_LARGO_PLAZO',
      balances: { '2023': 601987067, '2024': 744971522 },
    },
    {
      id: 'acc-222',
      code: '2202',
      name: 'Documentos por pagar largo plazo (Nota 20)',
      category: 'PASIVO_NO_CORRIENTE',
      subType: 'DEUDA_LARGO_PLAZO',
      balances: { '2023': 3340319, '2024': 52821542 },
    },
    {
      id: 'acc-223',
      code: '2203',
      name: 'Pasivo por arrendamiento largo plazo (Nota 16)',
      category: 'PASIVO_NO_CORRIENTE',
      subType: 'DEUDA_LARGO_PLAZO',
      balances: { '2023': 10008186, '2024': 10671079 },
    },
    {
      id: 'acc-224',
      code: '2204',
      name: 'Obligaciones post-empleo (Nota 22)',
      category: 'PASIVO_NO_CORRIENTE',
      subType: 'DEUDA_LARGO_PLAZO',
      balances: { '2023': 41732593, '2024': 43624964 },
    },
    {
      id: 'acc-225',
      code: '2205',
      name: 'Cuentas y doc. por pagar a partes relacionadas LP (Nota 11)',
      category: 'PASIVO_NO_CORRIENTE',
      subType: 'DEUDA_LARGO_PLAZO',
      balances: { '2023': 50670635, '2024': 42613289 },
    },
    {
      id: 'acc-226',
      code: '2206',
      name: 'Impuesto sobre la renta diferido (Nota 33)',
      category: 'PASIVO_NO_CORRIENTE',
      subType: 'DEUDA_LARGO_PLAZO',
      balances: { '2023': 57119047, '2024': 66595757 },
    },

    // =========================================================================
    // PATRIMONIO (Balance General Consolidado - Pág. 8 del PDF)
    // =========================================================================
    {
      id: 'acc-301',
      code: '3101',
      name: 'Capital social autorizado, suscrito y pagado (Nota 34)',
      category: 'PATRIMONIO',
      subType: 'CAPITAL_SOCIAL',
      balances: { '2023': 476176000, '2024': 476176000 },
    },
    {
      id: 'acc-302',
      code: '3102',
      name: 'Capital social preferente (Nota 34)',
      category: 'PATRIMONIO',
      subType: 'CAPITAL_SOCIAL',
      balances: { '2023': 262998840, '2024': 348028158 },
    },
    {
      id: 'acc-303',
      code: '3103',
      name: 'Reserva legal (Nota 2.21)',
      category: 'PATRIMONIO',
      subType: 'UTILIDADES_RETENIDAS',
      balances: { '2023': 47617691, '2024': 47617691 },
    },
    {
      id: 'acc-304',
      code: '3104',
      name: 'Superávit por revaluación (Nota 35)',
      category: 'PATRIMONIO',
      subType: 'UTILIDADES_RETENIDAS',
      balances: { '2023': 8508572, '2024': 55695277 },
    },
    {
      id: 'acc-305',
      code: '3105',
      name: 'Efecto de conversión de moneda',
      category: 'PATRIMONIO',
      subType: 'UTILIDADES_RETENIDAS',
      balances: { '2023': 16652855, '2024': 16652855 },
    },
    {
      id: 'acc-306',
      code: '3106',
      name: 'Utilidades retenidas (Déficit acumulado)',
      category: 'PATRIMONIO',
      subType: 'UTILIDADES_RETENIDAS',
      balances: { '2023': -2656945, '2024': 29796514 },
    },
    {
      id: 'acc-307',
      code: '3107',
      name: 'Participaciones no controladoras (Nota 6)',
      category: 'PATRIMONIO',
      subType: 'CAPITAL_SOCIAL',
      balances: { '2023': 21409334, '2024': 26255196 },
    },

    // =========================================================================
    // ESTADO CONSOLIDADO DE RESULTADOS (Página 9 del PDF)
    // =========================================================================
    {
      id: 'acc-401',
      code: '4101',
      name: 'Ingresos procedentes de contratos con clientes (Nota 24)',
      category: 'INGRESO_OPERATIVO',
      subType: 'VENTAS_NETAS',
      balances: { '2023': 9355895570, '2024': 9010443238 },
    },
    {
      id: 'acc-501',
      code: '5101',
      name: 'Costo de ventas (Nota 25)',
      category: 'COSTO_VENTAS',
      subType: 'COSTO_BIENES_VENDIDOS',
      balances: { '2023': 7967257505, '2024': 7539860126 },
    },
    {
      id: 'acc-601',
      code: '6101',
      name: 'Gastos de mercadeo y ventas (Nota 26)',
      category: 'GASTO_OPERATIVO',
      subType: 'GASTOS_VENTA_ADMIN',
      balances: { '2023': 573616923, '2024': 562260236 },
    },
    {
      id: 'acc-602',
      code: '6102',
      name: 'Gastos de administración (Nota 27)',
      category: 'GASTO_OPERATIVO',
      subType: 'GASTOS_VENTA_ADMIN',
      balances: { '2023': 150376398, '2024': 151041897 },
    },
    {
      id: 'acc-603',
      code: '6103',
      name: 'Gastos de tráfico de almacenes (Nota 28)',
      category: 'GASTO_OPERATIVO',
      subType: 'GASTOS_VENTA_ADMIN',
      balances: { '2023': 197510015, '2024': 215360471 },
    },
    {
      id: 'acc-604',
      code: '6104',
      name: 'Otros gastos operativos y Pago Mínimo Definitivo (Nota 30)',
      category: 'GASTO_OPERATIVO',
      subType: 'GASTOS_VENTA_ADMIN',
      balances: { '2023': 239524557, '2024': 209248155 },
    },
    {
      id: 'acc-605',
      code: '6105',
      name: 'Otros ingresos operativos (deduce gastos operativos)',
      category: 'GASTO_OPERATIVO',
      subType: 'GASTOS_VENTA_ADMIN',
      balances: { '2023': -69212845, '2024': -24995050 },
    },
    {
      id: 'acc-701',
      code: '7101',
      name: 'Gastos financieros por préstamos y documentos (Nota 31)',
      category: 'GASTO_FINANCIERO',
      subType: 'INTERESES_PAGADOS',
      balances: { '2023': 262177780, '2024': 275824274 },
    },
    {
      id: 'acc-702',
      code: '7102',
      name: 'Pérdida cambiaria, neta (Nota 3)',
      category: 'GASTO_FINANCIERO',
      subType: 'INTERESES_PAGADOS',
      balances: { '2023': 32726261, '2024': 3682989 },
    },
    {
      id: 'acc-703',
      code: '7103',
      name: 'Ingresos financieros ganados (Nota 32, compensa costo financiero)',
      category: 'GASTO_FINANCIERO',
      subType: 'INTERESES_PAGADOS',
      balances: { '2023': -35771615, '2024': -53045676 },
    },
    {
      id: 'acc-704',
      code: '7104',
      name: 'Participación en utilidad neta de asociadas (Nota 13)',
      category: 'GASTO_FINANCIERO',
      subType: 'INTERESES_PAGADOS',
      balances: { '2023': -856420, '2024': -2585160 },
    },
  ],

  // ===========================================================================
  // MÓDULOS C y D: Punto de Equilibrio (C-V-U) y Apalancamiento (GAO/GAF/GAT)
  // Sincronizados con el Estado de Resultados 2024 de Corporación Agrícola, S.A.
  // ===========================================================================
  cvuInput: {
    // 1,000,000 de lotes/quintales equivalentes a C$ 9,010.44 = C$ 9,010,440,000 Ingresos
    unitPrice: 9010.44,
    // Costo variable unitario C$ 7,539.86 -> Costo Variable Total C$ 7,539,860,000
    unitVariableCost: 7539.86,
    // Gastos fijos operativos netos 2024 (Pág. 9): C$ 1,112,915,709 -> UAII ~ C$ 357,664,291
    fixedOperatingCosts: 1112915709,
    currentUnitsSold: 1000000,
    // Costo financiero neto 2024 (Pág. 9): C$ 223,876,427
    interestExpense: 223876427,
    // Dividendos pagados sobre acciones preferentes 2024 (Nota 34, pág. 67): C$ 7,520,630
    preferredDividends: 7520630,
    taxRate: 30,
    priceChangePct: 5,
    variableCostChangePct: 0,
    fixedCostChangePct: 0,
    volumeChangePct: 8,
  },

  // ===========================================================================
  // MÓDULO E: Estado Consolidado de Flujos de Efectivo 2024 (Página 11 del PDF)
  // Efectivo inicial (2023): C$ 70,837,459
  // FEO: +C$ 190,033,364 | FEI: -C$ 78,516,767 | FEF: +C$ 102,282,062
  // Variación neta: +C$ 213,798,659 -> Efectivo final (2024): C$ 284,636,118
  // ===========================================================================
  cashFlowInitialBalance: 70837459,
  cashFlowEntries: [
    // 1. ACTIVIDADES DE OPERACIÓN (FEO = +190,033,364)
    {
      id: 'cf-op-1',
      concept: 'Efectivo provisto por las actividades de operación antes de intereses e impuestos',
      activity: 'OPERACION',
      direction: 'ENTRADA',
      amount: 758587482,
    },
    {
      id: 'cf-op-2',
      concept: 'Intereses cobrados sobre cuentas por cobrar',
      activity: 'OPERACION',
      direction: 'ENTRADA',
      amount: 12611343,
    },
    {
      id: 'cf-op-3',
      concept: 'Impuestos sobre la renta pagados (Nota 33)',
      activity: 'OPERACION',
      direction: 'SALIDA',
      amount: 374194121,
    },
    {
      id: 'cf-op-4',
      concept: 'Intereses pagados a instituciones financieras',
      activity: 'OPERACION',
      direction: 'SALIDA',
      amount: 206971340,
    },

    // 2. ACTIVIDADES DE INVERSIÓN (FEI = -78,516,767)
    {
      id: 'cf-inv-1',
      concept: 'Pagos recibidos por préstamos a partes relacionadas',
      activity: 'INVERSION',
      direction: 'ENTRADA',
      amount: 7124865,
    },
    {
      id: 'cf-inv-2',
      concept: 'Cobros netos de cuentas por cobrar a partes relacionadas',
      activity: 'INVERSION',
      direction: 'ENTRADA',
      amount: 5957397,
    },
    {
      id: 'cf-inv-3',
      concept: 'Préstamos otorgados a partes relacionadas',
      activity: 'INVERSION',
      direction: 'SALIDA',
      amount: 46190672,
    },
    {
      id: 'cf-inv-4',
      concept: 'Adquisición de activos intangibles - Licencias y SAP (Nota 17)',
      activity: 'INVERSION',
      direction: 'SALIDA',
      amount: 9121425,
    },
    {
      id: 'cf-inv-5',
      concept: 'Adiciones de propiedad, planta y equipos (Nota 15)',
      activity: 'INVERSION',
      direction: 'SALIDA',
      amount: 36286932,
    },

    // 3. ACTIVIDADES DE FINANCIAMIENTO (FEF = +102,282,062)
    {
      id: 'cf-fin-1',
      concept: 'Contratación de préstamos bancarios (Nota 19)',
      activity: 'FINANCIAMIENTO',
      direction: 'ENTRADA',
      amount: 4240845895,
    },
    {
      id: 'cf-fin-2',
      concept: 'Contrataciones de documentos por pagar - Valores estandarizados (Nota 20)',
      activity: 'FINANCIAMIENTO',
      direction: 'ENTRADA',
      amount: 597311913,
    },
    {
      id: 'cf-fin-3',
      concept: 'Pago recibido por emisión de acciones preferentes Clase B (Nota 34)',
      activity: 'FINANCIAMIENTO',
      direction: 'ENTRADA',
      amount: 85029318,
    },
    {
      id: 'cf-fin-4',
      concept: 'Pagos de principal de préstamos bancarios (Nota 19)',
      activity: 'FINANCIAMIENTO',
      direction: 'SALIDA',
      amount: 4061137253,
    },
    {
      id: 'cf-fin-5',
      concept: 'Pagos de documentos por pagar bursátiles y privados (Nota 20)',
      activity: 'FINANCIAMIENTO',
      direction: 'SALIDA',
      amount: 574357520,
    },
    {
      id: 'cf-fin-6',
      concept: 'Pagos efectuados a financiamientos de partes relacionadas',
      activity: 'FINANCIAMIENTO',
      direction: 'SALIDA',
      amount: 163791333,
    },
    {
      id: 'cf-fin-7',
      concept: 'Dividendos pagados sobre acciones preferentes (Nota 4 y 34)',
      activity: 'FINANCIAMIENTO',
      direction: 'SALIDA',
      amount: 7520630,
    },
    {
      id: 'cf-fin-8',
      concept: 'Pagos de porción de principal del arrendamiento (Nota 16)',
      activity: 'FINANCIAMIENTO',
      direction: 'SALIDA',
      amount: 14098328,
    },
  ],

  // ===========================================================================
  // MÓDULOS F y G: Presupuesto Maestro y Estados Proforma 2025
  // Proyección elaborada sobre la base real de cierre 2024 de Corporación Agrícola, S.A.
  // ===========================================================================
  masterBudget: {
    projectionName: 'Proyección Corporación Agrícola 2025',
    projectedUnitsToSell: 1050000,
    projectedUnitPrice: 9250,
    projectedUnitCost: 7650,
    initialInventoryUnits: 215000,
    desiredEndingInventoryUnits: 220000,
    cashSalesPct: 87,
    // Cuentas por cobrar a clientes al cierre 2024 (Nota 8): C$ 1,160,810,469
    collectionsFromPriorSales: 1160810469,
    cashPurchasesPct: 86,
    // Proveedores al cierre 2024 (Balance General): C$ 1,039,869,493
    paymentsForPriorPurchases: 1039869493,
    fixedOperatingExpenses: 850000000,
    variableOpExpensePct: 1.5,
    // Depreciación y amortización anual 2024 (PPE 117.39M + Der. Uso 12.67M + Intang. 19.18M)
    nonCashDepreciation: 149241420,
    // Adiciones de PPE e intangibles proyectadas (base 2024: C$ 45.41M)
    capexOutflow: 50000000,
    interestPayment: 235000000,
    dividendPayment: 7520630,
    // Impuesto sobre la renta por pagar al cierre 2024 (Nota 33)
    taxPayment: 148959541,
    // Efectivo al cierre 2024 (Nota 7): C$ 284,636,118
    initialCashBalance: 284636118,
    minimumCashRequired: 250000000,
  },

  // ===========================================================================
  // MÓDULO H: Presupuesto Personal (Independiente por usuario)
  // ===========================================================================
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

  // ===========================================================================
  // MÓDULO I: Control de Inventario (Nota 12 del PDF - Página 44)
  // Desglose real de inventarios de Corporación Agrícola, S.A. al 31/12/2024:
  // Suma total valorada = ~C$ 1,621,305,700 (Balance General Nota 12: C$ 1,621,305,239)
  // ===========================================================================
  inventoryProducts: [
    {
      id: 'inv-agr-1',
      sku: 'AGR-MP01',
      name: 'Materia prima: Granza de arroz (Nota 12)',
      category: 'Materia Prima',
      initialStock: 468537,
      entries: 1520000,
      exits: 1140258,
      unitCost: 1000,
      minStock: 400000, // Exist. Final = 848,279 qq -> C$ 848,279,000
    },
    {
      id: 'inv-agr-2',
      sku: 'AGR-MP02',
      name: 'Materia prima: Sal en crudo - Nicasal, S.A. (Nota 12)',
      category: 'Materia Prima',
      initialStock: 113947,
      entries: 85000,
      exits: 156128,
      unitCost: 500,
      minStock: 60000, // Exist. Final = 42,819 qq -> C$ 21,409,500 (Alerta de reposición: bajó desde C$ 56.97M en 2023)
    },
    {
      id: 'inv-agr-3',
      sku: 'AGR-PT01',
      name: 'Productos terminados: Arroz procesado producido (Nota 12)',
      category: 'Producto Terminado',
      initialStock: 160105,
      entries: 2850000,
      exits: 2696253,
      unitCost: 1500,
      minStock: 180000, // Exist. Final = 313,852 qq -> C$ 470,778,000
    },
    {
      id: 'inv-agr-4',
      sku: 'AGR-PT02',
      name: 'Productos terminados: Adquiridos consumo masivo (Nota 12)',
      category: 'Producto Terminado',
      initialStock: 182096,
      entries: 940000,
      exits: 1009835,
      unitCost: 1200,
      minStock: 100000, // Exist. Final = 112,261 u. -> C$ 134,713,200
    },
    {
      id: 'inv-agr-5',
      sku: 'AGR-IN01',
      name: 'Insumos y aditivos industriales de trilla (Nota 12)',
      category: 'Insumos y Aditivos',
      initialStock: 10866,
      entries: 14200,
      exits: 19002,
      unitCost: 1000,
      minStock: 8500, // Exist. Final = 6,064 u. -> C$ 6,064,000 (Alerta de reposición: bajó desde C$ 10.87M en 2023)
    },
    {
      id: 'inv-agr-6',
      sku: 'AGR-RP01',
      name: 'Repuestos y accesorios de maquinaria industrial (Nota 12)',
      category: 'Repuestos y Accesorios',
      initialStock: 31189,
      entries: 12500,
      exits: 10355,
      unitCost: 2500,
      minStock: 25000, // Exist. Final = 33,334 u. -> C$ 83,335,000
    },
    {
      id: 'inv-agr-7',
      sku: 'AGR-EM01',
      name: 'Material de empaque (Sacos y bobinas laminadas - Nota 12)',
      category: 'Material de Empaque',
      initialStock: 422006,
      entries: 1200000,
      exits: 1218426,
      unitCost: 50,
      minStock: 350000, // Exist. Final = 403,580 u. -> C$ 20,179,000
    },
    {
      id: 'inv-agr-8',
      sku: 'AGR-TR01',
      name: 'Importaciones en tránsito y otros, neto de deterioro (Nota 12)',
      category: 'Importaciones en Tránsito',
      initialStock: 8648,
      entries: 28000,
      exits: 99,
      unitCost: 1000,
      minStock: 15000, // Exist. Final = 36,549 u. -> C$ 36,549,000
    },
  ],
};

/**
 * Estado inicial por defecto y al pulsar "Cargar Ejemplo (PDF)":
 * Carga todos los datos auditados de Corporación Agrícola, S. A. y subsidiarias (2023-2024).
 */
export const INITIAL_DEMO_STATE: FinancialSystemState = {
  ...BASE_AGRICOLA_PDF_STATE,
  personalBudgetsByUser: createPersonalBudgetsByUser(BASE_AGRICOLA_PDF_STATE.personalBudget),
};

/**
 * Crea una plantilla limpia ("Nuevo Caso en Blanco") con las cuentas contables básicas en cero
 * para que el usuario pueda llenar cualquier otro ejercicio o empresa desde cero en todos los módulos.
 */
export function createBlankCaseState(
  existingPersonalBudgets?: FinancialSystemState['personalBudgetsByUser']
): FinancialSystemState {
  const personalBudgets =
    existingPersonalBudgets ??
    createPersonalBudgetsByUser(BASE_AGRICOLA_PDF_STATE.personalBudget);

  return {
    company: {
      id: 'comp-custom',
      name: 'Nueva Empresa, S. A.',
      sector: 'Comercial / Industrial / Servicios',
      currency: 'C$',
      sharesOutstanding: 1000,
      marketPricePerShare: 100,
    },
    periods: [
      { id: '2023', name: 'Período Base (2023)', year: 2023, taxRate: 30, taxAmount: null },
      { id: '2024', name: 'Período Actual (2024)', year: 2024, taxRate: 30, taxAmount: null },
    ],
    activePeriodId: '2024',
    comparisonPeriodId: '2023',
    accounts: [
      {
        id: 'acc-b-101',
        code: '1101',
        name: 'Efectivo y Equivalentes de Efectivo',
        category: 'ACTIVO_CORRIENTE',
        subType: 'EFECTIVO',
        balances: { '2023': 0, '2024': 0 },
      },
      {
        id: 'acc-b-102',
        code: '1102',
        name: 'Cuentas por Cobrar a Clientes',
        category: 'ACTIVO_CORRIENTE',
        subType: 'CUENTAS_POR_COBRAR',
        balances: { '2023': 0, '2024': 0 },
      },
      {
        id: 'acc-b-103',
        code: '1103',
        name: 'Inventarios',
        category: 'ACTIVO_CORRIENTE',
        subType: 'INVENTARIO',
        balances: { '2023': 0, '2024': 0 },
      },
      {
        id: 'acc-b-104',
        code: '1104',
        name: 'Otros Activos Corrientes',
        category: 'ACTIVO_CORRIENTE',
        subType: 'OTROS_ACTIVOS_CORRIENTES',
        balances: { '2023': 0, '2024': 0 },
      },
      {
        id: 'acc-b-121',
        code: '1201',
        name: 'Propiedad, Planta y Equipo (Neto)',
        category: 'ACTIVO_NO_CORRIENTE',
        subType: 'ACTIVO_FIJO_NETO',
        balances: { '2023': 0, '2024': 0 },
      },
      {
        id: 'acc-b-201',
        code: '2101',
        name: 'Proveedores y Cuentas por Pagar CP',
        category: 'PASIVO_CORRIENTE',
        subType: 'CUENTAS_POR_PAGAR',
        balances: { '2023': 0, '2024': 0 },
      },
      {
        id: 'acc-b-202',
        code: '2102',
        name: 'Préstamos y Documentos por Pagar CP',
        category: 'PASIVO_CORRIENTE',
        subType: 'DEUDA_CORTO_PLAZO',
        balances: { '2023': 0, '2024': 0 },
      },
      {
        id: 'acc-b-221',
        code: '2201',
        name: 'Préstamos y Obligaciones a Largo Plazo',
        category: 'PASIVO_NO_CORRIENTE',
        subType: 'DEUDA_LARGO_PLAZO',
        balances: { '2023': 0, '2024': 0 },
      },
      {
        id: 'acc-b-301',
        code: '3101',
        name: 'Capital Social',
        category: 'PATRIMONIO',
        subType: 'CAPITAL_SOCIAL',
        balances: { '2023': 0, '2024': 0 },
      },
      {
        id: 'acc-b-302',
        code: '3102',
        name: 'Reservas y Utilidades Retenidas',
        category: 'PATRIMONIO',
        subType: 'UTILIDADES_RETENIDAS',
        balances: { '2023': 0, '2024': 0 },
      },
      {
        id: 'acc-b-401',
        code: '4101',
        name: 'Ingresos por Ventas Netas',
        category: 'INGRESO_OPERATIVO',
        subType: 'VENTAS_NETAS',
        balances: { '2023': 0, '2024': 0 },
      },
      {
        id: 'acc-b-501',
        code: '5101',
        name: 'Costo de Ventas (CBV)',
        category: 'COSTO_VENTAS',
        subType: 'COSTO_BIENES_VENDIDOS',
        balances: { '2023': 0, '2024': 0 },
      },
      {
        id: 'acc-b-601',
        code: '6101',
        name: 'Gastos de Venta y Administración',
        category: 'GASTO_OPERATIVO',
        subType: 'GASTOS_VENTA_ADMIN',
        balances: { '2023': 0, '2024': 0 },
      },
      {
        id: 'acc-b-701',
        code: '7101',
        name: 'Gastos Financieros (Intereses)',
        category: 'GASTO_FINANCIERO',
        subType: 'INTERESES_PAGADOS',
        balances: { '2023': 0, '2024': 0 },
      },
    ],
    cvuInput: {
      unitPrice: 0,
      unitVariableCost: 0,
      fixedOperatingCosts: 0,
      currentUnitsSold: 0,
      interestExpense: 0,
      preferredDividends: 0,
      taxRate: 30,
      priceChangePct: 0,
      variableCostChangePct: 0,
      fixedCostChangePct: 0,
      volumeChangePct: 0,
    },
    cashFlowInitialBalance: 0,
    cashFlowEntries: [],
    masterBudget: {
      projectionName: 'Proyección Financiera',
      projectedUnitsToSell: 0,
      projectedUnitPrice: 0,
      projectedUnitCost: 0,
      initialInventoryUnits: 0,
      desiredEndingInventoryUnits: 0,
      cashSalesPct: 80,
      collectionsFromPriorSales: 0,
      cashPurchasesPct: 80,
      paymentsForPriorPurchases: 0,
      fixedOperatingExpenses: 0,
      variableOpExpensePct: 0,
      nonCashDepreciation: 0,
      capexOutflow: 0,
      interestPayment: 0,
      dividendPayment: 0,
      taxPayment: 0,
      initialCashBalance: 0,
      minimumCashRequired: 0,
    },
    personalBudget: BASE_AGRICOLA_PDF_STATE.personalBudget,
    personalBudgetsByUser: personalBudgets,
    inventoryProducts: [],
  };
}
