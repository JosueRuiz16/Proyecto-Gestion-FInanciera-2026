import React, { useState } from 'react';
import {
  Clock,
  TrendingDown,
  TrendingUp,
  Boxes,
  Users,
  Building2,
  Coins,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Info,
} from 'lucide-react';
import { useFinancialSystem } from '../../app/providers/FinancialContext';
import { AcademicDefenseCard } from '../../components/common/AcademicDefenseCard';
import { formatCurrency, formatNumber } from '../../components/common/formatters';
import { simulateCceSensitivity } from '../../core/finance/cashConversionCycle';

export const CashConversionCyclePage: React.FC = () => {
  const {
    activePeriod,
    comparisonPeriod,
    cashConversionCycle: cceAct,
    comparisonCashConversionCycle: cceComp,
  } = useFinancialSystem();

  // Estados del Simulador de Sensibilidad Operativa
  const [deltaInv, setDeltaInv] = useState<number>(-5);
  const [deltaCobro, setDeltaCobro] = useState<number>(-10);
  const [deltaPago, setDeltaPago] = useState<number>(15);

  const sim = simulateCceSensitivity(cceAct, deltaInv, deltaCobro, deltaPago);

  // Variaciones entre períodos
  const deltaCcePeriodos = Number(
    (cceAct.cicloConversionEfectivo - cceComp.cicloConversionEfectivo).toFixed(1)
  );

  return (
    <div className="space-y-6">
      {/* Encabezado del Módulo */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
            Módulo K • Unidad 2 y 3: Administración del Capital de Trabajo
          </span>
          <h1 className="text-xl font-bold text-slate-900">
            Ciclo de Conversión de Efectivo (CCE / Cash Conversion Cycle)
          </h1>
          <p className="text-xs text-slate-600">
            Medición integral de la liquidez dinámica: evalúa cuántos días transcurren desde que se
            desembolsa el efectivo para inventario hasta que se recupera mediante la cobranza.
          </p>
        </div>
      </div>

      {/* Tarjeta de Fórmulas Académicas para Defensa */}
      <AcademicDefenseCard
        moduleTitle="Ciclo de Conversión de Efectivo y Ciclo Operativo"
        unitReference="Unidad 2 y 3: Administración Financiera del Capital de Trabajo"
        codeFileLocation="src/core/finance/cashConversionCycle.ts -> computeCashConversionCycle()"
        formulas={[
          {
            label: '1. Periodo de Conversión de Inventario (PCI / Días de Inventario)',
            formula: 'PCI = (Inventario Promedio / Costo de Ventas) × 360',
            meaning:
              'Días promedio que tarda la empresa en convertir la mercadería/materia prima en productos terminados y venderlos.',
          },
          {
            label: '2. Periodo de Cobro de Cuentas por Cobrar (PCC / Días de Cobro)',
            formula: 'PCC = (Cuentas por Cobrar / Ventas Netas) × 360',
            meaning:
              'Días promedio que tardan los clientes en pagar sus compras a crédito.',
          },
          {
            label: '3. Ciclo Operativo (CO)',
            formula: 'Ciclo Operativo = PCI + PCC',
            meaning:
              'Tiempo total desde que ingresa la mercadería hasta que se cobra en efectivo la venta.',
          },
          {
            label: '4. Periodo de Diferimiento de Cuentas por Pagar (PDP / Días de Pago)',
            formula: 'PDP = (Cuentas por Pagar / Costo de Ventas) × 360',
            meaning:
              'Días que conceden los proveedores comerciales antes de exigir el desembolso en efectivo.',
          },
          {
            label: '5. Ciclo de Conversión de Efectivo (CCE / CCC)',
            formula: 'CCE = Ciclo Operativo - Días de Pago = PCI + PCC - PDP',
            meaning:
              'Días netos en que el dinero de la empresa está inmovilizado y debe financiarse con deuda bancaria o capital propio.',
          },
          {
            label: '6. Recursos Financieros Requeridos por el Ciclo',
            formula: 'Financiamiento Requerido = CCE × Desembolso Diario Promedio',
            meaning:
              'Monto de capital de trabajo en efectivo que la empresa debe sostener para operar sin quebrar.',
          },
        ]}
      />

      {/* Tarjetas Principales de los 5 Indicadores del Ciclo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* PCI: Inventario */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1.5">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase">1. Días Inventario (PCI)</span>
            <Boxes className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {cceAct.diasInventario}{' '}
            <span className="text-xs font-semibold text-slate-500">días</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Rotación: <strong>{cceAct.rotacionInventario} veces/año</strong>
          </p>
          <div className="text-[10px] text-slate-400 border-t border-slate-100 pt-1">
            Inventario: {formatCurrency(cceAct.inventario)}
          </div>
        </div>

        {/* PCC: Cobro */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1.5">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase">2. Días Cobro (PCC)</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {cceAct.diasCobro}{' '}
            <span className="text-xs font-semibold text-slate-500">días</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Rotación: <strong>{cceAct.rotacionCxC} veces/año</strong>
          </p>
          <div className="text-[10px] text-slate-400 border-t border-slate-100 pt-1">
            CxC: {formatCurrency(cceAct.cuentasPorCobrar)}
          </div>
        </div>

        {/* CO: Ciclo Operativo */}
        <div className="bg-indigo-50/60 p-4 rounded-xl border border-indigo-200 shadow-sm space-y-1.5">
          <div className="flex items-center justify-between text-indigo-800">
            <span className="text-[11px] font-bold uppercase">Ciclo Operativo (CO)</span>
            <Clock className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-indigo-950">
            {cceAct.cicloOperativo}{' '}
            <span className="text-xs font-semibold text-indigo-700">días</span>
          </div>
          <p className="text-[11px] text-indigo-800 font-medium">PCI ({cceAct.diasInventario}) + PCC ({cceAct.diasCobro})</p>
          <div className="text-[10px] text-indigo-600 border-t border-indigo-200/60 pt-1">
            Tiempo total producción a cobranza
          </div>
        </div>

        {/* PDP: Pago */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1.5">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase">3. Días Pago (PDP)</span>
            <Building2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {cceAct.diasPago}{' '}
            <span className="text-xs font-semibold text-slate-500">días</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Rotación: <strong>{cceAct.rotacionCxP} veces/año</strong>
          </p>
          <div className="text-[10px] text-slate-400 border-t border-slate-100 pt-1">
            CxP: {formatCurrency(cceAct.cuentasPorPagar)}
          </div>
        </div>

        {/* CCE: Ciclo de Conversión de Efectivo */}
        <div
          className={`p-4 rounded-xl border shadow-sm space-y-1.5 ${
            cceAct.status === 'OPTIMO'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
              : cceAct.status === 'MODERADO'
                ? 'bg-blue-50 border-blue-300 text-blue-950'
                : 'bg-rose-50 border-rose-300 text-rose-950'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase">CCE = CO - PDP</span>
            <Coins className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black">
            {cceAct.cicloConversionEfectivo}{' '}
            <span className="text-xs font-semibold">días</span>
          </div>
          <p className="text-[11px] font-medium">
            {cceAct.cicloConversionEfectivo <= 0
              ? 'Autofinanciado por proveedores'
              : `Financiamiento neto requerido`}
          </p>
          <div className="text-[10px] font-bold border-t border-current/20 pt-1">
            Estado: {cceAct.status}
          </div>
        </div>
      </div>

      {/* Línea de Tiempo Visual del Ciclo de Efectivo */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Cronología Visual del Ciclo Operativo y de Efectivo
            </h2>
            <p className="text-xs text-slate-500">
              Visualización de los {cceAct.cicloOperativo} días del Ciclo Operativo frente al alivio
              financiero de {cceAct.diasPago} días otorgado por los proveedores.
            </p>
          </div>
          <div className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg">
            Desembolso diario promedio: <strong>{formatCurrency(cceAct.gastoDiarioOperativo)} / día</strong>
          </div>
        </div>

        {/* Diagrama de barras proporcional */}
        <div className="space-y-3 pt-2">
          {/* Barra Ciclo Operativo */}
          <div>
            <div className="flex justify-between text-xs font-bold mb-1">
              <span className="text-indigo-900">
                1. Ciclo Operativo Total: {cceAct.cicloOperativo} días
              </span>
              <span className="text-slate-500 text-[11px]">
                Inventario ({cceAct.diasInventario} d) + Cobranza ({cceAct.diasCobro} d)
              </span>
            </div>
            <div className="w-full h-8 bg-slate-100 rounded-lg overflow-hidden flex text-white text-[11px] font-bold">
              <div
                style={{
                  width: `${Math.min(100, (cceAct.diasInventario / Math.max(1, cceAct.cicloOperativo)) * 100)}%`,
                }}
                className="bg-amber-500 flex items-center justify-center px-2 truncate transition-all"
                title={`Días de Inventario: ${cceAct.diasInventario} días`}
              >
                Inventario: {cceAct.diasInventario}d
              </div>
              <div
                style={{
                  width: `${Math.min(100, (cceAct.diasCobro / Math.max(1, cceAct.cicloOperativo)) * 100)}%`,
                }}
                className="bg-blue-600 flex items-center justify-center px-2 truncate transition-all"
                title={`Días de Cobro: ${cceAct.diasCobro} días`}
              >
                Cobranza: {cceAct.diasCobro}d
              </div>
            </div>
          </div>

          {/* Barra Ciclo de Conversión de Efectivo vs Pago a Proveedores */}
          <div>
            <div className="flex justify-between text-xs font-bold mb-1">
              <span className="text-emerald-900">
                2. Ciclo de Conversión de Efectivo (CCE): {cceAct.cicloConversionEfectivo} días
              </span>
              <span className="text-slate-500 text-[11px]">
                Crédito Proveedores ({cceAct.diasPago} d) financia parte del ciclo
              </span>
            </div>
            <div className="w-full h-8 bg-slate-100 rounded-lg overflow-hidden flex text-white text-[11px] font-bold">
              <div
                style={{
                  width: `${Math.min(100, (cceAct.diasPago / Math.max(1, cceAct.cicloOperativo)) * 100)}%`,
                }}
                className="bg-emerald-600 flex items-center justify-center px-2 truncate transition-all"
                title={`Crédito de Proveedores (PDP): ${cceAct.diasPago} días`}
              >
                Proveedores financian: {cceAct.diasPago}d
              </div>
              <div
                style={{
                  width: `${Math.max(
                    0,
                    Math.min(
                      100,
                      (cceAct.cicloConversionEfectivo / Math.max(1, cceAct.cicloOperativo)) * 100
                    )
                  )}%`,
                }}
                className="bg-rose-500 flex items-center justify-center px-2 truncate transition-all"
                title={`CCE (Brecha que requiere fondos): ${cceAct.cicloConversionEfectivo} días`}
              >
                {cceAct.cicloConversionEfectivo > 0
                  ? `Brecha CCE: ${cceAct.cicloConversionEfectivo}d`
                  : 'Autofinanciado'}
              </div>
            </div>
          </div>
        </div>

        {/* Tarjeta de Recursos Requeridos */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <Info className="w-5 h-5 text-blue-600 shrink-0" />
            <div>
              <span className="font-bold text-slate-800 block">
                Capital de Trabajo Operativo Inmovilizado en el Ciclo:
              </span>
              <span className="text-slate-600 text-[11px]">
                {cceAct.cicloConversionEfectivo} días de brecha operativa ×{' '}
                {formatCurrency(cceAct.gastoDiarioOperativo)} de gasto diario
              </span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-500 block">Recursos Necesarios a Financiar</span>
            <strong className="text-base text-blue-900 font-black">
              {formatCurrency(cceAct.recursosRequeridos)}
            </strong>
          </div>
        </div>
      </div>

      {/* Grid: Comparativa entre Períodos y Simulador de Sensibilidad */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Columna 1: Comparativa Anual (Evolución de la Gestión) */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 bg-slate-900 text-white">
            <h2 className="text-sm font-bold">
              Comparativa Interanual del Ciclo de Efectivo
            </h2>
            <p className="text-[11px] text-slate-300">
              Evolución operativa: {comparisonPeriod.name} frente a {activePeriod.name}
            </p>
          </div>
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase text-slate-600">
                <th className="px-4 py-2.5">Componente del Ciclo</th>
                <th className="px-4 py-2.5 text-right">{comparisonPeriod.name}</th>
                <th className="px-4 py-2.5 text-right text-blue-800">{activePeriod.name}</th>
                <th className="px-4 py-2.5 text-right">Variación</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100">
                <td className="px-4 py-2 font-medium">Días de Inventario (PCI)</td>
                <td className="px-4 py-2 text-right">{cceComp.diasInventario} d</td>
                <td className="px-4 py-2 text-right font-bold text-slate-900">
                  {cceAct.diasInventario} d
                </td>
                <td
                  className={`px-4 py-2 text-right font-bold ${
                    cceAct.diasInventario <= cceComp.diasInventario
                      ? 'text-emerald-700'
                      : 'text-rose-700'
                  }`}
                >
                  {(cceAct.diasInventario - cceComp.diasInventario).toFixed(1)} d
                </td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="px-4 py-2 font-medium">Días de Cobro (PCC)</td>
                <td className="px-4 py-2 text-right">{cceComp.diasCobro} d</td>
                <td className="px-4 py-2 text-right font-bold text-slate-900">
                  {cceAct.diasCobro} d
                </td>
                <td
                  className={`px-4 py-2 text-right font-bold ${
                    cceAct.diasCobro <= cceComp.diasCobro
                      ? 'text-emerald-700'
                      : 'text-rose-700'
                  }`}
                >
                  {(cceAct.diasCobro - cceComp.diasCobro).toFixed(1)} d
                </td>
              </tr>
              <tr className="border-b border-indigo-100 bg-indigo-50/40 font-bold text-indigo-950">
                <td className="px-4 py-2">(=) Ciclo Operativo (CO)</td>
                <td className="px-4 py-2 text-right">{cceComp.cicloOperativo} d</td>
                <td className="px-4 py-2 text-right">{cceAct.cicloOperativo} d</td>
                <td
                  className={`px-4 py-2 text-right ${
                    cceAct.cicloOperativo <= cceComp.cicloOperativo
                      ? 'text-emerald-700'
                      : 'text-rose-700'
                  }`}
                >
                  {(cceAct.cicloOperativo - cceComp.cicloOperativo).toFixed(1)} d
                </td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="px-4 py-2 font-medium">(-) Días de Pago Proveedores (PDP)</td>
                <td className="px-4 py-2 text-right">{cceComp.diasPago} d</td>
                <td className="px-4 py-2 text-right font-bold text-slate-900">
                  {cceAct.diasPago} d
                </td>
                <td
                  className={`px-4 py-2 text-right font-bold ${
                    cceAct.diasPago >= cceComp.diasPago
                      ? 'text-emerald-700'
                      : 'text-rose-700'
                  }`}
                >
                  {(cceAct.diasPago - cceComp.diasPago).toFixed(1)} d
                </td>
              </tr>
              <tr className="bg-slate-900 text-white font-bold">
                <td className="px-4 py-3">(=) CICLO DE CONVERSIÓN DE EFECTIVO</td>
                <td className="px-4 py-3 text-right">{cceComp.cicloConversionEfectivo} d</td>
                <td className="px-4 py-3 text-right text-emerald-400">
                  {cceAct.cicloConversionEfectivo} d
                </td>
                <td
                  className={`px-4 py-3 text-right ${
                    deltaCcePeriodos <= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {deltaCcePeriodos <= 0
                    ? `Mejora (${Math.abs(deltaCcePeriodos)} d)`
                    : `Deterioro (+${deltaCcePeriodos} d)`}
                </td>
              </tr>
            </tbody>
          </table>
          <div className="p-4 bg-slate-50 border-t border-slate-200 text-xs text-slate-700">
            <strong>Dictamen de Evolución:</strong>{' '}
            {deltaCcePeriodos <= 0
              ? `La empresa redujo su ciclo de efectivo en ${Math.abs(deltaCcePeriodos)} días, liberando capital de trabajo y mejorando su eficiencia de tesorería.`
              : `El ciclo se extendió en ${deltaCcePeriodos} días respecto al período anterior, lo cual inmoviliza más caja y demanda mayor financiamiento.`}
          </div>
        </div>

        {/* Columna 2: Simulador Interactivo de Sensibilidad Operativa */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" /> Simulador de Negociación y Liberación de Efectivo
            </span>
            <h3 className="text-sm font-bold text-slate-900">
              ¿Cuánto efectivo liberamos optimizando el ciclo?
            </h3>
            <p className="text-xs text-slate-500">
              Simula estrategias de optimización para responder a preguntas de toma de decisiones del
              docente.
            </p>
          </div>

          <div className="space-y-3 text-xs">
            {/* Control 1: Inventario */}
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div className="flex justify-between font-bold mb-1">
                <span>1. Reducción Días de Inventario (Δ PCI):</span>
                <span className="text-amber-700">{deltaInv} días</span>
              </div>
              <input
                type="range"
                min="-30"
                max="10"
                step="1"
                value={deltaInv}
                onChange={(e) => setDeltaInv(Number(e.target.value))}
                className="w-full accent-amber-600"
              />
              <span className="text-[11px] text-slate-500 block">
                Nuevo PCI proyectado: <strong>{sim.diasInventarioSim} días</strong> (agilizando ventas o entregas)
              </span>
            </div>

            {/* Control 2: Cobranza */}
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div className="flex justify-between font-bold mb-1">
                <span>2. Reducción Días de Cobro (Δ PCC):</span>
                <span className="text-blue-700">{deltaCobro} días</span>
              </div>
              <input
                type="range"
                min="-30"
                max="10"
                step="1"
                value={deltaCobro}
                onChange={(e) => setDeltaCobro(Number(e.target.value))}
                className="w-full accent-blue-600"
              />
              <span className="text-[11px] text-slate-500 block">
                Nuevo PCC proyectado: <strong>{sim.diasCobroSim} días</strong> (descuento pronto pago o mejor cobranza)
              </span>
            </div>

            {/* Control 3: Proveedores */}
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div className="flex justify-between font-bold mb-1">
                <span>3. Extensión Plazo a Proveedores (Δ PDP):</span>
                <span className="text-emerald-700">+{deltaPago} días</span>
              </div>
              <input
                type="range"
                min="-10"
                max="30"
                step="1"
                value={deltaPago}
                onChange={(e) => setDeltaPago(Number(e.target.value))}
                className="w-full accent-emerald-600"
              />
              <span className="text-[11px] text-slate-500 block">
                Nuevo PDP proyectado: <strong>{sim.diasPagoSim} días</strong> (negociando mayor crédito comercial)
              </span>
            </div>
          </div>

          {/* Resultado de la Simulación */}
          <div className="bg-gradient-to-r from-emerald-900 to-slate-900 text-white p-4 rounded-xl space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-emerald-300">CCE Actual vs Simulado:</span>
              <strong className="text-sm">
                {cceAct.cicloConversionEfectivo} d → {sim.cceSimulado} d{' '}
                <span className="text-emerald-400">
                  ({sim.diasAhorrados > 0 ? `-${sim.diasAhorrados}` : `+${Math.abs(sim.diasAhorrados)}`} d)
                </span>
              </strong>
            </div>
            <div className="border-t border-emerald-500/30 pt-2 flex justify-between items-center">
              <div>
                <span className="text-[11px] uppercase font-bold text-emerald-400 block">
                  {sim.efectivoLiberado >= 0 ? 'Caja Neta Liberada:' : 'Caja Adicional Requerida:'}
                </span>
                <span className="text-[11px] text-slate-300">
                  Impacto directo en liquidez y reducción de préstamos
                </span>
              </div>
              <strong className="text-lg font-black text-emerald-300">
                {formatCurrency(Math.abs(sim.efectivoLiberado))}
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* Dictamen Estratégico para Defensa */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
        <h3 className="text-sm font-bold text-slate-900">
          Dictamen Financiero para la Defensa de la Unidad 2 y 3
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-700">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <strong className="text-slate-900 block mb-1">1. Eficiencia Operativa:</strong>
            El inventario rota cada <strong>{cceAct.diasInventario} días</strong> y las cuentas por cobrar se recuperan en <strong>{cceAct.diasCobro} días</strong>, totalizando un Ciclo Operativo de <strong>{cceAct.cicloOperativo} días</strong>.
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <strong className="text-slate-900 block mb-1">2. Apalancamiento con Proveedores:</strong>
            Los proveedores conceden <strong>{cceAct.diasPago} días</strong> de crédito espontáneo, absorbiendo gran parte del ciclo sin costo por intereses bancarios.
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <strong className="text-slate-900 block mb-1">3. Recomendación del CFO:</strong>
            {cceAct.dictamen}
          </div>
        </div>
      </div>
    </div>
  );
};
