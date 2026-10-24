import { CompanyProfile, FinancialAccountItem } from '../../data/types/financial';
import { ComputedStatementTotals } from './statements';

export interface VerticalHorizontalRow {
  accountId: string;
  code: string;
  name: string;
  category: FinancialAccountItem['category'];
  baseValue: number; // Período anterior (ej. 2024)
  currentValue: number; // Período actual (ej. 2025)
  verticalBasePct: number; // % sobre Total Activos o Ventas Netas en base
  verticalCurrentPct: number; // % sobre Total Activos o Ventas Netas en actual
  horizontalAbsChange: number; // Variación absoluta (C$): Actual - Base
  horizontalRelChangePct: number | null; // Variación relativa (%): ((Actual - Base) / Base) * 100
}

export interface FinancialRatioResult {
  id: string;
  group: 'LIQUIDEZ' | 'ACTIVIDAD' | 'ENDEUDAMIENTO' | 'RENTABILIDAD' | 'MERCADO';
  name: string;
  formula: string;
  value: number | null;
  unit: 'veces' | 'C$' | '%' | 'días';
  benchmark: string;
  status: 'OPTIMO' | 'PRECAUCION' | 'RIESGO';
  interpretation: string;
}

export interface DuPontAnalysisResult {
  netProfitMarginPct: number; // Margen de utilidad neta (%) = (Utilidad Neta / Ventas) * 100
  assetTurnover: number; // Rotación de activos totales (veces) = Ventas / Total Activos
  roaDuPontPct: number; // ROA (%) = Margen Neto * Rotación de Activos
  equityMultiplier: number; // Multiplicador del capital (veces) = Total Activos / Total Patrimonio
  roeDuPontPct: number; // ROE (%) = ROA * Multiplicador del Capital
  roeDirectPct: number; // ROE directo (%) = (Utilidad Neta / Total Patrimonio) * 100
  interpretation: string;
}

/**
 * Calcula Análisis Vertical y Horizontal para cada cuenta del Balance General y Estado de Resultados.
 * - En el Balance General, la base del Análisis Vertical (100%) es el Total de Activos.
 * - En el Estado de Resultados, la base del Análisis Vertical (100%) son las Ventas Netas.
 */
export function computeVerticalAndHorizontalAnalysis(
  accounts: FinancialAccountItem[],
  baseTotals: ComputedStatementTotals,
  currentTotals: ComputedStatementTotals
): VerticalHorizontalRow[] {
  return accounts.map((acc) => {
    const baseVal = Number(acc.balances[baseTotals.periodId] ?? 0);
    const currVal = Number(acc.balances[currentTotals.periodId] ?? 0);

    const isBalanceSheet =
      acc.category === 'ACTIVO_CORRIENTE' ||
      acc.category === 'ACTIVO_NO_CORRIENTE' ||
      acc.category === 'PASIVO_CORRIENTE' ||
      acc.category === 'PASIVO_NO_CORRIENTE' ||
      acc.category === 'PATRIMONIO';

    const baseDenominator = isBalanceSheet ? baseTotals.totalActivos : baseTotals.ventasNetas;
    const currDenominator = isBalanceSheet ? currentTotals.totalActivos : currentTotals.ventasNetas;

    const verticalBasePct = baseDenominator > 0 ? (baseVal / baseDenominator) * 100 : 0;
    const verticalCurrentPct = currDenominator > 0 ? (currVal / currDenominator) * 100 : 0;

    const horizontalAbsChange = currVal - baseVal;
    const horizontalRelChangePct =
      baseVal !== 0 ? ((currVal - baseVal) / Math.abs(baseVal)) * 100 : null;

    return {
      accountId: acc.id,
      code: acc.code,
      name: acc.name,
      category: acc.category,
      baseValue: baseVal,
      currentValue: currVal,
      verticalBasePct: Number(verticalBasePct.toFixed(2)),
      verticalCurrentPct: Number(verticalCurrentPct.toFixed(2)),
      horizontalAbsChange: Number(horizontalAbsChange.toFixed(2)),
      horizontalRelChangePct:
        horizontalRelChangePct !== null ? Number(horizontalRelChangePct.toFixed(2)) : null,
    };
  });
}

/**
 * Calcula todas las Razones Financieras obligatorias (Liquidez, Actividad, Endeudamiento, Rentabilidad y Mercado).
 */
export function computeFinancialRatios(
  totals: ComputedStatementTotals,
  company: CompanyProfile
): FinancialRatioResult[] {
  const safeDiv = (num: number, den: number): number | null =>
    den !== 0 ? Number((num / den).toFixed(2)) : null;

  // 1. LIQUIDEZ
  const razonCirculante = safeDiv(totals.totalActivoCorriente, totals.totalPasivoCorriente);
  const pruebaAcida = safeDiv(
    totals.totalActivoCorriente - totals.inventario,
    totals.totalPasivoCorriente
  );
  const capitalTrabajoNeto = Number(
    (totals.totalActivoCorriente - totals.totalPasivoCorriente).toFixed(2)
  );

  // 2. ACTIVIDAD (año comercial de 360 días estándar académico)
  const rotacionInventario = safeDiv(totals.costoBienesVendidos, totals.inventario);
  const edadPromedioInventario =
    rotacionInventario && rotacionInventario > 0
      ? Number((360 / rotacionInventario).toFixed(1))
      : null;

  const rotacionCxC = safeDiv(totals.ventasNetas, totals.cuentasPorCobrar);
  const periodoPromedioCobro =
    rotacionCxC && rotacionCxC > 0 ? Number((360 / rotacionCxC).toFixed(1)) : null;

  const rotacionActivosTotales = safeDiv(totals.ventasNetas, totals.totalActivos);

  // 3. ENDEUDAMIENTO
  const indiceEndeudamiento =
    totals.totalActivos > 0
      ? Number(((totals.totalPasivos / totals.totalActivos) * 100).toFixed(2))
      : null;
  const razonDeudaPatrimonio = safeDiv(totals.totalPasivos, totals.totalPatrimonio);
  const coberturaIntereses = safeDiv(totals.uaii, totals.gastosFinancieros);

  // 4. RENTABILIDAD
  const margenBruto =
    totals.ventasNetas > 0
      ? Number(((totals.utilidadBruta / totals.ventasNetas) * 100).toFixed(2))
      : null;
  const margenOperativo =
    totals.ventasNetas > 0
      ? Number(((totals.uaii / totals.ventasNetas) * 100).toFixed(2))
      : null;
  const margenNeto =
    totals.ventasNetas > 0
      ? Number(((totals.utilidadNeta / totals.ventasNetas) * 100).toFixed(2))
      : null;
  const roa =
    totals.totalActivos > 0
      ? Number(((totals.utilidadNeta / totals.totalActivos) * 100).toFixed(2))
      : null;
  const roe =
    totals.totalPatrimonio > 0
      ? Number(((totals.utilidadNeta / totals.totalPatrimonio) * 100).toFixed(2))
      : null;

  // 5. MERCADO
  const upa =
    company.sharesOutstanding > 0
      ? Number((totals.utilidadNeta / company.sharesOutstanding).toFixed(2))
      : null;
  const razonPrecioUtilidad =
    upa && upa > 0 ? Number((company.marketPricePerShare / upa).toFixed(2)) : null;

  return [
    {
      id: 'liquidez_corriente',
      group: 'LIQUIDEZ',
      name: 'Razón Circulante (Liquidez Corriente)',
      formula: 'Activo Corriente / Pasivo Corriente',
      value: razonCirculante,
      unit: 'veces',
      benchmark: '1.50 a 2.50 veces',
      status:
        razonCirculante === null
          ? 'RIESGO'
          : razonCirculante >= 1.5
            ? 'OPTIMO'
            : razonCirculante >= 1.0
              ? 'PRECAUCION'
              : 'RIESGO',
      interpretation:
        razonCirculante !== null
          ? `Por cada C$ 1.00 de deuda a corto plazo, la empresa cuenta con C$ ${razonCirculante.toFixed(
            2
          )} en activos corrientes para respaldarla.`
          : 'No se puede calcular (Pasivo Corriente igual a cero).',
    },
    {
      id: 'prueba_acida',
      group: 'LIQUIDEZ',
      name: 'Prueba Ácida (Razón Rápida)',
      formula: '(Activo Corriente - Inventario) / Pasivo Corriente',
      value: pruebaAcida,
      unit: 'veces',
      benchmark: '>= 1.00 veces',
      status:
        pruebaAcida === null
          ? 'RIESGO'
          : pruebaAcida >= 1.0
            ? 'OPTIMO'
            : pruebaAcida >= 0.7
              ? 'PRECAUCION'
              : 'RIESGO',
      interpretation:
        pruebaAcida !== null
          ? `Sin depender de la venta de sus inventarios, la empresa dispone de C$ ${pruebaAcida.toFixed(
            2
          )} líquidos por cada C$ 1.00 de deuda a corto plazo.`
          : 'No disponible.',
    },
    {
      id: 'capital_trabajo',
      group: 'LIQUIDEZ',
      name: 'Capital de Trabajo Neto (CTN)',
      formula: 'Activo Corriente - Pasivo Corriente',
      value: capitalTrabajoNeto,
      unit: 'C$',
      benchmark: '> C$ 0.00',
      status: capitalTrabajoNeto > 0 ? 'OPTIMO' : 'RIESGO',
      interpretation:
        capitalTrabajoNeto > 0
          ? `La empresa dispone de un colchón operativo neto de C$ ${capitalTrabajoNeto.toLocaleString()} tras cubrir sus obligaciones de corto plazo.`
          : 'Déficit de capital de trabajo: el pasivo de corto plazo supera al activo corriente.',
    },
    {
      id: 'rotacion_inventario',
      group: 'ACTIVIDAD',
      name: 'Rotación de Inventarios',
      formula: 'Costo de Bienes Vendidos / Inventario',
      value: rotacionInventario,
      unit: 'veces',
      benchmark: '4.0 a 12.0 veces/año',
      status:
        rotacionInventario && rotacionInventario >= 4
          ? 'OPTIMO'
          : rotacionInventario && rotacionInventario >= 2
            ? 'PRECAUCION'
            : 'RIESGO',
      interpretation:
        rotacionInventario !== null
          ? `El inventario se renueva en promedio ${rotacionInventario} veces al año (permanece unos ${edadPromedioInventario ?? 0
          } días en bodega antes de venderse).`
          : 'Inventario en cero.',
    },
    {
      id: 'periodo_cobro',
      group: 'ACTIVIDAD',
      name: 'Período Promedio de Cobro (PPC)',
      formula: '(Cuentas por Cobrar / Ventas Anuales) × 360',
      value: periodoPromedioCobro,
      unit: 'días',
      benchmark: '<= 45 días',
      status:
        periodoPromedioCobro !== null && periodoPromedioCobro <= 45
          ? 'OPTIMO'
          : periodoPromedioCobro !== null && periodoPromedioCobro <= 60
            ? 'PRECAUCION'
            : 'RIESGO',
      interpretation:
        periodoPromedioCobro !== null
          ? `La empresa tarda en promedio ${periodoPromedioCobro} días en convertir sus cuentas por cobrar en efectivo (Rotación: ${rotacionCxC} veces/año).`
          : 'No disponible.',
    },
    {
      id: 'rotacion_activos',
      group: 'ACTIVIDAD',
      name: 'Rotación de Activos Totales',
      formula: 'Ventas Netas / Total Activos',
      value: rotacionActivosTotales,
      unit: 'veces',
      benchmark: '>= 0.80 veces',
      status:
        rotacionActivosTotales && rotacionActivosTotales >= 0.8
          ? 'OPTIMO'
          : rotacionActivosTotales && rotacionActivosTotales >= 0.5
            ? 'PRECAUCION'
            : 'RIESGO',
      interpretation:
        rotacionActivosTotales !== null
          ? `Cada C$ 1.00 invertido en activos totales genera C$ ${rotacionActivosTotales.toFixed(
            2
          )} en ventas anuales.`
          : 'Activos en cero.',
    },
    {
      id: 'indice_endeudamiento',
      group: 'ENDEUDAMIENTO',
      name: 'Índice de Endeudamiento Total',
      formula: '(Total Pasivos / Total Activos) × 100',
      value: indiceEndeudamiento,
      unit: '%',
      benchmark: '30% a 60%',
      status:
        indiceEndeudamiento !== null && indiceEndeudamiento <= 55
          ? 'OPTIMO'
          : indiceEndeudamiento !== null && indiceEndeudamiento <= 70
            ? 'PRECAUCION'
            : 'RIESGO',
      interpretation:
        indiceEndeudamiento !== null
          ? `El ${indiceEndeudamiento}% de los activos de la empresa está financiado con deuda de terceros y el ${(
            100 - indiceEndeudamiento
          ).toFixed(2)}% con patrimonio propio.`
          : 'No disponible.',
    },
    {
      id: 'deuda_patrimonio',
      group: 'ENDEUDAMIENTO',
      name: 'Razón Deuda a Patrimonio',
      formula: 'Total Pasivos / Total Patrimonio',
      value: razonDeudaPatrimonio,
      unit: 'veces',
      benchmark: '<= 1.20 veces',
      status:
        razonDeudaPatrimonio !== null && razonDeudaPatrimonio <= 1.2
          ? 'OPTIMO'
          : razonDeudaPatrimonio !== null && razonDeudaPatrimonio <= 2.0
            ? 'PRECAUCION'
            : 'RIESGO',
      interpretation:
        razonDeudaPatrimonio !== null
          ? `Los acreedores aportan C$ ${razonDeudaPatrimonio.toFixed(
            2
          )} por cada C$ 1.00 aportado por los accionistas.`
          : 'No disponible.',
    },
    {
      id: 'cobertura_intereses',
      group: 'ENDEUDAMIENTO',
      name: 'Razón de Cobertura de Intereses',
      formula: 'UAII (Utilidad Operativa) / Gastos por Intereses',
      value: coberturaIntereses,
      unit: 'veces',
      benchmark: '>= 3.00 veces',
      status:
        coberturaIntereses !== null && coberturaIntereses >= 3
          ? 'OPTIMO'
          : coberturaIntereses !== null && coberturaIntereses >= 1.5
            ? 'PRECAUCION'
            : 'RIESGO',
      interpretation:
        coberturaIntereses !== null
          ? `La utilidad operativa cubre ${coberturaIntereses} veces los cargos anuales por intereses financieros.`
          : 'Sin cargos por intereses registrados.',
    },
    {
      id: 'margen_bruto',
      group: 'RENTABILIDAD',
      name: 'Margen de Utilidad Bruta',
      formula: '(Utilidad Bruta / Ventas Netas) × 100',
      value: margenBruto,
      unit: '%',
      benchmark: '>= 30%',
      status:
        margenBruto !== null && margenBruto >= 30
          ? 'OPTIMO'
          : margenBruto !== null && margenBruto >= 20
            ? 'PRECAUCION'
            : 'RIESGO',
      interpretation:
        margenBruto !== null
          ? `Tras cubrir el costo de la mercadería vendida, queda un ${margenBruto}% sobre las ventas para cubrir gastos operativos y financieros.`
          : 'No disponible.',
    },
    {
      id: 'margen_operativo',
      group: 'RENTABILIDAD',
      name: 'Margen de Utilidad Operativa (UAII)',
      formula: '(UAII / Ventas Netas) × 100',
      value: margenOperativo,
      unit: '%',
      benchmark: '>= 15%',
      status:
        margenOperativo !== null && margenOperativo >= 15
          ? 'OPTIMO'
          : margenOperativo !== null && margenOperativo >= 8
            ? 'PRECAUCION'
            : 'RIESGO',
      interpretation:
        margenOperativo !== null
          ? `La operación pura del negocio genera C$ ${(margenOperativo / 100).toFixed(
            2
          )} de utilidad antes de intereses e impuestos por cada C$ 1.00 vendido.`
          : 'No disponible.',
    },
    {
      id: 'margen_neto',
      group: 'RENTABILIDAD',
      name: 'Margen de Utilidad Neta',
      formula: '(Utilidad Neta / Ventas Netas) × 100',
      value: margenNeto,
      unit: '%',
      benchmark: '>= 10%',
      status:
        margenNeto !== null && margenNeto >= 10
          ? 'OPTIMO'
          : margenNeto !== null && margenNeto >= 5
            ? 'PRECAUCION'
            : 'RIESGO',
      interpretation:
        margenNeto !== null
          ? `La empresa convierte en ganancia final para los socios el ${margenNeto}% de sus ingresos por ventas.`
          : 'No disponible.',
    },
    {
      id: 'roa',
      group: 'RENTABILIDAD',
      name: 'Rendimiento sobre los Activos (ROA / RSI)',
      formula: '(Utilidad Neta / Total Activos) × 100',
      value: roa,
      unit: '%',
      benchmark: '>= 8%',
      status:
        roa !== null && roa >= 8 ? 'OPTIMO' : roa !== null && roa >= 4 ? 'PRECAUCION' : 'RIESGO',
      interpretation:
        roa !== null
          ? `La gerencia obtiene un rendimiento neto del ${roa}% sobre la inversión total en activos.`
          : 'No disponible.',
    },
    {
      id: 'roe',
      group: 'RENTABILIDAD',
      name: 'Rendimiento sobre el Patrimonio (ROE)',
      formula: '(Utilidad Neta / Total Patrimonio) × 100',
      value: roe,
      unit: '%',
      benchmark: '>= 15%',
      status:
        roe !== null && roe >= 15 ? 'OPTIMO' : roe !== null && roe >= 8 ? 'PRECAUCION' : 'RIESGO',
      interpretation:
        roe !== null
          ? `Los accionistas obtienen una rentabilidad neta del ${roe}% sobre el capital propio invertido.`
          : 'No disponible.',
    },
    {
      id: 'upa',
      group: 'MERCADO',
      name: 'Utilidad por Acción (UPA / EPS)',
      formula: 'Utilidad Neta / Acciones en Circulación',
      value: upa,
      unit: 'C$',
      benchmark: '> C$ 0.00',
      status: upa && upa > 0 ? 'OPTIMO' : 'RIESGO',
      interpretation:
        upa !== null
          ? `Cada acción ordinaria en circulación (${company.sharesOutstanding.toLocaleString()} acciones) gana C$ ${upa.toFixed(
            2
          )} en el período.`
          : 'No disponible.',
    },
    {
      id: 'per',
      group: 'MERCADO',
      name: 'Razón Precio / Utilidad (P/U - PER)',
      formula: 'Precio de Mercado por Acción / Utilidad por Acción (UPA)',
      value: razonPrecioUtilidad,
      unit: 'veces',
      benchmark: '8 a 20 veces',
      status:
        razonPrecioUtilidad && razonPrecioUtilidad >= 5 ? 'OPTIMO' : 'PRECAUCION',
      interpretation:
        razonPrecioUtilidad !== null
          ? `Los inversionistas están dispuestos a pagar ${razonPrecioUtilidad} veces la utilidad anual por cada acción (Precio actual: C$ ${company.marketPricePerShare}).`
          : 'No disponible.',
    },
  ];
}

/**
 * Calcula el Sistema de Análisis DuPont (Descomposición de ROA y ROE en 3 factores):
 * ROE = Margen de Utilidad Neta × Rotación de Activos Totales × Multiplicador del Capital (MAF)
 */
export function computeDuPontAnalysis(totals: ComputedStatementTotals): DuPontAnalysisResult {
  const netProfitMarginPct =
    totals.ventasNetas > 0 ? (totals.utilidadNeta / totals.ventasNetas) * 100 : 0;
  const assetTurnover =
    totals.totalActivos > 0 ? totals.ventasNetas / totals.totalActivos : 0;
  const roaDuPontPct = netProfitMarginPct * assetTurnover;

  const equityMultiplier =
    totals.totalPatrimonio > 0 ? totals.totalActivos / totals.totalPatrimonio : 0;
  const roeDuPontPct = roaDuPontPct * equityMultiplier;
  const roeDirectPct =
    totals.totalPatrimonio > 0
      ? (totals.utilidadNeta / totals.totalPatrimonio) * 100
      : 0;

  return {
    netProfitMarginPct: Number(netProfitMarginPct.toFixed(2)),
    assetTurnover: Number(assetTurnover.toFixed(2)),
    roaDuPontPct: Number(roaDuPontPct.toFixed(2)),
    equityMultiplier: Number(equityMultiplier.toFixed(2)),
    roeDuPontPct: Number(roeDuPontPct.toFixed(2)),
    roeDirectPct: Number(roeDirectPct.toFixed(2)),
    interpretation: `Según el Sistema DuPont, el ROE del ${roeDuPontPct.toFixed(
      2
    )}% se explica por la combinación de: (1) Eficiencia en costos/precios con un Margen Neto de ${netProfitMarginPct.toFixed(
      2
    )}%, (2) Eficiencia en el uso de activos con una Rotación de ${assetTurnover.toFixed(
      2
    )} veces (generando un ROA de ${roaDuPontPct.toFixed(
      2
    )}%), y (3) un Multiplicador de Apalancamiento Financiero de ${equityMultiplier.toFixed(
      2
    )} veces.`,
  };
}

