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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { CustomerStorage, ActivityStorage, InvoiceStorage } from '@/lib/storage';
import type { Customer } from '@/types';
import {
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  UserCircle,
  Eye
} from 'lucide-react';

export default function CustomersList() {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerInvoices, setCustomerInvoices] = useState<any[]>([]);
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    company: '',
    taxNumber: '',
    notes: ''
  });

  useEffect(() => {
    loadCustomers();
  }, []);

  useEffect(() => {
    filterCustomers();
  }, [searchQuery, customers]);

  const loadCustomers = () => {
    const allCustomers = CustomerStorage.getAll();
    setCustomers(allCustomers);
    setFilteredCustomers(allCustomers);
    setLoading(false);
  };

  const filterCustomers = () => {
    let filtered = customers;
    
    if (searchQuery) {
      filtered = filtered.filter(cust => 
        cust.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cust.phone.includes(searchQuery) ||
        cust.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cust.company?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    setFilteredCustomers(filtered);
  };

  const handleDelete = (customer: Customer) => {
    setCustomerToDelete(customer);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (customerToDelete) {
      CustomerStorage.delete(customerToDelete.id);
      
      ActivityStorage.create({
        userId: currentUser?.id || '',
        userName: currentUser?.name,
        action: 'delete',
        entityType: 'customer',
        entityId: customerToDelete.id,
        entityName: customerToDelete.name,
        details: `حذف العميل ${customerToDelete.name}`
      });

      loadCustomers();
      setDeleteDialogOpen(false);
      setCustomerToDelete(null);
    }
  };

  const handleAddCustomer = () => {
    if (!newCustomer.name || !newCustomer.phone) {
      return;
    }

    const customer = CustomerStorage.create({
      name: newCustomer.name,
      email: newCustomer.email,
      phone: newCustomer.phone,
      address: newCustomer.address,
      city: newCustomer.city,
      company: newCustomer.company,
      taxNumber: newCustomer.taxNumber,
      notes: newCustomer.notes,
      balance: 0,
      status: 'active',
      createdBy: currentUser?.id || ''
    });

    ActivityStorage.create({
      userId: currentUser?.id || '',
      userName: currentUser?.name,
      action: 'create',
      entityType: 'customer',
      entityId: customer.id,
      entityName: customer.name,
      details: `إضافة عميل جديد: ${customer.name}`
    });

    setAddDialogOpen(false);
    setNewCustomer({
      name: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      company: '',
      taxNumber: '',
      notes: ''
    });
    loadCustomers();
  };

  const handleViewCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    const invoices = InvoiceStorage.getByCustomer(customer.id);
    setCustomerInvoices(invoices);
    setViewDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500">نشط</Badge>;
      case 'inactive':
        return <Badge variant="secondary">غير نشط</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
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
          <h1 className="text-2xl font-bold text-gray-900">العملاء</h1>
          <p className="text-gray-500 mt-1">إدارة قاعدة بيانات العملاء</p>
        </div>
        <Button onClick={() => setAddDialogOpen(true)}>
          <Plus className="w-4 h-4 ml-2" />
          عميل جديد
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="البحث عن عميل..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Customers Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">قائمة العملاء ({filteredCustomers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>العميل</TableHead>
                  <TableHead>الشركة</TableHead>
                  <TableHead>رقم الهاتف</TableHead>
                  <TableHead>الرصيد</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      لا يوجد عملاء
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCustomers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <UserCircle className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{customer.name}</p>
                            <p className="text-sm text-gray-500">{customer.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{customer.company || '-'}</TableCell>
                      <TableCell>{customer.phone}</TableCell>
                      <TableCell>
                        <span className={customer.balance > 0 ? 'text-red-600' : 'text-green-600'}>
                          {new Intl.NumberFormat('ar-EG', {
                            style: 'currency',
                            currency: 'EGP'
                          }).format(customer.balance)}
                        </span>
                      </TableCell>
                      <TableCell>{getStatusBadge(customer.status)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewCustomer(customer)}>
                              <Eye className="w-4 h-4 ml-2" />
                              عرض التفاصيل
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate(`/customers/${customer.id}`)}>
                              <Edit className="w-4 h-4 ml-2" />
                              تعديل
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDelete(customer)}
                              className="text-red-600"
                            >
                              <Trash2 className="w-4 h-4 ml-2" />
                              حذف
                            </DropdownMenuItem>
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

      {/* Add Customer Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>إضافة عميل جديد</DialogTitle>
            <DialogDescription>
              أدخل بيانات العميل الجديد
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>الاسم الكامل *</Label>
              <Input
                value={newCustomer.name}
                onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                placeholder="أحمد محمد"
              />
            </div>
            <div className="space-y-2">
              <Label>رقم الهاتف *</Label>
              <Input
                value={newCustomer.phone}
                onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                placeholder="01xxxxxxxxx"
              />
            </div>
            <div className="space-y-2">
              <Label>البريد الإلكتروني</Label>
              <Input
                type="email"
                value={newCustomer.email}
                onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                placeholder="customer@email.com"
                className="text-left"
              />
            </div>
            <div className="space-y-2">
              <Label>الشركة</Label>
              <Input
                value={newCustomer.company}
                onChange={(e) => setNewCustomer({ ...newCustomer, company: e.target.value })}
                placeholder="اسم الشركة"
              />
            </div>
            <div className="space-y-2">
              <Label>العنوان</Label>
              <Input
                value={newCustomer.address}
                onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                placeholder="العنوان بالتفصيل"
              />
            </div>
            <div className="space-y-2">
              <Label>المدينة</Label>
              <Input
                value={newCustomer.city}
                onChange={(e) => setNewCustomer({ ...newCustomer, city: e.target.value })}
                placeholder="القاهرة"
              />
            </div>
            <div className="space-y-2">
              <Label>الرقم الضريبي</Label>
              <Input
                value={newCustomer.taxNumber}
                onChange={(e) => setNewCustomer({ ...newCustomer, taxNumber: e.target.value })}
                placeholder="xxxxxxxxxxx"
              />
            </div>
            <div className="space-y-2">
              <Label>ملاحظات</Label>
              <Input
                value={newCustomer.notes}
                onChange={(e) => setNewCustomer({ ...newCustomer, notes: e.target.value })}
                placeholder="أي ملاحظات إضافية"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={handleAddCustomer}>
              إضافة
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Customer Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>تفاصيل العميل</DialogTitle>
          </DialogHeader>
          {selectedCustomer && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <UserCircle className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">{selectedCustomer.name}</h3>
                  <p className="text-gray-500">{selectedCustomer.company || 'فرد'}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">📞</span>
                  <span>{selectedCustomer.phone}</span>
                </div>
                {selectedCustomer.email && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">@</span>
                    <span>{selectedCustomer.email}</span>
                  </div>
                )}
                {selectedCustomer.address && (
                  <div className="flex items-center gap-2 col-span-2">
                    <span className="text-gray-400">📍</span>
                    <span>{selectedCustomer.address}, {selectedCustomer.city}</span>
                  </div>
                )}
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">إحصائيات</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-500">الرصيد</p>
                    <p className={`text-lg font-bold ${selectedCustomer.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {new Intl.NumberFormat('ar-EG', {
                        style: 'currency',
                        currency: 'EGP'
                      }).format(selectedCustomer.balance)}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-500">عدد الفواتير</p>
                    <p className="text-lg font-bold">{customerInvoices.length}</p>
                  </div>
                </div>
              </div>

              {customerInvoices.length > 0 && (
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2">آخر الفواتير</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {customerInvoices.slice(0, 5).map((invoice) => (
                      <div key={invoice.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm">{invoice.invoiceNumber}</span>
                        <span className="text-sm font-medium">
                          {new Intl.NumberFormat('ar-EG', {
                            style: 'currency',
                            currency: 'EGP'
                          }).format(invoice.total)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تأكيد الحذف</DialogTitle>
            <DialogDescription>
              هل أنت متأكد من حذف العميل {customerToDelete?.name}؟
              <br />
              <span className="text-red-500">لا يمكن التراجع عن هذا الإجراء.</span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              إلغاء
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              حذف
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
