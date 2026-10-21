-- =============================================================================
-- SISTEMA DE ANÁLISIS Y PLANEACIÓN FINANCIERA (IS2122 - GFO 2026)
-- ESQUEMA RELACIONAL DE BASE DE DATOS (PostgreSQL / Supabase)
-- =============================================================================
-- Decisiones de Diseño:
-- 1. Se utiliza NUMERIC(15, 2) para importes monetarios (C$) a fin de evitar errores
--    de redondeo en coma flotante.
-- 2. Se almacenan únicamente los datos de entrada (cuentas, saldos, supuestos,
--    movimientos de caja, inventario y transacciones personales). Los indicadores,
--    razones, punto de equilibrio, grados de apalancamiento y estados proforma se
--    calculan dinámicamente en el Motor Financiero (src/core/finance/) para evitar
--    redundancia o inconsistencias.
-- 3. El módulo de Presupuesto Personal se mantiene en tablas independientes
--    (personal_budgets y personal_transactions) separadas de las tablas empresariales,
--    cumpliendo estrictamente la Guía GFO 2026.
-- =============================================================================

-- 1. EMPRESAS
CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL,
    sector VARCHAR(100) NOT NULL DEFAULT 'Comercial / Industrial',
    currency VARCHAR(10) NOT NULL DEFAULT 'C$',
    shares_outstanding INTEGER NOT NULL DEFAULT 10000 CHECK (shares_outstanding > 0),
    market_price_per_share NUMERIC(15, 2) NOT NULL DEFAULT 100.00 CHECK (market_price_per_share >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. PERÍODOS FINANCIEROS
CREATE TABLE IF NOT EXISTS financial_periods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL, -- Ej: '2024', '2025'
    year INTEGER NOT NULL,
    tax_rate NUMERIC(5, 2) NOT NULL DEFAULT 30.00 CHECK (tax_rate >= 0 AND tax_rate <= 100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(company_id, name)
);

-- 3. CATÁLOGO DE CUENTAS Y SALDOS POR PERÍODO (Estados Financieros)
CREATE TYPE account_category AS ENUM (
    'ACTIVO_CORRIENTE',
    'ACTIVO_NO_CORRIENTE',
    'PASIVO_CORRIENTE',
    'PASIVO_NO_CORRIENTE',
    'PATRIMONIO',
    'INGRESO_OPERATIVO',
    'COSTO_VENTAS',
    'GASTO_OPERATIVO',
    'GASTO_FINANCIERO',
    'OTROS_INGRESOS_GASTOS'
);

CREATE TABLE IF NOT EXISTS financial_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    code VARCHAR(20) NOT NULL,
    name VARCHAR(150) NOT NULL,
    category account_category NOT NULL,
    sub_type VARCHAR(50) NOT NULL DEFAULT 'GENERAL', -- Ej: 'EFECTIVO', 'CUENTAS_POR_COBRAR', 'INVENTARIO', 'CUENTAS_POR_PAGAR', 'CAPITAL', 'UTILIDADES_RETENIDAS'
    UNIQUE(company_id, code)
);

CREATE TABLE IF NOT EXISTS account_balances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    period_id UUID NOT NULL REFERENCES financial_periods(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES financial_accounts(id) ON DELETE CASCADE,
    amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    UNIQUE(period_id, account_id)
);

-- 4. ESCENARIOS DE PUNTO DE EQUILIBRIO (C-V-U) Y APALANCAMIENTO
CREATE TABLE IF NOT EXISTS cvu_leverage_scenarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    period_id UUID NOT NULL REFERENCES financial_periods(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL DEFAULT 'Escenario Base',
    unit_price NUMERIC(15, 2) NOT NULL CHECK (unit_price > 0),
    unit_variable_cost NUMERIC(15, 2) NOT NULL CHECK (unit_variable_cost >= 0),
    fixed_operating_costs NUMERIC(15, 2) NOT NULL CHECK (fixed_operating_costs >= 0),
    current_units_sold NUMERIC(15, 2) NOT NULL CHECK (current_units_sold >= 0),
    interest_expense NUMERIC(15, 2) NOT NULL DEFAULT 0.00 CHECK (interest_expense >= 0),
    preferred_dividends NUMERIC(15, 2) NOT NULL DEFAULT 0.00 CHECK (preferred_dividends >= 0),
    tax_rate NUMERIC(5, 2) NOT NULL DEFAULT 30.00 CHECK (tax_rate >= 0 AND tax_rate < 100)
);

-- 5. MOVIMIENTOS DE FLUJO DE EFECTIVO
CREATE TYPE cash_flow_activity AS ENUM ('OPERACION', 'INVERSION', 'FINANCIAMIENTO');
CREATE TYPE cash_flow_direction AS ENUM ('ENTRADA', 'SALIDA');

CREATE TABLE IF NOT EXISTS cash_flow_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    period_id UUID NOT NULL REFERENCES financial_periods(id) ON DELETE CASCADE,
    concept VARCHAR(200) NOT NULL,
    activity cash_flow_activity NOT NULL,
    direction cash_flow_direction NOT NULL,
    amount NUMERIC(15, 2) NOT NULL CHECK (amount >= 0)
);

-- 6. SUPUESTOS DE PLANEACIÓN FINANCIERA Y PRESUPUESTO MAESTRO
CREATE TABLE IF NOT EXISTS master_budget_assumptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    base_period_id UUID REFERENCES financial_periods(id) ON DELETE SET NULL,
    projection_name VARCHAR(100) NOT NULL DEFAULT 'Presupuesto Maestro 2026',
    projected_units_to_sell NUMERIC(15, 2) NOT NULL CHECK (projected_units_to_sell >= 0),
    projected_unit_price NUMERIC(15, 2) NOT NULL CHECK (projected_unit_price > 0),
    projected_unit_cost NUMERIC(15, 2) NOT NULL CHECK (projected_unit_cost >= 0),
    initial_finished_inventory_units NUMERIC(15, 2) NOT NULL DEFAULT 0,
    desired_ending_inventory_units NUMERIC(15, 2) NOT NULL DEFAULT 0,
    cash_sales_percentage NUMERIC(5, 2) NOT NULL DEFAULT 70.00 CHECK (cash_sales_percentage BETWEEN 0 AND 100),
    cash_purchases_percentage NUMERIC(5, 2) NOT NULL DEFAULT 60.00 CHECK (cash_purchases_percentage BETWEEN 0 AND 100),
    projected_fixed_op_expenses NUMERIC(15, 2) NOT NULL DEFAULT 0,
    projected_variable_op_expense_rate NUMERIC(5, 2) NOT NULL DEFAULT 5.00,
    projected_capex_outflow NUMERIC(15, 2) NOT NULL DEFAULT 0,
    projected_interest_payment NUMERIC(15, 2) NOT NULL DEFAULT 0,
    projected_dividend_payment NUMERIC(15, 2) NOT NULL DEFAULT 0,
    initial_cash_balance NUMERIC(15, 2) NOT NULL DEFAULT 0,
    minimum_cash_required NUMERIC(15, 2) NOT NULL DEFAULT 50000
);

-- 7. MÓDULO COMPLEMENTARIO OBLIGATORIO: PRESUPUESTO PERSONAL (Independiente)
CREATE TYPE personal_tx_type AS ENUM ('INGRESO', 'GASTO');

CREATE TABLE IF NOT EXISTS personal_budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    month_label VARCHAR(50) NOT NULL, -- Ej: 'Octubre 2026'
    savings_goal_percentage NUMERIC(5, 2) NOT NULL DEFAULT 20.00 CHECK (savings_goal_percentage BETWEEN 0 AND 100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS personal_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    budget_id UUID NOT NULL REFERENCES personal_budgets(id) ON DELETE CASCADE,
    description VARCHAR(150) NOT NULL,
    category VARCHAR(80) NOT NULL, -- Ej: 'Salario', 'Vivienda', 'Alimentación', 'Transporte', 'Educación'
    tx_type personal_tx_type NOT NULL,
    amount NUMERIC(15, 2) NOT NULL CHECK (amount >= 0),
    is_fixed BOOLEAN NOT NULL DEFAULT true
);

-- 8. MÓDULO COMPLEMENTARIO OBLIGATORIO: CONTROL BÁSICO DE INVENTARIO
CREATE TABLE IF NOT EXISTS inventory_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    sku VARCHAR(50) NOT NULL,
    name VARCHAR(150) NOT NULL,
    category VARCHAR(80) NOT NULL DEFAULT 'Mercadería General',
    initial_stock NUMERIC(15, 2) NOT NULL DEFAULT 0 CHECK (initial_stock >= 0),
    entries NUMERIC(15, 2) NOT NULL DEFAULT 0 CHECK (entries >= 0),
    exits NUMERIC(15, 2) NOT NULL DEFAULT 0 CHECK (exits >= 0),
    unit_cost NUMERIC(15, 2) NOT NULL CHECK (unit_cost >= 0),
    min_stock NUMERIC(15, 2) NOT NULL DEFAULT 10 CHECK (min_stock >= 0),
    UNIQUE(company_id, sku)
);

