import { createClient } from '@supabase/supabase-js';
import { INITIAL_DEMO_STATE, createBlankCaseState } from '../seed/demoData';
import { createPersonalBudgetsByUser } from '../seed/personalBudgets';
import { FinancialSystemState } from '../types/financial';

// v3: Caso Oficial del PDF "Corporación Agrícola, S. A. y subsidiarias (2023-2024)"
const STORAGE_KEY = 'gfo_is2122_financial_system_state_v3';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const supabaseClient =
  supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

export class FinancialRepository {
  /**
   * Carga el estado persistido o inicializa con el Caso del PDF (Corporación Agrícola, S.A.).
   */
  static loadState(): FinancialSystemState {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return structuredClone(INITIAL_DEMO_STATE);
      }
      const parsed = JSON.parse(raw) as FinancialSystemState;
      if (!parsed.personalBudgetsByUser) {
        parsed.personalBudgetsByUser = createPersonalBudgetsByUser(parsed.personalBudget);
      }
      return parsed;
    } catch {
      return structuredClone(INITIAL_DEMO_STATE);
    }
  }

  /** Persiste automáticamente cualquier cambio. */
  static saveState(state: FinancialSystemState): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Error guardando estado financiero en almacenamiento local:', e);
    }
  }

  /** Carga el ejemplo completo del PDF (Corporación Agrícola, S. A. y subsidiarias 2023-2024). */
  static resetToDemoState(
    preservePersonalBudgets?: FinancialSystemState['personalBudgetsByUser']
  ): FinancialSystemState {
    const fresh = structuredClone(INITIAL_DEMO_STATE);
    if (preservePersonalBudgets) {
      fresh.personalBudgetsByUser = preservePersonalBudgets;
    }
    this.saveState(fresh);
    return fresh;
  }

  /** Limpia los módulos empresariales para llenar cualquier otro caso desde cero. */
  static resetToBlankCase(
    preservePersonalBudgets?: FinancialSystemState['personalBudgetsByUser']
  ): FinancialSystemState {
    const blank = createBlankCaseState(preservePersonalBudgets);
    this.saveState(blank);
    return blank;
  }
}
