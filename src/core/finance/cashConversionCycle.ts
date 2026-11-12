import { ComputedStatementTotals } from './statements';

export interface CashConversionCycleResult {
  periodId: string;
  // Días componentes (año comercial de 360 días según estándar universitario)
  diasInventario: number; // PCI / DIO = (Inventario / Costo de Ventas) * 360
  diasCobro: number; // PCC / DSO = (Cuentas por Cobrar / Ventas Netas) * 360
  cicloOperativo: number; // CO = PCI + PCC
  diasPago: number; // PDP / DPO = (Cuentas por Pagar / Costo de Ventas) * 360
  cicloConversionEfectivo: number; // CCE = CO - PDP = PCI + PCC - PDP

  // Rotaciones de actividad (veces al año)
  rotacionInventario: number;
  rotacionCxC: number;
  rotacionCxP: number;

  // Montos monetarios base (C$)
  inventario: number;
  cuentasPorCobrar: number;
  cuentasPorPagar: number;
  ventasNetas: number;
  costoBienesVendidos: number;

  // Recursos de Capital de Trabajo inmovilizados en el ciclo
  gastoDiarioOperativo: number; // Desembolso diario promedio = (Costo + Gastos Op) / 360
  recursosRequeridos: number; // Financiamiento necesario = CCE * Gasto Diario

  status: 'OPTIMO' | 'MODERADO' | 'CRITICO';
  dictamen: string;
}

export interface CceSimulationResult {
  diasInventarioSim: number;
  diasCobroSim: number;
  diasPagoSim: number;
  cceSimulado: number;
  cicloOperativoSimulado: number;
  diasAhorrados: number;
  efectivoLiberado: number;
}

/**
 * Calcula el Ciclo de Conversión de Efectivo (CCE) a partir de los totales de los estados financieros.
 * Base temporal: año comercial de 360 días (estándar académico NIIF/GFO).
 */
export function computeCashConversionCycle(
  totals: ComputedStatementTotals,
  daysInYear: number = 360
): CashConversionCycleResult {
  const cogs = Math.max(0, totals.costoBienesVendidos);
  const sales = Math.max(0, totals.ventasNetas);
  const inv = Math.max(0, totals.inventario);
  const cxc = Math.max(0, totals.cuentasPorCobrar);
  const cxp = Math.max(0, totals.cuentasPorPagar);

  // 1. Días de Inventario (PCI / Periodo de Conversión de Inventario)
  const rotInv = inv > 0 && cogs > 0 ? Number((cogs / inv).toFixed(2)) : 0;
  const diasInventario =
    cogs > 0 ? Number(((inv / cogs) * daysInYear).toFixed(1)) : 0;

  // 2. Días de Cobro (PCC / Periodo de Cobro de Cuentas por Cobrar)
  const rotCxC = cxc > 0 && sales > 0 ? Number((sales / cxc).toFixed(2)) : 0;
  const diasCobro =
    sales > 0 ? Number(((cxc / sales) * daysInYear).toFixed(1)) : 0;

  // 3. Ciclo Operativo (CO = PCI + PCC)
  const cicloOperativo = Number((diasInventario + diasCobro).toFixed(1));

  // 4. Días de Pago (PDP / Periodo de Diferimiento de Cuentas por Pagar)
  const rotCxP = cxp > 0 && cogs > 0 ? Number((cogs / cxp).toFixed(2)) : 0;
  const diasPago =
    cogs > 0 ? Number(((cxp / cogs) * daysInYear).toFixed(1)) : 0;

  // 5. Ciclo de Conversión de Efectivo (CCE = CO - PDP)
  const cce = Number((cicloOperativo - diasPago).toFixed(1));

  // 6. Gasto Diario y Recursos Requeridos para Financiar el Ciclo
  // Gasto desembolsable estimado: Costo de Ventas + Gastos de Operación (excluyendo partidas no monetarias)
  const gastosOperativosDesembolsables = Math.max(0, totals.totalGastosOperativos);
  const desembolsoTotalAnual = cogs + gastosOperativosDesembolsables;
  const gastoDiarioOperativo =
    desembolsoTotalAnual > 0 ? Number((desembolsoTotalAnual / daysInYear).toFixed(2)) : 0;

  const recursosRequeridos =
    cce > 0
      ? Number((cce * gastoDiarioOperativo).toFixed(2))
      : 0;

  // Dictamen y Diagnóstico Académico
  let status: 'OPTIMO' | 'MODERADO' | 'CRITICO' = 'MODERADO';
  let dictamen = '';

  if (cce <= 0) {
    status = 'OPTIMO';
    dictamen =
      'Ciclo de Efectivo Negativo o Autofinanciado: Los proveedores financian el 100% de la operación y el inventario se cobra antes de pagarlo. La empresa no requiere crédito bancario para capital de trabajo operativo.';
  } else if (cce <= 45) {
    status = 'OPTIMO';
    dictamen = `Ciclo Ágil y Saludable (${cce} días): La empresa rota sus recursos en mes y medio. Los días concedidos por proveedores (${diasPago} días) cubren una porción sustancial del ciclo operativo (${cicloOperativo} días).`;
  } else if (cce <= 90) {
    status = 'MODERADO';
    dictamen = `Ciclo Moderado (${cce} días): La empresa mantiene inmovilizados fondos por casi tres meses. Se sugiere acortar los días de cobro (${diasCobro} días) o negociar mayor plazo con proveedores para liberar caja.`;
  } else {
    status = 'CRITICO';
    dictamen = `Ciclo Extenso y de Alto Riesgo de Iliquidez (${cce} días): El dinero queda atrapado más de un trimestre. La empresa demanda ${recursosRequeridos.toLocaleString()} C$ en financiamiento continuo de corto plazo para no paralizar sus operaciones.`;
  }

  return {
    periodId: totals.periodId,
    diasInventario,
    diasCobro,
    cicloOperativo,
    diasPago,
    cicloConversionEfectivo: cce,
    rotacionInventario: rotInv,
    rotacionCxC: rotCxC,
    rotacionCxP: rotCxP,
    inventario: inv,
    cuentasPorCobrar: cxc,
    cuentasPorPagar: cxp,
    ventasNetas: sales,
    costoBienesVendidos: cogs,
    gastoDiarioOperativo,
    recursosRequeridos,
    status,
    dictamen,
  };
}

/**
 * Simula el impacto de negociaciones operativas (reducir inventario, acelerar cobranza o extender plazo a proveedores).
 */
export function simulateCceSensitivity(
  base: CashConversionCycleResult,
  deltaDiasInventario: number,
  deltaDiasCobro: number,
  deltaDiasPago: number
): CceSimulationResult {
  const diasInventarioSim = Math.max(0, Number((base.diasInventario + deltaDiasInventario).toFixed(1)));
  const diasCobroSim = Math.max(0, Number((base.diasCobro + deltaDiasCobro).toFixed(1)));
  const diasPagoSim = Math.max(0, Number((base.diasPago + deltaDiasPago).toFixed(1)));

  const cicloOperativoSimulado = Number((diasInventarioSim + diasCobroSim).toFixed(1));
  const cceSimulado = Number((cicloOperativoSimulado - diasPagoSim).toFixed(1));

  const diasAhorrados = Number((base.cicloConversionEfectivo - cceSimulado).toFixed(1));
  const efectivoLiberado = Number((diasAhorrados * base.gastoDiarioOperativo).toFixed(2));

  return {
    diasInventarioSim,
    diasCobroSim,
    diasPagoSim,
    cceSimulado,
    cicloOperativoSimulado,
    diasAhorrados,
    efectivoLiberado,
  };
}
