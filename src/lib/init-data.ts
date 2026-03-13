// ملف تهيئة البيانات الأولية للنظام

import {
  UserStorage,
  CustomerStorage,
  SupplierStorage,
  CategoryStorage,
  ProductStorage,
  WarehouseStorage,
  SettingsStorage
} from './storage';

export function initializeData() {
  // التحقق إذا كانت البيانات قد تم تهيئتها مسبقاً
  const users = UserStorage.getAll();
  if (users.length > 0) {
    return; // البيانات موجودة بالفعل
  }

  // إنشاء المستخدمين
  UserStorage.create({
    name: 'المشرف',
    email: 'admin@company.com',
    password: 'admin123',
    role: 'admin',
    phone: '01111111111',
    department: 'الإدارة',
    status: 'active'
  });

  UserStorage.create({
    name: 'المدير',
    email: 'manager@company.com',
    password: 'manager123',
    role: 'manager',
    phone: '01222222222',
    department: 'المبيعات',
    status: 'active'
  });

  UserStorage.create({
    name: 'موظف',
    email: 'employee@company.com',
    password: 'employee123',
    role: 'employee',
    phone: '01333333333',
    department: 'خدمة العملاء',
    status: 'active'
  });

  // إنشاء الفئات
  const electronics = CategoryStorage.create({
    name: 'إلكترونيات',
    description: 'الأجهزة الإلكترونية والكهربائية'
  });

  const clothing = CategoryStorage.create({
    name: 'ملابس',
    description: 'ملابس رجالي وحريمي وأطفال'
  });

  const food = CategoryStorage.create({
    name: 'مواد غذائية',
    description: 'المواد الغذائية والمشروبات'
  });

  const furniture = CategoryStorage.create({
    name: 'أثاث',
    description: 'أثاث منزلي ومكتبي'
  });

  // إنشاء المستودعات
  const mainWarehouse = WarehouseStorage.create({
    name: 'المستودع الرئيسي',
    location: 'القاهرة - شارع التحرير',
    manager: 'أحمد محمد',
    phone: '01444444444',
    status: 'active'
  });

  const branchWarehouse = WarehouseStorage.create({
    name: 'مستودع الفرع',
    location: 'الإسكندرية - شارع الجمهورية',
    manager: 'محمد علي',
    phone: '01555555555',
    status: 'active'
  });

  // إنشاء المنتجات
  ProductStorage.create({
    code: 'PRD-0001',
    name: 'هاتف ذكي Samsung Galaxy',
    description: 'هاتف ذكي بشاشة 6.5 بوصة',
    categoryId: electronics.id,
    categoryName: electronics.name,
    unit: 'piece',
    purchasePrice: 8000,
    salePrice: 9500,
    minStock: 5,
    currentStock: 25,
    warehouseId: mainWarehouse.id,
    barcode: '1234567890123',
    status: 'active'
  });

  ProductStorage.create({
    code: 'PRD-0002',
    name: 'لابتوب Dell Inspiron',
    description: 'لابتوب للأعمال والدراسة',
    categoryId: electronics.id,
    categoryName: electronics.name,
    unit: 'piece',
    purchasePrice: 15000,
    salePrice: 17500,
    minStock: 3,
    currentStock: 12,
    warehouseId: mainWarehouse.id,
    barcode: '1234567890124',
    status: 'active'
  });

  ProductStorage.create({
    code: 'PRD-0003',
    name: 'تيشيرت قطني',
    description: 'تيشيرت 100% قطن',
    categoryId: clothing.id,
    categoryName: clothing.name,
    unit: 'piece',
    purchasePrice: 150,
    salePrice: 250,
    minStock: 20,
    currentStock: 150,
    warehouseId: branchWarehouse.id,
    barcode: '1234567890125',
    status: 'active'
  });

  ProductStorage.create({
    code: 'PRD-0004',
    name: 'بنطلون جينز',
    description: 'بنطلون جينز عالي الجودة',
    categoryId: clothing.id,
    categoryName: clothing.name,
    unit: 'piece',
    purchasePrice: 400,
    salePrice: 650,
    minStock: 15,
    currentStock: 80,
    warehouseId: branchWarehouse.id,
    barcode: '1234567890126',
    status: 'active'
  });

  ProductStorage.create({
    code: 'PRD-0005',
    name: 'أرز مصري',
    description: 'أرز مصري فاخر 1 كجم',
    categoryId: food.id,
    categoryName: food.name,
    unit: 'kg',
    purchasePrice: 25,
    salePrice: 35,
    minStock: 50,
    currentStock: 200,
    warehouseId: mainWarehouse.id,
    barcode: '1234567890127',
    status: 'active'
  });

  ProductStorage.create({
    code: 'PRD-0006',
    name: 'سكر',
    description: 'سكر أبيض 1 كجم',
    categoryId: food.id,
    categoryName: food.name,
    unit: 'kg',
    purchasePrice: 15,
    salePrice: 22,
    minStock: 50,
    currentStock: 180,
    warehouseId: mainWarehouse.id,
    barcode: '1234567890128',
    status: 'active'
  });

  ProductStorage.create({
    code: 'PRD-0007',
    name: 'مكتب خشبي',
    description: 'مكتب خشبي للمكاتب',
    categoryId: furniture.id,
    categoryName: furniture.name,
    unit: 'piece',
    purchasePrice: 2500,
    salePrice: 3200,
    minStock: 2,
    currentStock: 8,
    warehouseId: mainWarehouse.id,
    barcode: '1234567890129',
    status: 'active'
  });

  ProductStorage.create({
    code: 'PRD-0008',
    name: 'كرسي مكتبي',
    description: 'كرسي مكتبي مريح',
    categoryId: furniture.id,
    categoryName: furniture.name,
    unit: 'piece',
    purchasePrice: 1200,
    salePrice: 1600,
    minStock: 5,
    currentStock: 15,
    warehouseId: mainWarehouse.id,
    barcode: '1234567890130',
    status: 'active'
  });

  // إنشاء العملاء
  CustomerStorage.create({
    name: 'أحمد محمد',
    email: 'ahmed@email.com',
    phone: '01000000001',
    address: 'شارع النصر، القاهرة',
    city: 'القاهرة',
    company: 'شركة الأمل',
    balance: 0,
    status: 'active',
    createdBy: 'admin'
  });

  CustomerStorage.create({
    name: 'محمد علي',
    email: 'mohamed@email.com',
    phone: '01000000002',
    address: 'شارع الجمهورية، الإسكندرية',
    city: 'الإسكندرية',
    company: 'مؤسسة النجاح',
    balance: 0,
    status: 'active',
    createdBy: 'admin'
  });

  CustomerStorage.create({
    name: 'فاطمة أحمد',
    email: 'fatma@email.com',
    phone: '01000000003',
    address: 'شارع التحرير، الجيزة',
    city: 'الجيزة',
    balance: 0,
    status: 'active',
    createdBy: 'admin'
  });

  CustomerStorage.create({
    name: 'خالد محمود',
    email: 'khaled@email.com',
    phone: '01000000004',
    address: 'شارع الهرم، الجيزة',
    city: 'الجيزة',
    company: 'شركة البركة',
    balance: 0,
    status: 'active',
    createdBy: 'admin'
  });

  // إنشاء الموردين
  SupplierStorage.create({
    name: 'شركة Samsung مصر',
    email: 'samsung@supplier.com',
    phone: '0211111111',
    address: 'القاهرة الجديدة',
    city: 'القاهرة',
    company: 'Samsung Egypt',
    balance: 0,
    status: 'active'
  });

  SupplierStorage.create({
    name: 'مصنع الملابس الذهبية',
    email: 'golden@supplier.com',
    phone: '0222222222',
    address: 'العبور',
    city: 'القليوبية',
    company: 'Golden Textile',
    balance: 0,
    status: 'active'
  });

  SupplierStorage.create({
    name: 'شركة الأغذية المتحدة',
    email: 'food@supplier.com',
    phone: '0233333333',
    address: '6 أكتوبر',
    city: 'الجيزة',
    company: 'United Food Co.',
    balance: 0,
    status: 'active'
  });

  // إعدادات افتراضية
  SettingsStorage.set({
    companyName: 'شركتي',
    companyPhone: '02xxxxxxxx',
    companyEmail: 'info@company.com',
    companyAddress: 'القاهرة، مصر',
    currency: 'EGP',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '12h',
    language: 'ar',
    theme: 'light',
    defaultTaxRate: 14,
    invoicePrefix: 'INV'
  });

  console.log('تم تهيئة البيانات الأولية بنجاح!');
}
