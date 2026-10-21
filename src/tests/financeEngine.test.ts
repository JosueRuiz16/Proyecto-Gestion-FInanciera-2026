import { describe, expect, it } from 'vitest';
import { INITIAL_DEMO_STATE } from '../data/seed/demoData';
import { computeFinancialStatements } from '../core/finance/statements';
import {
  computeDuPontAnalysis,
  computeFinancialRatios,
  computeVerticalAndHorizontalAnalysis,
} from '../core/finance/analysis';
import { computeCvuAndLeverage } from '../core/finance/cvuAndLeverage';
import {
  computeCashFlowStatement,
  computeMasterBudgetAndProforma,
} from '../core/finance/planningAndProforma';
import {
  computeInventoryControl,
  computePersonalBudget,
} from '../core/finance/complementaryModules';

describe('Motor Financiero GFO IS2122 - Verificación con Cálculos Manuales', () => {
  const period2024 = INITIAL_DEMO_STATE.periods[0];
  const period2025 = INITIAL_DEMO_STATE.periods[1];

  it('1. Verifica la ecuación contable y el Estado de Resultados en 2024 y 2025', () => {
    const st2024 = computeFinancialStatements(INITIAL_DEMO_STATE.accounts, period2024);
    const st2025 = computeFinancialStatements(INITIAL_DEMO_STATE.accounts, period2025);

    // 2024: Activo Corriente = 180k + 260k + 320k + 40k = 800,000 | No Corriente = 700,000 -> Total = 1,500,000
    expect(st2024.totalActivoCorriente).toBe(800000);
    expect(st2024.totalActivos).toBe(1500000);
    expect(st2024.totalPasivos).toBe(620000);
    expect(st2024.totalPatrimonio).toBe(880000);
    expect(st2024.estaCuadrado).toBe(true);

    // 2025: Activo Corriente = 240k + 310k + 380k + 50k = 980,000 | No Corriente = 820,000 -> Total = 1,800,000
    expect(st2025.totalActivoCorriente).toBe(980000);
    expect(st2025.totalActivos).toBe(1800000);
    expect(st2025.totalPasivoCorriente).toBe(350000);
    expect(st2025.totalPasivos).toBe(700000);
    expect(st2025.totalPatrimonio).toBe(1100000);
    expect(st2025.estaCuadrado).toBe(true);

    // Estado de Resultados 2025:
    // Ventas (2,500,000) - CBV (1,500,000) = Utilidad Bruta (1,000,000)
    // - Gastos Op (420,000 + 80,000 = 500,000) = UAII (500,000)
    // - Intereses (60,000) = UAI (440,000)
    // - Impuestos 30% (132,000) = Utilidad Neta (308,000)
    expect(st2025.utilidadBruta).toBe(1000000);
    expect(st2025.uaii).toBe(500000);
    expect(st2025.uai).toBe(440000);
    expect(st2025.impuestos).toBe(132000);
    expect(st2025.utilidadNeta).toBe(308000);
  });

  it('2. Verifica Análisis Vertical, Horizontal, Razones Financieras y DuPont', () => {
    const st2024 = computeFinancialStatements(INITIAL_DEMO_STATE.accounts, period2024);
    const st2025 = computeFinancialStatements(INITIAL_DEMO_STATE.accounts, period2025);

    const vh = computeVerticalAndHorizontalAnalysis(
      INITIAL_DEMO_STATE.accounts,
      st2024,
      st2025
    );
    const efectivoRow = vh.find((r) => r.code === '1101')!;
    // Efectivo pasó de 180,000 a 240,000 -> +60,000 (+33.33%)
    expect(efectivoRow.horizontalAbsChange).toBe(60000);
    expect(efectivoRow.horizontalRelChangePct).toBe(33.33);

    const ratios = computeFinancialRatios(st2025, INITIAL_DEMO_STATE.company);
    const liquidez = ratios.find((r) => r.id === 'liquidez_corriente')!;
    // 980,000 / 350,000 = 2.80 veces
    expect(liquidez.value).toBe(2.8);

    const dupont = computeDuPontAnalysis(st2025);
    // Margen Neto = 308,000 / 2,500,000 = 12.32%
    expect(dupont.netProfitMarginPct).toBe(12.32);
    // ROE directo = 308,000 / 1,100,000 = 28%
    expect(dupont.roeDuPontPct).toBeCloseTo(28, 1);
  });

  it('3. Verifica Punto de Equilibrio (C-V-U) y Grados de Apalancamiento (GAO, GAF, GAT)', () => {
    const cvu = computeCvuAndLeverage(INITIAL_DEMO_STATE.cvuInput);
    // MC unitario = 250 - 150 = C$ 100 (40%)
    // PE unidades = 500,000 / 100 = 5,000 unidades
    // PE monetario = 500,000 / 0.40 = C$ 1,250,000
    expect(cvu.unitContributionMargin).toBe(100);
    expect(cvu.breakEvenUnits).toBe(5000);
    expect(cvu.breakEvenRevenue).toBe(1250000);

    // Con 10,000 unidades: MC Total = 1,000,000; UAII = 500,000 -> GAO = 1,000,000 / 500,000 = 2.00
    // GAF = 500,000 / (500,000 - 60,000) = 500,000 / 440,000 = 1.14
    // GAT = 2.00 * 1.14 = 2.28
    expect(cvu.gao).toBe(2);
    expect(cvu.gaf).toBe(1.14);
    expect(cvu.gat).toBe(2.28);
  });

  it('4. Verifica Flujo de Efectivo, Presupuesto Maestro y Estados Proforma', () => {
    const cf = computeCashFlowStatement(
      INITIAL_DEMO_STATE.cashFlowEntries,
      INITIAL_DEMO_STATE.cashFlowInitialBalance
    );
    // FEO = 2,450,000 - (1,540,000 + 430,000 + 192,000) = +288,000
    // FEI = -200,000
    // FEF = 110,000 - 138,000 = -28,000
    // Variación Neta = +60,000 | Saldo Final = 180,000 + 60,000 = 240,000
    expect(cf.netOperatingCashFlow).toBe(288000);
    expect(cf.netInvestingCashFlow).toBe(-200000);
    expect(cf.netFinancingCashFlow).toBe(-28000);
    expect(cf.netCashVariation).toBe(60000);
    expect(cf.endingCashBalance).toBe(240000);

    const st2025 = computeFinancialStatements(INITIAL_DEMO_STATE.accounts, period2025);
    const budget = computeMasterBudgetAndProforma(
      INITIAL_DEMO_STATE.masterBudget,
      st2025,
      30
    );
    // Ventas proyectadas: 11,500 * 260 = C$ 2,990,000
    // Unidades a comprar: 11,500 + 2,800 - 2,500 = 11,800 unidades
    expect(budget.projectedSalesRevenue).toBe(2990000);
    expect(budget.requiredUnitsToBuyOrProduce).toBe(11800);
  });

  it('5. Verifica Presupuesto Personal e Inventario (Fórmulas obligatorias Guía 2026)', () => {
    const personal = computePersonalBudget(INITIAL_DEMO_STATE.personalBudget);
    // Ingresos = 32,000 + 6,500 = 38,500
    // Gastos = 10,500 + 8,200 + 3,400 + 2,800 + 1,900 + 1,600 = 28,400
    // Saldo disponible = 10,100 (26.23% capacidad de ahorro)
    expect(personal.totalIncome).toBe(38500);
    expect(personal.totalExpenses).toBe(28400);
    expect(personal.availableBalance).toBe(10100);
    expect(personal.savingsCapacityPct).toBe(26.23);

    const inv = computeInventoryControl(INITIAL_DEMO_STATE.inventoryProducts);
    // Producto 1: 45 + 60 - 72 = 33 unidades * C$ 4,200 = C$ 138,600
    expect(inv.items[0].finalStock).toBe(33);
    expect(inv.items[0].totalValue).toBe(138600);
    expect(inv.productsInReorderAlert).toBe(2);
  });
});

