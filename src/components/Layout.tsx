import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { NotificationStorage } from '@/lib/storage';
import { useEffect } from 'react';
import {
  LayoutDashboard,
  Users,
  UserCircle,
  Package,
  Warehouse,
  ShoppingCart,
  Receipt,
  DollarSign,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  Bell,
  ChevronDown,
  Building2,
  ClipboardList,
  X
} from 'lucide-react';

interface MenuItem {
  title: string;
  path: string;
  icon: React.ElementType;
  permission?: string;
  submenu?: { title: string; path: string }[];
}

const menuItems: MenuItem[] = [
  { title: 'الرئيسية', path: '/', icon: LayoutDashboard },
  { 
    title: 'الموظفين', 
    path: '/employees', 
    icon: Users,
    permission: 'employees.view',
    submenu: [
      { title: 'قائمة الموظفين', path: '/employees' },
      { title: 'الأدوار والصلاحيات', path: '/employees/roles' },
      { title: 'الحضور والانصراف', path: '/employees/attendance' },
    ]
  },
  { 
    title: 'العملاء', 
    path: '/customers', 
    icon: UserCircle,
    permission: 'customers.view'
  },
  { 
    title: 'الموردين', 
    path: '/suppliers', 
    icon: Building2,
    permission: 'suppliers.view'
  },
  { 
    title: 'المنتجات', 
    path: '/products', 
    icon: Package,
    permission: 'products.view',
    submenu: [
      { title: 'قائمة المنتجات', path: '/products' },
      { title: 'الفئات', path: '/products/categories' },
      { title: 'المخزون المنخفض', path: '/products/low-stock' },
    ]
  },
  { 
    title: 'المستودعات', 
    path: '/warehouses', 
    icon: Warehouse,
    permission: 'warehouses.view'
  },
  { 
    title: 'المبيعات', 
    path: '/sales', 
    icon: ShoppingCart,
    permission: 'sales.view',
    submenu: [
      { title: 'فاتورة جديدة', path: '/sales/invoice' },
      { title: 'قائمة الفواتير', path: '/sales/invoices' },
      { title: 'مرتجعات المبيعات', path: '/sales/returns' },
    ]
  },
  { 
    title: 'المشتريات', 
    path: '/purchases', 
    icon: Receipt,
    permission: 'purchases.view',
    submenu: [
      { title: 'فاتورة جديدة', path: '/purchases/invoice' },
      { title: 'قائمة الفواتير', path: '/purchases/invoices' },
      { title: 'مرتجعات المشتريات', path: '/purchases/returns' },
    ]
  },
  { 
    title: 'المالية', 
    path: '/finance', 
    icon: DollarSign,
    permission: 'finance.view',
    submenu: [
      { title: 'المدفوعات', path: '/finance/payments' },
      { title: 'المصروفات', path: '/finance/expenses' },
      { title: 'التقارير المالية', path: '/finance/reports' },
    ]
  },
  { 
    title: 'التقارير', 
    path: '/reports', 
    icon: BarChart3,
    permission: 'reports.view'
  },
  { 
    title: 'المهام', 
    path: '/tasks', 
    icon: ClipboardList,
    permission: 'tasks.view'
  },
  { 
    title: 'الإعدادات', 
    path: '/settings', 
    icon: Settings,
    permission: 'settings.view'
  },
];

export default function Layout() {
  const { user, logout, isAdmin, hasPermission } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      const userNotifications = NotificationStorage.getByUser(user.id);
      setNotifications(userNotifications);
      setUnreadCount(NotificationStorage.getUnread(user.id).length);
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const markNotificationAsRead = (id: string) => {
    NotificationStorage.markAsRead(id);
    if (user) {
      setUnreadCount(NotificationStorage.getUnread(user.id).length);
    }
  };

  // تصفية عناصر القائمة حسب الصلاحيات
  const filteredMenuItems = menuItems.filter(item => {
    if (!item.permission) return true;
    return hasPermission(item.permission) || isAdmin;
  });

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar - Desktop */}
      <aside
        className={`fixed inset-y-0 right-0 z-50 bg-white shadow-xl transition-all duration-300 ${
          sidebarOpen ? 'w-72' : 'w-20'
        } hidden lg:block`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            {sidebarOpen && (
              <span className="font-bold text-lg text-gray-800 truncate">نظام ERP</span>
            )}
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 rounded-lg hover:bg-gray-100"
          >
            <Menu className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-3 space-y-1 overflow-y-auto h-[calc(100vh-4rem)]">
          {filteredMenuItems.map((item) => (
            <div key={item.path}>
              <button
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                  isActive(item.path)
                    ? 'bg-primary text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && (
                  <span className="text-sm font-medium truncate">{item.title}</span>
                )}
              </button>
            </div>
          ))}
        </nav>
      </aside>

      {/* Mobile Sidebar */}
      <div
        className={`fixed inset-0 z-50 lg:hidden ${mobileMenuOpen ? 'visible' : 'invisible'}`}
      >
        <div
          className={`absolute inset-0 bg-black/50 transition-opacity ${
            mobileMenuOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setMobileMenuOpen(false)}
        />
        <aside
          className={`absolute inset-y-0 right-0 w-72 bg-white shadow-xl transition-transform ${
            mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="h-16 flex items-center justify-between px-4 border-b">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg">نظام ERP</span>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <nav className="p-3 space-y-1">
            {filteredMenuItems.map((item) => (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                  isActive(item.path)
                    ? 'bg-primary text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-sm font-medium">{item.title}</span>
              </button>
            ))}
          </nav>
        </aside>
      </div>

      {/* Main Content */}
      <main
        className={`flex-1 transition-all duration-300 ${
          sidebarOpen ? 'lg:mr-72' : 'lg:mr-20'
        }`}
      >
        {/* Header */}
        <header className="h-16 bg-white shadow-sm border-b sticky top-0 z-40">
          <div className="h-full px-4 flex items-center justify-between">
            {/* Left Side */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
              >
                <Menu className="w-5 h-5" />
              </button>
              <h1 className="text-lg font-semibold text-gray-800 hidden sm:block">
                {menuItems.find(item => isActive(item.path))?.title || 'الرئيسية'}
              </h1>
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-3">
              {/* Notifications */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="relative p-2 rounded-lg hover:bg-gray-100">
                    <Bell className="w-5 h-5 text-gray-600" />
                    {unreadCount > 0 && (
                      <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                        {unreadCount}
                      </Badge>
                    )}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <DropdownMenuLabel>الإشعارات</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 text-sm">
                      لا توجد إشعارات
                    </div>
                  ) : (
                    notifications.slice(0, 5).map((notification) => (
                      <DropdownMenuItem
                        key={notification.id}
                        className="flex flex-col items-start p-3 cursor-pointer"
                        onClick={() => markNotificationAsRead(notification.id)}
                      >
                        <div className="flex items-center gap-2 w-full">
                          <span className={`w-2 h-2 rounded-full ${
                            notification.read ? 'bg-gray-300' : 'bg-primary'
                          }`} />
                          <span className="font-medium text-sm flex-1">{notification.title}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1 mr-4">
                          {notification.message}
                        </p>
                      </DropdownMenuItem>
                    ))
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <UserCircle className="w-5 h-5 text-primary" />
                    </div>
                    <div className="hidden sm:block text-right">
                      <p className="text-sm font-medium">{user?.name}</p>
                      <p className="text-xs text-gray-500">
                        {user?.role === 'admin' ? 'مشرف' : user?.role === 'manager' ? 'مدير' : 'موظف'}
                      </p>
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>حسابي</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <UserCircle className="w-4 h-4 ml-2" />
                    الملف الشخصي
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/settings')}>
                    <Settings className="w-4 h-4 ml-2" />
                    الإعدادات
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                    <LogOut className="w-4 h-4 ml-2" />
                    تسجيل الخروج
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 lg:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
