// أنواع البيانات الرئيسية لنظام ERP

// نوع المستخدم
export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'manager' | 'employee';
  avatar?: string;
  phone?: string;
  department?: string;
  salary?: number;
  hireDate?: string;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
  lastLogin?: string;
  permissions?: string[];
}

// نوع العميل
export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone: string;
  address?: string;
  city?: string;
  country?: string;
  company?: string;
  taxNumber?: string;
  balance: number;
  status: 'active' | 'inactive';
  notes?: string;
  createdAt: string;
  createdBy: string;
}

// نوع المورد
export interface Supplier {
  id: string;
  name: string;
  email?: string;
  phone: string;
  address?: string;
  city?: string;
  country?: string;
  company?: string;
  taxNumber?: string;
  balance: number;
  status: 'active' | 'inactive';
  notes?: string;
  createdAt: string;
}

// نوع الفئة
export interface Category {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  createdAt: string;
}

// نوع المنتج
export interface Product {
  id: string;
  code: string;
  name: string;
  description?: string;
  categoryId: string;
  categoryName?: string;
  unit: string;
  purchasePrice: number;
  salePrice: number;
  minStock: number;
  currentStock: number;
  warehouseId?: string;
  supplierId?: string;
  barcode?: string;
  image?: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

// نوع المستودع
export interface Warehouse {
  id: string;
  name: string;
  location?: string;
  manager?: string;
  phone?: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

// نوع حركة المخزون
export interface StockMovement {
  id: string;
  productId: string;
  productName?: string;
  type: 'in' | 'out' | 'adjustment' | 'transfer';
  quantity: number;
  previousStock: number;
  newStock: number;
  warehouseId?: string;
  reference?: string;
  referenceId?: string;
  notes?: string;
  createdBy: string;
  createdByName?: string;
  createdAt: string;
}

// نوع الفاتورة
export interface Invoice {
  id: string;
  invoiceNumber: string;
  type: 'sale' | 'purchase' | 'return_sale' | 'return_purchase';
  customerId?: string;
  customerName?: string;
  supplierId?: string;
  supplierName?: string;
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  discountType: 'fixed' | 'percentage';
  taxRate: number;
  taxAmount: number;
  total: number;
  paid: number;
  remaining: number;
  paymentStatus: 'paid' | 'partial' | 'unpaid';
  paymentMethod?: 'cash' | 'card' | 'bank_transfer' | 'check' | 'credit';
  dueDate?: string;
  notes?: string;
  status: 'draft' | 'confirmed' | 'cancelled';
  createdBy: string;
  createdByName?: string;
  createdAt: string;
}

// نوع عنصر الفاتورة
export interface InvoiceItem {
  id: string;
  productId: string;
  productName: string;
  productCode?: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
}

// نوع الدفعة
export interface Payment {
  id: string;
  invoiceId?: string;
  invoiceNumber?: string;
  customerId?: string;
  customerName?: string;
  supplierId?: string;
  supplierName?: string;
  amount: number;
  type: 'income' | 'expense';
  method: 'cash' | 'card' | 'bank_transfer' | 'check';
  reference?: string;
  notes?: string;
  createdBy: string;
  createdByName?: string;
  createdAt: string;
}

// نوع المصروف
export interface Expense {
  id: string;
  title: string;
  category: string;
  amount: number;
  date: string;
  description?: string;
  receipt?: string;
  createdBy: string;
  createdByName?: string;
  createdAt: string;
}

// نوع المهمة
export interface Task {
  id: string;
  title: string;
  description?: string;
  assignedTo?: string;
  assignedToName?: string;
  assignedBy: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  dueDate?: string;
  completedAt?: string;
  createdAt: string;
}

// نوع النشاط (للتتبع)
export interface Activity {
  id: string;
  userId: string;
  userName?: string;
  userRole?: string;
  action: string;
  entityType: string;
  entityId?: string;
  entityName?: string;
  details?: string;
  ipAddress?: string;
  createdAt: string;
}

// نوع الإعدادات
export interface Settings {
  companyName: string;
  companyLogo?: string;
  companyPhone?: string;
  companyEmail?: string;
  companyAddress?: string;
  companyTaxNumber?: string;
  currency: string;
  dateFormat: string;
  timeFormat: string;
  language: string;
  theme: 'light' | 'dark' | 'system';
  defaultTaxRate: number;
  invoicePrefix: string;
}

// نوع الإشعار
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  link?: string;
  createdAt: string;
}

// نوع التقرير
export interface Report {
  id: string;
  title: string;
  type: string;
  dateRange: {
    from: string;
    to: string;
  };
  filters?: Record<string, any>;
  data: any;
  createdBy: string;
  createdAt: string;
}

// نوع البيانات الإحصائية
export interface DashboardStats {
  totalSales: number;
  totalPurchases: number;
  totalExpenses: number;
  netProfit: number;
  totalCustomers: number;
  totalSuppliers: number;
  totalProducts: number;
  lowStockProducts: number;
  totalInvoices: number;
  unpaidInvoices: number;
  recentActivities: Activity[];
  salesChart: { date: string; amount: number }[];
  topProducts: { name: string; sales: number }[];
}

// نوع صلاحيات المستخدم
export interface Permission {
  id: string;
  name: string;
  description: string;
  module: string;
}

// نوع الدور الوظيفي
export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: string[];
  createdAt: string;
}
