import fs from 'node:fs';
import { execSync } from 'node:child_process';
import path from 'node:path';

const htmlContent = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Guía Maestra de Defensa Académica y Arquitectura del Sistema Financiero</title>
<style>
  @page {
    size: letter;
    margin: 1.8cm 1.5cm;
    @bottom-right {
      content: counter(page);
    }
  }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    color: #1e293b;
    line-height: 1.55;
    font-size: 10.5pt;
    margin: 0;
    padding: 0;
  }
  .header-box {
    border-bottom: 3px solid #2563eb;
    padding-bottom: 15px;
    margin-bottom: 25px;
  }
  .badge {
    display: inline-block;
    padding: 4px 10px;
    background-color: #eff6ff;
    color: #1d4ed8;
    font-size: 8pt;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    border-radius: 6px;
    border: 1px solid #bfdbfe;
    margin-bottom: 8px;
  }
  h1 {
    font-size: 20pt;
    color: #0f172a;
    margin: 0 0 6px 0;
    font-weight: 800;
  }
  .subtitle {
    font-size: 11pt;
    color: #64748b;
    font-weight: 500;
    margin: 0;
  }
  h2 {
    font-size: 13pt;
    color: #1e3a8a;
    border-left: 4px solid #3b82f6;
    padding-left: 10px;
    margin-top: 26px;
    margin-bottom: 12px;
    page-break-after: avoid;
  }
  h3 {
    font-size: 11pt;
    color: #0f172a;
    margin-top: 18px;
    margin-bottom: 8px;
    page-break-after: avoid;
  }
  p {
    margin-top: 0;
    margin-bottom: 10px;
    text-align: justify;
  }
  ul, ol {
    margin-top: 0;
    margin-bottom: 12px;
    padding-left: 20px;
  }
  li {
    margin-bottom: 4px;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 14px 0 20px 0;
    font-size: 9pt;
    page-break-inside: avoid;
  }
  th {
    background-color: #f1f5f9;
    color: #0f172a;
    font-weight: 700;
    text-align: left;
    padding: 8px 10px;
    border: 1px solid #cbd5e1;
  }
  td {
    padding: 7px 10px;
    border: 1px solid #cbd5e1;
    vertical-align: top;
  }
  tr:nth-child(even) td {
    background-color: #f8fafc;
  }
  .formula-box {
    background-color: #f8fafc;
    border: 1px solid #e2e8f0;
    border-left: 4px solid #10b981;
    padding: 10px 14px;
    margin: 10px 0;
    font-family: Consolas, "Courier New", monospace;
    font-size: 9.5pt;
    color: #065f46;
    border-radius: 4px;
    page-break-inside: avoid;
  }
  .quote-box {
    background-color: #f0fdf4;
    border: 1px solid #bbf7d0;
    border-radius: 6px;
    padding: 12px 14px;
    font-style: italic;
    color: #166534;
    margin: 12px 0;
    page-break-inside: avoid;
  }
  .alert-box {
    background-color: #fffbeb;
    border: 1px solid #fef3c7;
    border-left: 4px solid #f59e0b;
    padding: 10px 14px;
    margin: 12px 0;
    font-size: 9.5pt;
    color: #92400e;
    border-radius: 4px;
    page-break-inside: avoid;
  }
  .script-step {
    background-color: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 12px;
    margin-bottom: 12px;
    box-shadow: 0 1px 2px rgba(0,0,0,0.03);
    page-break-inside: avoid;
  }
  .script-title {
    font-weight: 800;
    color: #2563eb;
    margin-bottom: 6px;
    font-size: 10.5pt;
  }
  .script-body {
    font-size: 9.5pt;
    color: #334155;
    line-height: 1.5;
  }
  .page-break {
    page-break-before: always;
  }
  .diagram-flow {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 15px;
    margin: 15px 0;
    font-family: monospace;
    font-size: 8.5pt;
    line-height: 1.4;
    color: #0f172a;
    white-space: pre-wrap;
  }
</style>
</head>
<body>

<div class="header-box">
  <div class="badge">GFO - IS2122 | INGENIERÍA EN SISTEMAS</div>
  <h1>Guía Maestra de Defensa Académica y Arquitectura del Sistema Financiero</h1>
  <p class="subtitle">Ecosistema Reactivo de Análisis, Planeación y Decisión Financiera (Módulos A al I)</p>
</div>

<h2>1. Visión Global: ¿Qué es el Sistema y cómo opera?</h2>
<p>
El software no es una simple hoja de cálculo ni un almacenamiento estático de datos: es un <strong>Ecosistema Financiero Integral en Cascada (Módulos A al I)</strong>. Cada módulo cumple una función canónica de la administración financiera moderna bajo principios internacionales (<strong>NIC 1, NIC 2, NIC 7 y NIIF</strong>), y todos los datos fluyen de forma continua y automatizada en memoria reactiva.
</p>

<div class="diagram-flow">
[1. ENTRADA Y NÚCLEO CONTABLE]
  └── MÓDULO A: Estados Financieros Consolidados (Balance y Resultados Comparativos)
        │
        ├─► [2. DIAGNÓSTICO FINANCIERO]
        │     └── MÓDULO B: Análisis Vertical, Horizontal, 14 Ratios y Descomposición DuPont
        │
        ├─► [3. ESTRUCTURA OPERATIVA Y SENSIBILIDAD]
        │     ├── MÓDULO C: Punto de Equilibrio C-V-U (Unidades, Ingresos y Margen de Contribución)
        │     └── MÓDULO D: Grados de Apalancamiento (GAO Operativo, GAF Financiero y GAT Total)
        │
        ├─► [4. PLANEACIÓN Y LIQUIDEZ]
        │     ├── MÓDULO E: Flujo de Efectivo NIC 7 (Método Indirecto: FEO, FEI, FEF y Caja Final)
        │     ├── MÓDULO F: Presupuesto Maestro Operativo (Ventas, Compras, Cobros y Pagos)
        │     └── MÓDULO G: Estados Financieros Proforma y Determinación del AFN
        │
        └─► [5. CONTROL Y GESTIÓN]
              ├── MÓDULO I: Control y Valuación de Inventarios NIC 2 (Kardex, Rotación, Días)
              │     └─► (Sincroniza y valida la Cuenta 1107 Inventarios en el Módulo A)
              └── MÓDULO H: Presupuesto Personal y Control Financiero Profesional
</div>

<h2>2. Mapa de Conexión en Cascada: De Dónde Salen y a Dónde Van los Datos</h2>
<table>
  <thead>
    <tr>
      <th style="width: 14%;">Módulo</th>
      <th style="width: 26%;">Origen (De dónde vienen)</th>
      <th style="width: 34%;">Lógica y Cálculos Centrales</th>
      <th style="width: 26%;">Destino (A dónde van)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Módulo A<br/>Estados Financieros</strong></td>
      <td>Documento subido (PDF, Excel, CSV, MD) o digitación manual directa de saldos.</td>
      <td>Cuadre contable (Activo = Pasivo + Patrimonio). Cálculo de Utilidad Bruta, UAII (EBIT), UAI (EBT), Impuestos y Utilidad Neta.</td>
      <td><strong>Es el núcleo central:</strong> Alimenta en tiempo real a B, C, D, E, F y G.</td>
    </tr>
    <tr>
      <td><strong>Módulo B<br/>Diagnóstico y DuPont</strong></td>
      <td>Catálogo de cuentas y totales consolidados del Módulo A.</td>
      <td>Análisis Vertical (% sobre base), Análisis Horizontal (Δ Absoluta y Relativa), 14 razones financieras y descomposición DuPont en 3 factores.</td>
      <td>Genera el Dictamen Ejecutivo y evalúa la viabilidad del crecimiento proyectado en G.</td>
    </tr>
    <tr>
      <td><strong>Módulo C<br/>Punto de Equilibrio</strong></td>
      <td>Ventas Netas, Costo de Ventas y Gastos Operativos Fijos de A; o datos P, CVu y Q del ejercicio.</td>
      <td>Margen de Contribución Unitario (MCU = P - CVu), % Margen de Contribución, Unidades de Equilibrio (Qe = CF / MCU) y Ventas de Equilibrio.</td>
      <td>Establece el piso mínimo operativo antes de proyectar metas en F y G.</td>
    </tr>
    <tr>
      <td><strong>Módulo D<br/>Apalancamiento</strong></td>
      <td>UAII, Intereses Financieros y Costos Fijos de A y C.</td>
      <td>Grado de Apalancamiento Operativo (GAO), Grado Financiero (GAF) y Grado Total (GAT = GAO × GAF).</td>
      <td>Mide la volatilidad de la utilidad neta ante caídas de ventas en los Proforma (G).</td>
    </tr>
    <tr>
      <td><strong>Módulo E<br/>Flujo de Efectivo</strong></td>
      <td>Utilidad Neta de A, sumando depreciaciones y evaluando variaciones de capital de trabajo (ΔCxC, ΔInventario, ΔCxP).</td>
      <td>Método Indirecto bajo NIC 7: Flujos de Operación (FEO), Inversión (FEI) y Financiamiento (FEF).</td>
      <td>Verifica si el saldo de caja del Balance General proviene de rentabilidad o endeudamiento.</td>
    </tr>
    <tr>
      <td><strong>Módulo F<br/>Presupuesto Maestro</strong></td>
      <td>Cierre de ventas, inventario inicial, CxC y proveedores del Módulo A, más metas de crecimiento.</td>
      <td>Cédulas presupuestarias de ventas, compras, cobranzas, pagos y flujo mensual/anual de tesorería.</td>
      <td>Construye los datos de entrada indispensables para proyectar el Proforma (G).</td>
    </tr>
    <tr>
      <td><strong>Módulo G<br/>Estados Proforma</strong></td>
      <td>Datos históricos del Módulo A combinados con los resultados del Presupuesto Maestro (F).</td>
      <td>Proyección del Estado de Resultados y Balance General. Cálculo de los <strong>Fondos Externos Necesarios (AFN)</strong>.</td>
      <td>Decisión de financiamiento: determina si se necesita crédito bancario o aporte de capital.</td>
    </tr>
    <tr>
      <td><strong>Módulo I<br/>Control Inventarios</strong></td>
      <td>Entradas, salidas, existencias iniciales y costos unitarios de cada producto (SKU).</td>
      <td>Costo Promedio Ponderado bajo NIC 2, Valoración total de inventario, Rotación Anual y Días de Inventario.</td>
      <td><strong>Sincroniza directamente con la cuenta 1107 (Inventarios) del Balance en el Módulo A.</strong></td>
    </tr>
  </tbody>
</table>

<div class="page-break"></div>

<h2>3. Profundización: MÓDULO G — Estados Financieros Proforma y el AFN</h2>
<p>
El Módulo G es el instrumento de <strong>planeación financiera estratégica</strong>. Responde la pregunta crítica que todo Director Financiero (CFO) debe resolver:
</p>
<div class="quote-box">
"Si planeamos incrementar las ventas un X% el próximo año, ¿cuánto dinero adicional necesitaremos conseguir de fuentes externas para financiar el crecimiento sin caer en insolvencia?"
</div>

<h3>3.1. Origen de los Datos</h3>
<ol>
  <li><strong>Del Módulo A:</strong> Cuentas de activos y pasivos espontáneos que crecen al ritmo de la actividad comercial (Efectivo, Clientes, Inventarios, Proveedores y Gastos acumulados), así como el margen de utilidad neta y dividendos históricos.</li>
  <li><strong>Del Módulo F:</strong> Pronóstico de unidades a vender, precio unitario proyectado, compras presupuestadas e inversiones en activo fijo (CAPEX planeado).</li>
</ol>

<h3>3.2. Fórmulas y Mecánica de Cálculo</h3>
<div class="formula-box">
• Ventas Proyectadas = Ventas Base × (1 + g)<br/>
• Costo de Ventas Proyectado = Ventas Proyectadas × (Costo Base / Ventas Base)<br/>
• Gastos Operativos Proyectados = Gastos Fijos + Gastos Variables Proyectados<br/>
• UAII Proforma = Ventas Proyectadas - Costo Proforma - Gastos Proforma<br/>
• Utilidad Neta Proforma = (UAII Proforma - Gastos Financieros) × (1 - Tasa IR)
</div>

<div class="formula-box">
• Retención de Utilidades = Utilidad Neta Proforma - Dividendos Proyectados<br/>
• Patrimonio Proforma = Capital Social + Utilidades Retenidas Previas + Retención del Período
</div>

<h3>3.3. Determinación y Decisión Estratégica del AFN</h3>
<p>
Al incrementarse las ventas, la empresa necesita comprar más inventario, financiar más crédito a clientes y posiblemente adquirir maquinaria (más Activos Totales Proforma: <strong>A*</strong>). Parte de esta necesidad se financia sola con el crédito de proveedores y las utilidades retenidas generadas internamente (<strong>L* + E*</strong>). La diferencia constituye el <strong>AFN (Additional Funds Needed)</strong>:
</p>

<div class="formula-box" style="border-left-color: #2563eb; color: #1e40af; font-size: 10.5pt; font-weight: bold;">
AFN = Total Activos Proforma - (Total Pasivos Proforma + Total Patrimonio Proforma)
</div>

<div class="alert-box">
<strong>Interpretación Defensiva ante el Profesor:</strong>
<ul>
  <li><strong>Si AFN > 0 (Faltante de Fondos):</strong> El negocio crece más rápido de lo que sus utilidades retenidas pueden respaldar. <em>Decisión requerida:</em> Gestionar un préstamo bancario a largo plazo o solicitar una inyección de capital a los socios para no descapitalizarse.</li>
  <li><strong>Si AFN &lt; 0 (Superávit de Fondos):</strong> El negocio genera más flujo de efectivo interno del que necesita para crecer. <em>Decisión requerida:</em> Amortizar deuda cara anticipadamente, invertir en valores negociables o distribuir dividendos extraordinarios.</li>
</ul>
</div>

<h2>4. Profundización: MÓDULO I — Control y Valuación de Inventarios (NIC 2)</h2>
<p>
El Módulo I administra el activo circulante de mayor riesgo operativo y financiero en empresas comerciales e industriales bajo la <strong>Norma Internacional de Contabilidad 2 (NIC 2: Inventarios)</strong>.
</p>

<h3>4.1. Conexión Directa con el Módulo A</h3>
<p>
El sistema no mantiene el inventario en una hoja desconectada. El cálculo de valor total:
</p>
<div class="formula-box">
Valor Total de Inventario en Bodega = Σ (Stock Final de cada SKU × Costo Unitario Promedio)
</div>
<p>
<strong>alimenta y valida automáticamente la cuenta contable 1107 ("Inventarios, neto") en el Balance General del Módulo A</strong>. Si se registran compras o ventas en el Kardex, el saldo de Activos Corrientes y el Capital de Trabajo se actualizan de inmediato.
</p>

<h3>4.2. Métricas y Ratios Operativos de Inventario</h3>
<ul>
  <li><strong>Ecuación de Existencia Física (Kardex):</strong>
    <div class="formula-box">Stock Final (unidades) = Stock Inicial + Entradas (Compras) - Salidas (Ventas)</div>
  </li>
  <li><strong>Rotación de Inventario (Veces al año):</strong>
    <div class="formula-box">Rotación = Costo de Ventas Anual (Módulo A) / Inventario Promedio (Módulo I)</div>
    <em>Mide cuántas veces al año la mercadería se vende y se repone en el almacén.</em>
  </li>
  <li><strong>Días de Venta de Inventario (DVI / Permanencia en Bodega):</strong>
    <div class="formula-box">Días de Inventario = 365 días / Rotación de Inventario</div>
    <em>Indica cuántos días pasa la mercadería inmovilizada en promedio antes de convertirse en efectivo o cuenta por cobrar.</em>
  </li>
  <li><strong>Semáforo de Seguridad y Alertas de Stock Mínimo:</strong>
    <ul>
      <li><strong>Alerta Roja (Reposición Urgente):</strong> Se activa si <code>Stock Final &lt; Stock Mínimo</code>. Previene el quiebre de stock, paros en ventas y pérdida de cuota de mercado.</li>
      <li><strong>Alerta Amarilla (Sobreinventario):</strong> Se activa si <code>Stock Final > 2.5 × Stock Mínimo</code>. Alerta sobre capital de trabajo ocioso, costo de almacenaje elevado y riesgo de merma o vencimiento.</li>
    </ul>
  </li>
</ul>

<div class="page-break"></div>

<h2>5. Guión Paso a Paso: Cómo Explicarle el Proyecto al Profesor</h2>

<div class="script-step">
  <div class="script-title">Paso 1: Apertura y Arquitectura del Sistema (30 segundos)</div>
  <div class="script-body">
    "Buenos días, profesor. Nuestro proyecto es un <strong>Sistema Integral de Análisis, Planeación y Decisión Financiera</strong> estructurado en 9 módulos en cascada bajo estándares NIC y NIIF. La ventaja principal es que no trabaja con celdas estáticas: cualquier modificación en las cuentas de los Estados Financieros se propaga de manera reactiva en tiempo real por todos los módulos sin requerir sincronizaciones manuales."
  </div>
</div>

<div class="script-step">
  <div class="script-title">Paso 2: El Núcleo Contable y Cuadre Patrimonial (Módulo A)</div>
  <div class="script-body">
    "En el <strong>Módulo A</strong> cargamos o editamos los Estados Financieros Comparativos de dos períodos. El sistema valida automáticamente la ecuación contable: <em>Activo = Pasivo + Patrimonio</em>. Desde aquí se calculan la Utilidad Bruta, la Utilidad Operativa (UAII) y la Utilidad Neta descontando la provisión real del Impuesto sobre la Renta. Este módulo es el corazón que bombea información a todos los demás."
  </div>
</div>

<div class="script-step">
  <div class="script-title">Paso 3: Diagnóstico, Estructura de Costos y Apalancamiento (Módulos B, C y D)</div>
  <div class="script-body">
    "A partir de estos estados, el <strong>Módulo B</strong> evalúa la empresa con Análisis Vertical, Horizontal, 14 razones financieras y la descomposición DuPont en tres palancas (margen, rotación y apalancamiento). Luego, los <strong>Módulos C y D</strong> analizan la estructura operativa: calculamos el Punto de Equilibrio en unidades e ingresos para saber el piso mínimo de operación, y los grados de apalancamiento GAO, GAF y GAT para medir el riesgo de la utilidad ante oscilaciones del mercado."
  </div>
</div>

<div class="script-step">
  <div class="script-title">Paso 4: Operación de Bodega y Control de Existencias (Módulo I)</div>
  <div class="script-body">
    "En el <strong>Módulo I</strong> llevamos el control de existencias bajo NIC 2 por el método de Costo Promedio Ponderado. Controlamos las compras, salidas, rotación y días de inventario de cada SKU. Lo más importante es que <em>el valor totalizado de las existencias físicas está enlazado directamente con la cuenta 1107 de Inventarios en el Balance General del Módulo A</em>, unificando la bodega con la contabilidad."
  </div>
</div>

<div class="script-step">
  <div class="script-title">Paso 5: Planeación, Flujo y Proforma Estratégico (Módulos E, F y G)</div>
  <div class="script-body">
    "Finalmente cerramos el ciclo gerencial: el <strong>Módulo E</strong> analiza la liquidez real mediante el Flujo de Efectivo NIC 7 por método indirecto (operación, inversión y financiamiento). El <strong>Módulo F</strong> estructura el Presupuesto Maestro. Y con esa base, el <strong>Módulo G</strong> proyecta los Estados Proforma del siguiente año, calculando con exactitud matemática el <strong>AFN (Fondos Externos Necesarios)</strong> para dictaminar si la empresa puede financiar su crecimiento con fondos propios o si debe negociar un crédito bancario."
  </div>
</div>

<h2>6. Respuestas Contundentes a Preguntas Clave del Profesor</h2>
<table>
  <thead>
    <tr>
      <th style="width: 35%;">Pregunta Típica del Profesor</th>
      <th style="width: 65%;">Respuesta Técnica y Rigurosa</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>¿Por qué la Utilidad Neta no es igual al saldo en efectivo del banco?</strong></td>
      <td>"Porque la utilidad neta se rige por el <strong>principio de devengado</strong> (ingresos y gastos se reconocen cuando se generan, no cuando se cobran o pagan), mientras que el efectivo se rige por el <strong>principio de caja</strong>. Por eso implementamos el <strong>Módulo E (Flujo de Efectivo NIC 7)</strong>, que concilia la utilidad neta sumando las partidas virtuales que no consumen dinero (como la depreciación) y ajustando las variaciones del capital de trabajo (clientes, inventarios y proveedores)."</td>
    </tr>
    <tr>
      <td><strong>¿Qué significa si en el Módulo G el AFN resulta negativo?</strong></td>
      <td>"Significa que la empresa genera un <strong>superávit de fondos internos</strong>. El margen de retención de utilidades y la generación operativa son mayores que la inversión en activos requerida para crecer. La empresa no necesita endeudarse; al contrario, puede amortizar pasivos caros o repartir dividendos a los socios."</td>
    </tr>
    <tr>
      <td><strong>¿Por qué en el Módulo I se mide la rotación y los días de inventario?</strong></td>
      <td>"Porque un exceso de días de inventario significa <strong>capital de trabajo ocioso e improductivo</strong>, costos de almacenamiento y riesgo de merma o deterioro. Al contrario, una rotación muy acelerada sin stock mínimo puede provocar quiebres de stock y pérdida de ventas. El módulo busca el equilibrio óptimo."</td>
    </tr>
    <tr>
      <td><strong>¿Qué sucede en el sistema si el usuario modifica una cuenta del Balance?</strong></td>
      <td>"Gracias a la reactividad del sistema, el nuevo valor recalcula de inmediato los ratios de liquidez y solvencia del Módulo B, actualiza las variaciones de efectivo del Módulo E y recalcula los activos requeridos en el Proforma del Módulo G."</td>
    </tr>
  </tbody>
</table>

</body>
</html>
`;

const tempHtmlPath = path.resolve('temp_guia_defensa.html');
const outputPdfPath = path.resolve('GUIA_DEFENSA_SISTEMA_FINANCIERO.pdf');

fs.writeFileSync(tempHtmlPath, htmlContent, 'utf8');

// Edge headless to PDF
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const cmd = `"${edgePath}" --headless --disable-gpu --run-all-compositor-stages-before-draw --print-to-pdf="${outputPdfPath}" "${tempHtmlPath}"`;

console.log('Generando PDF con Microsoft Edge...');
execSync(cmd);
fs.unlinkSync(tempHtmlPath);

console.log('PDF generado exitosamente en:', outputPdfPath);
