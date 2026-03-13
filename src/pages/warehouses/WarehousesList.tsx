import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
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
import { WarehouseStorage, ProductStorage, ActivityStorage } from '@/lib/storage';
import type { Warehouse as WarehouseType } from '@/types';
import {
  Plus,
  Search,
  MapPin,
  User,
  Phone,
  Trash2,
  Eye
} from 'lucide-react';

export default function WarehousesList() {
  const { user: currentUser } = useAuth();
  const [warehouses, setWarehouses] = useState<WarehouseType[]>([]);
  const [filteredWarehouses, setFilteredWarehouses] = useState<WarehouseType[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [warehouseToDelete, setWarehouseToDelete] = useState<WarehouseType | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState<WarehouseType | null>(null);
  const [warehouseProducts, setWarehouseProducts] = useState<any[]>([]);
  const [newWarehouse, setNewWarehouse] = useState({
    name: '',
    location: '',
    manager: '',
    phone: ''
  });

  useEffect(() => {
    loadWarehouses();
  }, []);

  useEffect(() => {
    filterWarehouses();
  }, [searchQuery, warehouses]);

  const loadWarehouses = () => {
    const allWarehouses = WarehouseStorage.getAll();
    setWarehouses(allWarehouses);
    setFilteredWarehouses(allWarehouses);
    setLoading(false);
  };

  const filterWarehouses = () => {
    let filtered = warehouses;
    
    if (searchQuery) {
      filtered = filtered.filter(w => 
        w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.manager?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    setFilteredWarehouses(filtered);
  };

  const handleDelete = (warehouse: WarehouseType) => {
    setWarehouseToDelete(warehouse);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (warehouseToDelete) {
      WarehouseStorage.delete(warehouseToDelete.id);
      
      ActivityStorage.create({
        userId: currentUser?.id || '',
        userName: currentUser?.name,
        action: 'delete',
        entityType: 'warehouse',
        entityId: warehouseToDelete.id,
        entityName: warehouseToDelete.name,
        details: `حذف المستودع ${warehouseToDelete.name}`
      });

      loadWarehouses();
      setDeleteDialogOpen(false);
      setWarehouseToDelete(null);
    }
  };

  const handleAddWarehouse = () => {
    if (!newWarehouse.name) {
      return;
    }

    const warehouse = WarehouseStorage.create({
      name: newWarehouse.name,
      location: newWarehouse.location,
      manager: newWarehouse.manager,
      phone: newWarehouse.phone,
      status: 'active'
    });

    ActivityStorage.create({
      userId: currentUser?.id || '',
      userName: currentUser?.name,
      action: 'create',
      entityType: 'warehouse',
      entityId: warehouse.id,
      entityName: warehouse.name,
      details: `إضافة مستودع جديد: ${warehouse.name}`
    });

    setAddDialogOpen(false);
    setNewWarehouse({
      name: '',
      location: '',
      manager: '',
      phone: ''
    });
    loadWarehouses();
  };

  const handleViewWarehouse = (warehouse: WarehouseType) => {
    setSelectedWarehouse(warehouse);
    const products = ProductStorage.getAll().filter(p => p.warehouseId === warehouse.id);
    setWarehouseProducts(products);
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
          <h1 className="text-2xl font-bold text-gray-900">المستودعات</h1>
          <p className="text-gray-500 mt-1">إدارة المستودعات والمخازن</p>
        </div>
        <Button onClick={() => setAddDialogOpen(true)}>
          <Plus className="w-4 h-4 ml-2" />
          مستودع جديد
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="البحث عن مستودع..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Warehouses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredWarehouses.length === 0 ? (
          <div className="col-span-full text-center py-8 text-gray-500">
            <div className="w-12 h-12 bg-gray-200 rounded-xl flex items-center justify-center mx-auto mb-3">
              <MapPin className="w-6 h-6 text-gray-400" />
            </div>
            <p>لا يوجد مستودعات</p>
          </div>
        ) : (
          filteredWarehouses.map((warehouse) => (
            <Card key={warehouse.id} className="card-hover">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">{warehouse.name}</h3>
                      {getStatusBadge(warehouse.status)}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => handleViewWarehouse(warehouse)}>
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(warehouse)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
                
                <div className="mt-4 space-y-2">
                  {warehouse.location && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{warehouse.location}</span>
                    </div>
                  )}
                  {warehouse.manager && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <User className="w-4 h-4" />
                      <span>{warehouse.manager}</span>
                    </div>
                  )}
                  {warehouse.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4" />
                      <span>{warehouse.phone}</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">المنتجات</span>
                    <Badge variant="secondary">
                      {ProductStorage.getAll().filter(p => p.warehouseId === warehouse.id).length}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Add Warehouse Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>إضافة مستودع جديد</DialogTitle>
            <DialogDescription>
              أدخل بيانات المستودع الجديد
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>اسم المستودع *</Label>
              <Input
                value={newWarehouse.name}
                onChange={(e) => setNewWarehouse({ ...newWarehouse, name: e.target.value })}
                placeholder="المستودع الرئيسي"
              />
            </div>
            <div className="space-y-2">
              <Label>الموقع</Label>
              <Input
                value={newWarehouse.location}
                onChange={(e) => setNewWarehouse({ ...newWarehouse, location: e.target.value })}
                placeholder="العنوان"
              />
            </div>
            <div className="space-y-2">
              <Label>المسؤول</Label>
              <Input
                value={newWarehouse.manager}
                onChange={(e) => setNewWarehouse({ ...newWarehouse, manager: e.target.value })}
                placeholder="اسم المسؤول"
              />
            </div>
            <div className="space-y-2">
              <Label>رقم الهاتف</Label>
              <Input
                value={newWarehouse.phone}
                onChange={(e) => setNewWarehouse({ ...newWarehouse, phone: e.target.value })}
                placeholder="01xxxxxxxxx"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={handleAddWarehouse}>
              إضافة
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Warehouse Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>تفاصيل المستودع</DialogTitle>
          </DialogHeader>
          {selectedWarehouse && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center">
                  <MapPin className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">{selectedWarehouse.name}</h3>
                  {getStatusBadge(selectedWarehouse.status)}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {selectedWarehouse.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span>{selectedWarehouse.location}</span>
                  </div>
                )}
                {selectedWarehouse.manager && (
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span>{selectedWarehouse.manager}</span>
                  </div>
                )}
                {selectedWarehouse.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span>{selectedWarehouse.phone}</span>
                  </div>
                )}
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">المنتجات ({warehouseProducts.length})</h4>
                {warehouseProducts.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">لا توجد منتجات في هذا المستودع</p>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {warehouseProducts.map((product) => (
                      <div key={product.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm">{product.name}</span>
                        <Badge>{product.currentStock}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
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
              هل أنت متأكد من حذف المستودع {warehouseToDelete?.name}؟
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
