import { PersonalBudgetData } from '../types/financial';
import { APP_USERS } from '../auth/users';

/**
 * PRESUPUESTOS PERSONALES POR USUARIO (Módulo H)
 *
 * Cada usuario tiene su propio presupuesto, independiente del resto y de las
 * finanzas empresariales. Por ahora todos parten de una COPIA del caso ficticio
 * demostrativo; para cargar los datos reales de cada persona, reemplaza la entrada
 * correspondiente en PERSONAL_BUDGET_OVERRIDES (por ejemplo `josue: { ... }`).
 */
const PERSONAL_BUDGET_OVERRIDES: Partial<Record<string, PersonalBudgetData>> = {
  // josue: { monthLabel: 'Octubre 2026', savingsGoalPct: 20, transactions: [ ... ] },
};

export function createPersonalBudgetsByUser(
  template: PersonalBudgetData
): Record<string, PersonalBudgetData> {
  const result: Record<string, PersonalBudgetData> = {};
  for (const user of APP_USERS) {
    const override = PERSONAL_BUDGET_OVERRIDES[user.id];
    result[user.id] = override
      ? structuredClone(override)
      : {
        ...structuredClone(template),
        monthLabel: `Octubre 2026 · ${user.displayName} (datos ficticios de ejemplo)`,
      };
  }
  return result;
}

/** Presupuesto vacío para un usuario sin registro previo. */
export function createEmptyPersonalBudget(displayName: string): PersonalBudgetData {
  return {
    monthLabel: `Octubre 2026 · ${displayName}`,
    savingsGoalPct: 20,
    transactions: [],
  };
}

