import {
  FinancialPeriod,
  FinancialSystemState,
  PersonalBudgetData,
} from '../../data/types/financial';
import { ComputedStatementTotals } from '../finance/statements';
import { DuPontAnalysisResult, FinancialRatioResult } from '../finance/analysis';
import { CvuAndLeverageResult } from '../finance/cvuAndLeverage';
import { CashFlowStatementResult, MasterBudgetAndProformaResult } from '../finance/planningAndProforma';
import {
  InventorySummaryResult,
  PersonalBudgetResult,
} from '../finance/complementaryModules';

export interface ExecutiveReportPayload {
  state: FinancialSystemState;
  activePeriod: FinancialPeriod;
  comparisonPeriod: FinancialPeriod;
  activeTotals: ComputedStatementTotals;
  comparisonTotals: ComputedStatementTotals;
  ratios: FinancialRatioResult[];
  duPont: DuPontAnalysisResult;
  cvuAndLeverage: CvuAndLeverageResult;
  cashFlowResult: CashFlowStatementResult;
  masterBudgetAndProforma: MasterBudgetAndProformaResult;
  inventoryResult: InventorySummaryResult;
  authorName?: string;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatRatioValue(r: FinancialRatioResult, currency: string): string {
  if (r.value === null || Number.isNaN(r.value)) return 'N/D';
  if (r.unit === '%') return `${r.value.toFixed(2)}%`;
  if (r.unit === 'veces') return `${r.value.toFixed(2)}x`;
  if (r.unit === 'días') return `${Math.round(r.value)} días`;
  return `${currency} ${Math.round(r.value).toLocaleString('en-US')}`;
}

/**
 * Muestra el reporte en un visor modal a pantalla completa dentro de la misma pestaña
 * (nunca bloqueado por bloqueadores de ventanas emergentes) con impresión directa a PDF y descarga.
 */
function showReportPreviewAndPrintModal(html: string, title: string, fileName: string): void {
  const existing = document.getElementById('gfo-report-preview-modal');
  if (existing) {
    existing.remove();
  }

  const overlay = document.createElement('div');
  overlay.id = 'gfo-report-preview-modal';
  overlay.style.cssText =
    'position:fixed;inset:0;z-index:999999;background:rgba(2,6,23,0.88);backdrop-filter:blur(8px);display:flex;flex-direction:column;padding:12px;font-family:Segoe UI,Roboto,Arial,sans-serif;';

  const toolbar = document.createElement('div');
  toolbar.style.cssText =
    'max-width:1100px;width:100%;margin:0 auto 10px auto;background:#0f172a;border:1px solid rgba(16,185,129,0.4);border-radius:14px;padding:10px 16px;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:10px;color:#fff;box-shadow:0 10px 30px rgba(0,0,0,0.45);';

  const titleBox = document.createElement('div');
  titleBox.innerHTML = `<div style="font-size:13px;font-weight:800;color:#fff;">📄 ${escapeHtml(title)}</div>
    <div style="font-size:11px;color:#a7f3d0;">Vista previa lista • Haz clic en "Imprimir / Guardar PDF" y selecciona "Guardar como PDF" en Destino</div>`;

  const actionsBox = document.createElement('div');
  actionsBox.style.cssText = 'display:flex;flex-wrap:wrap;align-items:center;gap:8px;';

  const frame = document.createElement('iframe');
  frame.style.cssText =
    'max-width:1100px;width:100%;flex:1;margin:0 auto;background:#ffffff;border:none;border-radius:14px;box-shadow:0 15px 40px rgba(0,0,0,0.5);';

  const printBtn = document.createElement('button');
  printBtn.type = 'button';
  printBtn.innerHTML = '🖨️ Imprimir / Guardar como PDF';
  printBtn.style.cssText =
    'background:#10b981;color:#fff;border:none;padding:8px 14px;border-radius:10px;font-size:12px;font-weight:800;cursor:pointer;';
  printBtn.onclick = () => {
    try {
      if (frame.contentWindow) {
        frame.contentWindow.focus();
        frame.contentWindow.print();
        return;
      }
    } catch {
      // Fallback en caso de restricción
    }
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  const downloadHtmlBtn = document.createElement('button');
  downloadHtmlBtn.type = 'button';
  downloadHtmlBtn.innerHTML = '📥 Descargar Reporte';
  downloadHtmlBtn.style.cssText =
    'background:#0284c7;color:#fff;border:none;padding:8px 14px;border-radius:10px;font-size:12px;font-weight:700;cursor:pointer;';
  downloadHtmlBtn.onclick = () => {
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.innerHTML = '✖ Cerrar';
  closeBtn.style.cssText =
    'background:rgba(255,255,255,0.12);color:#fff;border:1px solid rgba(255,255,255,0.25);padding:8px 14px;border-radius:10px;font-size:12px;font-weight:700;cursor:pointer;';
  closeBtn.onclick = () => {
    overlay.remove();
  };

  actionsBox.appendChild(printBtn);
  actionsBox.appendChild(downloadHtmlBtn);
  actionsBox.appendChild(closeBtn);

  toolbar.appendChild(titleBox);
  toolbar.appendChild(actionsBox);
  overlay.appendChild(toolbar);
  overlay.appendChild(frame);
  document.body.appendChild(overlay);

  const doc = frame.contentDocument || frame.contentWindow?.document;
  if (doc) {
    doc.open();
    doc.write(html);
    doc.close();
  } else {
    frame.srcdoc = html;
  }
}

/**
 * Descarga un libro Excel (.xls) completo con todas las tablas financieras del caso actual.
 */
export function exportFinancialCaseExcel(payload: ExecutiveReportPayload): void {
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
    masterBudgetAndProforma,
    inventoryResult,
  } = payload;

  const safeName = state.company.name
    .replace(/[^a-zA-Z0-9_-]+/g, '_')
    .replace(/^_+|_+$/g, '');
  const cur = state.company.currency;

  const accountRows = state.accounts
    .map((acc) => {
      const b = acc.balances[comparisonPeriod.id] ?? 0;
      const a = acc.balances[activePeriod.id] ?? 0;
      const diff = a - b;
      const pct = b !== 0 ? ((diff / Math.abs(b)) * 100).toFixed(2) + '%' : '0.00%';
      return `<tr>
        <td>${escapeHtml(acc.code)}</td>
        <td>${escapeHtml(acc.name)}</td>
        <td>${escapeHtml(acc.category)}</td>
        <td>${b}</td>
        <td>${a}</td>
        <td>${diff}</td>
        <td>${pct}</td>
      </tr>`;
    })
    .join('');

  const ratioRows = ratios
    .map(
      (r) => `<tr>
        <td>${escapeHtml(r.group)}</td>
        <td>${escapeHtml(r.name)}</td>
        <td>${escapeHtml(r.formula)}</td>
        <td>${escapeHtml(formatRatioValue(r, cur))}</td>
        <td>${escapeHtml(r.benchmark)}</td>
        <td>${escapeHtml(r.interpretation)}</td>
      </tr>`
    )
    .join('');

  const inventoryRows = inventoryResult.items
    .map(
      (item) => `<tr>
        <td>${escapeHtml(item.sku)}</td>
        <td>${escapeHtml(item.name)}</td>
        <td>${escapeHtml(item.category)}</td>
        <td>${item.finalStock}</td>
        <td>${item.unitCost}</td>
        <td>${item.totalValue}</td>
        <td>${item.minStock}</td>
        <td>${item.suggestedPurchaseUnits}</td>
        <td>${item.needsReorder ? 'REABASTECER' : 'OK'}</td>
      </tr>`
    )
    .join('');

  const excelHtml = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta charset="UTF-8" />
  <style>
    table { border-collapse: collapse; margin-bottom: 18px; font-family: Arial, sans-serif; font-size: 11pt; }
    th { background-color: #0f172a; color: #ffffff; font-weight: bold; border: 1px solid #cbd5e1; padding: 6px 10px; }
    td { border: 1px solid #cbd5e1; padding: 5px 8px; }
    .section { background-color: #10b981; color: #ffffff; font-weight: bold; font-size: 12pt; }
    .total { background-color: #f1f5f9; font-weight: bold; }
  </style>
</head>
<body>
  <h2>${escapeHtml(state.company.name)} — Reporte Financiero Integral (${escapeHtml(comparisonPeriod.name)} vs ${escapeHtml(activePeriod.name)})</h2>
  <p>Sector: ${escapeHtml(state.company.sector)} | Moneda: ${escapeHtml(cur)} | Tasa IR: ${activePeriod.taxRate}%</p>

  <table>
    <tr><td colspan="7" class="section">1. CATÁLOGO DE CUENTAS Y ANÁLISIS HORIZONTAL</td></tr>
    <tr>
      <th>Código</th>
      <th>Cuenta</th>
      <th>Categoría</th>
      <th>${escapeHtml(comparisonPeriod.name)}</th>
      <th>${escapeHtml(activePeriod.name)}</th>
      <th>Variación Abs.</th>
      <th>Variación %</th>
    </tr>
    ${accountRows}
    <tr class="total"><td colspan="3">TOTAL ACTIVOS</td><td>${comparisonTotals.totalActivos}</td><td>${activeTotals.totalActivos}</td><td>${activeTotals.totalActivos - comparisonTotals.totalActivos}</td><td></td></tr>
    <tr class="total"><td colspan="3">TOTAL PASIVOS</td><td>${comparisonTotals.totalPasivos}</td><td>${activeTotals.totalPasivos}</td><td>${activeTotals.totalPasivos - comparisonTotals.totalPasivos}</td><td></td></tr>
    <tr class="total"><td colspan="3">TOTAL PATRIMONIO</td><td>${comparisonTotals.totalPatrimonio}</td><td>${activeTotals.totalPatrimonio}</td><td>${activeTotals.totalPatrimonio - comparisonTotals.totalPatrimonio}</td><td></td></tr>
    <tr class="total"><td colspan="3">VENTAS NETAS</td><td>${comparisonTotals.ventasNetas}</td><td>${activeTotals.ventasNetas}</td><td>${activeTotals.ventasNetas - comparisonTotals.ventasNetas}</td><td></td></tr>
    <tr class="total"><td colspan="3">UTILIDAD BRUTA</td><td>${comparisonTotals.utilidadBruta}</td><td>${activeTotals.utilidadBruta}</td><td>${activeTotals.utilidadBruta - comparisonTotals.utilidadBruta}</td><td></td></tr>
    <tr class="total"><td colspan="3">UTILIDAD OPERATIVA (UAII)</td><td>${comparisonTotals.uaii}</td><td>${activeTotals.uaii}</td><td>${activeTotals.uaii - comparisonTotals.uaii}</td><td></td></tr>
    <tr class="total"><td colspan="3">UTILIDAD NETA DEL EJERCICIO</td><td>${comparisonTotals.utilidadNeta}</td><td>${activeTotals.utilidadNeta}</td><td>${activeTotals.utilidadNeta - comparisonTotals.utilidadNeta}</td><td></td></tr>
  </table>

  <table>
    <tr><td colspan="6" class="section">2. RAZONES FINANCIERAS Y MODELO DUPONT (${escapeHtml(activePeriod.name)})</td></tr>
    <tr>
      <th>Grupo</th>
      <th>Indicador</th>
      <th>Fórmula</th>
      <th>Resultado</th>
      <th>Referencia</th>
      <th>Diagnóstico</th>
    </tr>
    ${ratioRows}
    <tr class="total"><td>DUPONT</td><td>ROE DuPont (3 Factores)</td><td>Margen Neto × Rotación Activos × Multiplicador Capital</td><td>${(duPont.roeDuPontPct ?? 0).toFixed(2)}%</td><td>ROA: ${(duPont.roaDuPontPct ?? 0).toFixed(2)}%</td><td>${escapeHtml(duPont.interpretation)}</td></tr>
  </table>

  <table>
    <tr><td colspan="4" class="section">3. PUNTO DE EQUILIBRIO (C-V-U), APALANCAMIENTO, FLUJO DE CAJA Y PROFORMA</td></tr>
    <tr><th>Indicador</th><th>Valor</th><th>Indicador</th><th>Valor</th></tr>
    <tr><td>Precio de Venta Unitario</td><td>${state.cvuInput.unitPrice}</td><td>Flujo Operativo Neto (NIC 7)</td><td>${cashFlowResult.netOperatingCashFlow}</td></tr>
    <tr><td>Costo Variable Unitario</td><td>${state.cvuInput.unitVariableCost}</td><td>Flujo de Inversión Neto</td><td>${cashFlowResult.netInvestingCashFlow}</td></tr>
    <tr><td>Punto de Equilibrio (Unidades)</td><td>${Math.round(cvuAndLeverage.breakEvenUnits ?? 0)}</td><td>Flujo de Financiamiento Neto</td><td>${cashFlowResult.netFinancingCashFlow}</td></tr>
    <tr><td>Punto de Equilibrio (Monetario)</td><td>${Math.round(cvuAndLeverage.breakEvenRevenue ?? 0)}</td><td>Saldo Final de Efectivo en Caja</td><td>${cashFlowResult.endingCashBalance}</td></tr>
    <tr><td>Margen de Seguridad (%)</td><td>${cvuAndLeverage.safetyMarginPct.toFixed(2)}%</td><td>Ventas Proyectadas (Proforma)</td><td>${masterBudgetAndProforma.projectedSalesRevenue}</td></tr>
    <tr><td>GAO / GAF / GAT</td><td>${(cvuAndLeverage.gao ?? 0).toFixed(2)}x / ${(cvuAndLeverage.gaf ?? 0).toFixed(2)}x / ${(cvuAndLeverage.gat ?? 0).toFixed(2)}x</td><td>Utilidad Neta Proyectada (Proforma)</td><td>${masterBudgetAndProforma.proformaNetIncome}</td></tr>
  </table>

  <table>
    <tr><td colspan="9" class="section">4. CONTROL DE INVENTARIO (MODELO EOQ, ROP Y ABC)</td></tr>
    <tr>
      <th>SKU</th>
      <th>Producto</th>
      <th>Categoría</th>
      <th>Stock Actual</th>
      <th>Costo Unitario</th>
      <th>Valor Total</th>
      <th>Lote Óptimo (EOQ)</th>
      <th>Punto Reorden (ROP)</th>
      <th>Estado</th>
    </tr>
    ${inventoryRows}
  </table>
</body>
</html>`;

  const blob = new Blob(['\uFEFF' + excelHtml], {
    type: 'application/vnd.ms-excel;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Reporte_Financiero_${safeName || 'Empresa'}.xls`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Genera y abre el Informe Ejecutivo Financiero Integral listo para imprimir o guardar como PDF.
 */
export function openExecutiveReportPrintView(payload: ExecutiveReportPayload): void {
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
    masterBudgetAndProforma,
    inventoryResult,
    authorName,
  } = payload;

  const cur = state.company.currency;
  const fmt = (n: number) => `${cur} ${Math.round(n).toLocaleString('en-US')}`;
  const pctChange = (base: number, active: number): string => {
    if (!base) return '0.0%';
    const v = ((active - base) / Math.abs(base)) * 100;
    return `${v >= 0 ? '+' : ''}${v.toFixed(1)}%`;
  };

  const dateStr = new Date().toLocaleDateString('es-NI', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const ctnBase = comparisonTotals.totalActivoCorriente - comparisonTotals.totalPasivoCorriente;
  const ctnActive = activeTotals.totalActivoCorriente - activeTotals.totalPasivoCorriente;
  const razonCirculante =
    activeTotals.totalPasivoCorriente > 0
      ? activeTotals.totalActivoCorriente / activeTotals.totalPasivoCorriente
      : 0;
  const razonDeudaPct =
    activeTotals.totalActivos > 0
      ? (activeTotals.totalPasivos / activeTotals.totalActivos) * 100
      : 0;

  const balanceCategories = [
    { key: 'ACTIVO_CORRIENTE', label: 'Activo Corriente' },
    { key: 'ACTIVO_NO_CORRIENTE', label: 'Activo No Corriente' },
    { key: 'PASIVO_CORRIENTE', label: 'Pasivo Corriente' },
    { key: 'PASIVO_NO_CORRIENTE', label: 'Pasivo No Corriente' },
    { key: 'PATRIMONIO', label: 'Patrimonio de los Accionistas' },
  ];

  const incomeCategories = [
    { key: 'INGRESO_OPERATIVO', label: 'Ingresos Operativos' },
    { key: 'COSTO_VENTAS', label: 'Costo de Ventas' },
    { key: 'GASTO_OPERATIVO', label: 'Gastos Operativos' },
    { key: 'GASTO_FINANCIERO', label: 'Resultado Financiero / Otros' },
  ];

  const renderAccountsRows = (cats: Array<{ key: string; label: string }>) =>
    cats
      .map((cat) => {
        const accs = state.accounts.filter((a) => a.category === cat.key);
        if (accs.length === 0) return '';
        const rowsHtml = accs
          .map((acc) => {
            const bVal = acc.balances[comparisonPeriod.id] ?? 0;
            const aVal = acc.balances[activePeriod.id] ?? 0;
            const diff = aVal - bVal;
            return `<tr>
              <td class="code">${escapeHtml(acc.code)}</td>
              <td>${escapeHtml(acc.name)}</td>
              <td class="num">${fmt(bVal)}</td>
              <td class="num bold">${fmt(aVal)}</td>
              <td class="num ${diff >= 0 ? 'pos' : 'neg'}">${diff >= 0 ? '+' : ''}${fmt(diff)}</td>
              <td class="num ${diff >= 0 ? 'pos' : 'neg'}">${pctChange(bVal, aVal)}</td>
            </tr>`;
          })
          .join('');
        return `<tr class="group-row"><td colspan="6">${escapeHtml(cat.label)}</td></tr>${rowsHtml}`;
      })
      .join('');

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <title>Informe Financiero Ejecutivo — ${escapeHtml(state.company.name)}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Segoe UI', Inter, system-ui, -apple-system, sans-serif;
      color: #0f172a;
      background: #f1f5f9;
      line-height: 1.45;
      padding: 68px 20px 40px;
    }
    .toolbar {
      position: fixed;
      top: 0; left: 0; right: 0;
      height: 54px;
      background: #0f172a;
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 24px;
      z-index: 9999;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    }
    .toolbar-title {
      font-size: 13px;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .toolbar-actions { display: flex; gap: 10px; }
    .btn {
      border: none;
      padding: 8px 16px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
    }
    .btn-primary { background: #10b981; color: #ffffff; }
    .btn-primary:hover { background: #059669; }
    .btn-secondary { background: #334155; color: #ffffff; }
    .btn-secondary:hover { background: #475569; }

    .sheet {
      max-width: 980px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 14px;
      padding: 32px 36px;
      box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
    }
    .header-banner {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 3px solid #0f172a;
      padding-bottom: 16px;
      margin-bottom: 22px;
    }
    .tag {
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #059669;
    }
    h1 { font-size: 22px; font-weight: 800; color: #0f172a; margin: 2px 0 4px; }
    .subtitle { font-size: 12px; color: #475569; }
    .meta-box {
      text-align: right;
      font-size: 11px;
      color: #334155;
    }
    .badge {
      display: inline-block;
      margin-top: 6px;
      padding: 3px 10px;
      border-radius: 999px;
      font-size: 10px;
      font-weight: 800;
    }
    .badge-ok { background: #d1fae5; color: #065f46; }
    .badge-warn { background: #ffe4e6; color: #9f1239; }

    h2 {
      font-size: 14px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: #0f172a;
      background: #f8fafc;
      border-left: 4px solid #2563eb;
      padding: 7px 12px;
      margin: 22px 0 12px;
    }
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
      margin-bottom: 14px;
    }
    .kpi-card {
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 10px 12px;
      background: #f8fafc;
    }
    .kpi-label { font-size: 10px; font-weight: 700; text-transform: uppercase; color: #64748b; }
    .kpi-val { font-size: 15px; font-weight: 800; color: #0f172a; margin-top: 2px; }
    .kpi-sub { font-size: 10px; color: #475569; margin-top: 2px; }

    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 11px;
      margin-bottom: 14px;
    }
    th {
      background: #0f172a;
      color: #ffffff;
      text-align: left;
      padding: 6px 8px;
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    td {
      padding: 5px 8px;
      border-bottom: 1px solid #e2e8f0;
    }
    tr.group-row td {
      background: #eff6ff;
      font-weight: 800;
      color: #1e3a8a;
      text-transform: uppercase;
      font-size: 10px;
      padding-top: 6px;
      padding-bottom: 6px;
    }
    tr.total-row td {
      background: #f1f5f9;
      font-weight: 800;
      border-top: 1.5px solid #0f172a;
      border-bottom: 1.5px solid #0f172a;
    }
    td.num, th.num { text-align: right; font-variant-numeric: tabular-nums; }
    td.code { font-family: monospace; color: #64748b; width: 58px; }
    td.bold { font-weight: 700; }
    td.pos { color: #059669; font-weight: 600; }
    td.neg { color: #e11d48; font-weight: 600; }

    .two-col {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 14px;
    }
    .box {
      border: 1px solid #cbd5e1;
      border-radius: 10px;
      padding: 12px 14px;
      font-size: 11.5px;
    }
    .box h3 {
      font-size: 12px;
      font-weight: 800;
      color: #0f172a;
      margin-bottom: 6px;
    }
    .box ul { padding-left: 16px; }
    .box li { margin-bottom: 4px; }

    .footer {
      margin-top: 26px;
      padding-top: 12px;
      border-top: 1px solid #cbd5e1;
      display: flex;
      justify-content: space-between;
      font-size: 10px;
      color: #64748b;
    }

    @media print {
      body { background: #ffffff; padding: 0; }
      .no-print { display: none !important; }
      .sheet { box-shadow: none; max-width: 100%; padding: 12px 16px; }
      h2 { break-after: avoid; }
      table, .box, .kpi-grid { break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="toolbar no-print">
    <div class="toolbar-title">
      <span>📄 Vista Previa del Informe Ejecutivo PDF — ${escapeHtml(state.company.name)}</span>
    </div>
    <div class="toolbar-actions">
      <button class="btn btn-primary" onclick="window.print()">🖨️ Imprimir / Guardar como PDF</button>
      <button class="btn btn-secondary" onclick="window.close()">✕ Cerrar</button>
    </div>
  </div>

  <div class="sheet">
    <div class="header-banner">
      <div>
        <div class="tag">GFO • IS2122 • Sistema de Análisis y Planeación Financiera</div>
        <h1>${escapeHtml(state.company.name)}</h1>
        <div class="subtitle">${escapeHtml(state.company.sector)} • Moneda: ${escapeHtml(cur)} • Tasa IR: ${activePeriod.taxRate}%</div>
      </div>
      <div class="meta-box">
        <div><strong>Períodos Analizados:</strong> ${escapeHtml(comparisonPeriod.name)} vs ${escapeHtml(activePeriod.name)}</div>
        <div><strong>Elaborado por:</strong> ${escapeHtml(authorName || 'Analista Financiero')}</div>
        <div><strong>Fecha de emisión:</strong> ${escapeHtml(dateStr)}</div>
        <span class="badge ${activeTotals.estaCuadrado ? 'badge-ok' : 'badge-warn'}">
          ${activeTotals.estaCuadrado ? '✓ ECUACIÓN CONTABLE CUADRADA' : `⚠ DESCUADRE: ${fmt(activeTotals.diferenciaCuadre)}`}
        </span>
      </div>
    </div>

    <h2>1. Resumen Ejecutivo de Indicadores y Sistema DuPont (${escapeHtml(activePeriod.name)})</h2>
    <div class="kpi-grid">
      <div class="kpi-card">
        <div class="kpi-label">Ventas Netas (${escapeHtml(activePeriod.name)})</div>
        <div class="kpi-val">${fmt(activeTotals.ventasNetas)}</div>
        <div class="kpi-sub">Variación: ${pctChange(comparisonTotals.ventasNetas, activeTotals.ventasNetas)} vs ${escapeHtml(comparisonPeriod.name)}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Utilidad Neta (${escapeHtml(activePeriod.name)})</div>
        <div class="kpi-val">${fmt(activeTotals.utilidadNeta)}</div>
        <div class="kpi-sub">Margen Neto: ${duPont.netProfitMarginPct.toFixed(2)}%</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Total Activos (${escapeHtml(activePeriod.name)})</div>
        <div class="kpi-val">${fmt(activeTotals.totalActivos)}</div>
        <div class="kpi-sub">Capital de Trabajo: ${fmt(ctnActive)}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">ROE DuPont (3 Factores)</div>
        <div class="kpi-val">${duPont.roeDuPontPct.toFixed(2)}%</div>
        <div class="kpi-sub">${duPont.netProfitMarginPct.toFixed(2)}% × ${duPont.assetTurnover.toFixed(2)}x × ${duPont.equityMultiplier.toFixed(2)}x</div>
      </div>
    </div>

    <h2>2. Balance General Comparativo y Análisis Horizontal (Módulos A y B)</h2>
    <table>
      <thead>
        <tr>
          <th>Cód.</th>
          <th>Cuenta Contable</th>
          <th class="num">${escapeHtml(comparisonPeriod.name)}</th>
          <th class="num">${escapeHtml(activePeriod.name)}</th>
          <th class="num">Var. Absoluta</th>
          <th class="num">Var. %</th>
        </tr>
      </thead>
      <tbody>
        ${renderAccountsRows(balanceCategories)}
        <tr class="total-row">
          <td></td>
          <td>TOTAL ACTIVOS</td>
          <td class="num">${fmt(comparisonTotals.totalActivos)}</td>
          <td class="num">${fmt(activeTotals.totalActivos)}</td>
          <td class="num">${fmt(activeTotals.totalActivos - comparisonTotals.totalActivos)}</td>
          <td class="num">${pctChange(comparisonTotals.totalActivos, activeTotals.totalActivos)}</td>
        </tr>
        <tr class="total-row">
          <td></td>
          <td>TOTAL PASIVO + PATRIMONIO</td>
          <td class="num">${fmt(comparisonTotals.totalPasivoMasPatrimonio)}</td>
          <td class="num">${fmt(activeTotals.totalPasivoMasPatrimonio)}</td>
          <td class="num">${fmt(activeTotals.totalPasivoMasPatrimonio - comparisonTotals.totalPasivoMasPatrimonio)}</td>
          <td class="num">${pctChange(comparisonTotals.totalPasivoMasPatrimonio, activeTotals.totalPasivoMasPatrimonio)}</td>
        </tr>
      </tbody>
    </table>

    <h2>3. Estado de Resultados Comparativo (Módulos A y B)</h2>
    <table>
      <thead>
        <tr>
          <th>Cód.</th>
          <th>Rubro de Resultados</th>
          <th class="num">${escapeHtml(comparisonPeriod.name)}</th>
          <th class="num">${escapeHtml(activePeriod.name)}</th>
          <th class="num">Var. Absoluta</th>
          <th class="num">Var. %</th>
        </tr>
      </thead>
      <tbody>
        ${renderAccountsRows(incomeCategories)}
        <tr class="total-row">
          <td></td>
          <td>UTILIDAD BRUTA</td>
          <td class="num">${fmt(comparisonTotals.utilidadBruta)}</td>
          <td class="num">${fmt(activeTotals.utilidadBruta)}</td>
          <td class="num">${fmt(activeTotals.utilidadBruta - comparisonTotals.utilidadBruta)}</td>
          <td class="num">${pctChange(comparisonTotals.utilidadBruta, activeTotals.utilidadBruta)}</td>
        </tr>
        <tr class="total-row">
          <td></td>
          <td>UTILIDAD OPERATIVA (UAII / EBIT)</td>
          <td class="num">${fmt(comparisonTotals.uaii)}</td>
          <td class="num">${fmt(activeTotals.uaii)}</td>
          <td class="num">${fmt(activeTotals.uaii - comparisonTotals.uaii)}</td>
          <td class="num">${pctChange(comparisonTotals.uaii, activeTotals.uaii)}</td>
        </tr>
        <tr class="total-row">
          <td></td>
          <td>UTILIDAD NETA DEL PERÍODO (Después de IR)</td>
          <td class="num">${fmt(comparisonTotals.utilidadNeta)}</td>
          <td class="num">${fmt(activeTotals.utilidadNeta)}</td>
          <td class="num">${fmt(activeTotals.utilidadNeta - comparisonTotals.utilidadNeta)}</td>
          <td class="num">${pctChange(comparisonTotals.utilidadNeta, activeTotals.utilidadNeta)}</td>
        </tr>
      </tbody>
    </table>

    <h2>4. Tablero de Razones Financieras (Módulo B)</h2>
    <table>
      <thead>
        <tr>
          <th>Grupo</th>
          <th>Indicador Financiero</th>
          <th class="num">Valor (${escapeHtml(activePeriod.name)})</th>
          <th>Meta / Benchmark</th>
          <th>Diagnóstico</th>
        </tr>
      </thead>
      <tbody>
        ${ratios
          .map(
            (r) => `<tr>
          <td class="bold">${escapeHtml(r.group)}</td>
          <td>${escapeHtml(r.name)}</td>
          <td class="num bold">${escapeHtml(formatRatioValue(r, cur))}</td>
          <td>${escapeHtml(r.benchmark)}</td>
          <td>${escapeHtml(r.interpretation)}</td>
        </tr>`
          )
          .join('')}
      </tbody>
    </table>

    <h2>5. Punto de Equilibrio (C-V-U), Apalancamiento, Flujo de Caja e Inventario (Módulos C–I)</h2>
    <div class="two-col">
      <div class="box">
        <h3>Módulos C y D: Punto de Equilibrio y Apalancamiento</h3>
        <ul>
          <li><strong>Precio Unitario:</strong> ${cur} ${state.cvuInput.unitPrice.toLocaleString()} | <strong>Costo Variable Unit.:</strong> ${cur} ${state.cvuInput.unitVariableCost.toLocaleString()}</li>
          <li><strong>Margen de Contribución Unitario:</strong> ${cur} ${cvuAndLeverage.unitContributionMargin.toLocaleString()} (${cvuAndLeverage.contributionMarginRatioPct.toFixed(1)}%)</li>
          <li><strong>Punto de Equilibrio Físico:</strong> ${Math.round(cvuAndLeverage.breakEvenUnits ?? 0).toLocaleString()} unidades</li>
          <li><strong>Punto de Equilibrio Monetario:</strong> ${fmt(cvuAndLeverage.breakEvenRevenue ?? 0)}</li>
          <li><strong>Margen de Seguridad:</strong> ${cvuAndLeverage.safetyMarginPct.toFixed(2)}%</li>
          <li><strong>Grados de Apalancamiento:</strong> GAO = ${(cvuAndLeverage.gao ?? 0).toFixed(2)}x | GAF = ${(cvuAndLeverage.gaf ?? 0).toFixed(2)}x | GAT = ${(cvuAndLeverage.gat ?? 0).toFixed(2)}x</li>
        </ul>
      </div>
      <div class="box">
        <h3>Módulos E, F, G e I: Efectivo, Proforma e Inventario</h3>
        <ul>
          <li><strong>Flujo Operativo (NIC 7):</strong> ${fmt(cashFlowResult.netOperatingCashFlow)}</li>
          <li><strong>Flujo de Inversión / Financiamiento:</strong> ${fmt(cashFlowResult.netInvestingCashFlow)} / ${fmt(cashFlowResult.netFinancingCashFlow)}</li>
          <li><strong>Saldo Final de Efectivo en Caja:</strong> ${fmt(cashFlowResult.endingCashBalance)}</li>
          <li><strong>Ventas Proyectadas (Proforma):</strong> ${fmt(masterBudgetAndProforma.projectedSalesRevenue)}</li>
          <li><strong>Utilidad Neta Proforma:</strong> ${fmt(masterBudgetAndProforma.proformaNetIncome)}</li>
          <li><strong>Valor de Inventario (Módulo I):</strong> ${fmt(inventoryResult.totalInventoryValue)} (${inventoryResult.productsInReorderAlert} alertas de reorden)</li>
        </ul>
      </div>
    </div>

    <h2>6. Dictamen Ejecutivo y Conclusiones Estratégicas</h2>
    <div class="box">
      <ul>
        <li><strong>Posición Patrimonial y Solvencia:</strong> ${escapeHtml(state.company.name)} registra activos totales por <strong>${fmt(activeTotals.totalActivos)}</strong> financiados en un <strong>${razonDeudaPct.toFixed(1)}%</strong> con pasivos y un <strong>${(100 - razonDeudaPct).toFixed(1)}%</strong> con patrimonio propio. El capital de trabajo neto pasó de ${fmt(ctnBase)} a <strong>${fmt(ctnActive)}</strong> (razón circulante de <strong>${razonCirculante.toFixed(2)}x</strong>).</li>
        <li><strong>Desempeño DuPont:</strong> ${escapeHtml(duPont.interpretation)}</li>
        <li><strong>Gestión de Efectivo e Inventarios:</strong> ${escapeHtml(cashFlowResult.interpretation)} En bodega se administran ${inventoryResult.items.length} rubros con ${inventoryResult.productsInReorderAlert} alerta(s) de reabastecimiento.</li>
      </ul>
    </div>

    <div class="footer">
      <span>Sistema de Análisis y Planeación Financiera (GFO • IS2122) — Reporte Oficial</span>
      <span>${escapeHtml(state.company.name)} • ${escapeHtml(dateStr)}</span>
    </div>
  </div>
</body>
</html>`;

  const safeName = state.company.name.replace(/[^a-zA-Z0-9_-]+/g, '_') || 'Empresa';
  showReportPreviewAndPrintModal(
    html,
    `Informe Financiero Ejecutivo — ${state.company.name}`,
    `Informe_Ejecutivo_${safeName}`
  );
}

/**
 * Descarga en formato Excel (.xls) el Control de Presupuesto Personal del usuario activo.
 */
export function exportPersonalBudgetExcel(
  budget: PersonalBudgetData,
  result: PersonalBudgetResult,
  userName?: string
): void {
  const sc = budget.studentControl;
  const studentTitle = sc?.studentName || userName || 'Usuario';
  const safeName = studentTitle.replace(/[^a-zA-Z0-9_-]+/g, '_');

  const trackingRows = sc
    ? sc.weeklyTracking
        .map(
          (w) => `<tr>
            <td>Mes ${w.month}</td>
            <td>Semana ${w.week}</td>
            <td>${escapeHtml(w.from)}</td>
            <td>${escapeHtml(w.to)}</td>
            <td>${w.income}</td>
            <td>${w.expenses}</td>
            <td>${w.savings}</td>
            <td>${w.reserve}</td>
            <td>${w.balance ?? 0}</td>
            <td>${w.accumulatedSavings}</td>
            <td>${w.goalProgressPct.toFixed(2)}%</td>
          </tr>`
        )
        .join('')
    : '';

  const projectedRows = sc
    ? sc.projectedCategories
        .map(
          (c) => `<tr>
            <td>${escapeHtml(c.category)}</td>
            <td>${c.plannedAmount}</td>
            <td>${c.incomePct.toFixed(2)}%</td>
            <td>${escapeHtml(c.type)}</td>
            <td>${escapeHtml(c.comment || '')}</td>
          </tr>`
        )
        .join('')
    : '';

  const logRows = sc
    ? sc.weeklyRecords
        .map(
          (r) => `<tr>
            <td>${escapeHtml(r.date)}</td>
            <td>${r.week}</td>
            <td>${escapeHtml(r.fromMonday)}</td>
            <td>${escapeHtml(r.toSunday)}</td>
            <td>${escapeHtml(r.movementType)}</td>
            <td>${escapeHtml(r.category)}</td>
            <td>${escapeHtml(r.description)}</td>
            <td>${r.amount}</td>
            <td>${escapeHtml(r.priority)}</td>
            <td>${escapeHtml(r.medium)}</td>
            <td>${escapeHtml(r.observation)}</td>
          </tr>`
        )
        .join('')
    : '';

  const txRows = budget.transactions
    .map(
      (t) => `<tr>
        <td>${escapeHtml(t.description)}</td>
        <td>${escapeHtml(t.category)}</td>
        <td>${escapeHtml(t.type)}</td>
        <td>${t.isFixed ? 'Fijo' : 'Variable'}</td>
        <td>${t.amount}</td>
      </tr>`
    )
    .join('');

  const excelHtml = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta charset="UTF-8" />
  <style>
    table { border-collapse: collapse; margin-bottom: 18px; font-family: Arial, sans-serif; font-size: 11pt; }
    th { background-color: #0f172a; color: #ffffff; font-weight: bold; border: 1px solid #cbd5e1; padding: 6px 10px; }
    td { border: 1px solid #cbd5e1; padding: 5px 8px; }
    .section { background-color: #2563eb; color: #ffffff; font-weight: bold; font-size: 12pt; }
    .total { background-color: #f1f5f9; font-weight: bold; }
  </style>
</head>
<body>
  <h2>MI CONTROL DE PRESUPUESTO ESTUDIANTIL — ${escapeHtml(studentTitle)}</h2>
  <p>${escapeHtml(budget.monthLabel)}</p>
  ${
    sc
      ? `<table>
          <tr><td colspan="4" class="section">1. DATOS DEL ESTUDIANTE Y RESULTADOS AUTOMÁTICOS</td></tr>
          <tr><td><b>Estudiante:</b></td><td>${escapeHtml(sc.studentName)}</td><td><b>Total de ingresos:</b></td><td>C$ ${sc.autoTotalIncome}</td></tr>
          <tr><td><b>Meta del semestre:</b></td><td>${escapeHtml(sc.semesterGoal)}</td><td><b>Total de gastos:</b></td><td>C$ ${sc.autoTotalExpenses}</td></tr>
          <tr><td><b>Costo de la meta:</b></td><td>C$ ${sc.goalCost}</td><td><b>Total ahorrado:</b></td><td>C$ ${sc.autoTotalSavings}</td></tr>
          <tr><td><b>Duración (semanas):</b></td><td>${sc.durationWeeks}</td><td><b>Reserva acumulada:</b></td><td>C$ ${sc.autoAccumulatedReserve}</td></tr>
          <tr><td><b>Aporte semanal recomendado:</b></td><td>C$ ${(sc.recommendedWeeklyContribution ?? 0).toFixed(2)}</td><td><b>Saldo disponible:</b></td><td>C$ ${sc.autoAvailableBalance}</td></tr>
          <tr><td><b>Periodo:</b></td><td>${escapeHtml(sc.startDate)} al ${escapeHtml(sc.endDate)}</td><td><b>Avance de la meta:</b></td><td>${(sc.autoGoalAchievementRatio * 100).toFixed(2)}%</td></tr>
        </table>
        <table>
          <tr><td colspan="11" class="section">2. SEGUIMIENTO SEMANAL DEL PRESUPUESTO</td></tr>
          <tr><th>Mes</th><th>Semana</th><th>Desde</th><th>Hasta</th><th>Ingresos</th><th>Gastos</th><th>Ahorro</th><th>Reserva</th><th>Saldo</th><th>Ahorro Acum.</th><th>% Meta</th></tr>
          ${trackingRows}
        </table>
        <table>
          <tr><td colspan="5" class="section">3. PRESUPUESTO PROYECTADO SEMANAL (C$ ${sc.availableWeeklyIncome})</td></tr>
          <tr><th>Categoría</th><th>Monto Planificado</th><th>% del Ingreso</th><th>Tipo</th><th>Comentario</th></tr>
          ${projectedRows}
        </table>
        <table>
          <tr><td colspan="11" class="section">4. REGISTRO SEMANAL DETALLADO (${sc.weeklyRecords.length} MOVIMIENTOS)</td></tr>
          <tr><th>Fecha</th><th>Semana</th><th>Desde</th><th>Hasta</th><th>Tipo</th><th>Categoría</th><th>Descripción</th><th>Monto</th><th>Prioridad</th><th>Medio</th><th>Observación</th></tr>
          ${logRows}
        </table>`
      : `<table>
          <tr><td colspan="5" class="section">RESUMEN CONSOLIDADO DE PRESUPUESTO PERSONAL</td></tr>
          <tr><th>Descripción</th><th>Categoría</th><th>Tipo</th><th>Naturaleza</th><th>Monto (C$)</th></tr>
          ${txRows}
          <tr class="total"><td colspan="4">TOTAL INGRESOS</td><td>${result.totalIncome}</td></tr>
          <tr class="total"><td colspan="4">TOTAL GASTOS</td><td>${result.totalExpenses}</td></tr>
          <tr class="total"><td colspan="4">SALDO DISPONIBLE (AHORRO)</td><td>${result.availableBalance}</td></tr>
        </table>`
  }
</body>
</html>`;

  const blob = new Blob(['\uFEFF' + excelHtml], {
    type: 'application/vnd.ms-excel;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Presupuesto_Personal_${safeName}.xls`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Abre una vista de impresión / PDF del Control de Presupuesto Personal del estudiante activo.
 */
export function openPersonalBudgetReportPrintView(
  budget: PersonalBudgetData,
  result: PersonalBudgetResult,
  userName?: string
): void {
  const sc = budget.studentControl;
  const studentTitle = sc?.studentName || userName || 'Estudiante';
  const fmt = (n: number) => `C$ ${Math.round(n).toLocaleString('en-US')}`;

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <title>Reporte de Presupuesto Personal — ${escapeHtml(studentTitle)}</title>
  <style>
    @page { size: A4 portrait; margin: 12mm; }
    * { box-sizing: border-box; }
    body { font-family: 'Segoe UI', Roboto, Arial, sans-serif; color: #0f172a; font-size: 10.5px; line-height: 1.4; margin: 0; }
    .header { background: linear-gradient(135deg, #0f172a, #064e3b); color: #fff; padding: 14px 18px; border-radius: 10px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center; }
    .header h1 { margin: 0 0 4px 0; font-size: 16px; }
    .header p { margin: 0; font-size: 10px; color: #a7f3d0; }
    h2 { font-size: 12px; text-transform: uppercase; color: #065f46; border-bottom: 2px solid #10b981; padding-bottom: 3px; margin: 12px 0 6px 0; }
    .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 10px; }
    .kpi { border: 1px solid #cbd5e1; border-radius: 8px; padding: 8px 10px; background: #f8fafc; }
    .kpi .lbl { font-size: 9px; text-transform: uppercase; color: #64748b; font-weight: 700; }
    .kpi .val { font-size: 13px; font-weight: 800; color: #0f172a; margin-top: 2px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 10px; font-size: 9.5px; }
    th { background: #f1f5f9; padding: 5px 6px; border-bottom: 1.5px solid #94a3b8; text-align: left; text-transform: uppercase; font-size: 8.5px; }
    td { padding: 4px 6px; border-bottom: 1px solid #e2e8f0; }
    .num { text-align: right; font-variant-numeric: tabular-nums; }
    .total { background: #ecfdf5; font-weight: 800; }
    .no-print { background: #0f172a; color: #fff; padding: 10px 18px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
    .btn { background: #10b981; color: #fff; border: none; padding: 7px 14px; border-radius: 6px; font-weight: 700; cursor: pointer; }
    @media print { .no-print { display: none !important; } }
  </style>
</head>
<body>
  <div class="no-print">
    <span><strong>Vista Previa de Reporte Personal:</strong> Presiona "Imprimir / Guardar PDF"</span>
    <button class="btn" onclick="window.print()">🖨️ Imprimir / Guardar como PDF</button>
  </div>
  <div class="header">
    <div>
      <h1>MI CONTROL DE PRESUPUESTO ESTUDIANTIL — ${escapeHtml(studentTitle.toUpperCase())}</h1>
      <p>${escapeHtml(budget.monthLabel)}</p>
    </div>
    <div style="text-align:right">
      <div style="font-weight:800;font-size:13px">${sc ? escapeHtml(sc.semesterGoal) : 'Presupuesto Personal'}</div>
      <p>${sc ? `Meta: ${fmt(sc.goalCost)} (${sc.durationWeeks} semanas)` : ''}</p>
    </div>
  </div>
  ${
    sc
      ? `<div class="kpi-grid">
          <div class="kpi"><div class="lbl">Total Ingresos</div><div class="val">${fmt(sc.autoTotalIncome)}</div></div>
          <div class="kpi"><div class="lbl">Total Gastos</div><div class="val">${fmt(sc.autoTotalExpenses)}</div></div>
          <div class="kpi"><div class="lbl">Ahorro Meta</div><div class="val">${fmt(sc.autoTotalSavings)}</div></div>
          <div class="kpi"><div class="lbl">Avance de Meta</div><div class="val">${(sc.autoGoalAchievementRatio * 100).toFixed(2)}%</div></div>
        </div>
        <h2>1. Seguimiento Semanal (Semanas 1 a ${sc.weeklyTracking.length})</h2>
        <table>
          <thead>
            <tr><th>Mes</th><th>Semana</th><th>Desde</th><th>Hasta</th><th class="num">Ingresos</th><th class="num">Gastos</th><th class="num">Ahorro</th><th class="num">Reserva</th><th class="num">Saldo</th><th class="num">Ahorro Acum.</th><th class="num">% Meta</th></tr>
          </thead>
          <tbody>
            ${sc.weeklyTracking
              .map(
                (w) => `<tr>
                  <td>Mes ${w.month}</td>
                  <td><b>Semana ${w.week}</b></td>
                  <td>${escapeHtml(w.from)}</td>
                  <td>${escapeHtml(w.to)}</td>
                  <td class="num">${fmt(w.income)}</td>
                  <td class="num">${fmt(w.expenses)}</td>
                  <td class="num">${fmt(w.savings)}</td>
                  <td class="num">${fmt(w.reserve)}</td>
                  <td class="num">${w.balance === null ? '—' : fmt(w.balance)}</td>
                  <td class="num"><b>${fmt(w.accumulatedSavings)}</b></td>
                  <td class="num"><b>${w.goalProgressPct.toFixed(2)}%</b></td>
                </tr>`
              )
              .join('')}
            <tr class="total">
              <td colspan="4">TOTAL ACUMULADO (${sc.weeklyTracking.length} SEMANAS)</td>
              <td class="num">${fmt(sc.autoTotalIncome)}</td>
              <td class="num">${fmt(sc.autoTotalExpenses)}</td>
              <td class="num">${fmt(sc.autoTotalSavings)}</td>
              <td class="num">${fmt(sc.autoAccumulatedReserve)}</td>
              <td class="num">${fmt(sc.autoAvailableBalance)}</td>
              <td class="num">${fmt(sc.autoTotalSavings)}</td>
              <td class="num">${(sc.autoGoalAchievementRatio * 100).toFixed(2)}%</td>
            </tr>
          </tbody>
        </table>
        <h2>2. Presupuesto Proyectado Semanal (${fmt(sc.availableWeeklyIncome)})</h2>
        <table>
          <thead>
            <tr><th>Categoría</th><th class="num">Monto Planificado</th><th class="num">% del Ingreso</th><th>Tipo</th><th>Comentario</th></tr>
          </thead>
          <tbody>
            ${sc.projectedCategories
              .map(
                (c) => `<tr>
                  <td><b>${escapeHtml(c.category)}</b></td>
                  <td class="num">${fmt(c.plannedAmount)}</td>
                  <td class="num">${c.incomePct.toFixed(2)}%</td>
                  <td>${escapeHtml(c.type)}</td>
                  <td>${escapeHtml(c.comment || '—')}</td>
                </tr>`
              )
              .join('')}
          </tbody>
        </table>
        <h2>3. Registro Semanal Detallado (${sc.weeklyRecords.length} Movimientos)</h2>
        <table>
          <thead>
            <tr><th>Fecha</th><th>Sem</th><th>Periodo</th><th>Tipo</th><th>Categoría</th><th>Descripción</th><th class="num">Monto</th><th>Prioridad</th><th>Medio</th><th>Observación</th></tr>
          </thead>
          <tbody>
            ${sc.weeklyRecords
              .map(
                (r) => `<tr>
                  <td>${escapeHtml(r.date)}</td>
                  <td><b>${r.week}</b></td>
                  <td>${escapeHtml(r.fromMonday)} al ${escapeHtml(r.toSunday)}</td>
                  <td><b>${escapeHtml(r.movementType)}</b></td>
                  <td>${escapeHtml(r.category)}</td>
                  <td>${escapeHtml(r.description)}</td>
                  <td class="num"><b>${fmt(r.amount)}</b></td>
                  <td>${escapeHtml(r.priority)}</td>
                  <td>${escapeHtml(r.medium)}</td>
                  <td>${escapeHtml(r.observation || '—')}</td>
                </tr>`
              )
              .join('')}
          </tbody>
        </table>`
      : `<div class="kpi-grid">
          <div class="kpi"><div class="lbl">Ingresos</div><div class="val">${fmt(result.totalIncome)}</div></div>
          <div class="kpi"><div class="lbl">Gastos</div><div class="val">${fmt(result.totalExpenses)}</div></div>
          <div class="kpi"><div class="lbl">Saldo Disponible</div><div class="val">${fmt(result.availableBalance)}</div></div>
          <div class="kpi"><div class="lbl">Tasa de Ahorro</div><div class="val">${result.savingsCapacityPct.toFixed(1)}%</div></div>
        </div>
        <h2>Detalle de Movimientos del Presupuesto Personal</h2>
        <table>
          <thead>
            <tr><th>Descripción</th><th>Categoría</th><th>Tipo</th><th>Naturaleza</th><th class="num">Monto</th></tr>
          </thead>
          <tbody>
            ${budget.transactions
              .map(
                (t) => `<tr>
                  <td><b>${escapeHtml(t.description)}</b></td>
                  <td>${escapeHtml(t.category)}</td>
                  <td>${escapeHtml(t.type)}</td>
                  <td>${t.isFixed ? 'Fijo' : 'Variable'}</td>
                  <td class="num">${fmt(t.amount)}</td>
                </tr>`
              )
              .join('')}
          </tbody>
        </table>`
  }
</body>
</html>`;

  const safeName = studentTitle.replace(/[^a-zA-Z0-9_-]+/g, '_') || 'Estudiante';
  showReportPreviewAndPrintModal(
    html,
    `Reporte de Presupuesto Personal — ${studentTitle}`,
    `Reporte_Presupuesto_Personal_${safeName}`
  );
}
