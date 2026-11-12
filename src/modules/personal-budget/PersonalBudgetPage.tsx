import React, { useMemo, useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  ClipboardList,
  Download,
  PlusCircle,
  Printer,
  Sparkles,
  Target,
  Trash2,
  TrendingUp,
  UserCheck,
  Wallet,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useFinancialSystem } from '../../app/providers/FinancialContext';
import { useAuth } from '../../app/providers/AuthContext';
import { APP_USERS } from '../../data/auth/users';
import { PERSONAL_BUDGET_OVERRIDES } from '../../data/seed/personalBudgets';
import { computePersonalBudget } from '../../core/finance/complementaryModules';
import { AcademicDefenseCard } from '../../components/common/AcademicDefenseCard';
import { formatCurrency, formatPct } from '../../components/common/formatters';
import {
  exportPersonalBudgetExcel,
  openPersonalBudgetReportPrintView,
} from '../../core/reports/executiveReportGenerator';

const PIE_COLORS = ['#2563eb', '#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#f43f5e'];

export const PersonalBudgetPage: React.FC = () => {
  const {
    state,
    addPersonalTransaction,
    removePersonalTransaction,
    updatePersonalSavingsGoal,
  } = useFinancialSystem();
  const { user } = useAuth();

  // Permite visualizar el presupuesto del usuario conectado o inspeccionar el de otro integrante
  const [selectedUserId, setSelectedUserId] = useState<string>(() => {
    if (user?.id && user.role === 'ESTUDIANTE') return user.id;
    return 'josue';
  });
  const [activeTab, setActiveTab] = useState<'TRACKING' | 'WEEKLY_LOG' | 'PROJECTED' | 'GENERAL'>(
    'TRACKING'
  );
  const [weekFilter, setWeekFilter] = useState<number | 'ALL'>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');

  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Alimentación');
  const [type, setType] = useState<'INGRESO' | 'GASTO'>('GASTO');
  const [amount, setAmount] = useState('');
  const [isFixed, setIsFixed] = useState(true);

  const isViewingOwnBudget = !user || selectedUserId === user.id;

  const activeBudgetData = useMemo(() => {
    const stored = state.personalBudgetsByUser?.[selectedUserId];
    const override = PERSONAL_BUDGET_OVERRIDES[selectedUserId];
    if (stored?.studentControl) {
      return stored;
    }
    if (override) {
      return override;
    }
    if (isViewingOwnBudget) {
      return state.personalBudget;
    }
    return stored ?? state.personalBudget;
  }, [isViewingOwnBudget, selectedUserId, state.personalBudget, state.personalBudgetsByUser]);

  const pb = useMemo(() => computePersonalBudget(activeBudgetData), [activeBudgetData]);
  const sc = activeBudgetData.studentControl;

  const filteredWeeklyRecords = useMemo(() => {
    if (!sc) return [];
    return sc.weeklyRecords.filter((r) => {
      if (weekFilter !== 'ALL' && r.week !== weekFilter) return false;
      if (typeFilter !== 'ALL' && r.movementType !== typeFilter) return false;
      return true;
    });
  }, [sc, weekFilter, typeFilter]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !amount) return;
    addPersonalTransaction({
      description: description.trim(),
      category: category.trim(),
      type,
      amount: Math.max(0, Number(amount)),
      isFixed,
    });
    setDescription('');
    setAmount('');
  };

  return (
    <div className="space-y-6">
      {/* Encabezado y Selector de Integrante */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
            Módulo Complementario Obligatorio H • Control de Presupuesto Personal y Estudiantil
          </span>
          <h1 className="text-xl font-bold text-slate-900">
            {sc
              ? `Mi Control de Presupuesto Estudiantil — ${sc.studentName}`
              : `Presupuesto Personal (${activeBudgetData.monthLabel})`}
          </h1>
          <p className="text-xs text-slate-600">
            {sc
              ? 'Registrar → revisar → ajustar → avanzar hacia la meta • Seguimiento real semanal, proyección y ahorro acumulado.'
              : 'Aplicación práctica de planificación de ingresos, clasificación de gastos por categorías, saldo disponible y capacidad de ahorro.'}
          </p>
        </div>

        {/* Selector de integrante y botones de exportación */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() =>
              openPersonalBudgetReportPrintView(
                activeBudgetData,
                pb,
                sc?.studentName || user?.displayName
              )
            }
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-colors"
            title="Generar e imprimir el reporte en PDF del presupuesto personal del integrante seleccionado"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Generar Reporte Personal</span>
          </button>

          <button
            type="button"
            onClick={() =>
              exportPersonalBudgetExcel(
                activeBudgetData,
                pb,
                sc?.studentName || user?.displayName
              )
            }
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold shadow-sm transition-colors"
            title="Descargar en Excel (.xls) el presupuesto personal completo del integrante seleccionado"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar Excel</span>
          </button>

          <div className="flex flex-wrap items-center gap-1.5 bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-[11px] font-bold text-slate-500 px-2 flex items-center gap-1">
              <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
              Integrante:
            </span>
            {APP_USERS.filter((u) => u.role === 'ESTUDIANTE').map((u) => {
              const hasCustom = Boolean(
                state.personalBudgetsByUser?.[u.id]?.studentControl ||
                  PERSONAL_BUDGET_OVERRIDES[u.id]?.studentControl
              );
              const active = selectedUserId === u.id;
              return (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => {
                    setSelectedUserId(u.id);
                    setWeekFilter('ALL');
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    active
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span>{u.displayName}</span>
                  {hasCustom && (
                    <span
                      className={`w-2 h-2 rounded-full ${
                        active ? 'bg-white' : 'bg-emerald-500'
                      }`}
                      title="Presupuesto estudiantil cargado"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* =====================================================================
          FICHA DE CONTROL ESTUDIANTIL (Cuando el usuario tiene studentControl, ej. Alejandra Abarca)
         ===================================================================== */}
      {sc && (
        <div className="space-y-5">
          {/* 1. Tarjeta Principal: DATOS DEL ESTUDIANTE + RESULTADOS AUTOMÁTICOS */}
          <div className="bg-white rounded-xl border border-emerald-200 shadow-sm overflow-hidden">
            <div className="px-5 py-3 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <h2 className="text-sm font-bold">
                  DATOS DEL ESTUDIANTE Y RESULTADOS AUTOMÁTICOS — {sc.studentName.toUpperCase()}
                </h2>
              </div>
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                Período: {sc.startDate} al {sc.endDate} ({sc.durationWeeks} semanas de plan)
              </span>
            </div>

            <div className="p-5 grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Columna Izquierda: Datos del Estudiante */}
              <div className="lg:col-span-5 bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2.5 text-xs">
                <div className="flex items-center gap-2 text-slate-900 font-extrabold text-xs uppercase tracking-wider border-b border-slate-200 pb-2">
                  <Target className="w-4 h-4 text-blue-600" />
                  <span>Datos del Estudiante y Meta Semestral</span>
                </div>
                <div className="grid grid-cols-2 gap-2 py-0.5">
                  <span className="text-slate-500 font-medium">Nombre:</span>
                  <span className="font-bold text-slate-900 text-right">{sc.studentName}</span>

                  <span className="text-slate-500 font-medium">Meta al final del semestre:</span>
                  <span className="font-bold text-emerald-700 text-right">{sc.semesterGoal}</span>

                  <span className="text-slate-500 font-medium">Costo de la meta:</span>
                  <span className="font-extrabold text-slate-900 text-right">
                    {formatCurrency(sc.goalCost)}
                  </span>

                  <span className="text-slate-500 font-medium">Duración del seguimiento:</span>
                  <span className="font-bold text-slate-800 text-right">
                    {sc.durationWeeks} semanas
                  </span>

                  <span className="text-slate-500 font-medium">Aporte semanal proyectado:</span>
                  <span className="font-bold text-blue-700 text-right">
                    {sc.recommendedWeeklyContribution
                      ? formatCurrency(sc.recommendedWeeklyContribution)
                      : 'Según disponibilidad'}
                  </span>

                  <span className="text-slate-500 font-medium">Inicio del seguimiento:</span>
                  <span className="font-semibold text-slate-800 text-right">{sc.startDate}</span>

                  <span className="text-slate-500 font-medium">Final del seguimiento:</span>
                  <span className="font-semibold text-slate-800 text-right">{sc.endDate}</span>
                </div>
              </div>

              {/* Columna Derecha: Resultados Automáticos */}
              <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200">
                  <span className="text-[11px] font-bold uppercase text-emerald-800">
                    Total de Ingresos
                  </span>
                  <p className="text-xl font-extrabold text-emerald-700 mt-1">
                    {formatCurrency(sc.autoTotalIncome)}
                  </p>
                  <span className="text-[11px] text-emerald-800/80">
                    {sc.weeklyTracking.length} semanas registradas
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200">
                  <span className="text-[11px] font-bold uppercase text-rose-800">
                    Total de Gastos
                  </span>
                  <p className="text-xl font-extrabold text-rose-700 mt-1">
                    {formatCurrency(sc.autoTotalExpenses)}
                  </p>
                  <span className="text-[11px] text-rose-800/80">
                    Gastos del período registrado
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200">
                  <span className="text-[11px] font-bold uppercase text-blue-800">
                    Ahorro para la Meta
                  </span>
                  <p className="text-xl font-extrabold text-blue-700 mt-1">
                    {formatCurrency(sc.autoTotalSavings)}
                  </p>
                  <span className="text-[11px] text-blue-800/80">
                    {sc.autoAugustSavings
                      ? `Ago: ${formatCurrency(sc.autoAugustSavings)} + Sep: C$ 5,500`
                      : `Meta: ${sc.semesterGoal} (${formatCurrency(sc.goalCost)})`}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200">
                  <span className="text-[11px] font-bold uppercase text-amber-800">
                    Reserva Acumulada
                  </span>
                  <p className="text-lg font-extrabold text-amber-700 mt-1">
                    {formatCurrency(sc.autoAccumulatedReserve)}
                  </p>
                  <span className="text-[11px] text-amber-800/80">
                    Fondo para imprevistos
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[11px] font-bold uppercase text-slate-600">
                    Saldo Disponible
                  </span>
                  <p className="text-lg font-extrabold text-slate-900 mt-1">
                    {formatCurrency(sc.autoAvailableBalance)}
                  </p>
                  <span className="text-[11px] text-slate-500">
                    100% asignado (Balanceado)
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-200">
                  <span className="text-[11px] font-bold uppercase text-indigo-800">
                    Cumplimiento de Meta
                  </span>
                  <p className="text-lg font-extrabold text-indigo-700 mt-1">
                    {(sc.autoGoalAchievementRatio * 100).toFixed(2)}%
                  </p>
                  <span className="text-[11px] text-indigo-800/80">
                    Meta superada ({formatCurrency(sc.autoTotalSavings)} / {formatCurrency(sc.goalCost)})
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Barra de Pestañas del Control Estudiantil */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('TRACKING')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                activeTab === 'TRACKING'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>1. Seguimiento Semanal (Semanas 1–{sc.weeklyTracking.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('WEEKLY_LOG')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                activeTab === 'WEEKLY_LOG'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <ClipboardList className="w-4 h-4" />
              <span>2. Registro Semanal Detallado ({sc.weeklyRecords.length} movs.)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('PROJECTED')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                activeTab === 'PROJECTED'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>3. Presupuesto Proyectado Semanal ({formatCurrency(sc.availableWeeklyIncome)})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('GENERAL')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                activeTab === 'GENERAL'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Wallet className="w-4 h-4" />
              <span>4. Resumen Consolidado y Editor</span>
            </button>
          </div>

          {/* PESTAÑA 1: SEGUIMIENTO SEMANAL DEL PRESUPUESTO */}
          {activeTab === 'TRACKING' && (
            <div className="space-y-5">
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-5 py-3.5 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-sm font-bold">
                    SEGUIMIENTO SEMANAL DEL PRESUPUESTO — {sc.studentName.toUpperCase()}
                  </h3>
                  <span className="text-xs text-emerald-300 font-medium">
                    Meta: {sc.semesterGoal} ({formatCurrency(sc.goalCost)})
                  </span>
                </div>
                <div className="p-4 bg-emerald-50 border-b border-emerald-200 text-xs text-emerald-900">
                  <strong>Nota de seguimiento:</strong> {sc.trackingNote}
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase text-slate-600">
                        <th className="px-3 py-2.5">Mes</th>
                        <th className="px-3 py-2.5">Semana</th>
                        <th className="px-3 py-2.5">Desde</th>
                        <th className="px-3 py-2.5">Hasta</th>
                        <th className="px-3 py-2.5 text-right">Ingresos</th>
                        <th className="px-3 py-2.5 text-right">Gastos</th>
                        <th className="px-3 py-2.5 text-right">Ahorro</th>
                        <th className="px-3 py-2.5 text-right">Reserva</th>
                        <th className="px-3 py-2.5 text-right">Saldo</th>
                        <th className="px-3 py-2.5 text-right">Ahorro Acum.</th>
                        <th className="px-3 py-2.5 text-right">% de la Meta</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sc.weeklyTracking.map((row) => (
                        <tr
                          key={`wk-${row.week}`}
                          className="border-b border-slate-100 hover:bg-slate-50"
                        >
                          <td className="px-3 py-2 font-semibold text-slate-700">Mes {row.month}</td>
                          <td className="px-3 py-2 font-bold text-slate-900">Semana {row.week}</td>
                          <td className="px-3 py-2 text-slate-600">{row.from}</td>
                          <td className="px-3 py-2 text-slate-600">{row.to}</td>
                          <td className="px-3 py-2 text-right font-bold text-emerald-700">
                            {formatCurrency(row.income)}
                          </td>
                          <td className="px-3 py-2 text-right font-bold text-rose-700">
                            {formatCurrency(row.expenses)}
                          </td>
                          <td className="px-3 py-2 text-right font-bold text-blue-700">
                            {formatCurrency(row.savings)}
                          </td>
                          <td className="px-3 py-2 text-right font-semibold text-amber-700">
                            {formatCurrency(row.reserve)}
                          </td>
                          <td
                            className={`px-3 py-2 text-right font-semibold ${
                              (row.balance ?? 0) < 0 ? 'text-rose-600' : 'text-slate-700'
                            }`}
                          >
                            {row.balance === null ? '—' : formatCurrency(row.balance)}
                          </td>
                          <td className="px-3 py-2 text-right font-extrabold text-indigo-700">
                            {formatCurrency(row.accumulatedSavings)}
                          </td>
                          <td className="px-3 py-2 text-right">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                                row.goalProgressPct >= 100
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : 'bg-blue-50 text-blue-700 border border-blue-200'
                              }`}
                            >
                              {row.goalProgressPct.toFixed(2)}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-slate-100 font-extrabold text-slate-900 border-t-2 border-slate-300">
                        <td colSpan={4} className="px-3 py-2.5">
                          TOTAL ACUMULADO ({sc.weeklyTracking.length} SEMANAS)
                        </td>
                        <td className="px-3 py-2.5 text-right text-emerald-700">
                          {formatCurrency(sc.autoTotalIncome)}
                        </td>
                        <td className="px-3 py-2.5 text-right text-rose-700">
                          {formatCurrency(sc.autoTotalExpenses)}
                        </td>
                        <td className="px-3 py-2.5 text-right text-blue-700">
                          {formatCurrency(sc.autoTotalSavings)}
                        </td>
                        <td className="px-3 py-2.5 text-right text-amber-700">
                          {formatCurrency(sc.autoAccumulatedReserve)}
                        </td>
                        <td className="px-3 py-2.5 text-right">
                          {formatCurrency(sc.autoAvailableBalance)}
                        </td>
                        <td className="px-3 py-2.5 text-right text-indigo-700">
                          {formatCurrency(sc.autoTotalSavings)}
                        </td>
                        <td className="px-3 py-2.5 text-right text-emerald-700">
                          {(sc.autoGoalAchievementRatio * 100).toFixed(2)}%
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Gráfico de Barras de Ingresos, Gastos y Ahorro Acumulado por Semana */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 mb-3">
                  Evolución Semanal: Ingresos vs. Gastos vs. Ahorro Acumulado (Semanas 1 a {sc.weeklyTracking.length})
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={sc.weeklyTracking.map((w) => ({
                        name: `Sem ${w.week}`,
                        Ingresos: w.income,
                        Gastos: w.expenses,
                        'Ahorro Acumulado': w.accumulatedSavings,
                      }))}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip formatter={(val: number) => formatCurrency(val)} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Bar dataKey="Ingresos" fill="#10b981" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Gastos" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Ahorro Acumulado" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* PESTAÑA 2: REGISTRO SEMANAL DETALLADO */}
          {activeTab === 'WEEKLY_LOG' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-5 py-3.5 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold">
                    REGISTRO SEMANAL — {sc.studentName.toUpperCase()}
                  </h3>
                  <p className="text-[11px] text-slate-300 mt-0.5">{sc.weeklyLogNote}</p>
                </div>
              </div>

              {/* Filtros por Semana y Tipo de Movimiento */}
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="font-bold text-slate-600 mr-1">Semana:</span>
                  <button
                    type="button"
                    onClick={() => setWeekFilter('ALL')}
                    className={`px-2.5 py-1 rounded-lg font-bold ${
                      weekFilter === 'ALL'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-slate-700 border border-slate-200'
                    }`}
                  >
                    Todas (1–{sc.weeklyTracking.length})
                  </button>
                  {sc.weeklyTracking.map((wk) => (
                    <button
                      key={wk.week}
                      type="button"
                      onClick={() => setWeekFilter(wk.week)}
                      className={`px-2.5 py-1 rounded-lg font-bold ${
                        weekFilter === wk.week
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-slate-700 border border-slate-200'
                      }`}
                    >
                      Sem {wk.week}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-600">Tipo:</span>
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-semibold"
                  >
                    <option value="ALL">Todos los movimientos</option>
                    <option value="Ingreso">Ingreso</option>
                    <option value="Gasto">Gasto</option>
                    <option value="Ahorro">Ahorro</option>
                    <option value="Reserva">Reserva</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto max-h-[540px]">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="sticky top-0 bg-slate-100 z-10">
                    <tr className="border-b border-slate-200 text-[11px] font-bold uppercase text-slate-600">
                      <th className="px-3 py-2.5">Fecha</th>
                      <th className="px-3 py-2.5">Sem</th>
                      <th className="px-3 py-2.5">Periodo (Lun–Dom)</th>
                      <th className="px-3 py-2.5">Tipo</th>
                      <th className="px-3 py-2.5">Categoría</th>
                      <th className="px-3 py-2.5">Descripción</th>
                      <th className="px-3 py-2.5 text-right">Monto</th>
                      <th className="px-3 py-2.5">Prioridad</th>
                      <th className="px-3 py-2.5">Medio</th>
                      <th className="px-3 py-2.5">Observación</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredWeeklyRecords.map((r) => (
                      <tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="px-3 py-2 font-mono text-slate-700 whitespace-nowrap">
                          {r.date}
                        </td>
                        <td className="px-3 py-2 font-bold text-slate-900 text-center">
                          {r.week}
                        </td>
                        <td className="px-3 py-2 text-[11px] text-slate-500 whitespace-nowrap">
                          {r.fromMonday} → {r.toSunday}
                        </td>
                        <td className="px-3 py-2">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              r.movementType === 'Ingreso'
                                ? 'bg-emerald-100 text-emerald-800'
                                : r.movementType === 'Ahorro'
                                ? 'bg-blue-100 text-blue-800'
                                : r.movementType === 'Reserva'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {r.movementType}
                          </span>
                        </td>
                        <td className="px-3 py-2 font-semibold text-slate-800">{r.category}</td>
                        <td className="px-3 py-2 text-slate-700">{r.description}</td>
                        <td
                          className={`px-3 py-2 text-right font-bold whitespace-nowrap ${
                            r.movementType === 'Ingreso'
                              ? 'text-emerald-700'
                              : r.movementType === 'Ahorro'
                              ? 'text-blue-700'
                              : r.movementType === 'Reserva'
                              ? 'text-amber-700'
                              : 'text-rose-700'
                          }`}
                        >
                          {formatCurrency(r.amount)}
                        </td>
                        <td className="px-3 py-2 text-slate-600">{r.priority}</td>
                        <td className="px-3 py-2 text-slate-600">{r.medium}</td>
                        <td className="px-3 py-2 text-slate-500 text-[11px]">{r.observation}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* PESTAÑA 3: PRESUPUESTO PROYECTADO SEMANAL */}
          {activeTab === 'PROJECTED' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              <div className="lg:col-span-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3 text-xs">
                <h3 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2">
                  PRESUPUESTO PROYECTADO: {sc.studentName.toUpperCase()}
                </h3>
                <p className="text-slate-600">{sc.projectedNote}</p>

                <div className="space-y-2 pt-1">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Tipo de proyección:</span>
                    <span className="font-bold text-slate-900">{sc.projectionType}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Ingreso semanal disponible:</span>
                    <span className="font-extrabold text-emerald-700">
                      {formatCurrency(sc.availableWeeklyIncome)}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Frecuencia:</span>
                    <span className="font-bold text-slate-900">{sc.frequency}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Total asignado:</span>
                    <span className="font-bold text-slate-900">
                      {formatCurrency(sc.totalAssigned)} ({sc.assignedPct}%)
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Diferencia:</span>
                    <span className="font-bold text-emerald-700">
                      {formatCurrency(sc.projectedDifference)}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Estado:</span>
                    <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
                      <CheckCircle2 className="w-3.5 h-3.5" /> {sc.projectedStatus}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Ahorro semanal proyectado:</span>
                    <span className="font-extrabold text-blue-700">
                      {formatCurrency(sc.projectedSavings)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-5 py-3.5 bg-slate-900 text-white">
                  <h3 className="text-sm font-bold">
                    Distribución del Presupuesto Semanal Planificado (C$ 1,500.00)
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase text-slate-600">
                        <th className="px-4 py-2.5">Categoría</th>
                        <th className="px-4 py-2.5 text-right">Monto Planificado</th>
                        <th className="px-4 py-2.5 text-right">% del Ingreso</th>
                        <th className="px-4 py-2.5">Tipo</th>
                        <th className="px-4 py-2.5">Comentario</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sc.projectedCategories.map((c, idx) => (
                        <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="px-4 py-2 font-bold text-slate-900">{c.category}</td>
                          <td className="px-4 py-2 text-right font-bold text-slate-800">
                            {formatCurrency(c.plannedAmount)}
                          </td>
                          <td className="px-4 py-2 text-right font-semibold text-blue-700">
                            {c.incomePct.toFixed(2)}%
                          </td>
                          <td className="px-4 py-2">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                c.type === 'Necesidad'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : c.type === 'Ahorro'
                                  ? 'bg-blue-100 text-blue-800'
                                  : c.type === 'Reserva'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-purple-100 text-purple-800'
                              }`}
                            >
                              {c.type}
                            </span>
                          </td>
                          <td className="px-4 py-2 text-slate-600">{c.comment}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =====================================================================
          VISTA CONSOLIDADA / EDITOR GENERAL (Siempre visible si no hay studentControl
          o cuando se selecciona la pestaña 4 "Resumen Consolidado y Editor")
         ===================================================================== */}
      {(!sc || activeTab === 'GENERAL') && (
        <>
          <AcademicDefenseCard
            moduleTitle="Presupuesto Personal (Ingresos, Gastos, Ahorro y Saldo Disponible)"
            unitReference="Aplicación Práctica Complementaria"
            codeFileLocation="src/core/finance/complementaryModules.ts -> computePersonalBudget()"
            formulas={[
              {
                label: 'Total de Ingresos y Total de Gastos',
                formula:
                  'Total Ingresos = Σ Ingresos | Total Gastos = Σ Gastos Fijos + Σ Gastos Variables',
                meaning:
                  'Agrupa todas las fuentes de ingreso y clasifica los desembolsos por categoría.',
              },
              {
                label: 'Saldo Disponible y Capacidad de Ahorro (%)',
                formula:
                  'Saldo Disponible = Total Ingresos - Total Gastos | % Ahorro = (Saldo Disponible / Total Ingresos) × 100',
                meaning:
                  'Mide qué porcentaje del ingreso queda libre para ahorro o meta personal sin comprometer las finanzas empresariales.',
              },
            ]}
          />

          {/* Tarjetas de Resumen */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs font-medium text-slate-500">Total de Ingresos</span>
              <p className="text-xl font-extrabold text-emerald-700 mt-1">
                {formatCurrency(pb.totalIncome)}
              </p>
              <span className="text-[11px] text-slate-500">100% Base de ingresos del período</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs font-medium text-slate-500">Total de Gastos</span>
              <p className="text-xl font-extrabold text-rose-700 mt-1">
                {formatCurrency(pb.totalExpenses)}
              </p>
              <span className="text-[11px] text-slate-500">
                Fijos: {formatCurrency(pb.fixedExpenses)} • Variables:{' '}
                {formatCurrency(pb.variableExpenses)}
              </span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-blue-200 shadow-sm">
              <span className="text-xs font-medium text-slate-500">
                Flujo Libre para Ahorro y Reserva
              </span>
              <p
                className={`text-xl font-extrabold mt-1 ${
                  pb.availableBalance >= 0 ? 'text-blue-700' : 'text-rose-700'
                }`}
              >
                {formatCurrency(pb.availableBalance)}
              </p>
              <span className="text-[11px] text-slate-600">
                Meta ({activeBudgetData.savingsGoalPct}%):{' '}
                {formatCurrency(pb.recommendedSavingsAmount)}
              </span>
            </div>

            <div className="bg-slate-900 text-white p-4 rounded-xl shadow-sm">
              <span className="text-xs font-medium text-emerald-300">
                Capacidad de Ahorro / Reserva (%)
              </span>
              <p className="text-xl font-extrabold text-white mt-1">
                {formatPct(pb.savingsCapacityPct)}
              </p>
              {isViewingOwnBudget && (
                <div className="flex items-center gap-2 mt-1">
                  <label className="text-[11px] text-slate-300">Meta %:</label>
                  <input
                    type="number"
                    min={0}
                    max={90}
                    value={activeBudgetData.savingsGoalPct}
                    onChange={(e) => updatePersonalSavingsGoal(Number(e.target.value))}
                    className="w-16 bg-slate-800 border border-slate-700 rounded px-1.5 py-0.5 text-xs text-white font-bold"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Tabla de Movimientos Personales */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-5 py-3.5 bg-slate-900 text-white">
                <h2 className="text-sm font-bold">
                  Registro Consolidado de Ingresos y Gastos por Categoría
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase text-slate-500">
                      <th className="px-4 py-2.5">Descripción</th>
                      <th className="px-4 py-2.5">Categoría</th>
                      <th className="px-4 py-2.5">Tipo</th>
                      <th className="px-4 py-2.5 text-right">Monto (C$)</th>
                      {isViewingOwnBudget && <th className="px-4 py-2.5 text-right">Acción</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {activeBudgetData.transactions.map((t) => (
                      <tr key={t.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="px-4 py-2 font-medium text-slate-900">{t.description}</td>
                        <td className="px-4 py-2 text-slate-600">{t.category}</td>
                        <td className="px-4 py-2">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              t.type === 'INGRESO'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}
                          >
                            {t.type} ({t.isFixed ? 'Fijo' : 'Variable'})
                          </span>
                        </td>
                        <td
                          className={`px-4 py-2 text-right font-bold ${
                            t.type === 'INGRESO' ? 'text-emerald-700' : 'text-rose-700'
                          }`}
                        >
                          {formatCurrency(t.amount)}
                        </td>
                        {isViewingOwnBudget && (
                          <td className="px-4 py-2 text-right">
                            <button
                              type="button"
                              onClick={() => removePersonalTransaction(t.id)}
                              className="text-slate-400 hover:text-rose-600 p-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="p-4 bg-slate-50 border-t border-slate-200 text-xs text-slate-700">
                <strong>Diagnóstico del Presupuesto Personal:</strong> {pb.interpretation}
              </div>
            </div>

            {/* Gráfico de distribución de gastos y formulario */}
            <div className="space-y-6">
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 mb-2">
                  Distribución de Gastos por Categoría
                </h3>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pb.expensesByCategory}
                        dataKey="amount"
                        nameKey="category"
                        cx="50%"
                        cy="50%"
                        outerRadius={70}
                        label={({ percentageOfExpenses }) => `${percentageOfExpenses}%`}
                      >
                        {pb.expensesByCategory.map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={PIE_COLORS[index % PIE_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip formatter={(val: number) => formatCurrency(val)} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {isViewingOwnBudget && (
                <form
                  onSubmit={handleAdd}
                  className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <PlusCircle className="w-4 h-4 text-blue-600" />
                    <h3 className="text-sm font-bold text-slate-900">
                      Agregar Ingreso o Gasto Personal
                    </h3>
                  </div>
                  <div>
                    <label className="block font-medium text-slate-600 mb-1">Descripción</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Pasajes o recarga de datos"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full border border-slate-300 rounded-lg px-3 py-1.5"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-medium text-slate-600 mb-1">Tipo</label>
                      <select
                        value={type}
                        onChange={(e) => setType(e.target.value as 'INGRESO' | 'GASTO')}
                        className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5"
                      >
                        <option value="GASTO">Gasto (-)</option>
                        <option value="INGRESO">Ingreso (+)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-medium text-slate-600 mb-1">Categoría</label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5"
                      >
                        <option value="Alimentación">Alimentación</option>
                        <option value="Transporte">Transporte</option>
                        <option value="Datos/Internet">Datos/Internet</option>
                        <option value="Copias y materiales">Copias y materiales</option>
                        <option value="Personal/Ocio">Personal/Ocio</option>
                        <option value="Fiestas patronales">Fiestas patronales</option>
                        <option value="Apoyo familiar">Apoyo familiar</option>
                        <option value="Ingreso extraordinario">Ingreso extraordinario</option>
                        <option value="Salud">Salud</option>
                        <option value="Vivienda y Servicios">Vivienda y Servicios</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 items-center">
                    <div>
                      <label className="block font-medium text-slate-600 mb-1">Monto (C$)</label>
                      <input
                        type="number"
                        required
                        min={1}
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full border border-slate-300 rounded-lg px-3 py-1.5"
                      />
                    </div>
                    <label className="flex items-center gap-2 pt-5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isFixed}
                        onChange={(e) => setIsFixed(e.target.checked)}
                      />
                      <span>Es rubro fijo</span>
                    </label>
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors"
                  >
                    Registrar en Presupuesto Personal
                  </button>
                </form>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
