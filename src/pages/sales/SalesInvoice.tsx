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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  InvoiceStorage, 
  CustomerStorage, 
  ProductStorage,
  ActivityStorage,
  PaymentStorage,
  generateInvoiceNumber
} from '@/lib/storage';
import type { InvoiceItem, Customer, Product } from '@/types';
import {
  Plus,
  Trash2,
  Save,
  X,
  Search,
  UserCircle,
  Package
} from 'lucide-react';

export default function SalesInvoice() {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [searchProduct, setSearchProduct] = useState('');
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  
  // Invoice calculations
  const [subtotal, setSubtotal] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState<'fixed' | 'percentage'>('fixed');
  const [taxRate, setTaxRate] = useState(14);
  const [taxAmount, setTaxAmount] = useState(0);
  const [total, setTotal] = useState(0);
  const [paid, setPaid] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'bank_transfer'>('cash');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    setCustomers(CustomerStorage.getActive());
    setProducts(ProductStorage.getActive());
  }, []);

  useEffect(() => {
    calculateTotals();
  }, [items, discount, discountType, taxRate]);

  useEffect(() => {
    if (searchProduct) {
      const filtered = products.filter(p => 
        p.name.toLowerCase().includes(searchProduct.toLowerCase()) ||
        p.code.toLowerCase().includes(searchProduct.toLowerCase()) ||
        p.barcode?.includes(searchProduct)
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(products);
    }
  }, [searchProduct, products]);

  const calculateTotals = () => {
    const itemsTotal = items.reduce((sum, item) => sum + item.total, 0);
    setSubtotal(itemsTotal);
    
    let discountAmount = discount;
    if (discountType === 'percentage') {
      discountAmount = (itemsTotal * discount) / 100;
    }
    
    const afterDiscount = itemsTotal - discountAmount;
    const tax = (afterDiscount * taxRate) / 100;
    setTaxAmount(tax);
    
    setTotal(afterDiscount + tax);
  };

  const addItem = (product: Product) => {
    const existingItem = items.find(item => item.productId === product.id);
    
    if (existingItem) {
      updateItemQuantity(existingItem.id, existingItem.quantity + 1);
    } else {
      const newItem: InvoiceItem = {
        id: Date.now().toString(),
        productId: product.id,
        productName: product.name,
        productCode: product.code,
        quantity: 1,
        unitPrice: product.salePrice,
        discount: 0,
        total: product.salePrice
      };
      setItems([...items, newItem]);
    }
    setProductDialogOpen(false);
    setSearchProduct('');
  };

  const updateItemQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }
    
    setItems(items.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          quantity,
          total: (quantity * item.unitPrice) - item.discount
        };
      }
      return item;
    }));
  };

  const updateItemPrice = (itemId: string, price: number) => {
    setItems(items.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          unitPrice: price,
          total: (item.quantity * price) - item.discount
        };
      }
      return item;
    }));
  };

  const removeItem = (itemId: string) => {
    setItems(items.filter(item => item.id !== itemId));
  };

  const handleSave = () => {
    if (!selectedCustomer || items.length === 0) {
      return;
    }

    const remaining = total - paid;
    const paymentStatus = remaining <= 0 ? 'paid' : paid > 0 ? 'partial' : 'unpaid';

    const invoice = InvoiceStorage.create({
      invoiceNumber: generateInvoiceNumber('sale'),
      type: 'sale',
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.name,
      items,
      subtotal,
      discount,
      discountType,
      taxRate,
      taxAmount,
      total,
      paid,
      remaining: Math.max(0, remaining),
      paymentStatus,
      paymentMethod: paid > 0 ? paymentMethod : undefined,
      notes,
      status: 'confirmed',
      createdBy: currentUser?.id || '',
      createdByName: currentUser?.name
    });

    // Update customer balance
    if (remaining > 0) {
      CustomerStorage.updateBalance(selectedCustomer.id, remaining);
    }

    // Record payment if paid > 0
    if (paid > 0) {
      PaymentStorage.create({
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        customerId: selectedCustomer.id,
        customerName: selectedCustomer.name,
        amount: paid,
        type: 'income',
        method: paymentMethod,
        notes: `دفعة على فاتورة ${invoice.invoiceNumber}`,
        createdBy: currentUser?.id || '',
        createdByName: currentUser?.name
      });
    }

    // Log activity
    ActivityStorage.create({
      userId: currentUser?.id || '',
      userName: currentUser?.name,
      action: 'create',
      entityType: 'invoice',
      entityId: invoice.id,
      entityName: invoice.invoiceNumber,
      details: `إنشاء فاتورة مبيعات: ${invoice.invoiceNumber} - ${selectedCustomer.name}`
    });

    navigate('/sales/invoices');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP'
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">فاتورة مبيعات جديدة</h1>
          <p className="text-gray-500 mt-1">إنشاء فاتورة بيع جديدة</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/sales/invoices')}>
            <X className="w-4 h-4 ml-2" />
            إلغاء
          </Button>
          <Button onClick={handleSave} disabled={!selectedCustomer || items.length === 0}>
            <Save className="w-4 h-4 ml-2" />
            حفظ الفاتورة
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Invoice Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">بيانات العميل</CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={selectedCustomer?.id}
                onValueChange={(value) => {
                  const customer = customers.find(c => c.id === value);
                  setSelectedCustomer(customer || null);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر العميل" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name} - {customer.phone}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {selectedCustomer && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <UserCircle className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{selectedCustomer.name}</p>
                      <p className="text-sm text-gray-500">{selectedCustomer.phone}</p>
                      {selectedCustomer.email && (
                        <p className="text-sm text-gray-500">{selectedCustomer.email}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Items */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">المنتجات</CardTitle>
              <Button onClick={() => setProductDialogOpen(true)}>
                <Plus className="w-4 h-4 ml-2" />
                إضافة منتج
              </Button>
            </CardHeader>
            <CardContent>
              {items.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>لا توجد منتجات مضافة</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => setProductDialogOpen(true)}
                  >
                    إضافة منتج
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>المنتج</TableHead>
                        <TableHead>الكمية</TableHead>
                        <TableHead>السعر</TableHead>
                        <TableHead>الإجمالي</TableHead>
                        <TableHead className="w-10"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{item.productName}</p>
                              <p className="text-sm text-gray-500">{item.productCode}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                              >
                                -
                              </Button>
                              <Input
                                type="number"
                                value={item.quantity}
                                onChange={(e) => updateItemQuantity(item.id, parseInt(e.target.value) || 0)}
                                className="w-20 text-center"
                              />
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                              >
                                +
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={item.unitPrice}
                              onChange={(e) => updateItemPrice(item.id, parseFloat(e.target.value) || 0)}
                              className="w-28"
                            />
                          </TableCell>
                          <TableCell className="font-medium">
                            {formatCurrency(item.total)}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeItem(item.id)}
                              className="text-red-500"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Totals */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">ملخص الفاتورة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">المجموع الفرعي</span>
                <span className="font-medium">{formatCurrency(subtotal)}</span>
              </div>
              
              <div className="space-y-2">
                <Label>الخصم</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    value={discount}
                    onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                    className="flex-1"
                  />
                  <Select
                    value={discountType}
                    onValueChange={(value: 'fixed' | 'percentage') => setDiscountType(value)}
                  >
                    <SelectTrigger className="w-28">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fixed">جنيه</SelectItem>
                      <SelectItem value="percentage">%</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>نسبة الضريبة (%)</Label>
                <Input
                  type="number"
                  value={taxRate}
                  onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                />
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">الضريبة</span>
                <span className="font-medium">{formatCurrency(taxAmount)}</span>
              </div>
              
              <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>الإجمالي</span>
                  <span className="text-primary">{formatCurrency(total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">الدفع</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>المبلغ المدفوع</Label>
                <Input
                  type="number"
                  value={paid}
                  onChange={(e) => setPaid(parseFloat(e.target.value) || 0)}
                />
              </div>
              
              <div className="space-y-2">
                <Label>طريقة الدفع</Label>
                <Select
                  value={paymentMethod}
                  onValueChange={(value: any) => setPaymentMethod(value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">نقدي</SelectItem>
                    <SelectItem value="card">بطاقة ائتمان</SelectItem>
                    <SelectItem value="bank_transfer">تحويل بنكي</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {total - paid > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>المتبقي</span>
                  <span className="font-medium">{formatCurrency(total - paid)}</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">ملاحظات</CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="أي ملاحظات على الفاتورة..."
                className="w-full min-h-[100px] p-3 border rounded-md resize-none"
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Product Selection Dialog */}
      <Dialog open={productDialogOpen} onOpenChange={setProductDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>اختيار منتج</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="البحث عن منتج..."
                value={searchProduct}
                onChange={(e) => setSearchProduct(e.target.value)}
                className="pr-10"
              />
            </div>
            <div className="overflow-y-auto max-h-96">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredProducts.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => addItem(product)}
                    className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 text-right"
                    disabled={product.currentStock <= 0}
                  >
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Package className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{product.name}</p>
                      <p className="text-sm text-gray-500">{product.code}</p>
                      <p className="text-sm font-medium text-primary">
                        {formatCurrency(product.salePrice)}
                      </p>
                    </div>
                    <Badge variant={product.currentStock > 0 ? "default" : "destructive"}>
                      {product.currentStock}
                    </Badge>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
