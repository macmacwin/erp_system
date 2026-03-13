import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PaymentStorage, ExpenseStorage, ActivityStorage, CustomerStorage } from '@/lib/storage';
import type { Payment, Expense } from '@/types';
import {
  Plus,
  TrendingUp,
  TrendingDown,
  Wallet,
  Trash2
} from 'lucide-react';

export default function FinanceDashboard() {
  const { user: currentUser } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [activeTab, setActiveTab] = useState<'payments' | 'expenses'>('payments');
  const [loading, setLoading] = useState(true);
  
  // Dialogs
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);
  
  // New payment/expense
  const [newPayment, setNewPayment] = useState({
    amount: '',
    method: 'cash' as const,
    customerId: '',
    notes: ''
  });
  
  const [newExpense, setNewExpense] = useState({
    title: '',
    category: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const allPayments = PaymentStorage.getRecent(100);
    const allExpenses = ExpenseStorage.getRecent(100);
    setPayments(allPayments);
    setExpenses(allExpenses);
    setLoading(false);
  };

  const handleAddPayment = () => {
    if (!newPayment.amount) return;

    const customer = newPayment.customerId ? CustomerStorage.getById(newPayment.customerId) : null;

    PaymentStorage.create({
      amount: parseFloat(newPayment.amount),
      type: 'income',
      method: newPayment.method,
      customerId: customer?.id,
      customerName: customer?.name,
      notes: newPayment.notes,
      createdBy: currentUser?.id || '',
      createdByName: currentUser?.name
    });

    ActivityStorage.create({
      userId: currentUser?.id || '',
      userName: currentUser?.name,
      action: 'create',
      entityType: 'payment',
      details: `تسجيل دفعة بقيمة ${newPayment.amount}`
    });

    setPaymentDialogOpen(false);
    setNewPayment({
      amount: '',
      method: 'cash',
      customerId: '',
      notes: ''
    });
    loadData();
  };

  const handleAddExpense = () => {
    if (!newExpense.title || !newExpense.amount) return;

    ExpenseStorage.create({
      title: newExpense.title,
      category: newExpense.category,
      amount: parseFloat(newExpense.amount),
      date: newExpense.date,
      description: newExpense.description,
      createdBy: currentUser?.id || '',
      createdByName: currentUser?.name
    });

    ActivityStorage.create({
      userId: currentUser?.id || '',
      userName: currentUser?.name,
      action: 'create',
      entityType: 'expense',
      details: `تسجيل مصروف: ${newExpense.title}`
    });

    setExpenseDialogOpen(false);
    setNewExpense({
      title: '',
      category: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      description: ''
    });
    loadData();
  };

  const handleDeleteExpense = (expense: Expense) => {
    if (confirm('هل أنت متأكد من حذف هذا المصروف؟')) {
      ExpenseStorage.delete(expense.id);
      loadData();
    }
  };

  const totalIncome = payments
    .filter(p => p.type === 'income')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP'
    }).format(amount);
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
          <h1 className="text-2xl font-bold text-gray-900">المالية</h1>
          <p className="text-gray-500 mt-1">إدارة المدفوعات والمصروفات</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setExpenseDialogOpen(true)}>
            <Plus className="w-4 h-4 ml-2" />
            مصروف جديد
          </Button>
          <Button onClick={() => setPaymentDialogOpen(true)}>
            <Plus className="w-4 h-4 ml-2" />
            دفعة جديدة
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">إجمالي الإيرادات</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(totalIncome)}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">إجمالي المصروفات</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(totalExpenses)}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">صافي الربح</p>
                <p className={`text-2xl font-bold ${totalIncome - totalExpenses >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(totalIncome - totalExpenses)}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Wallet className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setActiveTab('payments')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'payments' 
              ? 'text-primary border-b-2 border-primary' 
              : 'text-gray-500'
          }`}
        >
          المدفوعات
        </button>
        <button
          onClick={() => setActiveTab('expenses')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'expenses' 
              ? 'text-primary border-b-2 border-primary' 
              : 'text-gray-500'
          }`}
        >
          المصروفات
        </button>
      </div>

      {/* Content */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {activeTab === 'payments' ? 'المدفوعات' : 'المصروفات'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activeTab === 'payments' ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>التاريخ</TableHead>
                    <TableHead>العميل</TableHead>
                    <TableHead>الطريقة</TableHead>
                    <TableHead>المبلغ</TableHead>
                    <TableHead>ملاحظات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                        لا توجد مدفوعات
                      </TableCell>
                    </TableRow>
                  ) : (
                    payments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>
                          {new Date(payment.createdAt).toLocaleDateString('ar-EG')}
                        </TableCell>
                        <TableCell>{payment.customerName || '-'}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {payment.method === 'cash' ? 'نقدي' :
                             payment.method === 'card' ? 'بطاقة' :
                             payment.method === 'bank_transfer' ? 'تحويل بنكي' : payment.method}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium text-green-600">
                          {formatCurrency(payment.amount)}
                        </TableCell>
                        <TableCell>{payment.notes || '-'}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>التاريخ</TableHead>
                    <TableHead>البيان</TableHead>
                    <TableHead>التصنيف</TableHead>
                    <TableHead>المبلغ</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenses.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                        لا توجد مصروفات
                      </TableCell>
                    </TableRow>
                  ) : (
                    expenses.map((expense) => (
                      <TableRow key={expense.id}>
                        <TableCell>
                          {new Date(expense.date).toLocaleDateString('ar-EG')}
                        </TableCell>
                        <TableCell>{expense.title}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{expense.category}</Badge>
                        </TableCell>
                        <TableCell className="font-medium text-red-600">
                          {formatCurrency(expense.amount)}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteExpense(expense)}
                            className="text-red-500"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Payment Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>تسجيل دفعة جديدة</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>المبلغ *</Label>
              <Input
                type="number"
                value={newPayment.amount}
                onChange={(e) => setNewPayment({ ...newPayment, amount: e.target.value })}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label>طريقة الدفع</Label>
              <Select
                value={newPayment.method}
                onValueChange={(value: any) => setNewPayment({ ...newPayment, method: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">نقدي</SelectItem>
                  <SelectItem value="card">بطاقة ائتمان</SelectItem>
                  <SelectItem value="bank_transfer">تحويل بنكي</SelectItem>
                  <SelectItem value="check">شيك</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>العميل (اختياري)</Label>
              <Select
                value={newPayment.customerId}
                onValueChange={(value) => setNewPayment({ ...newPayment, customerId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر العميل" />
                </SelectTrigger>
                <SelectContent>
                  {CustomerStorage.getActive().map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>ملاحظات</Label>
              <Input
                value={newPayment.notes}
                onChange={(e) => setNewPayment({ ...newPayment, notes: e.target.value })}
                placeholder="أي ملاحظات..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPaymentDialogOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={handleAddPayment}>حفظ</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Expense Dialog */}
      <Dialog open={expenseDialogOpen} onOpenChange={setExpenseDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>تسجيل مصروف جديد</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>البيان *</Label>
              <Input
                value={newExpense.title}
                onChange={(e) => setNewExpense({ ...newExpense, title: e.target.value })}
                placeholder="مثال: إيجار المكتب"
              />
            </div>
            <div className="space-y-2">
              <Label>التصنيف</Label>
              <Select
                value={newExpense.category}
                onValueChange={(value) => setNewExpense({ ...newExpense, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر التصنيف" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rent">إيجار</SelectItem>
                  <SelectItem value="salaries">رواتب</SelectItem>
                  <SelectItem value="utilities">خدمات</SelectItem>
                  <SelectItem value="maintenance">صيانة</SelectItem>
                  <SelectItem value="marketing">تسويق</SelectItem>
                  <SelectItem value="other">أخرى</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>المبلغ *</Label>
              <Input
                type="number"
                value={newExpense.amount}
                onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label>التاريخ</Label>
              <Input
                type="date"
                value={newExpense.date}
                onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>الوصف</Label>
              <Input
                value={newExpense.description}
                onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                placeholder="تفاصيل إضافية..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExpenseDialogOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={handleAddExpense}>حفظ</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
