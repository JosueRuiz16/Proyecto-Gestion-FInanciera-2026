import React from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Boxes,
  Calculator,
  CheckCircle2,
  FileSpreadsheet,
  FolderKanban,
  Gauge,
  Scale,
  Wallet,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useFinancialSystem } from '../../app/providers/FinancialContext';
import { formatCurrency, formatPct } from '../../components/common/formatters';

const PURPLE = '#6d4aff';
const GREEN = '#22c55e';
const AMBER = '#f59e0b';
const PIE_COLORS = [PURPLE, GREEN, '#a78bfa', AMBER, '#38bdf8', '#ec4899'];

/** Anillo de progreso (0-100) similar a los indicadores "Profit" del diseño de referencia. */
const RingStat: React.FC<{ label: string; value: number | null; color: string }> = ({
  label,
  value,
  color,
}) => {
  const pct = Math.max(0, Math.min(100, value ?? 0));
  const r = 30;
  const c = 2 * Math.PI * r;
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-20 h-20">
        <svg viewBox="0 0 80 80" className="w-20 h-20 -rotate-90">
          <circle cx="40" cy="40" r={r} fill="none" stroke="#e9e5fb" strokeWidth="8" />
          <circle
            cx="40" cy="40" r={r} fill="none" stroke={color} strokeWidth="8" strokeLinecap="round"
            strokeDasharray={c} strokeDashoffset={c - (c * pct) / 100}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-xs font-extrabold text-slate-800">
          {value === null ? 'N/D' : `${value.toFixed(1)}%`}
        </span>
      </div>
      <span className="text-[11px] font-semibold text-slate-600 text-center leading-tight">{label}</span>
    </div>
  );
};

/** Medidor semicircular (0-100) para el margen de seguridad. */
const SemiGauge: React.FC<{ value: number }> = ({ value }) => {
  const pct = Math.max(0, Math.min(100, value));
  const len = Math.PI * 70;
  return (
    <div className="relative w-48 h-28 mx-auto">
      <svg viewBox="0 0 160 90" className="w-full h-full">
        <path d="M10 80 A70 70 0 0 1 150 80" fill="none" stroke="#e9e5fb" strokeWidth="12" strokeLinecap="round" />
        <path
          d="M10 80 A70 70 0 0 1 150 80" fill="none" stroke={pct >= 20 ? GREEN : AMBER} strokeWidth="12"
          strokeLinecap="round" strokeDasharray={len} strokeDashoffset={len - (len * pct) / 100}
        />
      </svg>
      <div className="absolute inset-x-0 bottom-0 text-center">
        <span className="text-2xl font-extrabold text-slate-900">{value.toFixed(1)}%</span>
      </div>
    </div>
  );
};

const CardTitle: React.FC<{ title: string; sub?: string; right?: React.ReactNode }> = ({
  title, sub, right,
}) => (
  <div className="flex items-start justify-between mb-3">
    <div>
      <h3 className="text-sm font-bold text-slate-900">{title}</h3>
      {sub && <p className="text-[11px] text-slate-500">{sub}</p>}
    </div>
    {right}
  </div>
);

export const DashboardPage: React.FC = () => {
  const {
    state,
    activePeriod,
    comparisonPeriod,
    activeTotals,
    comparisonTotals,
    ratios,
    duPont,
    cvuAndLeverage,
    cashFlowResult,
    masterBudgetAndProforma: pf,
    personalBudgetResult: pb,
    inventoryResult,
  } = useFinancialSystem();

  const ratio = (id: string) => ratios.find((r) => r.id === id)?.value ?? null;

  const trendData = [
    { name: comparisonPeriod.name, Ventas: comparisonTotals.ventasNetas, Utilidad: comparisonTotals.utilidadNeta },
    { name: activePeriod.name, Ventas: activeTotals.ventasNetas, Utilidad: activeTotals.utilidadNeta },
    { name: 'Proforma', Ventas: pf.projectedSalesRevenue, Utilidad: pf.proformaNetIncome },
  ];

  const inventoryBars = inventoryResult.items.map((i) => ({
    name: i.sku,
    valor: i.totalValue,
    alerta: i.needsReorder,
  }));

  const modules = [
    { to: '/finanzas/estados', title: 'Estados Financieros', icon: FileSpreadsheet, kpi: formatCurrency(activeTotals.totalActivos), sub: 'Total activos' },
    { to: '/finanzas/analisis', title: 'Análisis y DuPont', icon: BarChart3, kpi: formatPct(duPont.roeDuPontPct), sub: 'ROE' },
    { to: '/finanzas/punto-equilibrio', title: 'Punto de Equilibrio', icon: Scale, kpi: `${cvuAndLeverage.breakEvenUnits?.toLocaleString() ?? 'N/D'} u.`, sub: 'PE en unidades' },
    { to: '/finanzas/apalancamiento', title: 'Apalancamiento', icon: Gauge, kpi: `${cvuAndLeverage.gat ?? 'N/D'}x`, sub: 'GAT' },
    { to: '/finanzas/flujo-efectivo', title: 'Flujo de Efectivo', icon: Activity, kpi: formatCurrency(cashFlowResult.endingCashBalance), sub: 'Saldo final' },
    { to: '/finanzas/presupuestos', title: 'Presupuesto Maestro', icon: Calculator, kpi: formatCurrency(pf.projectedEndingCashBalance), sub: 'Caja proyectada' },
    { to: '/finanzas/proforma', title: 'Estados Proforma', icon: FolderKanban, kpi: formatCurrency(pf.proformaNetIncome), sub: 'Utilidad proforma' },
    { to: '/personal/presupuesto', title: 'Presupuesto Personal', icon: Wallet, kpi: formatPct(pb.savingsCapacityPct), sub: 'Capacidad de ahorro' },
    { to: '/inventario', title: 'Control de Inventario', icon: Boxes, kpi: formatCurrency(inventoryResult.totalInventoryValue), sub: 'Valor inventario' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      {/* Tendencia */}
      <section className="glass-card p-5 lg:col-span-6">
        <CardTitle
          title="Ventas y Utilidad Neta"
          sub={`${comparisonPeriod.name} → ${activePeriod.name} → Proforma`}
          right={<span className="text-[11px] px-2.5 py-1 rounded-full bg-blue-600 text-white font-semibold">C$</span>}
        />
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="gV" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={PURPLE} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={PURPLE} stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="gU" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={GREEN} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={GREEN} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e1f7" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip formatter={(v: number) => formatCurrency(v)} />
              <Area type="monotone" dataKey="Ventas" stroke={PURPLE} strokeWidth={3} fill="url(#gV)" />
              <Area type="monotone" dataKey="Utilidad" stroke={GREEN} strokeWidth={3} fill="url(#gU)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Márgenes (anillos) */}
      <section className="glass-card p-5 lg:col-span-3">
        <CardTitle title="Rentabilidad" sub={`Período ${activePeriod.name}`} />
        <div className="grid grid-cols-2 gap-3">
          <RingStat label="Margen bruto" value={ratio('margen_bruto')} color={PURPLE} />
          <RingStat label="Margen operativo" value={ratio('margen_operativo')} color="#a78bfa" />
          <RingStat label="Margen neto" value={ratio('margen_neto')} color={GREEN} />
          <RingStat label="ROE" value={ratio('roe')} color={AMBER} />
        </div>
      </section>

      {/* Medidor margen de seguridad */}
      <section className="glass-card p-5 lg:col-span-3">
        <CardTitle title="Margen de Seguridad" sub="Sobre el punto de equilibrio" />
        <SemiGauge value={cvuAndLeverage.safetyMarginPct} />
        <div className="mt-3 grid grid-cols-3 text-center text-[11px] text-slate-600">
          <div><b className="block text-sm text-slate-900">{cvuAndLeverage.gao ?? 'N/D'}x</b>GAO</div>
          <div><b className="block text-sm text-slate-900">{cvuAndLeverage.gaf ?? 'N/D'}x</b>GAF</div>
          <div><b className="block text-sm text-slate-900">{cvuAndLeverage.gat ?? 'N/D'}x</b>GAT</div>
        </div>
      </section>

      {/* KPIs */}
      <section className="glass-card p-5 lg:col-span-4">
        <CardTitle title="Indicadores Clave" sub="Resumen del período activo" />
        <ul className="space-y-3 text-xs">
          {[
            { label: 'Ventas netas', value: formatCurrency(activeTotals.ventasNetas), pct: 100, color: PURPLE },
            { label: 'Utilidad bruta', value: formatCurrency(activeTotals.utilidadBruta), pct: activeTotals.ventasNetas ? (activeTotals.utilidadBruta / activeTotals.ventasNetas) * 100 : 0, color: '#a78bfa' },
            { label: 'Utilidad operativa (UAII)', value: formatCurrency(activeTotals.uaii), pct: activeTotals.ventasNetas ? (activeTotals.uaii / activeTotals.ventasNetas) * 100 : 0, color: GREEN },
            { label: 'Utilidad neta', value: formatCurrency(activeTotals.utilidadNeta), pct: activeTotals.ventasNetas ? (activeTotals.utilidadNeta / activeTotals.ventasNetas) * 100 : 0, color: AMBER },
          ].map((row) => (
            <li key={row.label}>
              <div className="flex justify-between mb-1">
                <span className="text-slate-600 font-medium">{row.label}</span>
                <b className="text-slate-900">{row.value}</b>
              </div>
              <div className="h-2 rounded-full bg-violet-100 overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${Math.max(2, Math.min(100, row.pct))}%`, background: row.color }} />
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-[11px] text-slate-500 bg-white/60 rounded-xl p-2.5">{cvuAndLeverage.gatInterpretation}</p>
      </section>

      {/* Inventario */}
      <section className="glass-card p-5 lg:col-span-4">
        <CardTitle
          title="Valor de Inventario por Producto"
          sub="Naranja = alerta de reposición"
          right={
            inventoryResult.productsInReorderAlert > 0 ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                <AlertTriangle className="w-3 h-3" /> {inventoryResult.productsInReorderAlert}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                <CheckCircle2 className="w-3 h-3" /> OK
              </span>
            )
          }
        />
        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={inventoryBars}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e1f7" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip formatter={(v: number) => formatCurrency(v)} />
              <Bar dataKey="valor" radius={[6, 6, 0, 0]}>
                {inventoryBars.map((b, i) => (
                  <Cell key={i} fill={b.alerta ? AMBER : i % 2 ? GREEN : PURPLE} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="mt-2 text-[11px] text-slate-600">
          Compra sugerida: <b>{formatCurrency(inventoryResult.totalSuggestedPurchaseCost)}</b>
        </p>
      </section>

      {/* Presupuesto personal (separado del empresarial) */}
      <section className="glass-card p-5 lg:col-span-4">
        <CardTitle title="Gastos Personales" sub={`${state.personalBudget.monthLabel}`} />
        <div className="flex items-center gap-3">
          <div className="relative w-36 h-36 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pb.expensesByCategory} dataKey="amount" nameKey="category" innerRadius={42} outerRadius={64} paddingAngle={2}>
                  {pb.expensesByCategory.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-base font-extrabold text-slate-900">{formatPct(pb.savingsCapacityPct)}</span>
              <span className="text-[10px] text-slate-500">ahorro</span>
            </div>
          </div>
          <ul className="text-[11px] space-y-1.5 flex-1 min-w-0">
            {pb.expensesByCategory.slice(0, 4).map((c, i) => (
              <li key={c.category} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                <span className="truncate text-slate-600">{c.category}</span>
                <b className="ml-auto text-slate-900">{c.percentageOfExpenses.toFixed(0)}%</b>
              </li>
            ))}
            <li className="pt-1 border-t border-white/70 text-slate-600">
              Saldo: <b className="text-slate-900">{formatCurrency(pb.availableBalance)}</b>
            </li>
          </ul>
        </div>
      </section>

      {/* Accesos a módulos */}
      <section className="glass-card p-5 lg:col-span-12">
        <CardTitle title="Módulos del Sistema" sub="Acceso directo con su indicador principal" />
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
          {modules.map((m) => {
            const Icon = m.icon;
            return (
              <Link
                key={m.to}
                to={m.to}
                className="group rounded-2xl bg-white/70 hover:bg-white border border-white p-3.5 transition-all hover:shadow-glass"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="p-2 rounded-xl bg-violet-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <Icon className="w-4 h-4" />
                  </span>
                  <span className="text-xs font-bold text-slate-800 leading-tight">{m.title}</span>
                </div>
                <b className="block text-sm text-slate-900 truncate">{m.kpi}</b>
                <span className="text-[11px] text-slate-500">{m.sub}</span>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
};
