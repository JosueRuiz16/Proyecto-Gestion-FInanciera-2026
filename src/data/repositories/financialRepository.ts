import { createClient } from '@supabase/supabase-js';
import { INITIAL_DEMO_STATE, createBlankCaseState } from '../seed/demoData';
import {
  PERSONAL_BUDGET_OVERRIDES,
  createPersonalBudgetsByUser,
} from '../seed/personalBudgets';
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
      if (
        parsed.company?.name &&
        (/^\.(md|markdown|pdf|xlsx|xls|txt|csv)$/i.test(parsed.company.name.trim()) ||
          parsed.company.name.trim() === '.md')
      ) {
        parsed.company.name = 'Distribuidora Comercial del Pacífico, S. A. (DISCOPAC)';
        this.saveState(parsed);
      }
      if (Array.isArray(parsed.accounts)) {
        let repaired = false;
        const cleanedAccounts = parsed.accounts.filter((acc) => {
          const n = String(acc?.name || '').trim();
          const u = n
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toUpperCase();
          if (!n || n.startsWith('.')) return false;
          if (
            /\b(ENERO|FEBRERO|MARZO|ABRIL|MAYO|JUNIO|JULIO|AGOSTO|SEPTIEMBRE|OCTUBRE|NOVIEMBRE|DICIEMBRE)\b/.test(u) ||
            u.includes('ANOS TERMINADOS') ||
            u.includes('CADA ANO') ||
            u.includes('EXPRESADO EN')
          ) {
            return false;
          }
          if (/\.(MD|MARKDOWN|PDF|XLSX|XLS|CSV|TXT|JSON)\b/.test(u)) return false;
          if (
            u.includes('CASO DE PRUEBA') ||
            u.includes('DATOS GENERALES') ||
            u.includes('BALANCE GENERAL COMPARATIVO') ||
            u.includes('ESTADO DE RESULTADOS COMPARATIVO')
          ) {
            return false;
          }
          // Reparar si Inventarios había quedado clasificado erróneamente como Ingreso por Ventas
          if (u.includes('INVENTARIO') && acc.category !== 'ACTIVO_CORRIENTE') {
            acc.category = 'ACTIVO_CORRIENTE';
            acc.subType = 'INVENTARIO';
            repaired = true;
          }
          return true;
        });
        if (repaired || cleanedAccounts.length !== parsed.accounts.length) {
          parsed.accounts = cleanedAccounts;
          this.saveState(parsed);
        }
      }
      if (!parsed.personalBudgetsByUser) {
        parsed.personalBudgetsByUser = createPersonalBudgetsByUser(parsed.personalBudget);
      } else {
        for (const [uid, override] of Object.entries(PERSONAL_BUDGET_OVERRIDES)) {
          if (
            override &&
            (!parsed.personalBudgetsByUser[uid]?.studentControl ||
              parsed.personalBudgetsByUser[uid]?.monthLabel?.includes('ficticios'))
          ) {
            parsed.personalBudgetsByUser[uid] = structuredClone(override);
          }
        }
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
