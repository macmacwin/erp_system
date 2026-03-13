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
import { UserStorage, ActivityStorage } from '@/lib/storage';
import type { User as UserType } from '@/types';
import {
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  UserCircle
} from 'lucide-react';

export default function EmployeesList() {
  const navigate = useNavigate();
  const { user: currentUser, isAdmin } = useAuth();
  const [employees, setEmployees] = useState<UserType[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<UserType[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<UserType | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'employee' as const,
    department: '',
    salary: ''
  });

  useEffect(() => {
    loadEmployees();
  }, []);

  useEffect(() => {
    filterEmployees();
  }, [searchQuery, employees]);

  const loadEmployees = () => {
    const allEmployees = UserStorage.getAll();
    setEmployees(allEmployees);
    setFilteredEmployees(allEmployees);
    setLoading(false);
  };

  const filterEmployees = () => {
    let filtered = employees;
    
    if (searchQuery) {
      filtered = filtered.filter(emp => 
        emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.department?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    setFilteredEmployees(filtered);
  };

  const handleDelete = (employee: UserType) => {
    setEmployeeToDelete(employee);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (employeeToDelete) {
      UserStorage.delete(employeeToDelete.id);
      
      ActivityStorage.create({
        userId: currentUser?.id || '',
        userName: currentUser?.name,
        action: 'delete',
        entityType: 'employee',
        entityId: employeeToDelete.id,
        entityName: employeeToDelete.name,
        details: `حذف الموظف ${employeeToDelete.name}`
      });

      loadEmployees();
      setDeleteDialogOpen(false);
      setEmployeeToDelete(null);
    }
  };

  const handleAddEmployee = () => {
    if (!newEmployee.name || !newEmployee.email || !newEmployee.password) {
      return;
    }

    const employee = UserStorage.create({
      name: newEmployee.name,
      email: newEmployee.email,
      password: newEmployee.password,
      phone: newEmployee.phone,
      role: newEmployee.role,
      department: newEmployee.department,
      salary: newEmployee.salary ? parseFloat(newEmployee.salary) : undefined,
      status: 'active'
    });

    ActivityStorage.create({
      userId: currentUser?.id || '',
      userName: currentUser?.name,
      action: 'create',
      entityType: 'employee',
      entityId: employee.id,
      entityName: employee.name,
      details: `إضافة موظف جديد: ${employee.name}`
    });

    setAddDialogOpen(false);
    setNewEmployee({
      name: '',
      email: '',
      password: '',
      phone: '',
      role: 'employee',
      department: '',
      salary: ''
    });
    loadEmployees();
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-red-500">مشرف</Badge>;
      case 'manager':
        return <Badge className="bg-blue-500">مدير</Badge>;
      case 'employee':
        return <Badge className="bg-green-500">موظف</Badge>;
      default:
        return <Badge>{role}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="outline" className="border-green-500 text-green-600">نشط</Badge>;
      case 'inactive':
        return <Badge variant="outline" className="border-gray-500 text-gray-600">غير نشط</Badge>;
      case 'suspended':
        return <Badge variant="outline" className="border-red-500 text-red-600">موقوف</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
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
          <h1 className="text-2xl font-bold text-gray-900">الموظفين</h1>
          <p className="text-gray-500 mt-1">إدارة فريق العمل والصلاحيات</p>
        </div>
        {isAdmin && (
          <Button onClick={() => setAddDialogOpen(true)}>
            <Plus className="w-4 h-4 ml-2" />
            موظف جديد
          </Button>
        )}
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="البحث عن موظف..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Employees Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">قائمة الموظفين ({filteredEmployees.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الموظف</TableHead>
                  <TableHead>الدور</TableHead>
                  <TableHead>القسم</TableHead>
                  <TableHead>الراتب</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>آخر دخول</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      لا يوجد موظفين
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEmployees.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <UserCircle className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{employee.name}</p>
                            <p className="text-sm text-gray-500">{employee.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getRoleBadge(employee.role)}</TableCell>
                      <TableCell>{employee.department || '-'}</TableCell>
                      <TableCell>
                        {employee.salary 
                          ? new Intl.NumberFormat('ar-EG', {
                              style: 'currency',
                              currency: 'EGP'
                            }).format(employee.salary)
                          : '-'
                        }
                      </TableCell>
                      <TableCell>{getStatusBadge(employee.status)}</TableCell>
                      <TableCell>
                        {employee.lastLogin 
                          ? new Date(employee.lastLogin).toLocaleDateString('ar-EG')
                          : 'لم يسبق له'
                        }
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigate(`/employees/${employee.id}`)}>
                              <Edit className="w-4 h-4 ml-2" />
                              تعديل
                            </DropdownMenuItem>
                            {isAdmin && employee.id !== currentUser?.id && (
                              <DropdownMenuItem 
                                onClick={() => handleDelete(employee)}
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

      {/* Add Employee Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>إضافة موظف جديد</DialogTitle>
            <DialogDescription>
              أدخل بيانات الموظف الجديد
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>الاسم الكامل *</Label>
              <Input
                value={newEmployee.name}
                onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                placeholder="محمد أحمد"
              />
            </div>
            <div className="space-y-2">
              <Label>البريد الإلكتروني *</Label>
              <Input
                type="email"
                value={newEmployee.email}
                onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                placeholder="employee@company.com"
                className="text-left"
              />
            </div>
            <div className="space-y-2">
              <Label>كلمة المرور *</Label>
              <Input
                type="password"
                value={newEmployee.password}
                onChange={(e) => setNewEmployee({ ...newEmployee, password: e.target.value })}
                placeholder="••••••••"
              />
            </div>
            <div className="space-y-2">
              <Label>رقم الهاتف</Label>
              <Input
                value={newEmployee.phone}
                onChange={(e) => setNewEmployee({ ...newEmployee, phone: e.target.value })}
                placeholder="01xxxxxxxxx"
              />
            </div>
            <div className="space-y-2">
              <Label>الدور الوظيفي</Label>
              <Select
                value={newEmployee.role}
                onValueChange={(value: any) => setNewEmployee({ ...newEmployee, role: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="employee">موظف</SelectItem>
                  <SelectItem value="manager">مدير</SelectItem>
                  <SelectItem value="admin">مشرف</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>القسم</Label>
              <Input
                value={newEmployee.department}
                onChange={(e) => setNewEmployee({ ...newEmployee, department: e.target.value })}
                placeholder="المبيعات"
              />
            </div>
            <div className="space-y-2">
              <Label>الراتب</Label>
              <Input
                type="number"
                value={newEmployee.salary}
                onChange={(e) => setNewEmployee({ ...newEmployee, salary: e.target.value })}
                placeholder="5000"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={handleAddEmployee}>
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
              هل أنت متأكد من حذف الموظف {employeeToDelete?.name}؟
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
