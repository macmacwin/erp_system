import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  Package,
  ShoppingCart,
  TrendingUp,
  AlertTriangle,
  ArrowUpLeft,
  ArrowDownRight,
  Calendar,
  Clock,
  BarChart3
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import {
  CustomerStorage,
  ProductStorage,
  InvoiceStorage,
  ExpenseStorage,
  ActivityStorage
} from '@/lib/storage';
import type { DashboardStats } from '@/types';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('today');

  useEffect(() => {
    loadDashboardData();
  }, [dateRange]);

  const loadDashboardData = () => {
    setLoading(true);
    
    // حساب نطاق التاريخ
    const today = new Date();
    let fromDate = new Date();
    
    switch (dateRange) {
      case 'today':
        fromDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        break;
      case 'week':
        fromDate.setDate(today.getDate() - 7);
        break;
      case 'month':
        fromDate.setMonth(today.getMonth() - 1);
        break;
      case 'year':
        fromDate.setFullYear(today.getFullYear() - 1);
        break;
    }

    const from = fromDate.toISOString();
    const to = today.toISOString();

    // جلب البيانات
    const customers = CustomerStorage.getAll();
    const products = ProductStorage.getAll();
    const invoices = InvoiceStorage.getByDateRange(from, to);
    const expenses = ExpenseStorage.getByDateRange(from, to);
    const activities = ActivityStorage.getRecent(10);

    // حساب الإحصائيات
    const salesInvoices = invoices.filter(i => i.type === 'sale' && i.status === 'confirmed');
    const purchaseInvoices = invoices.filter(i => i.type === 'purchase' && i.status === 'confirmed');
    
    const totalSales = salesInvoices.reduce((sum, i) => sum + i.total, 0);
    const totalPurchases = purchaseInvoices.reduce((sum, i) => sum + i.total, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    
    const unpaidInvoices = invoices.filter(i => i.paymentStatus !== 'paid' && i.status === 'confirmed');
    const lowStockProducts = products.filter(p => p.currentStock <= p.minStock && p.status === 'active');

    // بيانات الرسم البياني للمبيعات
    const salesByDate: Record<string, number> = {};
    salesInvoices.forEach(inv => {
      const date = inv.createdAt.split('T')[0];
      salesByDate[date] = (salesByDate[date] || 0) + inv.total;
    });
    
    const salesChart = Object.entries(salesByDate)
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-7);

    // أفضل المنتجات مبيعاً
    const productSales: Record<string, number> = {};
    salesInvoices.forEach(inv => {
      inv.items.forEach(item => {
        productSales[item.productName] = (productSales[item.productName] || 0) + item.quantity;
      });
    });
    
    const topProducts = Object.entries(productSales)
      .map(([name, sales]) => ({ name, sales }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5);

    setStats({
      totalSales,
      totalPurchases,
      totalExpenses,
      netProfit: totalSales - totalPurchases - totalExpenses,
      totalCustomers: customers.length,
      totalSuppliers: 0,
      totalProducts: products.length,
      lowStockProducts: lowStockProducts.length,
      totalInvoices: invoices.length,
      unpaidInvoices: unpaidInvoices.length,
      recentActivities: activities,
      salesChart,
      topProducts
    });

    setLoading(false);
  };

  const statCards = [
    {
      title: 'إجمالي المبيعات',
      value: stats?.totalSales || 0,
      icon: ShoppingCart,
      trend: 12,
      color: 'bg-blue-500',
      format: 'currency'
    },
    {
      title: 'إجمالي المشتريات',
      value: stats?.totalPurchases || 0,
      icon: ShoppingCart,
      trend: -5,
      color: 'bg-orange-500',
      format: 'currency'
    },
    {
      title: 'صافي الربح',
      value: stats?.netProfit || 0,
      icon: TrendingUp,
      trend: 8,
      color: 'bg-green-500',
      format: 'currency'
    },
    {
      title: 'العملاء',
      value: stats?.totalCustomers || 0,
      icon: Users,
      trend: 15,
      color: 'bg-purple-500',
      format: 'number'
    },
    {
      title: 'المنتجات',
      value: stats?.totalProducts || 0,
      icon: Package,
      trend: 3,
      color: 'bg-cyan-500',
      format: 'number'
    },
    {
      title: 'المخزون المنخفض',
      value: stats?.lowStockProducts || 0,
      icon: AlertTriangle,
      trend: null,
      color: 'bg-red-500',
      format: 'number',
      alert: (stats?.lowStockProducts || 0) > 0
    }
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('ar-EG').format(value);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">لوحة التحكم</h1>
          <p className="text-gray-500 mt-1">
            مرحباً، {user?.name}! إليك نظرة عامة على أداء نشاطك التجاري
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="today">اليوم</option>
            <option value="week">آخر 7 أيام</option>
            <option value="month">آخر 30 يوم</option>
            <option value="year">آخر سنة</option>
          </select>
          <Button onClick={() => navigate('/reports')}>
            <BarChart3 className="w-4 h-4 ml-2" />
            التقارير
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((card, index) => (
          <Card key={index} className={`card-hover ${card.alert ? 'border-red-300' : ''}`}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500">{card.title}</p>
                  <p className="text-2xl font-bold mt-1">
                    {card.format === 'currency' 
                      ? formatCurrency(card.value)
                      : formatNumber(card.value)
                    }
                  </p>
                  {card.trend !== null && (
                    <div className={`flex items-center gap-1 mt-2 text-sm ${
                      card.trend >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {card.trend >= 0 ? (
                        <ArrowUpLeft className="w-4 h-4" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4" />
                      )}
                      <span>{Math.abs(card.trend)}%</span>
                    </div>
                  )}
                </div>
                <div className={`${card.color} p-3 rounded-xl`}>
                  <card.icon className="w-5 h-5 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">مخطط المبيعات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats?.salesChart}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(value) => new Date(value).toLocaleDateString('ar-EG', { 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  />
                  <YAxis 
                    tickFormatter={(value) => formatCurrency(value)}
                  />
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value)}
                    labelFormatter={(label) => new Date(label).toLocaleDateString('ar-EG')}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="amount" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">أفضل المنتجات مبيعاً</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats?.topProducts} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={100} />
                  <Tooltip />
                  <Bar dataKey="sales" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts & Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Alert */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              تنبيهات المخزون المنخفض
            </CardTitle>
            <Button variant="outline" size="sm" onClick={() => navigate('/products/low-stock')}>
              عرض الكل
            </Button>
          </CardHeader>
          <CardContent>
            {(stats?.lowStockProducts || 0) === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>لا توجد منتجات منخفضة المخزون</p>
              </div>
            ) : (
              <div className="space-y-3">
                {ProductStorage.getLowStock().slice(0, 5).map((product) => (
                  <div 
                    key={product.id} 
                    className="flex items-center justify-between p-3 bg-orange-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-gray-500">الحد الأدنى: {product.minStock}</p>
                    </div>
                    <Badge variant="destructive">
                      {product.currentStock} متبقي
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-500" />
              آخر الأنشطة
            </CardTitle>
            <Button variant="outline" size="sm" onClick={() => navigate('/activities')}>
              عرض الكل
            </Button>
          </CardHeader>
          <CardContent>
            {(stats?.recentActivities.length || 0) === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>لا توجد أنشطة حديثة</p>
              </div>
            ) : (
              <div className="space-y-3">
                {stats?.recentActivities.slice(0, 5).map((activity) => (
                  <div 
                    key={activity.id} 
                    className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Clock className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">
                        <span className="font-medium">{activity.userName}</span>{' '}
                        {activity.action === 'create' ? 'أضاف' :
                         activity.action === 'update' ? 'عدل' :
                         activity.action === 'delete' ? 'حذف' :
                         activity.action === 'login' ? 'سجل دخول' :
                         activity.action === 'logout' ? 'سجل خروج' : activity.action}{' '}
                        {activity.entityName}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(activity.createdAt).toLocaleString('ar-EG')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">إجراءات سريعة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Button 
              variant="outline" 
              className="h-auto py-4 flex flex-col items-center gap-2"
              onClick={() => navigate('/sales/invoice')}
            >
              <ShoppingCart className="w-6 h-6 text-blue-500" />
              <span>فاتورة مبيعات</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto py-4 flex flex-col items-center gap-2"
              onClick={() => navigate('/purchases/invoice')}
            >
              <ShoppingCart className="w-6 h-6 text-orange-500" />
              <span>فاتورة مشتريات</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto py-4 flex flex-col items-center gap-2"
              onClick={() => navigate('/customers')}
            >
              <Users className="w-6 h-6 text-green-500" />
              <span>عميل جديد</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto py-4 flex flex-col items-center gap-2"
              onClick={() => navigate('/products')}
            >
              <Package className="w-6 h-6 text-purple-500" />
              <span>منتج جديد</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
