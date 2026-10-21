import React, { useState } from 'react';
import { AlertTriangle, CheckCircle2, PlusCircle, Trash2 } from 'lucide-react';
import { useFinancialSystem } from '../../app/providers/FinancialContext';
import { AcademicDefenseCard } from '../../components/common/AcademicDefenseCard';
import { formatCurrency, formatNumber } from '../../components/common/formatters';

export const InventoryPage: React.FC = () => {
  const {
    inventoryResult,
    updateInventoryProduct,
    addInventoryProduct,
    removeInventoryProduct,
  } = useFinancialSystem();

  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Equipos Industriales');
  const [initialStock, setInitialStock] = useState('20');
  const [entries, setEntries] = useState('10');
  const [exits, setExits] = useState('5');
  const [unitCost, setUnitCost] = useState('1500');
  const [minStock, setMinStock] = useState('10');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sku.trim() || !name.trim()) return;
    addInventoryProduct({
      sku: sku.trim(),
      name: name.trim(),
      category: category.trim(),
      initialStock: Math.max(0, Number(initialStock)),
      entries: Math.max(0, Number(entries)),
      exits: Math.max(0, Number(exits)),
      unitCost: Math.max(0, Number(unitCost)),
      minStock: Math.max(0, Number(minStock)),
    });
    setSku('');
    setName('');
  };

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
          Módulo Complementario Obligatorio I • Aplicación Práctica
        </span>
        <h1 className="text-xl font-bold text-slate-900">
          Control Básico de Inventario y Valoración de Existencias
        </h1>
        <p className="text-xs text-slate-600">
          Cálculo de existencia final, valoración monetaria del inventario, alertas de
          stock mínimo y sugerencia de reposición vinculada a la planeación de compras.
        </p>
      </div>

      <AcademicDefenseCard
        moduleTitle="Control Básico de Inventario y Valoración"
        unitReference="Aplicación Práctica Complementaria (Guía GFO 2026)"
        codeFileLocation="src/core/finance/complementaryModules.ts -> computeInventoryControl()"
        formulas={[
          {
            label: 'Fórmula Obligatoria 1: Existencia Final',
            formula: 'Existencia Final = Existencia Inicial + Entradas - Salidas',
            meaning:
              'Determina las unidades físicas disponibles en bodega al cierre del período tras registrar compras (entradas) y despachos/ventas (salidas).',
          },
          {
            label: 'Fórmula Obligatoria 2: Valor del Inventario (C$)',
            formula: 'Valor del Inventario = Existencia Final × Costo Unitario',
            meaning:
              'Cuantifica el capital de trabajo inmovilizado en mercaderías para cada ítem y el total general de bodega.',
          },
          {
            label: 'Fórmula 3: Alerta de Reposición y Vínculo con Compras',
            formula: 'Alerta Activa si: Existencia Final <= Stock Mínimo',
            meaning:
              'Identifica oportunamente qué productos requieren orden de compra para evitar quiebres de stock en el Presupuesto de Compras.',
          },
        ]}
      />

      {/* Resumen de Inventario */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-medium text-slate-500">
            Total Unidades en Existencia Final
          </span>
          <p className="text-xl font-extrabold text-slate-900 mt-1">
            {formatNumber(inventoryResult.totalUnitsInStock, 0)} unidades
          </p>
          <span className="text-[11px] text-slate-500">
            {inventoryResult.items.length} referencias activas en catálogo
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-blue-200 shadow-sm">
          <span className="text-xs font-medium text-slate-500">
            Valor Total del Inventario
          </span>
          <p className="text-xl font-extrabold text-blue-700 mt-1">
            {formatCurrency(inventoryResult.totalInventoryValue)}
          </p>
          <span className="text-[11px] text-slate-500">
            Σ (Existencia Final × Costo Unitario)
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-sm">
          <span className="text-xs font-medium text-slate-500">
            Productos en Alerta de Reposición
          </span>
          <p className="text-xl font-extrabold text-amber-700 mt-1">
            {inventoryResult.productsInReorderAlert} productos
          </p>
          <span className="text-[11px] text-slate-500">
            Con Existencia Final ≤ Stock Mínimo
          </span>
        </div>

        <div className="bg-slate-900 text-white p-4 rounded-xl shadow-sm">
          <span className="text-xs font-medium text-emerald-300">
            Requerimiento Sugerido de Compra
          </span>
          <p className="text-xl font-extrabold text-white mt-1">
            {formatCurrency(inventoryResult.totalSuggestedPurchaseCost)}
          </p>
          <span className="text-[11px] text-slate-300">
            Vinculado con Planeación de Compras
          </span>
        </div>
      </div>

      {/* Tabla editable de Kárdex / Existencias */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 bg-slate-900 text-white">
          <h2 className="text-sm font-bold">
            Matriz Interactiva de Control de Inventario (Edita Entradas, Salidas o Costo
            para probar en vivo)
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase text-slate-600">
                <th className="px-3 py-3">SKU</th>
                <th className="px-3 py-3">Producto</th>
                <th className="px-3 py-3 text-right">Exist. Inicial</th>
                <th className="px-3 py-3 text-right">(+) Entradas</th>
                <th className="px-3 py-3 text-right">(-) Salidas</th>
                <th className="px-3 py-3 text-right text-blue-700">(=) Exist. Final</th>
                <th className="px-3 py-3 text-right">Costo Unit. (C$)</th>
                <th className="px-3 py-3 text-right text-emerald-800">Valor Total (C$)</th>
                <th className="px-3 py-3 text-right">Stock Mín.</th>
                <th className="px-3 py-3 text-center">Estado / Alerta</th>
                <th className="px-3 py-3 text-right">Acción</th>
              </tr>
            </thead>
            <tbody>
              {inventoryResult.items.map((item) => (
                <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-3 py-2 font-mono text-slate-500">{item.sku}</td>
                  <td className="px-3 py-2 font-medium text-slate-900">{item.name}</td>
                  <td className="px-3 py-2 text-right">
                    <input
                      type="number"
                      min={0}
                      value={item.initialStock}
                      onChange={(e) =>
                        updateInventoryProduct(item.id, {
                          initialStock: Math.max(0, Number(e.target.value)),
                        })
                      }
                      className="w-20 text-right border border-slate-300 rounded px-1.5 py-1 font-semibold"
                    />
                  </td>
                  <td className="px-3 py-2 text-right">
                    <input
                      type="number"
                      min={0}
                      value={item.entries}
                      onChange={(e) =>
                        updateInventoryProduct(item.id, {
                          entries: Math.max(0, Number(e.target.value)),
                        })
                      }
                      className="w-20 text-right border border-emerald-300 bg-emerald-50/30 rounded px-1.5 py-1 font-semibold text-emerald-900"
                    />
                  </td>
                  <td className="px-3 py-2 text-right">
                    <input
                      type="number"
                      min={0}
                      value={item.exits}
                      onChange={(e) =>
                        updateInventoryProduct(item.id, {
                          exits: Math.max(0, Number(e.target.value)),
                        })
                      }
                      className="w-20 text-right border border-rose-300 bg-rose-50/30 rounded px-1.5 py-1 font-semibold text-rose-900"
                    />
                  </td>
                  <td className="px-3 py-2 text-right font-extrabold text-blue-900 bg-blue-50/40">
                    {formatNumber(item.finalStock, 0)} unid.
                  </td>
                  <td className="px-3 py-2 text-right">
                    <input
                      type="number"
                      min={0}
                      value={item.unitCost}
                      onChange={(e) =>
                        updateInventoryProduct(item.id, {
                          unitCost: Math.max(0, Number(e.target.value)),
                        })
                      }
                      className="w-24 text-right border border-slate-300 rounded px-1.5 py-1 font-semibold"
                    />
                  </td>
                  <td className="px-3 py-2 text-right font-extrabold text-emerald-800">
                    {formatCurrency(item.totalValue)}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <input
                      type="number"
                      min={0}
                      value={item.minStock}
                      onChange={(e) =>
                        updateInventoryProduct(item.id, {
                          minStock: Math.max(0, Number(e.target.value)),
                        })
                      }
                      className="w-16 text-right border border-slate-300 rounded px-1.5 py-1"
                    />
                  </td>
                  <td className="px-3 py-2 text-center">
                    {item.needsReorder ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                        <AlertTriangle className="w-3 h-3" />
                        Reponer ({item.suggestedPurchaseUnits} u.)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" />
                        Normal
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <button
                      type="button"
                      onClick={() => removeInventoryProduct(item.id)}
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
      </div>

      {/* Formulario para agregar nuevo producto */}
      <form
        onSubmit={handleAdd}
        className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4 text-xs"
      >
        <div className="flex items-center gap-2">
          <PlusCircle className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-bold text-slate-900">
            Agregar Nuevo Producto al Control de Inventario
          </h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          <div>
            <label className="block font-medium text-slate-600 mb-1">SKU</label>
            <input
              type="text"
              required
              placeholder="IND-501"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block font-medium text-slate-600 mb-1">
              Nombre del Producto
            </label>
            <input
              type="text"
              required
              placeholder="Compresor Industrial 100L"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5"
            />
          </div>
          <div>
            <label className="block font-medium text-slate-600 mb-1">Exist. Inicial</label>
            <input
              type="number"
              min={0}
              value={initialStock}
              onChange={(e) => setInitialStock(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5"
            />
          </div>
          <div>
            <label className="block font-medium text-slate-600 mb-1">Entradas</label>
            <input
              type="number"
              min={0}
              value={entries}
              onChange={(e) => setEntries(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5"
            />
          </div>
          <div>
            <label className="block font-medium text-slate-600 mb-1">Salidas</label>
            <input
              type="number"
              min={0}
              value={exits}
              onChange={(e) => setExits(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5"
            />
          </div>
          <div>
            <label className="block font-medium text-slate-600 mb-1">Costo Unit. (C$)</label>
            <input
              type="number"
              min={0}
              value={unitCost}
              onChange={(e) => setUnitCost(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5"
            />
          </div>
          <div>
            <label className="block font-medium text-slate-600 mb-1">Stock Mín.</label>
            <input
              type="number"
              min={0}
              value={minStock}
              onChange={(e) => setMinStock(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5"
            />
          </div>
        </div>
        <button
          type="submit"
          className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors"
        >
          Registrar Producto en Inventario
        </button>
      </form>
    </div>
  );
};

