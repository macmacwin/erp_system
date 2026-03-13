import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { InvoiceStorage, ActivityStorage } from '@/lib/storage';
import type { Invoice } from '@/types';
import {
  Plus,
  Search,
  MoreVertical,
  Eye,
  Printer,
  Trash2,
  ShoppingCart,
  Receipt,
  DollarSign
} from 'lucide-react';

export default function InvoicesList() {
  const navigate = useNavigate();
  const { user: currentUser, isAdmin } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  useEffect(() => {
    loadInvoices();
  }, []);

  useEffect(() => {
    filterInvoices();
  }, [searchQuery, typeFilter, statusFilter, invoices]);

  const loadInvoices = () => {
    const allInvoices = InvoiceStorage.getAll();
    setInvoices(allInvoices);
    setFilteredInvoices(allInvoices);
    setLoading(false);
  };

  const filterInvoices = () => {
    let filtered = invoices;
    
    if (searchQuery) {
      filtered = filtered.filter(inv => 
        inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.supplierName?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (typeFilter !== 'all') {
      filtered = filtered.filter(inv => inv.type === typeFilter);
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(inv => inv.status === statusFilter);
    }
    
    setFilteredInvoices(filtered);
  };

  const handleDelete = (invoice: Invoice) => {
    if (confirm('هل أنت متأكد من حذف هذه الفاتورة؟')) {
      InvoiceStorage.delete(invoice.id);
      
      ActivityStorage.create({
        userId: currentUser?.id || '',
        userName: currentUser?.name,
        action: 'delete',
        entityType: 'invoice',
        entityId: invoice.id,
        entityName: invoice.invoiceNumber,
        details: `حذف الفاتورة ${invoice.invoiceNumber}`
      });

      loadInvoices();
    }
  };

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setViewDialogOpen(true);
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'sale':
        return <Badge className="bg-blue-500">مبيعات</Badge>;
      case 'purchase':
        return <Badge className="bg-orange-500">مشتريات</Badge>;
      case 'return_sale':
        return <Badge className="bg-red-500">مرتجع مبيعات</Badge>;
      case 'return_purchase':
        return <Badge className="bg-purple-500">مرتجع مشتريات</Badge>;
      default:
        return <Badge>{type}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-500">مؤكدة</Badge>;
      case 'draft':
        return <Badge variant="secondary">مسودة</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">ملغاة</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-500">مدفوعة</Badge>;
      case 'partial':
        return <Badge className="bg-yellow-500">جزئي</Badge>;
      case 'unpaid':
        return <Badge variant="destructive">غير مدفوعة</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

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
          <h1 className="text-2xl font-bold text-gray-900">الفواتير</h1>
          <p className="text-gray-500 mt-1">إدارة فواتير المبيعات والمشتريات</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/purchases/invoice')}>
            <Receipt className="w-4 h-4 ml-2" />
            فاتورة شراء
          </Button>
          <Button onClick={() => navigate('/sales/invoice')}>
            <Plus className="w-4 h-4 ml-2" />
            فاتورة بيع
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">إجمالي الفواتير</p>
                <p className="text-2xl font-bold">{invoices.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Receipt className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">المبيعات</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(invoices
                    .filter(i => i.type === 'sale' && i.status === 'confirmed')
                    .reduce((sum, i) => sum + i.total, 0))}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">المشتريات</p>
                <p className="text-2xl font-bold text-orange-600">
                  {formatCurrency(invoices
                    .filter(i => i.type === 'purchase' && i.status === 'confirmed')
                    .reduce((sum, i) => sum + i.total, 0))}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <Receipt className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">غير مدفوعة</p>
                <p className="text-2xl font-bold text-red-600">
                  {invoices.filter(i => i.paymentStatus !== 'paid' && i.status === 'confirmed').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="البحث عن فاتورة..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="نوع الفاتورة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الأنواع</SelectItem>
                <SelectItem value="sale">مبيعات</SelectItem>
                <SelectItem value="purchase">مشتريات</SelectItem>
                <SelectItem value="return_sale">مرتجع مبيعات</SelectItem>
                <SelectItem value="return_purchase">مرتجع مشتريات</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="confirmed">مؤكدة</SelectItem>
                <SelectItem value="draft">مسودة</SelectItem>
                <SelectItem value="cancelled">ملغاة</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">قائمة الفواتير ({filteredInvoices.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>رقم الفاتورة</TableHead>
                  <TableHead>النوع</TableHead>
                  <TableHead>العميل/المورد</TableHead>
                  <TableHead>التاريخ</TableHead>
                  <TableHead>الإجمالي</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>الدفع</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      لا توجد فواتير
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredInvoices
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell>
                        <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                          {invoice.invoiceNumber}
                        </code>
                      </TableCell>
                      <TableCell>{getTypeBadge(invoice.type)}</TableCell>
                      <TableCell>
                        {invoice.customerName || invoice.supplierName || '-'}
                      </TableCell>
                      <TableCell>
                        {new Date(invoice.createdAt).toLocaleDateString('ar-EG')}
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(invoice.total)}
                      </TableCell>
                      <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                      <TableCell>{getPaymentStatusBadge(invoice.paymentStatus)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewInvoice(invoice)}>
                              <Eye className="w-4 h-4 ml-2" />
                              عرض
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => window.print()}>
                              <Printer className="w-4 h-4 ml-2" />
                              طباعة
                            </DropdownMenuItem>
                            {isAdmin && (
                              <DropdownMenuItem 
                                onClick={() => handleDelete(invoice)}
                                className="text-red-600"
                              >
                                <Trash2 className="w-4 h-4 ml-2" />
                                حذف
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* View Invoice Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>تفاصيل الفاتورة</DialogTitle>
          </DialogHeader>
          {selectedInvoice && (
            <div className="space-y-6">
              {/* Invoice Header */}
              <div className="flex justify-between items-start border-b pb-4">
                <div>
                  <p className="text-sm text-gray-500">رقم الفاتورة</p>
                  <p className="text-xl font-bold">{selectedInvoice.invoiceNumber}</p>
                </div>
                <div className="text-left">
                  <p className="text-sm text-gray-500">التاريخ</p>
                  <p>{new Date(selectedInvoice.createdAt).toLocaleDateString('ar-EG')}</p>
                </div>
              </div>

              {/* Customer/Supplier Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">
                  {selectedInvoice.type === 'sale' || selectedInvoice.type === 'return_sale' ? 'العميل' : 'المورد'}
                </p>
                <p className="font-medium">
                  {selectedInvoice.customerName || selectedInvoice.supplierName || '-'}
                </p>
              </div>

              {/* Items */}
              <div>
                <h4 className="font-medium mb-3">المنتجات</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>المنتج</TableHead>
                      <TableHead>الكمية</TableHead>
                      <TableHead>السعر</TableHead>
                      <TableHead>الإجمالي</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedInvoice.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.productName}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>{formatCurrency(item.unitPrice)}</TableCell>
                        <TableCell>{formatCurrency(item.total)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Totals */}
              <div className="border-t pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">المجموع الفرعي</span>
                    <span>{formatCurrency(selectedInvoice.subtotal)}</span>
                  </div>
                  {selectedInvoice.discount > 0 && (
                    <div className="flex justify-between text-red-600">
                      <span>الخصم</span>
                      <span>
                        {selectedInvoice.discountType === 'percentage' 
                          ? `${selectedInvoice.discount}%`
                          : formatCurrency(selectedInvoice.discount)
                        }
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">الضريبة ({selectedInvoice.taxRate}%)</span>
                    <span>{formatCurrency(selectedInvoice.taxAmount)}</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold border-t pt-2">
                    <span>الإجمالي</span>
                    <span className="text-primary">{formatCurrency(selectedInvoice.total)}</span>
                  </div>
                  {selectedInvoice.paid > 0 && (
                    <>
                      <div className="flex justify-between text-green-600">
                        <span>المدفوع</span>
                        <span>{formatCurrency(selectedInvoice.paid)}</span>
                      </div>
                      {selectedInvoice.remaining > 0 && (
                        <div className="flex justify-between text-red-600">
                          <span>المتبقي</span>
                          <span>{formatCurrency(selectedInvoice.remaining)}</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Notes */}
              {selectedInvoice.notes && (
                <div className="border-t pt-4">
                  <p className="text-sm text-gray-500">ملاحظات</p>
                  <p>{selectedInvoice.notes}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-4">
                <Button className="flex-1" onClick={() => window.print()}>
                  <Printer className="w-4 h-4 ml-2" />
                  طباعة
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
