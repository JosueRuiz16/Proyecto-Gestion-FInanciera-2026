import React, { useState } from 'react';
import { PlusCircle, ShieldAlert, Trash2 } from 'lucide-react';
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { useFinancialSystem } from '../../app/providers/FinancialContext';
import { AcademicDefenseCard } from '../../components/common/AcademicDefenseCard';
import { formatCurrency, formatPct } from '../../components/common/formatters';

const PIE_COLORS = ['#2563eb', '#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

export const PersonalBudgetPage: React.FC = () => {
  const {
    state,
    personalBudgetResult: pb,
    addPersonalTransaction,
    removePersonalTransaction,
    updatePersonalSavingsGoal,
  } = useFinancialSystem();

  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Alimentación');
  const [type, setType] = useState<'INGRESO' | 'GASTO'>('GASTO');
  const [amount, setAmount] = useState('');
  const [isFixed, setIsFixed] = useState(true);

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
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
            Módulo Complementario Obligatorio H • Independiente del Empresarial
          </span>
          <h1 className="text-xl font-bold text-slate-900">
            Presupuesto Personal Mensual ({state.personalBudget.monthLabel})
          </h1>
          <p className="text-xs text-slate-600">
            Aplicación práctica de planificación de ingresos, clasificación de gastos por
            categorías, saldo disponible y capacidad de ahorro.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3.5 py-2 rounded-xl text-xs text-emerald-900">
          <ShieldAlert className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            <strong>Nota de Privacidad (Guía GFO 2026):</strong> Datos personales ficticios
            cargados con fines demostrativos.
          </span>
        </div>
      </div>

      <AcademicDefenseCard
        moduleTitle="Presupuesto Personal (Ingresos, Gastos, Ahorro y Saldo Disponible)"
        unitReference="Aplicación Práctica Complementaria"
        codeFileLocation="src/core/finance/complementaryModules.ts -> computePersonalBudget()"
        formulas={[
          {
            label: 'Total de Ingresos y Total de Gastos',
            formula: 'Total Ingresos = Σ Ingresos | Total Gastos = Σ Gastos Fijos + Σ Gastos Variables',
            meaning:
              'Agrupa todas las fuentes de ingreso mensual y clasifica los desembolsos por categoría.',
          },
          {
            label: 'Saldo Disponible y Capacidad de Ahorro (%)',
            formula: 'Saldo Disponible = Total Ingresos - Total Gastos | % Ahorro = (Saldo Disponible / Total Ingresos) × 100',
            meaning:
              'Mide qué porcentaje del ingreso mensual queda libre para ahorro o inversión personal sin comprometer las finanzas empresariales.',
          },
        ]}
      />

      {/* Tarjetas de Resumen Mensual */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-medium text-slate-500">Total de Ingresos</span>
          <p className="text-xl font-extrabold text-emerald-700 mt-1">
            {formatCurrency(pb.totalIncome)}
          </p>
          <span className="text-[11px] text-slate-500">100% Base de ingreso mensual</span>
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
            Saldo Disponible (Ahorro Neto)
          </span>
          <p
            className={`text-xl font-extrabold mt-1 ${pb.availableBalance >= 0 ? 'text-blue-700' : 'text-rose-700'
              }`}
          >
            {formatCurrency(pb.availableBalance)}
          </p>
          <span className="text-[11px] text-slate-600">
            Meta ({state.personalBudget.savingsGoalPct}%):{' '}
            {formatCurrency(pb.recommendedSavingsAmount)}
          </span>
        </div>

        <div className="bg-slate-900 text-white p-4 rounded-xl shadow-sm">
          <span className="text-xs font-medium text-emerald-300">
            Capacidad de Ahorro (%)
          </span>
          <p className="text-xl font-extrabold text-white mt-1">
            {formatPct(pb.savingsCapacityPct)}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <label className="text-[11px] text-slate-300">Meta %:</label>
            <input
              type="number"
              min={0}
              max={90}
              value={state.personalBudget.savingsGoalPct}
              onChange={(e) => updatePersonalSavingsGoal(Number(e.target.value))}
              className="w-16 bg-slate-800 border border-slate-700 rounded px-1.5 py-0.5 text-xs text-white font-bold"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tabla de Movimientos Personales */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 bg-slate-900 text-white">
            <h2 className="text-sm font-bold">
              Registro de Ingresos y Gastos Personales por Categoría
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
                  <th className="px-4 py-2.5 text-right">Acción</th>
                </tr>
              </thead>
              <tbody>
                {state.personalBudget.transactions.map((t) => (
                  <tr key={t.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-2 font-medium text-slate-900">
                      {t.description}
                    </td>
                    <td className="px-4 py-2 text-slate-600">{t.category}</td>
                    <td className="px-4 py-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${t.type === 'INGRESO'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                      >
                        {t.type} ({t.isFixed ? 'Fijo' : 'Variable'})
                      </span>
                    </td>
                    <td
                      className={`px-4 py-2 text-right font-bold ${t.type === 'INGRESO' ? 'text-emerald-700' : 'text-rose-700'
                        }`}
                    >
                      {formatCurrency(t.amount)}
                    </td>
                    <td className="px-4 py-2 text-right">
                      <button
                        type="button"
                        onClick={() => removePersonalTransaction(t.id)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
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
              <label className="block font-medium text-slate-600 mb-1">
                Descripción
              </label>
              <input
                type="text"
                required
                placeholder="Ej. Pago de curso de inglés"
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
                  <option value="Vivienda y Servicios">Vivienda y Servicios</option>
                  <option value="Alimentación">Alimentación</option>
                  <option value="Transporte">Transporte</option>
                  <option value="Educación">Educación</option>
                  <option value="Salud">Salud</option>
                  <option value="Recreación">Recreación</option>
                  <option value="Salario Principal">Salario Principal</option>
                  <option value="Ingresos Extra">Ingresos Extra</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 items-center">
              <div>
                <label className="block font-medium text-slate-600 mb-1">
                  Monto (C$)
                </label>
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
        </div>
      </div>
    </div>
  );
};

