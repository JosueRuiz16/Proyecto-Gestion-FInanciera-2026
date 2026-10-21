import { createClient } from '@supabase/supabase-js';
import { INITIAL_DEMO_STATE } from '../seed/demoData';
import { createPersonalBudgetsByUser } from '../seed/personalBudgets';
import { FinancialSystemState } from '../types/financial';

// v2: incorpora presupuestos personales por usuario.
const STORAGE_KEY = 'gfo_is2122_financial_system_state_v2';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const supabaseClient =
  supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

export class FinancialRepository {
  /**
   * Carga el estado persistido o inicializa con el Caso Demostrativo Oficial.
   * Si un estado guardado no trae presupuestos por usuario, se completan desde la semilla.
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

  /** Restaura el caso demostrativo original. */
  static resetToDemoState(): FinancialSystemState {
    const fresh = structuredClone(INITIAL_DEMO_STATE);
    this.saveState(fresh);
    return fresh;
  }
}
