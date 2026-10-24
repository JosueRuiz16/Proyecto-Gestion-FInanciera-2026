import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
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
  Menu,
  Moon,
  RotateCcw,
  Scale,
  Sun,
  Wallet,
  UserCircle2,
  X,
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
    clearForNewCase,
  } = useFinancialSystem();
  const { user, logout } = useAuth();
  const location = useLocation();

  // Tema claro/oscuro: aplica la clase 'dark' en <html> y persiste en localStorage
  const [isDark, setIsDark] = useState<boolean>(
    () => localStorage.getItem('gfo_theme') === 'dark'
  );
  // Menú de pantalla completa en móvil
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('gfo_theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  // Cierra automáticamente el menú móvil al cambiar de ruta
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const currentModule =
    NAV_ITEMS.find((item) => location.pathname.startsWith(item.to)) ?? NAV_ITEMS[0];
  const CurrentModuleIcon = currentModule.icon;

  return (
    <div className="min-h-screen p-1 sm:p-3 lg:p-4 overflow-x-hidden">
      <div className="glass-frame rounded-[1.5rem] sm:rounded-[1.75rem] p-2 sm:p-3 flex flex-col lg:flex-row gap-2 lg:gap-3 w-full min-h-[calc(100vh-0.5rem)] sm:min-h-[calc(100vh-2rem)]">
        {/* =====================================================================
            1. BARRA SUPERIOR COMPACTA PARA MÓVIL (lg:hidden)
            Evita que los iconos se desborden horizontalmente y abre el menú
            de pantalla completa con fondo translúcido.
           ===================================================================== */}
        <div className="glass-card flex lg:hidden items-center justify-between px-2.5 py-1.5 gap-2">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-sm active:scale-95 transition-transform"
          >
            <Menu className="w-4 h-4" />
            <span className="truncate max-w-[175px] sm:max-w-xs">
              {currentModule.label}
            </span>
            {inventoryResult.productsInReorderAlert > 0 && (
              <span className="w-2 h-2 rounded-full bg-rose-400" />
            )}
          </button>

          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label={isDark ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
              onClick={() => setIsDark((d) => !d)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-blue-600 dark:text-emerald-400 bg-white/60 dark:bg-emerald-950/60 border border-slate-200 dark:border-emerald-500/30"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
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
              className="w-8 h-8 rounded-lg flex items-center justify-center text-amber-500 bg-white/60 dark:bg-emerald-950/60 border border-slate-200 dark:border-emerald-500/30"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              type="button"
              aria-label="Cerrar sesión"
              onClick={logout}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-rose-500 bg-white/60 dark:bg-emerald-950/60 border border-slate-200 dark:border-emerald-500/30"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* =====================================================================
            2. MENÚ MÓVIL A PANTALLA COMPLETA TRANSLÚCIDO (Estilo Overlay)
            Deja ver ligeramente el fondo desenfocado, lista centrada de módulos
            y botón circular "X" abajo para cerrar, con márgenes reducidos.
           ===================================================================== */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-[100000] lg:hidden bg-slate-950/85 dark:bg-black/88 backdrop-blur-md flex flex-col items-center justify-center gap-2 px-4 py-2 text-white animate-fadeIn">
            {/* Encabezado compacto del overlay con foto y nombre del usuario */}
            <div className="w-full max-w-xs flex items-center justify-between border-b border-white/15 pb-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-emerald-400/70 bg-blue-600 flex items-center justify-center text-xs font-bold">
                  {user?.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.displayName}
                      style={{ objectPosition: user.avatarPosition ?? 'center' }}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    user?.displayName.charAt(0).toUpperCase()
                  )}
                </div>
                <div>
                  <p className="text-xs font-bold text-white leading-tight">{user?.displayName}</p>
                  <p className="text-[10px] text-slate-300 leading-tight">
                    Selecciona un módulo
                  </p>
                </div>
              </div>
              <CurrentModuleIcon className="w-4 h-4 text-emerald-400" />
            </div>

            {/* Lista central vertical de todos los módulos con menor margen */}
            <nav className="w-full max-w-xs py-1 overflow-y-auto max-h-[76vh] flex flex-col items-center gap-1">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const showBadge =
                  item.to === '/inventario' &&
                  inventoryResult.productsInReorderAlert > 0;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `w-full px-3 py-1.5 rounded-xl flex items-center justify-center gap-2 text-center transition-all ${isActive
                        ? 'text-white font-extrabold text-sm bg-white/15 border border-white/25 shadow-md'
                        : 'text-slate-300/85 hover:text-white font-medium text-xs hover:bg-white/5'
                      }`
                    }
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0 opacity-85" />
                    <span>{item.label}</span>
                    {showBadge && (
                      <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-rose-500 text-white">
                        {inventoryResult.productsInReorderAlert}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </nav>

            {/* Botón inferior de cierre "X" compacto */}
            <div className="w-full max-w-xs pt-1.5 border-t border-white/15 flex flex-col items-center gap-0.5">
              <button
                type="button"
                aria-label="Cerrar menú"
                onClick={() => setMobileMenuOpen(false)}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/25 flex items-center justify-center text-white transition-transform active:scale-90"
              >
                <X className="w-5 h-5" />
              </button>
              <span className="text-[10px] text-slate-400">Cerrar</span>
            </div>
          </div>
        )}

        {/* =====================================================================
            3. BARRA LATERAL DE ESCRITORIO (Solo visible en PC: hidden lg:flex)
           ===================================================================== */}
        <aside className="glass-card sidebar-dock !rounded-3xl hidden lg:flex lg:w-[76px] shrink-0 flex-col items-center gap-2 p-3 overflow-visible">
          <div className="nav-icon flex mb-2 w-11 h-11 rounded-full bg-blue-600 text-white items-center justify-center text-base font-bold shadow-md overflow-hidden ring-2 ring-white/80 dark:ring-emerald-400/50">
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.displayName}
                style={{ objectPosition: user.avatarPosition ?? 'center' }}
                className="w-full h-full object-cover"
              />
            ) : (
              user?.displayName.charAt(0).toUpperCase() ?? (
                <UserCircle2 className="w-6 h-6" />
              )
            )}
            <span className="nav-tip">
              {user?.displayName} {user?.role === 'ADMIN' ? '(Administrador)' : ''}
            </span>
          </div>

          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const showBadge =
              item.to === '/inventario' &&
              inventoryResult.productsInReorderAlert > 0;
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

          <div className="mt-auto flex flex-col items-center gap-2 pt-2 border-t border-white/40 dark:border-emerald-500/20">
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

        {/* Contenedor derecho con z-index inferior (z-10) */}
        <div className="relative z-10 flex-1 min-w-0 flex flex-col gap-2 sm:gap-4">
          <header className="glass-card px-3 sm:px-5 py-2 sm:py-3 flex flex-wrap items-center justify-between gap-2 sm:gap-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                GFO • IS2122 • Sistema de Análisis y Planeación Financiera
              </span>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                {state.company.name}
              </h2>
              <p className="text-[11px] text-slate-500">
                {state.company.sector} • IR {activePeriod.taxRate}% • Moneda{' '}
                {state.company.currency}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
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

              <button
                type="button"
                onClick={() => {
                  if (
                    window.confirm(
                      '¿Cargar todos los datos del Ejemplo del PDF (Corporación Agrícola, S. A. y subsidiarias 2023-2024) en todos los módulos?'
                    )
                  ) {
                    resetDemoData();
                  }
                }}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-colors"
                title="Cargar todos los datos del PDF (Corporación Agrícola, S.A. 2023-2024)"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Cargar Ejemplo</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (
                    window.confirm(
                      '¿Limpiar los datos actuales para llenar un nuevo caso / otra empresa desde cero?'
                    )
                  ) {
                    clearForNewCase();
                  }
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-emerald-950/70 dark:hover:bg-emerald-900/70 text-slate-700 dark:text-emerald-200 border border-slate-300 dark:border-emerald-700/50 transition-colors"
                title="Poner cuentas en cero para ingresar cualquier otro caso"
              >
                <span>Nuevo Caso</span>
              </button>

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
