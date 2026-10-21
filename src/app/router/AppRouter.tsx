import React from 'react';
import { HashRouter, Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from '../providers/AuthContext';
import { FinancialProvider } from '../providers/FinancialContext';
import { MainLayout } from '../layouts/MainLayout';
import { LoginPage } from '../../modules/auth/LoginPage';
import { DashboardPage } from '../../modules/dashboard/DashboardPage';
import { FinancialStatementsPage } from '../../modules/financial-statements/FinancialStatementsPage';
import { FinancialAnalysisPage } from '../../modules/financial-analysis/FinancialAnalysisPage';
import { BreakEvenPage } from '../../modules/break-even/BreakEvenPage';
import { LeveragePage } from '../../modules/leverage/LeveragePage';
import { CashFlowPage } from '../../modules/cash-flow/CashFlowPage';
import { BudgetingPage } from '../../modules/budgeting/BudgetingPage';
import { ProformaPage } from '../../modules/proforma/ProformaPage';
import { PersonalBudgetPage } from '../../modules/personal-budget/PersonalBudgetPage';
import { InventoryPage } from '../../modules/inventory/InventoryPage';

/**
 * Ruta protegida: sin sesión redirige a /login. Con sesión, monta el contexto financiero
 * del usuario (key = id para reiniciar el estado al cambiar de usuario).
 */
const RequireAuth: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return (
    <FinancialProvider key={user.id} userId={user.id} userDisplayName={user.displayName}>
      <Outlet />
    </FinancialProvider>
  );
};

export const AppRouter: React.FC = () => {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<RequireAuth />}>
            <Route element={<MainLayout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/finanzas/estados" element={<FinancialStatementsPage />} />
              <Route path="/finanzas/analisis" element={<FinancialAnalysisPage />} />
              <Route path="/finanzas/punto-equilibrio" element={<BreakEvenPage />} />
              <Route path="/finanzas/apalancamiento" element={<LeveragePage />} />
              <Route path="/finanzas/flujo-efectivo" element={<CashFlowPage />} />
              <Route path="/finanzas/presupuestos" element={<BudgetingPage />} />
              <Route path="/finanzas/proforma" element={<ProformaPage />} />
              <Route path="/personal/presupuesto" element={<PersonalBudgetPage />} />
              <Route path="/inventario" element={<InventoryPage />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>
          </Route>
        </Routes>
      </HashRouter>
    </AuthProvider>
  );
};
