import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  InvoiceStorage,
  ExpenseStorage,
  PaymentStorage
} from '@/lib/storage';
import {
  Download,
  Printer
} from 'lucide-react';

export default function ReportsDashboard() {
  const { user: currentUser } = useAuth();
  const [reportType, setReportType] = useState('sales');
  const [dateRange, setDateRange] = useState('month');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [reportData, setReportData] = useState<any>(null);

  useEffect(() => {
    generateReport();
  }, [reportType, dateRange, fromDate, toDate]);

  const getDateRange = () => {
    const today = new Date();
    let from = new Date();
    
    switch (dateRange) {
      case 'today':
        from = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        break;
      case 'week':
        from.setDate(today.getDate() - 7);
        break;
      case 'month':
        from.setMonth(today.getMonth() - 1);
        break;
      case 'quarter':
        from.setMonth(today.getMonth() - 3);
        break;
      case 'year':
        from.setFullYear(today.getFullYear() - 1);
        break;
      case 'custom':
        return {
          from: fromDate ? new Date(fromDate).toISOString() : today.toISOString(),
          to: toDate ? new Date(toDate).toISOString() : today.toISOString()
        };
    }
    
    return {
      from: from.toISOString(),
      to: today.toISOString()
    };
  };

  const generateReport = () => {
    const { from, to } = getDateRange();
    
    switch (reportType) {
      case 'sales':
        generateSalesReport(from, to);
        break;
      case 'products':
        generateProductsReport(from, to);
        break;
      case 'customers':
        generateCustomersReport(from, to);
        break;
      case 'financial':
        generateFinancialReport(from, to);
        break;
    }
  };

  const generateSalesReport = (from: string, to: string) => {
    const invoices = InvoiceStorage.getByDateRange(from, to)
      .filter(i => i.type === 'sale' && i.status === 'confirmed');
    
    const dailySales: Record<string, number> = {};
    invoices.forEach(inv => {
      const date = inv.createdAt.split('T')[0];
      dailySales[date] = (dailySales[date] || 0) + inv.total;
    });

    const chartData = Object.entries(dailySales)
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const totalSales = invoices.reduce((sum, i) => sum + i.total, 0);
    const totalInvoices = invoices.length;
    const averageInvoice = totalInvoices > 0 ? totalSales / totalInvoices : 0;

    setReportData({
      chartData,
      totalSales,
      totalInvoices,
      averageInvoice
    });
  };

  const generateProductsReport = (from: string, to: string) => {
    const invoices = InvoiceStorage.getByDateRange(from, to)
      .filter(i => i.type === 'sale' && i.status === 'confirmed');
    
    const productSales: Record<string, { name: string; quantity: number; revenue: number }> = {};
    
    invoices.forEach(inv => {
      inv.items.forEach(item => {
        if (!productSales[item.productId]) {
          productSales[item.productId] = {
            name: item.productName,
            quantity: 0,
            revenue: 0
          };
        }
        productSales[item.productId].quantity += item.quantity;
        productSales[item.productId].revenue += item.total;
      });
    });

    const chartData = Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    setReportData({
      chartData,
      totalProducts: Object.keys(productSales).length
    });
  };

  const generateCustomersReport = (from: string, to: string) => {
    const invoices = InvoiceStorage.getByDateRange(from, to)
      .filter(i => i.type === 'sale' && i.status === 'confirmed');
    
    const customerSales: Record<string, { name: string; purchases: number; total: number }> = {};
    
    invoices.forEach(inv => {
      if (inv.customerId) {
        if (!customerSales[inv.customerId]) {
          customerSales[inv.customerId] = {
            name: inv.customerName || 'Unknown',
            purchases: 0,
            total: 0
          };
        }
        customerSales[inv.customerId].purchases += 1;
        customerSales[inv.customerId].total += inv.total;
      }
    });

    const chartData = Object.values(customerSales)
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);

    setReportData({
      chartData,
      totalCustomers: Object.keys(customerSales).length
    });
  };

  const generateFinancialReport = (from: string, to: string) => {
    const payments = PaymentStorage.getByDateRange(from, to);
    const expenses = ExpenseStorage.getByDateRange(from, to);

    const income = payments
      .filter(p => p.type === 'income')
      .reduce((sum, p) => sum + p.amount, 0);

    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

    const dailyData: Record<string, { income: number; expense: number }> = {};
    
    payments.filter(p => p.type === 'income').forEach(p => {
      const date = p.createdAt.split('T')[0];
      if (!dailyData[date]) dailyData[date] = { income: 0, expense: 0 };
      dailyData[date].income += p.amount;
    });

    expenses.forEach(e => {
      const date = e.date;
      if (!dailyData[date]) dailyData[date] = { income: 0, expense: 0 };
      dailyData[date].expense += e.amount;
    });

    const chartData = Object.entries(dailyData)
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date));

    setReportData({
      chartData,
      income,
      expenses: totalExpenses,
      profit: income - totalExpenses
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP'
    }).format(amount);
  };

  const exportReport = () => {
    const data = {
      type: reportType,
      dateRange: { from: fromDate, to: toDate },
      data: reportData,
      generatedBy: currentUser?.name,
      generatedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report-${reportType}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">التقارير</h1>
          <p className="text-gray-500 mt-1">تقارير وإحصائيات شاملة</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportReport}>
            <Download className="w-4 h-4 ml-2" />
            تصدير
          </Button>
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="w-4 h-4 ml-2" />
            طباعة
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <Label>نوع التقرير</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sales">المبيعات</SelectItem>
                  <SelectItem value="products">المنتجات</SelectItem>
                  <SelectItem value="customers">العملاء</SelectItem>
                  <SelectItem value="financial">المالية</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>الفترة</Label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">اليوم</SelectItem>
                  <SelectItem value="week">آخر أسبوع</SelectItem>
                  <SelectItem value="month">آخر شهر</SelectItem>
                  <SelectItem value="quarter">آخر ربع سنة</SelectItem>
                  <SelectItem value="year">آخر سنة</SelectItem>
                  <SelectItem value="custom">مخصص</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {dateRange === 'custom' && (
              <>
                <div>
                  <Label>من</Label>
                  <Input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                  />
                </div>
                <div>
                  <Label>إلى</Label>
                  <Input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                  />
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Report Content */}
      {reportData && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {reportType === 'sales' && (
              <>
                <Card>
                  <CardContent className="p-4">
                    <p className="text-sm text-gray-500">إجمالي المبيعات</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(reportData.totalSales)}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <p className="text-sm text-gray-500">عدد الفواتير</p>
                    <p className="text-2xl font-bold">{reportData.totalInvoices}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <p className="text-sm text-gray-500">متوسط الفاتورة</p>
                    <p className="text-2xl font-bold">
                      {formatCurrency(reportData.averageInvoice)}
                    </p>
                  </CardContent>
                </Card>
              </>
            )}
            {reportType === 'products' && (
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-gray-500">المنتجات المباعة</p>
                  <p className="text-2xl font-bold">{reportData.totalProducts}</p>
                </CardContent>
              </Card>
            )}
            {reportType === 'customers' && (
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-gray-500">العملاء النشطين</p>
                  <p className="text-2xl font-bold">{reportData.totalCustomers}</p>
                </CardContent>
              </Card>
            )}
            {reportType === 'financial' && (
              <>
                <Card>
                  <CardContent className="p-4">
                    <p className="text-sm text-gray-500">الإيرادات</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(reportData.income)}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <p className="text-sm text-gray-500">المصروفات</p>
                    <p className="text-2xl font-bold text-red-600">
                      {formatCurrency(reportData.expenses)}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <p className="text-sm text-gray-500">صافي الربح</p>
                    <p className={`text-2xl font-bold ${reportData.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(reportData.profit)}
                    </p>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          {/* Charts */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {reportType === 'sales' && 'مخطط المبيعات'}
                {reportType === 'products' && 'أفضل المنتجات مبيعاً'}
                {reportType === 'customers' && 'أفضل العملاء'}
                {reportType === 'financial' && 'التحليل المالي'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  {reportType === 'sales' || reportType === 'financial' ? (
                    <LineChart data={reportData.chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(value) => new Date(value).toLocaleDateString('ar-EG', { 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      />
                      <YAxis tickFormatter={(value) => formatCurrency(value)} />
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                      {reportType === 'sales' ? (
                        <Line 
                          type="monotone" 
                          dataKey="amount" 
                          stroke="#3b82f6" 
                          strokeWidth={2}
                          name="المبيعات"
                        />
                      ) : (
                        <>
                          <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} name="الإيرادات" />
                          <Line type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2} name="المصروفات" />
                        </>
                      )}
                    </LineChart>
                  ) : (
                    <BarChart data={reportData.chartData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" tickFormatter={(value) => formatCurrency(value)} />
                      <YAxis dataKey="name" type="category" width={120} />
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                      <Bar 
                        dataKey={reportType === 'products' ? 'revenue' : 'total'} 
                        fill="#3b82f6" 
                        radius={[0, 4, 4, 0]}
                      />
                    </BarChart>
                  )}
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
