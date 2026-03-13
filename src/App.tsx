import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { Toaster } from '@/components/ui/sonner';
import Layout from '@/components/Layout';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';

// Employees
import EmployeesList from '@/pages/employees/EmployeesList';

// Customers
import CustomersList from '@/pages/customers/CustomersList';

// Products
import ProductsList from '@/pages/products/ProductsList';

// Sales
import SalesInvoice from '@/pages/sales/SalesInvoice';
import InvoicesList from '@/pages/sales/InvoicesList';

// Warehouses
import WarehousesList from '@/pages/warehouses/WarehousesList';

// Finance
import FinanceDashboard from '@/pages/finance/FinanceDashboard';

// Reports
import ReportsDashboard from '@/pages/reports/ReportsDashboard';

// Tasks
import TasksList from '@/pages/tasks/TasksList';

// Settings
import SettingsPage from '@/pages/settings/SettingsPage';

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        {/* Dashboard */}
        <Route index element={<Dashboard />} />
        
        {/* Employees */}
        <Route path="employees" element={<EmployeesList />} />
        
        {/* Customers */}
        <Route path="customers" element={<CustomersList />} />
        
        {/* Products */}
        <Route path="products" element={<ProductsList />} />
        
        {/* Warehouses */}
        <Route path="warehouses" element={<WarehousesList />} />
        
        {/* Sales */}
        <Route path="sales/invoice" element={<SalesInvoice />} />
        <Route path="sales/invoices" element={<InvoicesList />} />
        <Route path="sales" element={<Navigate to="/sales/invoices" replace />} />
        
        {/* Purchases */}
        <Route path="purchases/invoice" element={<SalesInvoice />} />
        <Route path="purchases/invoices" element={<InvoicesList />} />
        <Route path="purchases" element={<Navigate to="/purchases/invoices" replace />} />
        
        {/* Finance */}
        <Route path="finance" element={<FinanceDashboard />} />
        <Route path="finance/payments" element={<FinanceDashboard />} />
        <Route path="finance/expenses" element={<FinanceDashboard />} />
        <Route path="finance/reports" element={<FinanceDashboard />} />
        
        {/* Reports */}
        <Route path="reports" element={<ReportsDashboard />} />
        
        {/* Tasks */}
        <Route path="tasks" element={<TasksList />} />
        
        {/* Settings */}
        <Route path="settings" element={<SettingsPage />} />
        
        {/* Profile */}
        <Route path="profile" element={<SettingsPage />} />
      </Route>
      
      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
      <Toaster position="top-center" richColors />
    </AuthProvider>
  );
}

export default App;
