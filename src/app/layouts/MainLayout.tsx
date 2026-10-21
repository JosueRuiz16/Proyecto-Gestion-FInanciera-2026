import React, { useEffect, useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import {
  Activity,
  BarChart3,
  Boxes,
  Calculator,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  FolderKanban,
  Gauge,
  LayoutDashboard,
  LogOut,
  Moon,
  RotateCcw,
  Scale,
  Sun,
  Wallet,
  UserCircle2,
} from 'lucide-react';
import { useFinancialSystem } from '../providers/FinancialContext';
import { useAuth } from '../providers/AuthContext';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard Principal', icon: LayoutDashboard },
  { to: '/finanzas/estados', label: 'A. Estados Financieros', icon: FileSpreadsheet },
  { to: '/finanzas/analisis', label: 'B. Análisis y DuPont', icon: BarChart3 },
  { to: '/finanzas/punto-equilibrio', label: 'C. Punto de Equilibrio (C-V-U)', icon: Scale },
  { to: '/finanzas/apalancamiento', label: 'D. Apalancamiento (GAO/GAF/GAT)', icon: Gauge },
  { to: '/finanzas/flujo-efectivo', label: 'E. Flujo de Efectivo', icon: Activity },
  { to: '/finanzas/presupuestos', label: 'F. Presupuesto Maestro', icon: Calculator },
  { to: '/finanzas/proforma', label: 'G. Estados Proforma', icon: FolderKanban },
  { to: '/personal/presupuesto', label: 'H. Presupuesto Personal', icon: Wallet },
  { to: '/inventario', label: 'I. Control de Inventario', icon: Boxes },
];

export const MainLayout: React.FC = () => {
  const {
    state,
    activePeriod,
    comparisonPeriod,
    activeTotals,
    inventoryResult,
    setActivePeriodId,
    setComparisonPeriodId,
    resetDemoData,
  } = useFinancialSystem();
  const { user, logout } = useAuth();

  // Tema claro/oscuro: aplica la clase 'dark' en <html> y persiste en localStorage
  const [isDark, setIsDark] = useState<boolean>(
    () => localStorage.getItem('gfo_theme') === 'dark'
  );

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('gfo_theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  return (
    <div className="min-h-screen p-2 sm:p-3 lg:p-4">
      <div className="glass-frame rounded-[1.75rem] p-2.5 sm:p-3 flex flex-col lg:flex-row gap-3 w-full min-h-[calc(100vh-2rem)]">
        {/* Barra lateral compacta de iconos con sidebar-dock (z-index superior a todo el contenido) */}
        <aside className="glass-card sidebar-dock !rounded-3xl lg:w-[76px] shrink-0 flex lg:flex-col items-center gap-2 p-3 overflow-visible">
          <div className="nav-icon hidden lg:flex mb-2 w-11 h-11 rounded-full bg-blue-600 text-white items-center justify-center text-base font-bold shadow-md overflow-hidden ring-2 ring-white/80 dark:ring-emerald-400/50">
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.displayName}
                style={{ objectPosition: user.avatarPosition ?? 'center' }}
                className="w-full h-full object-cover"
              />
            ) : (
              user?.displayName.charAt(0).toUpperCase() ?? <UserCircle2 className="w-6 h-6" />
            )}
            <span className="nav-tip">
              {user?.displayName} {user?.role === 'ADMIN' ? '(Administrador)' : ''}
            </span>
          </div>

          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const showBadge =
              item.to === '/inventario' && inventoryResult.productsInReorderAlert > 0;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                aria-label={item.label}
                className={({ isActive }) =>
                  `nav-icon relative w-11 h-11 shrink-0 rounded-xl flex items-center justify-center transition-all ${isActive
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-500 hover:text-blue-600 hover:bg-white/60 dark:text-slate-400 dark:hover:bg-emerald-950/60'
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                {showBadge && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-rose-500 border border-white" />
                )}
                <span className="nav-tip">{item.label}</span>
              </NavLink>
            );
          })}

          {/* Controles inferiores: Botón de Tema (Claro / Oscuro Verde-Negro) arriba de Restaurar */}
          <div className="lg:mt-auto flex lg:flex-col items-center gap-2 pt-2 border-t border-white/40 dark:border-emerald-500/20">
            <button
              type="button"
              aria-label={isDark ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
              onClick={() => setIsDark((d) => !d)}
              className="nav-icon w-11 h-11 rounded-xl flex items-center justify-center text-blue-600 dark:text-emerald-400 bg-white/50 dark:bg-emerald-950/50 hover:bg-white dark:hover:bg-emerald-900/70 border border-white/70 dark:border-emerald-500/30 transition-all shadow-sm"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              <span className="nav-tip">
                {isDark ? 'Cambiar a Tema Claro' : 'Tema Oscuro (Verde / Negro)'}
              </span>
            </button>

            <button
              type="button"
              aria-label="Restaurar caso demostrativo"
              onClick={() => {
                if (
                  window.confirm(
                    '¿Restaurar todos los datos al Caso Demostrativo original?'
                  )
                ) {
                  resetDemoData();
                }
              }}
              className="nav-icon w-11 h-11 rounded-xl flex items-center justify-center text-amber-500 hover:bg-white/60 dark:hover:bg-emerald-950/60 transition-all"
            >
              <RotateCcw className="w-5 h-5" />
              <span className="nav-tip">Restaurar caso demostrativo</span>
            </button>

            <button
              type="button"
              aria-label="Cerrar sesión"
              onClick={logout}
              className="nav-icon w-11 h-11 rounded-xl flex items-center justify-center text-rose-500 hover:bg-white/60 dark:hover:bg-emerald-950/60 transition-all"
            >
              <LogOut className="w-5 h-5" />
              <span className="nav-tip">Cerrar sesión ({user?.displayName})</span>
            </button>
          </div>
        </aside>

        {/* Contenedor derecho con z-index inferior (z-10) para que los tooltips de aside nunca queden debajo */}
        <div className="relative z-10 flex-1 min-w-0 flex flex-col gap-4">
          <header className="glass-card px-5 py-3 flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                GFO • IS2122 • Sistema de Análisis y Planeación Financiera
              </span>
              <h2 className="text-base font-bold text-slate-900 leading-tight">
                {state.company.name}
              </h2>
              <p className="text-[11px] text-slate-500">
                {state.company.sector} • IR {activePeriod.taxRate}% • Moneda{' '}
                {state.company.currency}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.displayName}
                    style={{ objectPosition: user.avatarPosition ?? 'center' }}
                    className="w-5 h-5 rounded-full object-cover"
                  />
                ) : (
                  <UserCircle2 className="w-4 h-4" />
                )}
                {user?.displayName}
                {user?.role === 'ADMIN' && (
                  <span className="text-[10px] font-bold uppercase">· Admin</span>
                )}
              </span>
              <div
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${activeTotals.estaCuadrado
                  ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700/50'
                  : 'bg-rose-50 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-700/50'
                  }`}
              >
                {activeTotals.estaCuadrado ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" /> Balance cuadrado
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4" /> Descuadre C${' '}
                    {activeTotals.diferenciaCuadre.toLocaleString()}
                  </>
                )}
              </div>

              <label className="flex items-center gap-1.5 text-[11px] font-medium text-slate-600">
                Base
                <select
                  value={comparisonPeriod.id}
                  onChange={(e) => setComparisonPeriodId(e.target.value)}
                  className="border border-slate-200 px-2 py-1 text-xs font-semibold"
                >
                  {state.periods.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex items-center gap-1.5 text-[11px] font-bold text-blue-700">
                Activo
                <select
                  value={activePeriod.id}
                  onChange={(e) => setActivePeriodId(e.target.value)}
                  className="border border-blue-300 px-2 py-1 text-xs font-bold text-blue-800"
                >
                  {state.periods.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </header>

          <main className="flex-1 min-w-0 overflow-x-hidden">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};
