import { FinancialAccountItem, FinancialPeriod } from '../../data/types/financial';

export interface ComputedStatementTotals {
  periodId: string;
  periodName: string;
  // Subtotales de Activos
  efectivo: number;
  cuentasPorCobrar: number;
  inventario: number;
  otrosActivosCorrientes: number;
  totalActivoCorriente: number;
  totalActivoNoCorriente: number;
  totalActivos: number;

  // Subtotales de Pasivos y Patrimonio
  cuentasPorPagar: number;
  deudaCortoPlazo: number;
  totalPasivoCorriente: number;
  totalPasivoNoCorriente: number;
  totalPasivos: number;
  capitalSocial: number;
  utilidadesRetenidas: number;
  totalPatrimonio: number;
  totalPasivoMasPatrimonio: number;

  // Validación de la Ecuación Contable: Activo = Pasivo + Patrimonio
  diferenciaCuadre: number;
  estaCuadrado: boolean;

  // Subtotales del Estado de Resultados
  ventasNetas: number;
  costoBienesVendidos: number;
  utilidadBruta: number;
  gastosVentaAdmin: number;
  gastosDepreciacion: number;
  totalGastosOperativos: number;
  uaii: number; // Utilidad Antes de Intereses e Impuestos (EBIT)
  gastosFinancieros: number; // Intereses
  uai: number; // Utilidad Antes de Impuestos (EBT)
  impuestos: number;
  utilidadNeta: number;
}

/**
 * Calcula todos los subtotales del Balance General y Estado de Resultados para un período.
 * Fórmulas principales:
 * - Utilidad Bruta = Ventas Netas - Costo de Bienes Vendidos
 * - UAII (Utilidad Operativa) = Utilidad Bruta - Gastos Operativos (incluyendo depreciación)
 * - UAI = UAII - Gastos Financieros (Intereses)
 * - Utilidad Neta = UAI - Impuestos
 * - Ecuación Contable: Total Activos = Total Pasivos + Total Patrimonio
 */
export function computeFinancialStatements(
  accounts: FinancialAccountItem[],
  period: FinancialPeriod
): ComputedStatementTotals {
  const pid = period.id;
  const getVal = (acc: FinancialAccountItem) => Number(acc.balances[pid] ?? 0);

  const sumByCategory = (cat: FinancialAccountItem['category']) =>
    accounts
      .filter((a) => a.category === cat)
      .reduce((acc, item) => acc + getVal(item), 0);

  const sumBySubType = (sub: FinancialAccountItem['subType']) =>
    accounts
      .filter((a) => a.subType === sub)
      .reduce((acc, item) => acc + getVal(item), 0);

  // Activos
  const efectivo = sumBySubType('EFECTIVO');
  const cuentasPorCobrar = sumBySubType('CUENTAS_POR_COBRAR');
  const inventario = sumBySubType('INVENTARIO');
  const otrosActivosCorrientes = sumBySubType('OTROS_ACTIVOS_CORRIENTES');
  const totalActivoCorriente = sumByCategory('ACTIVO_CORRIENTE');
  const totalActivoNoCorriente = sumByCategory('ACTIVO_NO_CORRIENTE');
  const totalActivos = totalActivoCorriente + totalActivoNoCorriente;

  // Pasivos y Patrimonio
  const cuentasPorPagar = sumBySubType('CUENTAS_POR_PAGAR');
  const deudaCortoPlazo = sumBySubType('DEUDA_CORTO_PLAZO');
  const totalPasivoCorriente = sumByCategory('PASIVO_CORRIENTE');
  const totalPasivoNoCorriente = sumByCategory('PASIVO_NO_CORRIENTE');
  const totalPasivos = totalPasivoCorriente + totalPasivoNoCorriente;

  const capitalSocial = sumBySubType('CAPITAL_SOCIAL');
  const utilidadesRetenidas = sumBySubType('UTILIDADES_RETENIDAS');
  const totalPatrimonio = sumByCategory('PATRIMONIO');
  const totalPasivoMasPatrimonio = totalPasivos + totalPatrimonio;

  const diferenciaCuadre = Number((totalActivos - totalPasivoMasPatrimonio).toFixed(2));
  const estaCuadrado = Math.abs(diferenciaCuadre) < 0.01;

  // Estado de Resultados
  const ventasNetas = sumByCategory('INGRESO_OPERATIVO');
  const costoBienesVendidos = sumByCategory('COSTO_VENTAS');
  const utilidadBruta = ventasNetas - costoBienesVendidos;

  const gastosVentaAdmin = sumBySubType('GASTOS_VENTA_ADMIN');
  const gastosDepreciacion = sumBySubType('GASTOS_DEPRECIACION');
  const totalGastosOperativos = sumByCategory('GASTO_OPERATIVO');

  const uaii = utilidadBruta - totalGastosOperativos;
  const gastosFinancieros = sumByCategory('GASTO_FINANCIERO');
  const uai = uaii - gastosFinancieros;
  const impuestos =
    period.taxAmount !== undefined && period.taxAmount !== null
      ? Number(Number(period.taxAmount).toFixed(2))
      : uai > 0
        ? Number(((uai * period.taxRate) / 100).toFixed(2))
        : 0;
  const utilidadNeta = Number((uai - impuestos).toFixed(2));

  return {
    periodId: pid,
    periodName: period.name,
    efectivo,
    cuentasPorCobrar,
    inventario,
    otrosActivosCorrientes,
    totalActivoCorriente,
    totalActivoNoCorriente,
    totalActivos,
    cuentasPorPagar,
    deudaCortoPlazo,
    totalPasivoCorriente,
    totalPasivoNoCorriente,
    totalPasivos,
    capitalSocial,
    utilidadesRetenidas,
    totalPatrimonio,
    totalPasivoMasPatrimonio,
    diferenciaCuadre,
    estaCuadrado,
    ventasNetas,
    costoBienesVendidos,
    utilidadBruta,
    gastosVentaAdmin,
    gastosDepreciacion,
    totalGastosOperativos,
    uaii,
    gastosFinancieros,
    uai,
    impuestos,
    utilidadNeta,
  };
}

