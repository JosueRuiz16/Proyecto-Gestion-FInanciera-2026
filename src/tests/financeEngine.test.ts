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

describe('Motor Financiero GFO IS2122 - Verificación con Estados Auditados Corporación Agrícola, S.A. (2023-2024)', () => {
  const period2023 = INITIAL_DEMO_STATE.periods[0];
  const period2024 = INITIAL_DEMO_STATE.periods[1];

  it('1. Verifica la ecuación contable y el Estado de Resultados en 2023 y 2024 (Págs. 8 y 9 del PDF)', () => {
    const st2023 = computeFinancialStatements(INITIAL_DEMO_STATE.accounts, period2023);
    const st2024 = computeFinancialStatements(INITIAL_DEMO_STATE.accounts, period2024);

    // Balance General 2023 (Pág. 8 PDF):
    expect(st2023.totalActivoCorriente).toBe(3130400003);
    expect(st2023.totalActivoNoCorriente).toBe(2159324100);
    expect(st2023.totalActivos).toBe(5289724103);
    expect(st2023.totalPasivoCorriente).toBe(3694159909);
    expect(st2023.totalPasivoNoCorriente).toBe(764857847);
    expect(st2023.totalPasivos).toBe(4459017756);
    expect(st2023.totalPatrimonio).toBe(830706347);
    expect(st2023.totalPasivoMasPatrimonio).toBe(5289724103);
    expect(st2023.estaCuadrado).toBe(true);

    // Balance General 2024 (Pág. 8 PDF):
    expect(st2024.totalActivoCorriente).toBe(4196014499);
    expect(st2024.totalActivoNoCorriente).toBe(2132118197);
    expect(st2024.totalActivos).toBe(6328132696);
    expect(st2024.totalPasivoCorriente).toBe(4366612852);
    expect(st2024.totalPasivoNoCorriente).toBe(961298153);
    expect(st2024.totalPasivos).toBe(5327911005);
    expect(st2024.totalPatrimonio).toBe(1000221691);
    expect(st2024.totalPasivoMasPatrimonio).toBe(6328132696);
    expect(st2024.estaCuadrado).toBe(true);

    // Estado de Resultados 2023 y 2024 (Pág. 9 PDF):
    expect(st2023.utilidadBruta).toBe(1388638065);
    expect(st2023.uaii).toBe(296823017);
    expect(st2023.uai).toBe(38547011);
    expect(st2023.impuestos).toBe(458130322);
    expect(st2023.utilidadNeta).toBe(-419583311);

    expect(st2024.utilidadBruta).toBe(1470583112);
    expect(st2024.uaii).toBe(357667403);
    expect(st2024.uai).toBe(133790976);
    expect(st2024.impuestos).toBe(91567028);
    expect(st2024.utilidadNeta).toBe(42223948);
  });

  it('2. Verifica Análisis Vertical, Horizontal, Razones Financieras y DuPont (2024 vs 2023)', () => {
    const st2023 = computeFinancialStatements(INITIAL_DEMO_STATE.accounts, period2023);
    const st2024 = computeFinancialStatements(INITIAL_DEMO_STATE.accounts, period2024);

    const vh = computeVerticalAndHorizontalAnalysis(
      INITIAL_DEMO_STATE.accounts,
      st2023,
      st2024
    );
    const efectivoRow = vh.find((r) => r.code === '1101')!;
    // Efectivo pasó de 70,837,459 a 284,636,118 -> +213,798,659
    expect(efectivoRow.horizontalAbsChange).toBe(213798659);

    const ratios = computeFinancialRatios(st2024, INITIAL_DEMO_STATE.company);
    const liquidez = ratios.find((r) => r.id === 'liquidez_corriente')!;
    // 4,196,014,499 / 4,366,612,852 = 0.96 veces
    expect(liquidez.value).toBe(0.96);

    const dupont = computeDuPontAnalysis(st2024);
    // ROE directo = 42,223,948 / 1,000,221,691 = 4.22%
    expect(dupont.roeDirectPct).toBe(4.22);
  });

  it('3. Verifica Punto de Equilibrio (C-V-U) y Grados de Apalancamiento (GAO, GAF, GAT)', () => {
    const cvu = computeCvuAndLeverage(INITIAL_DEMO_STATE.cvuInput);
    expect(cvu.unitContributionMargin).toBe(1470.58);
    expect(cvu.gao).toBeGreaterThan(4);
    expect(cvu.gaf).toBeGreaterThan(2.5);
    expect(cvu.gat).toBeGreaterThan(10);
  });

  it('4. Verifica Flujo de Efectivo 2024 (Pág. 11 del PDF), Presupuesto Maestro y Proforma', () => {
    const cf = computeCashFlowStatement(
      INITIAL_DEMO_STATE.cashFlowEntries,
      INITIAL_DEMO_STATE.cashFlowInitialBalance
    );
    // Flujo de Efectivo 2024 (Pág. 11 PDF):
    // FEO = +190,033,364 | FEI = -78,516,767 | FEF = +102,282,062
    // Variación Neta = +213,798,659 | Saldo Final = 70,837,459 + 213,798,659 = 284,636,118
    expect(cf.netOperatingCashFlow).toBe(190033364);
    expect(cf.netInvestingCashFlow).toBe(-78516767);
    expect(cf.netFinancingCashFlow).toBe(102282062);
    expect(cf.netCashVariation).toBe(213798659);
    expect(cf.endingCashBalance).toBe(284636118);

    const st2024 = computeFinancialStatements(INITIAL_DEMO_STATE.accounts, period2024);
    const budget = computeMasterBudgetAndProforma(
      INITIAL_DEMO_STATE.masterBudget,
      st2024,
      30
    );
    expect(budget.projectedSalesRevenue).toBe(9712500000);
  });

  it('5. Verifica Presupuesto Personal e Inventario Nota 12 (Pág. 44 del PDF)', () => {
    const personal = computePersonalBudget(INITIAL_DEMO_STATE.personalBudget);
    expect(personal.totalIncome).toBe(38500);
    expect(personal.totalExpenses).toBe(28400);

    const inv = computeInventoryControl(INITIAL_DEMO_STATE.inventoryProducts);
    // Granza de arroz: 848,279 qq * C$ 1,000 = C$ 848,279,000
    expect(inv.items[0].finalStock).toBe(848279);
    expect(inv.items[0].totalValue).toBe(848279000);
    expect(inv.productsInReorderAlert).toBe(2);
  });
});
