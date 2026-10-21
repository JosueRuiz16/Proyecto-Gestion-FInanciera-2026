# Sistema de Análisis y Planeación Financiera (IS2122 - GFO 2026)

Aplicación web integral desarrollada con **React, TypeScript, React Router, Recharts, Vitest y PostgreSQL/Supabase** para el Proyecto Final de **Gestión Financiera Operativa (IS2122)**.

---

## 1.Cómo Ejecutar el Proyecto Localmente

Abre una terminal en la carpeta del proyecto (`c:\Users\ADMON\Documents\Josue\Proyecto Gestion Financiera`) y ejecuta:

```powershell
# 1. Instalar las dependencias
npm install

# 2. Ejecutar las pruebas unitarias del motor financiero (comprobación manual)
npm test

# 3. Iniciar el servidor de desarrollo web
npm run dev
```

Luego abre en tu navegador el enlace local que mostrará Vite (usualmente `http://localhost:5173`).

---

## 2. Mapa de Código para la Defensa Individual (Sección 9 de la Guía)

Durante la defensa individual, el docente puede pedirte localizar qué archivo realiza cada cálculo, explicar la fórmula y modificar un dato en vivo:

| Módulo Obligatorio | Ruta en la App | Archivo del Motor Financiero (`src/core/finance/`) | Función Principal |
| :--- | :--- | :--- | :--- |
| **A. Estados Financieros** | `/finanzas/estados` | `src/core/finance/statements.ts` | `computeFinancialStatements()` |
| **B. Análisis Financiero y DuPont** | `/finanzas/analisis` | `src/core/finance/analysis.ts` | `computeVerticalAndHorizontalAnalysis()`, `computeFinancialRatios()`, `computeDuPontAnalysis()` |
| **C. Punto de Equilibrio (C-V-U)** | `/finanzas/punto-equilibrio` | `src/core/finance/cvuAndLeverage.ts` | `computeCvuAndLeverage()` |
| **D. Apalancamiento (GAO/GAF/GAT)** | `/finanzas/apalancamiento` | `src/core/finance/cvuAndLeverage.ts` | `computeCvuAndLeverage()` |
| **E. Flujo de Efectivo** | `/finanzas/flujo-efectivo` | `src/core/finance/planningAndProforma.ts` | `computeCashFlowStatement()` |
| **F. Planeación y Presupuestos** | `/finanzas/presupuestos` | `src/core/finance/planningAndProforma.ts` | `computeMasterBudgetAndProforma()` |
| **G. Estados Proforma** | `/finanzas/proforma` | `src/core/finance/planningAndProforma.ts` | `computeMasterBudgetAndProforma()` |
| **H. Presupuesto Personal** | `/personal/presupuesto` | `src/core/finance/complementaryModules.ts` | `computePersonalBudget()` |
| **I. Control Básico de Inventario** | `/inventario` | `src/core/finance/complementaryModules.ts` | `computeInventoryControl()` |

