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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProductStorage, CategoryStorage, ActivityStorage, WarehouseStorage } from '@/lib/storage';
import type { Product, Category, Warehouse } from '@/types';
import {
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Package,
  AlertTriangle,
  TrendingUp,
  Boxes
} from 'lucide-react';

export default function ProductsList() {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    code: '',
    name: '',
    description: '',
    categoryId: '',
    unit: 'piece',
    purchasePrice: '',
    salePrice: '',
    minStock: '10',
    currentStock: '0',
    warehouseId: '',
    barcode: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [searchQuery, selectedCategory, products]);

  const loadData = () => {
    const allProducts = ProductStorage.getAll();
    const allCategories = CategoryStorage.getAll();
    const allWarehouses = WarehouseStorage.getAll();
    
    setProducts(allProducts);
    setFilteredProducts(allProducts);
    setCategories(allCategories);
    setWarehouses(allWarehouses);
    setLoading(false);
  };

  const filterProducts = () => {
    let filtered = products;
    
    if (searchQuery) {
      filtered = filtered.filter(prod => 
        prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prod.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prod.barcode?.includes(searchQuery)
      );
    }
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(prod => prod.categoryId === selectedCategory);
    }
    
    setFilteredProducts(filtered);
  };

  const generateProductCode = () => {
    const prefix = 'PRD';
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${prefix}-${random}`;
  };

  const handleDelete = (product: Product) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (productToDelete) {
      ProductStorage.delete(productToDelete.id);
      
      ActivityStorage.create({
        userId: currentUser?.id || '',
        userName: currentUser?.name,
        action: 'delete',
        entityType: 'product',
        entityId: productToDelete.id,
        entityName: productToDelete.name,
        details: `حذف المنتج ${productToDelete.name}`
      });

      loadData();
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    }
  };

  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.salePrice) {
      return;
    }

    const code = newProduct.code || generateProductCode();
    const category = categories.find(c => c.id === newProduct.categoryId);

    const product = ProductStorage.create({
      code,
      name: newProduct.name,
      description: newProduct.description,
      categoryId: newProduct.categoryId,
      categoryName: category?.name,
      unit: newProduct.unit,
      purchasePrice: parseFloat(newProduct.purchasePrice) || 0,
      salePrice: parseFloat(newProduct.salePrice),
      minStock: parseInt(newProduct.minStock) || 10,
      currentStock: parseInt(newProduct.currentStock) || 0,
      warehouseId: newProduct.warehouseId,
      barcode: newProduct.barcode,
      status: 'active'
    });

    ActivityStorage.create({
      userId: currentUser?.id || '',
      userName: currentUser?.name,
      action: 'create',
      entityType: 'product',
      entityId: product.id,
      entityName: product.name,
      details: `إضافة منتج جديد: ${product.name}`
    });

    setAddDialogOpen(false);
    setNewProduct({
      code: '',
      name: '',
      description: '',
      categoryId: '',
      unit: 'piece',
      purchasePrice: '',
      salePrice: '',
      minStock: '10',
      currentStock: '0',
      warehouseId: '',
      barcode: ''
    });
    loadData();
  };

  const getStockBadge = (product: Product) => {
    if (product.currentStock <= 0) {
      return <Badge variant="destructive">نفذت الكمية</Badge>;
    } else if (product.currentStock <= product.minStock) {
      return <Badge className="bg-orange-500">منخفض</Badge>;
    } else {
      return <Badge className="bg-green-500">متوفر</Badge>;
    }
  };

  const calculateProfitMargin = (product: Product) => {
    if (product.purchasePrice === 0) return 100;
    return ((product.salePrice - product.purchasePrice) / product.purchasePrice * 100).toFixed(1);
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
          <h1 className="text-2xl font-bold text-gray-900">المنتجات</h1>
          <p className="text-gray-500 mt-1">إدارة المنتجات والمخزون</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/products/categories')}>
            الفئات
          </Button>
          <Button onClick={() => setAddDialogOpen(true)}>
            <Plus className="w-4 h-4 ml-2" />
            منتج جديد
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">إجمالي المنتجات</p>
                <p className="text-2xl font-bold">{products.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">المخزون المنخفض</p>
                <p className="text-2xl font-bold text-orange-600">
                  {products.filter(p => p.currentStock <= p.minStock && p.currentStock > 0).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">نفذت الكمية</p>
                <p className="text-2xl font-bold text-red-600">
                  {products.filter(p => p.currentStock <= 0).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <Boxes className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">المنتجات النشطة</p>
                <p className="text-2xl font-bold text-green-600">
                  {products.filter(p => p.status === 'active').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
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
                placeholder="البحث عن منتج..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="جميع الفئات" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الفئات</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">قائمة المنتجات ({filteredProducts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>المنتج</TableHead>
                  <TableHead>الكود</TableHead>
                  <TableHead>الفئة</TableHead>
                  <TableHead>السعر</TableHead>
                  <TableHead>المخزون</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      لا يوجد منتجات
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                            <Package className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{product.name}</p>
                            {product.description && (
                              <p className="text-sm text-gray-500 truncate max-w-xs">
                                {product.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                          {product.code}
                        </code>
                      </TableCell>
                      <TableCell>{product.categoryName || '-'}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium">
                            {new Intl.NumberFormat('ar-EG', {
                              style: 'currency',
                              currency: 'EGP'
                            }).format(product.salePrice)}
                          </p>
                          <p className="text-xs text-gray-500">
                            ربح: {calculateProfitMargin(product)}%
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium">{product.currentStock} {product.unit}</p>
                          <p className="text-xs text-gray-500">
                            حد أدنى: {product.minStock}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{getStockBadge(product)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigate(`/products/${product.id}`)}>
                              <Edit className="w-4 h-4 ml-2" />
                              تعديل
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDelete(product)}
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

      {/* Add Product Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>إضافة منتج جديد</DialogTitle>
            <DialogDescription>
              أدخل بيانات المنتج الجديد
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>كود المنتج</Label>
                <Input
                  value={newProduct.code}
                  onChange={(e) => setNewProduct({ ...newProduct, code: e.target.value })}
                  placeholder={generateProductCode()}
                />
              </div>
              <div className="space-y-2">
                <Label>الباركود</Label>
                <Input
                  value={newProduct.barcode}
                  onChange={(e) => setNewProduct({ ...newProduct, barcode: e.target.value })}
                  placeholder="xxxxxxxxxx"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>اسم المنتج *</Label>
              <Input
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                placeholder="اسم المنتج"
              />
            </div>
            <div className="space-y-2">
              <Label>الوصف</Label>
              <Input
                value={newProduct.description}
                onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                placeholder="وصف المنتج"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>الفئة</Label>
                <Select
                  value={newProduct.categoryId}
                  onValueChange={(value) => setNewProduct({ ...newProduct, categoryId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الفئة" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>الوحدة</Label>
                <Select
                  value={newProduct.unit}
                  onValueChange={(value) => setNewProduct({ ...newProduct, unit: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="piece">قطعة</SelectItem>
                    <SelectItem value="kg">كيلوجرام</SelectItem>
                    <SelectItem value="meter">متر</SelectItem>
                    <SelectItem value="liter">لتر</SelectItem>
                    <SelectItem value="box">صندوق</SelectItem>
                    <SelectItem value="pack">عبوة</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>سعر الشراء</Label>
                <Input
                  type="number"
                  value={newProduct.purchasePrice}
                  onChange={(e) => setNewProduct({ ...newProduct, purchasePrice: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label>سعر البيع *</Label>
                <Input
                  type="number"
                  value={newProduct.salePrice}
                  onChange={(e) => setNewProduct({ ...newProduct, salePrice: e.target.value })}
                  placeholder="0.00"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>المخزون الحالي</Label>
                <Input
                  type="number"
                  value={newProduct.currentStock}
                  onChange={(e) => setNewProduct({ ...newProduct, currentStock: e.target.value })}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label>الحد الأدنى</Label>
                <Input
                  type="number"
                  value={newProduct.minStock}
                  onChange={(e) => setNewProduct({ ...newProduct, minStock: e.target.value })}
                  placeholder="10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>المستودع</Label>
              <Select
                value={newProduct.warehouseId}
                onValueChange={(value) => setNewProduct({ ...newProduct, warehouseId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر المستودع" />
                </SelectTrigger>
                <SelectContent>
                  {warehouses.map((warehouse) => (
                    <SelectItem key={warehouse.id} value={warehouse.id}>
                      {warehouse.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={handleAddProduct}>
              إضافة
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تأكيد الحذف</DialogTitle>
            <DialogDescription>
              هل أنت متأكد من حذف المنتج {productToDelete?.name}؟
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
