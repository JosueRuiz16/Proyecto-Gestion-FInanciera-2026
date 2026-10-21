import { CvuLeverageInput } from '../../data/types/financial';

export interface CvuAndLeverageResult {
  // Base actual
  unitContributionMargin: number; // Margen de contribución unitario (C$) = P - CVu
  contributionMarginRatioPct: number; // Razón de margen de contribución (%) = ((P - CVu) / P) * 100
  breakEvenUnits: number | null; // Punto de equilibrio en unidades = CF / (P - CVu)
  breakEvenRevenue: number | null; // Punto de equilibrio monetario (C$) = CF / Razón MC
  currentRevenue: number; // Ventas actuales (C$)
  currentTotalVariableCost: number; // Costo variable total (C$)
  currentTotalContributionMargin: number; // Margen de contribución total (C$)
  currentUaii: number; // UAII operativa (C$) = MC Total - CF
  currentUai: number; // UAI (C$) = UAII - Intereses
  currentNetIncome: number; // Utilidad Neta después de impuestos (C$)
  safetyMarginUnits: number; // Margen de seguridad en unidades
  safetyMarginPct: number; // Margen de seguridad (%)

  // Escenario Simulado (con cambios en P, CV, CF o Volumen)
  simulatedPrice: number;
  simulatedVariableCost: number;
  simulatedFixedCost: number;
  simulatedVolume: number;
  simulatedUnitCM: number;
  simulatedBreakEvenUnits: number | null;
  simulatedBreakEvenRevenue: number | null;
  simulatedUaii: number;
  uaiiVariationPct: number | null;

  // Grados de Apalancamiento (Módulo D)
  gao: number | null; // Grado de Apalancamiento Operativo = MC Total / UAII
  gaf: number | null; // Grado de Apalancamiento Financiero = UAII / (UAII - Intereses - (DivPref / (1 - t)))
  gat: number | null; // Grado de Apalancamiento Total = GAO * GAF
  gaoInterpretation: string;
  gafInterpretation: string;
  gatInterpretation: string;

  // Puntos para el gráfico de Punto de Equilibrio (Recharts)
  chartData: Array<{
    units: number;
    ventas: number;
    costosTotales: number;
    costosFijos: number;
  }>;
}

/**
 * Calcula Punto de Equilibrio, Relación Costo-Volumen-Utilidad (C-V-U), Simulación de Escenarios
 * y Grados de Apalancamiento Operativo (GAO), Financiero (GAF) y Total (GAT).
 */
export function computeCvuAndLeverage(input: CvuLeverageInput): CvuAndLeverageResult {
  const {
    unitPrice: P,
    unitVariableCost: CVu,
    fixedOperatingCosts: CF,
    currentUnitsSold: Q,
    interestExpense: I,
    preferredDividends: DP,
    taxRate,
  } = input;

  const t = taxRate / 100;
  const unitContributionMargin = Number((P - CVu).toFixed(2));
  const contributionMarginRatio = P > 0 ? (P - CVu) / P : 0;
  const contributionMarginRatioPct = Number((contributionMarginRatio * 100).toFixed(2));

  // Punto de equilibrio base
  const breakEvenUnits =
    unitContributionMargin > 0 ? Number((CF / unitContributionMargin).toFixed(2)) : null;
  const breakEvenRevenue =
    contributionMarginRatio > 0 ? Number((CF / contributionMarginRatio).toFixed(2)) : null;

  const currentRevenue = Number((P * Q).toFixed(2));
  const currentTotalVariableCost = Number((CVu * Q).toFixed(2));
  const currentTotalContributionMargin = Number((unitContributionMargin * Q).toFixed(2));
  const currentUaii = Number((currentTotalContributionMargin - CF).toFixed(2));
  const currentUai = Number((currentUaii - I).toFixed(2));
  const taxes = currentUai > 0 ? currentUai * t : 0;
  const currentNetIncome = Number((currentUai - taxes - DP).toFixed(2));

  const safetyMarginUnits =
    breakEvenUnits !== null ? Number((Q - breakEvenUnits).toFixed(2)) : 0;
  const safetyMarginPct =
    Q > 0 && breakEvenUnits !== null
      ? Number((((Q - breakEvenUnits) / Q) * 100).toFixed(2))
      : 0;

  // Escenario Simulado (cambios en Precio, Costo Variable, Costo Fijo o Volumen)
  const simulatedPrice = Number((P * (1 + input.priceChangePct / 100)).toFixed(2));
  const simulatedVariableCost = Number(
    (CVu * (1 + input.variableCostChangePct / 100)).toFixed(2)
  );
  const simulatedFixedCost = Number((CF * (1 + input.fixedCostChangePct / 100)).toFixed(2));
  const simulatedVolume = Number((Q * (1 + input.volumeChangePct / 100)).toFixed(2));

  const simulatedUnitCM = Number((simulatedPrice - simulatedVariableCost).toFixed(2));
  const simulatedCMRatio = simulatedPrice > 0 ? simulatedUnitCM / simulatedPrice : 0;
  const simulatedBreakEvenUnits =
    simulatedUnitCM > 0 ? Number((simulatedFixedCost / simulatedUnitCM).toFixed(2)) : null;
  const simulatedBreakEvenRevenue =
    simulatedCMRatio > 0 ? Number((simulatedFixedCost / simulatedCMRatio).toFixed(2)) : null;
  const simulatedUaii = Number(
    (simulatedUnitCM * simulatedVolume - simulatedFixedCost).toFixed(2)
  );
  const uaiiVariationPct =
    currentUaii !== 0
      ? Number((((simulatedUaii - currentUaii) / Math.abs(currentUaii)) * 100).toFixed(2))
      : null;

  // APALANCAMIENTO (Módulo D)
  // GAO = Margen de Contribución Total / UAII
  const gao =
    currentUaii !== 0
      ? Number((currentTotalContributionMargin / currentUaii).toFixed(2))
      : null;

  // GAF = UAII / [UAII - Intereses - (Dividendos Preferentes / (1 - t))]
  const preferredBeforeTax = 1 - t > 0 ? DP / (1 - t) : 0;
  const gafDenominator = currentUaii - I - preferredBeforeTax;
  const gaf = gafDenominator !== 0 ? Number((currentUaii / gafDenominator).toFixed(2)) : null;

  // GAT = GAO * GAF
  const gat = gao !== null && gaf !== null ? Number((gao * gaf).toFixed(2)) : null;

  const gaoInterpretation =
    gao !== null
      ? `Un GAO de ${gao} indica que por cada 1% de variación en las ventas (en unidades), la Utilidad Operativa (UAII) variará en un ${gao.toFixed(
        2
      )}% en la misma dirección.`
      : 'No es posible calcular el GAO (UAII es igual a cero, la empresa está exactamente en el punto de equilibrio operativo).';

  const gafInterpretation =
    gaf !== null
      ? `Un GAF de ${gaf} significa que ante un cambio del 1% en la UAII, la Utilidad por Acción (UPA) o Utilidad Neta disponible para socios variará en un ${gaf.toFixed(
        2
      )}%.`
      : 'No es posible calcular el GAF (el denominador financiero es cero).';

  const gatInterpretation =
    gat !== null
      ? `El Grado de Apalancamiento Total (GAT) es de ${gat}: un incremento del 10% en las ventas provocará un incremento del ${(
        gat * 10
      ).toFixed(2)}% en la Utilidad por Acción (efecto combinado operativo y financiero).`
      : 'No es posible calcular el GAT combinado.';

  // Datos para gráfica de Punto de Equilibrio
  const maxUnits = Math.max(
    Q * 1.5,
    (breakEvenUnits ?? Q) * 1.6,
    100
  );
  const steps = 6;
  const chartData = Array.from({ length: steps + 1 }, (_, idx) => {
    const u = Math.round((maxUnits / steps) * idx);
    return {
      units: u,
      ventas: Number((u * P).toFixed(2)),
      costosTotales: Number((CF + u * CVu).toFixed(2)),
      costosFijos: Number(CF.toFixed(2)),
    };
  });

  return {
    unitContributionMargin,
    contributionMarginRatioPct,
    breakEvenUnits,
    breakEvenRevenue,
    currentRevenue,
    currentTotalVariableCost,
    currentTotalContributionMargin,
    currentUaii,
    currentUai,
    currentNetIncome,
    safetyMarginUnits,
    safetyMarginPct,
    simulatedPrice,
    simulatedVariableCost,
    simulatedFixedCost,
    simulatedVolume,
    simulatedUnitCM,
    simulatedBreakEvenUnits,
    simulatedBreakEvenRevenue,
    simulatedUaii,
    uaiiVariationPct,
    gao,
    gaf,
    gat,
    gaoInterpretation,
    gafInterpretation,
    gatInterpretation,
    chartData,
  };
}

