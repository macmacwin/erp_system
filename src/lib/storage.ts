// نظام التخزين المحلي - Local Storage Database
// يحل محل قاعدة البيانات في هذا النظام

import type {
  User, Customer, Supplier, Category, Product, Warehouse,
  StockMovement, Invoice, Payment, Expense, Task, Activity,
  Settings, Notification, Role
} from '@/types';

// مفاتيح التخزين
const STORAGE_KEYS = {
  users: 'erp_users',
  customers: 'erp_customers',
  suppliers: 'erp_suppliers',
  categories: 'erp_categories',
  products: 'erp_products',
  warehouses: 'erp_warehouses',
  stockMovements: 'erp_stock_movements',
  invoices: 'erp_invoices',
  payments: 'erp_payments',
  expenses: 'erp_expenses',
  tasks: 'erp_tasks',
  activities: 'erp_activities',
  settings: 'erp_settings',
  notifications: 'erp_notifications',
  roles: 'erp_roles',
  currentUser: 'erp_current_user',
  authToken: 'erp_auth_token'
};

// ==================== دوال مساعدة ====================

// الحصول على البيانات
function getData<T>(key: string): T[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
}

// حفظ البيانات
function setData<T>(key: string, data: T[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(data));
}

// توليد معرف فريد
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// توليد رقم فاتورة
export function generateInvoiceNumber(type: 'sale' | 'purchase' | 'return_sale' | 'return_purchase'): string {
  const prefix = {
    sale: 'INV-S',
    purchase: 'INV-P',
    return_sale: 'RET-S',
    return_purchase: 'RET-P'
  };
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${prefix[type]}-${date}-${random}`;
}

// الحصول على الوقت الحالي
export function getCurrentDateTime(): string {
  return new Date().toISOString();
}

// ==================== المستخدمين ====================

export const UserStorage = {
  getAll: (): User[] => getData<User>(STORAGE_KEYS.users),
  
  getById: (id: string): User | undefined => {
    const users = getData<User>(STORAGE_KEYS.users);
    return users.find(u => u.id === id);
  },
  
  getByEmail: (email: string): User | undefined => {
    const users = getData<User>(STORAGE_KEYS.users);
    return users.find(u => u.email === email);
  },
  
  create: (user: Omit<User, 'id' | 'createdAt'>): User => {
    const users = getData<User>(STORAGE_KEYS.users);
    const newUser: User = {
      ...user,
      id: generateId(),
      createdAt: getCurrentDateTime()
    };
    users.push(newUser);
    setData(STORAGE_KEYS.users, users);
    return newUser;
  },
  
  update: (id: string, updates: Partial<User>): User | null => {
    const users = getData<User>(STORAGE_KEYS.users);
    const index = users.findIndex(u => u.id === id);
    if (index === -1) return null;
    users[index] = { ...users[index], ...updates };
    setData(STORAGE_KEYS.users, users);
    return users[index];
  },
  
  delete: (id: string): boolean => {
    const users = getData<User>(STORAGE_KEYS.users);
    const filtered = users.filter(u => u.id !== id);
    if (filtered.length === users.length) return false;
    setData(STORAGE_KEYS.users, filtered);
    return true;
  },
  
  getActive: (): User[] => {
    return getData<User>(STORAGE_KEYS.users).filter(u => u.status === 'active');
  }
};

// ==================== العملاء ====================

export const CustomerStorage = {
  getAll: (): Customer[] => getData<Customer>(STORAGE_KEYS.customers),
  
  getById: (id: string): Customer | undefined => {
    return getData<Customer>(STORAGE_KEYS.customers).find(c => c.id === id);
  },
  
  create: (customer: Omit<Customer, 'id' | 'createdAt'>): Customer => {
    const customers = getData<Customer>(STORAGE_KEYS.customers);
    const newCustomer: Customer = {
      ...customer,
      id: generateId(),
      createdAt: getCurrentDateTime()
    };
    customers.push(newCustomer);
    setData(STORAGE_KEYS.customers, customers);
    return newCustomer;
  },
  
  update: (id: string, updates: Partial<Customer>): Customer | null => {
    const customers = getData<Customer>(STORAGE_KEYS.customers);
    const index = customers.findIndex(c => c.id === id);
    if (index === -1) return null;
    customers[index] = { ...customers[index], ...updates };
    setData(STORAGE_KEYS.customers, customers);
    return customers[index];
  },
  
  delete: (id: string): boolean => {
    const customers = getData<Customer>(STORAGE_KEYS.customers);
    const filtered = customers.filter(c => c.id !== id);
    if (filtered.length === customers.length) return false;
    setData(STORAGE_KEYS.customers, filtered);
    return true;
  },
  
  getActive: (): Customer[] => {
    return getData<Customer>(STORAGE_KEYS.customers).filter(c => c.status === 'active');
  },
  
  updateBalance: (id: string, amount: number): void => {
    const customer = CustomerStorage.getById(id);
    if (customer) {
      CustomerStorage.update(id, { balance: customer.balance + amount });
    }
  }
};

// ==================== الموردين ====================

export const SupplierStorage = {
  getAll: (): Supplier[] => getData<Supplier>(STORAGE_KEYS.suppliers),
  
  getById: (id: string): Supplier | undefined => {
    return getData<Supplier>(STORAGE_KEYS.suppliers).find(s => s.id === id);
  },
  
  create: (supplier: Omit<Supplier, 'id' | 'createdAt'>): Supplier => {
    const suppliers = getData<Supplier>(STORAGE_KEYS.suppliers);
    const newSupplier: Supplier = {
      ...supplier,
      id: generateId(),
      createdAt: getCurrentDateTime()
    };
    suppliers.push(newSupplier);
    setData(STORAGE_KEYS.suppliers, suppliers);
    return newSupplier;
  },
  
  update: (id: string, updates: Partial<Supplier>): Supplier | null => {
    const suppliers = getData<Supplier>(STORAGE_KEYS.suppliers);
    const index = suppliers.findIndex(s => s.id === id);
    if (index === -1) return null;
    suppliers[index] = { ...suppliers[index], ...updates };
    setData(STORAGE_KEYS.suppliers, suppliers);
    return suppliers[index];
  },
  
  delete: (id: string): boolean => {
    const suppliers = getData<Supplier>(STORAGE_KEYS.suppliers);
    const filtered = suppliers.filter(s => s.id !== id);
    if (filtered.length === suppliers.length) return false;
    setData(STORAGE_KEYS.suppliers, filtered);
    return true;
  },
  
  getActive: (): Supplier[] => {
    return getData<Supplier>(STORAGE_KEYS.suppliers).filter(s => s.status === 'active');
  }
};

// ==================== الفئات ====================

export const CategoryStorage = {
  getAll: (): Category[] => getData<Category>(STORAGE_KEYS.categories),
  
  getById: (id: string): Category | undefined => {
    return getData<Category>(STORAGE_KEYS.categories).find(c => c.id === id);
  },
  
  create: (category: Omit<Category, 'id' | 'createdAt'>): Category => {
    const categories = getData<Category>(STORAGE_KEYS.categories);
    const newCategory: Category = {
      ...category,
      id: generateId(),
      createdAt: getCurrentDateTime()
    };
    categories.push(newCategory);
    setData(STORAGE_KEYS.categories, categories);
    return newCategory;
  },
  
  update: (id: string, updates: Partial<Category>): Category | null => {
    const categories = getData<Category>(STORAGE_KEYS.categories);
    const index = categories.findIndex(c => c.id === id);
    if (index === -1) return null;
    categories[index] = { ...categories[index], ...updates };
    setData(STORAGE_KEYS.categories, categories);
    return categories[index];
  },
  
  delete: (id: string): boolean => {
    const categories = getData<Category>(STORAGE_KEYS.categories);
    const filtered = categories.filter(c => c.id !== id);
    if (filtered.length === categories.length) return false;
    setData(STORAGE_KEYS.categories, filtered);
    return true;
  }
};

// ==================== المنتجات ====================

export const ProductStorage = {
  getAll: (): Product[] => getData<Product>(STORAGE_KEYS.products),
  
  getById: (id: string): Product | undefined => {
    return getData<Product>(STORAGE_KEYS.products).find(p => p.id === id);
  },
  
  getByCode: (code: string): Product | undefined => {
    return getData<Product>(STORAGE_KEYS.products).find(p => p.code === code);
  },
  
  create: (product: Omit<Product, 'id' | 'createdAt'>): Product => {
    const products = getData<Product>(STORAGE_KEYS.products);
    const newProduct: Product = {
      ...product,
      id: generateId(),
      createdAt: getCurrentDateTime()
    };
    products.push(newProduct);
    setData(STORAGE_KEYS.products, products);
    return newProduct;
  },
  
  update: (id: string, updates: Partial<Product>): Product | null => {
    const products = getData<Product>(STORAGE_KEYS.products);
    const index = products.findIndex(p => p.id === id);
    if (index === -1) return null;
    products[index] = { ...products[index], ...updates };
    setData(STORAGE_KEYS.products, products);
    return products[index];
  },
  
  delete: (id: string): boolean => {
    const products = getData<Product>(STORAGE_KEYS.products);
    const filtered = products.filter(p => p.id !== id);
    if (filtered.length === products.length) return false;
    setData(STORAGE_KEYS.products, filtered);
    return true;
  },
  
  getActive: (): Product[] => {
    return getData<Product>(STORAGE_KEYS.products).filter(p => p.status === 'active');
  },
  
  getLowStock: (): Product[] => {
    return getData<Product>(STORAGE_KEYS.products).filter(p => 
      p.status === 'active' && p.currentStock <= p.minStock
    );
  },
  
  updateStock: (id: string, quantity: number): void => {
    const product = ProductStorage.getById(id);
    if (product) {
      ProductStorage.update(id, { currentStock: product.currentStock + quantity });
    }
  }
};

// ==================== المستودعات ====================

export const WarehouseStorage = {
  getAll: (): Warehouse[] => getData<Warehouse>(STORAGE_KEYS.warehouses),
  
  getById: (id: string): Warehouse | undefined => {
    return getData<Warehouse>(STORAGE_KEYS.warehouses).find(w => w.id === id);
  },
  
  create: (warehouse: Omit<Warehouse, 'id' | 'createdAt'>): Warehouse => {
    const warehouses = getData<Warehouse>(STORAGE_KEYS.warehouses);
    const newWarehouse: Warehouse = {
      ...warehouse,
      id: generateId(),
      createdAt: getCurrentDateTime()
    };
    warehouses.push(newWarehouse);
    setData(STORAGE_KEYS.warehouses, warehouses);
    return newWarehouse;
  },
  
  update: (id: string, updates: Partial<Warehouse>): Warehouse | null => {
    const warehouses = getData<Warehouse>(STORAGE_KEYS.warehouses);
    const index = warehouses.findIndex(w => w.id === id);
    if (index === -1) return null;
    warehouses[index] = { ...warehouses[index], ...updates };
    setData(STORAGE_KEYS.warehouses, warehouses);
    return warehouses[index];
  },
  
  delete: (id: string): boolean => {
    const warehouses = getData<Warehouse>(STORAGE_KEYS.warehouses);
    const filtered = warehouses.filter(w => w.id !== id);
    if (filtered.length === warehouses.length) return false;
    setData(STORAGE_KEYS.warehouses, filtered);
    return true;
  },
  
  getActive: (): Warehouse[] => {
    return getData<Warehouse>(STORAGE_KEYS.warehouses).filter(w => w.status === 'active');
  }
};

// ==================== حركات المخزون ====================

export const StockMovementStorage = {
  getAll: (): StockMovement[] => getData<StockMovement>(STORAGE_KEYS.stockMovements),
  
  create: (movement: Omit<StockMovement, 'id' | 'createdAt'>): StockMovement => {
    const movements = getData<StockMovement>(STORAGE_KEYS.stockMovements);
    const newMovement: StockMovement = {
      ...movement,
      id: generateId(),
      createdAt: getCurrentDateTime()
    };
    movements.push(newMovement);
    setData(STORAGE_KEYS.stockMovements, movements);
    return newMovement;
  },
  
  getByProduct: (productId: string): StockMovement[] => {
    return getData<StockMovement>(STORAGE_KEYS.stockMovements)
      .filter(m => m.productId === productId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },
  
  getRecent: (limit: number = 50): StockMovement[] => {
    return getData<StockMovement>(STORAGE_KEYS.stockMovements)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }
};

// ==================== الفواتير ====================

export const InvoiceStorage = {
  getAll: (): Invoice[] => getData<Invoice>(STORAGE_KEYS.invoices),
  
  getById: (id: string): Invoice | undefined => {
    return getData<Invoice>(STORAGE_KEYS.invoices).find(i => i.id === id);
  },
  
  getByNumber: (number: string): Invoice | undefined => {
    return getData<Invoice>(STORAGE_KEYS.invoices).find(i => i.invoiceNumber === number);
  },
  
  create: (invoice: Omit<Invoice, 'id' | 'createdAt'>): Invoice => {
    const invoices = getData<Invoice>(STORAGE_KEYS.invoices);
    const newInvoice: Invoice = {
      ...invoice,
      id: generateId(),
      createdAt: getCurrentDateTime()
    };
    invoices.push(newInvoice);
    setData(STORAGE_KEYS.invoices, invoices);
    return newInvoice;
  },
  
  update: (id: string, updates: Partial<Invoice>): Invoice | null => {
    const invoices = getData<Invoice>(STORAGE_KEYS.invoices);
    const index = invoices.findIndex(i => i.id === id);
    if (index === -1) return null;
    invoices[index] = { ...invoices[index], ...updates };
    setData(STORAGE_KEYS.invoices, invoices);
    return invoices[index];
  },
  
  delete: (id: string): boolean => {
    const invoices = getData<Invoice>(STORAGE_KEYS.invoices);
    const filtered = invoices.filter(i => i.id !== id);
    if (filtered.length === invoices.length) return false;
    setData(STORAGE_KEYS.invoices, filtered);
    return true;
  },
  
  getByCustomer: (customerId: string): Invoice[] => {
    return getData<Invoice>(STORAGE_KEYS.invoices)
      .filter(i => i.customerId === customerId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },
  
  getByType: (type: Invoice['type']): Invoice[] => {
    return getData<Invoice>(STORAGE_KEYS.invoices)
      .filter(i => i.type === type)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },
  
  getUnpaid: (): Invoice[] => {
    return getData<Invoice>(STORAGE_KEYS.invoices)
      .filter(i => i.paymentStatus !== 'paid' && i.status === 'confirmed')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },
  
  getRecent: (limit: number = 50): Invoice[] => {
    return getData<Invoice>(STORAGE_KEYS.invoices)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  },
  
  getByDateRange: (from: string, to: string): Invoice[] => {
    return getData<Invoice>(STORAGE_KEYS.invoices)
      .filter(i => i.createdAt >= from && i.createdAt <= to)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
};

// ==================== المدفوعات ====================

export const PaymentStorage = {
  getAll: (): Payment[] => getData<Payment>(STORAGE_KEYS.payments),
  
  create: (payment: Omit<Payment, 'id' | 'createdAt'>): Payment => {
    const payments = getData<Payment>(STORAGE_KEYS.payments);
    const newPayment: Payment = {
      ...payment,
      id: generateId(),
      createdAt: getCurrentDateTime()
    };
    payments.push(newPayment);
    setData(STORAGE_KEYS.payments, payments);
    return newPayment;
  },
  
  getByInvoice: (invoiceId: string): Payment[] => {
    return getData<Payment>(STORAGE_KEYS.payments)
      .filter(p => p.invoiceId === invoiceId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },
  
  getRecent: (limit: number = 50): Payment[] => {
    return getData<Payment>(STORAGE_KEYS.payments)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  },
  
  getByDateRange: (from: string, to: string): Payment[] => {
    return getData<Payment>(STORAGE_KEYS.payments)
      .filter(p => p.createdAt >= from && p.createdAt <= to)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
};

// ==================== المصروفات ====================

export const ExpenseStorage = {
  getAll: (): Expense[] => getData<Expense>(STORAGE_KEYS.expenses),
  
  create: (expense: Omit<Expense, 'id' | 'createdAt'>): Expense => {
    const expenses = getData<Expense>(STORAGE_KEYS.expenses);
    const newExpense: Expense = {
      ...expense,
      id: generateId(),
      createdAt: getCurrentDateTime()
    };
    expenses.push(newExpense);
    setData(STORAGE_KEYS.expenses, expenses);
    return newExpense;
  },
  
  update: (id: string, updates: Partial<Expense>): Expense | null => {
    const expenses = getData<Expense>(STORAGE_KEYS.expenses);
    const index = expenses.findIndex(e => e.id === id);
    if (index === -1) return null;
    expenses[index] = { ...expenses[index], ...updates };
    setData(STORAGE_KEYS.expenses, expenses);
    return expenses[index];
  },
  
  delete: (id: string): boolean => {
    const expenses = getData<Expense>(STORAGE_KEYS.expenses);
    const filtered = expenses.filter(e => e.id !== id);
    if (filtered.length === expenses.length) return false;
    setData(STORAGE_KEYS.expenses, filtered);
    return true;
  },
  
  getByDateRange: (from: string, to: string): Expense[] => {
    return getData<Expense>(STORAGE_KEYS.expenses)
      .filter(e => e.date >= from && e.date <= to)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },
  
  getRecent: (limit: number = 50): Expense[] => {
    return getData<Expense>(STORAGE_KEYS.expenses)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }
};

// ==================== المهام ====================

export const TaskStorage = {
  getAll: (): Task[] => getData<Task>(STORAGE_KEYS.tasks),
  
  getById: (id: string): Task | undefined => {
    return getData<Task>(STORAGE_KEYS.tasks).find(t => t.id === id);
  },
  
  create: (task: Omit<Task, 'id' | 'createdAt'>): Task => {
    const tasks = getData<Task>(STORAGE_KEYS.tasks);
    const newTask: Task = {
      ...task,
      id: generateId(),
      createdAt: getCurrentDateTime()
    };
    tasks.push(newTask);
    setData(STORAGE_KEYS.tasks, tasks);
    return newTask;
  },
  
  update: (id: string, updates: Partial<Task>): Task | null => {
    const tasks = getData<Task>(STORAGE_KEYS.tasks);
    const index = tasks.findIndex(t => t.id === id);
    if (index === -1) return null;
    tasks[index] = { ...tasks[index], ...updates };
    setData(STORAGE_KEYS.tasks, tasks);
    return tasks[index];
  },
  
  delete: (id: string): boolean => {
    const tasks = getData<Task>(STORAGE_KEYS.tasks);
    const filtered = tasks.filter(t => t.id !== id);
    if (filtered.length === tasks.length) return false;
    setData(STORAGE_KEYS.tasks, filtered);
    return true;
  },
  
  getByAssignee: (userId: string): Task[] => {
    return getData<Task>(STORAGE_KEYS.tasks)
      .filter(t => t.assignedTo === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },
  
  getPending: (): Task[] => {
    return getData<Task>(STORAGE_KEYS.tasks)
      .filter(t => t.status === 'pending' || t.status === 'in_progress')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
};

// ==================== الأنشطة ====================

export const ActivityStorage = {
  getAll: (): Activity[] => getData<Activity>(STORAGE_KEYS.activities),
  
  create: (activity: Omit<Activity, 'id' | 'createdAt'>): Activity => {
    const activities = getData<Activity>(STORAGE_KEYS.activities);
    const newActivity: Activity = {
      ...activity,
      id: generateId(),
      createdAt: getCurrentDateTime()
    };
    activities.unshift(newActivity);
    // الاحتفاظ بآخر 1000 نشاط فقط
    if (activities.length > 1000) {
      activities.pop();
    }
    setData(STORAGE_KEYS.activities, activities);
    return newActivity;
  },
  
  getRecent: (limit: number = 100): Activity[] => {
    return getData<Activity>(STORAGE_KEYS.activities).slice(0, limit);
  },
  
  getByUser: (userId: string): Activity[] => {
    return getData<Activity>(STORAGE_KEYS.activities)
      .filter(a => a.userId === userId)
      .slice(0, 100);
  },
  
  getByEntity: (entityType: string, entityId: string): Activity[] => {
    return getData<Activity>(STORAGE_KEYS.activities)
      .filter(a => a.entityType === entityType && a.entityId === entityId)
      .slice(0, 50);
  }
};

// ==================== الإعدادات ====================

export const SettingsStorage = {
  get: (): Settings => {
    const defaultSettings: Settings = {
      companyName: 'شركتي',
      currency: 'EGP',
      dateFormat: 'DD/MM/YYYY',
      timeFormat: '12h',
      language: 'ar',
      theme: 'light',
      defaultTaxRate: 14,
      invoicePrefix: 'INV'
    };
    if (typeof window === 'undefined') return defaultSettings;
    const settings = localStorage.getItem(STORAGE_KEYS.settings);
    return settings ? { ...defaultSettings, ...JSON.parse(settings) } : defaultSettings;
  },
  
  set: (settings: Partial<Settings>): void => {
    const current = SettingsStorage.get();
    localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify({ ...current, ...settings }));
  }
};

// ==================== الإشعارات ====================

export const NotificationStorage = {
  getAll: (): Notification[] => getData<Notification>(STORAGE_KEYS.notifications),
  
  getByUser: (userId: string): Notification[] => {
    return getData<Notification>(STORAGE_KEYS.notifications)
      .filter(n => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },
  
  getUnread: (userId: string): Notification[] => {
    return getData<Notification>(STORAGE_KEYS.notifications)
      .filter(n => n.userId === userId && !n.read)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },
  
  create: (notification: Omit<Notification, 'id' | 'createdAt'>): Notification => {
    const notifications = getData<Notification>(STORAGE_KEYS.notifications);
    const newNotification: Notification = {
      ...notification,
      id: generateId(),
      createdAt: getCurrentDateTime()
    };
    notifications.push(newNotification);
    setData(STORAGE_KEYS.notifications, notifications);
    return newNotification;
  },
  
  markAsRead: (id: string): void => {
    const notifications = getData<Notification>(STORAGE_KEYS.notifications);
    const index = notifications.findIndex(n => n.id === id);
    if (index !== -1) {
      notifications[index].read = true;
      setData(STORAGE_KEYS.notifications, notifications);
    }
  },
  
  markAllAsRead: (userId: string): void => {
    const notifications = getData<Notification>(STORAGE_KEYS.notifications);
    notifications.forEach(n => {
      if (n.userId === userId) n.read = true;
    });
    setData(STORAGE_KEYS.notifications, notifications);
  },
  
  delete: (id: string): void => {
    const notifications = getData<Notification>(STORAGE_KEYS.notifications);
    setData(STORAGE_KEYS.notifications, notifications.filter(n => n.id !== id));
  }
};

// ==================== الأدوار ====================

export const RoleStorage = {
  getAll: (): Role[] => getData<Role>(STORAGE_KEYS.roles),
  
  getById: (id: string): Role | undefined => {
    return getData<Role>(STORAGE_KEYS.roles).find(r => r.id === id);
  },
  
  create: (role: Omit<Role, 'id' | 'createdAt'>): Role => {
    const roles = getData<Role>(STORAGE_KEYS.roles);
    const newRole: Role = {
      ...role,
      id: generateId(),
      createdAt: getCurrentDateTime()
    };
    roles.push(newRole);
    setData(STORAGE_KEYS.roles, roles);
    return newRole;
  },
  
  update: (id: string, updates: Partial<Role>): Role | null => {
    const roles = getData<Role>(STORAGE_KEYS.roles);
    const index = roles.findIndex(r => r.id === id);
    if (index === -1) return null;
    roles[index] = { ...roles[index], ...updates };
    setData(STORAGE_KEYS.roles, roles);
    return roles[index];
  },
  
  delete: (id: string): boolean => {
    const roles = getData<Role>(STORAGE_KEYS.roles);
    const filtered = roles.filter(r => r.id !== id);
    if (filtered.length === roles.length) return false;
    setData(STORAGE_KEYS.roles, filtered);
    return true;
  }
};

// ==================== المصادقة ====================

export const AuthStorage = {
  getCurrentUser: (): User | null => {
    if (typeof window === 'undefined') return null;
    const user = localStorage.getItem(STORAGE_KEYS.currentUser);
    return user ? JSON.parse(user) : null;
  },
  
  setCurrentUser: (user: User | null): void => {
    if (typeof window === 'undefined') return;
    if (user) {
      localStorage.setItem(STORAGE_KEYS.currentUser, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.currentUser);
    }
  },
  
  getToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(STORAGE_KEYS.authToken);
  },
  
  setToken: (token: string | null): void => {
    if (typeof window === 'undefined') return;
    if (token) {
      localStorage.setItem(STORAGE_KEYS.authToken, token);
    } else {
      localStorage.removeItem(STORAGE_KEYS.authToken);
    }
  },
  
  logout: (): void => {
    localStorage.removeItem(STORAGE_KEYS.currentUser);
    localStorage.removeItem(STORAGE_KEYS.authToken);
  },
  
  isAuthenticated: (): boolean => {
    return !!AuthStorage.getCurrentUser();
  },
  
  isAdmin: (): boolean => {
    const user = AuthStorage.getCurrentUser();
    return user?.role === 'admin';
  },
  
  isManager: (): boolean => {
    const user = AuthStorage.getCurrentUser();
    return user?.role === 'admin' || user?.role === 'manager';
  }
};

// ==================== مسح البيانات ====================

export function clearAllData(): void {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
}

// ==================== تصدير/استيراد البيانات ====================

export function exportAllData(): string {
  const data: Record<string, any> = {};
  Object.entries(STORAGE_KEYS).forEach(([name, key]) => {
    const value = localStorage.getItem(key);
    if (value) {
      data[name] = JSON.parse(value);
    }
  });
  return JSON.stringify(data, null, 2);
}

export function importAllData(jsonData: string): boolean {
  try {
    const data = JSON.parse(jsonData);
    Object.entries(data).forEach(([name, value]) => {
      const key = STORAGE_KEYS[name as keyof typeof STORAGE_KEYS];
      if (key) {
        localStorage.setItem(key, JSON.stringify(value));
      }
    });
    return true;
  } catch (error) {
    console.error('Error importing data:', error);
    return false;
  }
}
