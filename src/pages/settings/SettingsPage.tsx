import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SettingsStorage, clearAllData, exportAllData, importAllData } from '@/lib/storage';
import { toast } from 'sonner';
import {
  Building2,
  User,
  Palette,
  Database,
  Save,
  Upload,
  Download,
  Trash2,
  AlertTriangle
} from 'lucide-react';

export default function SettingsPage() {
  const { user, updateUser, logout } = useAuth();
  const [settings, setSettings] = useState(SettingsStorage.get());
  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [importData, setImportData] = useState('');

  const handleSaveSettings = () => {
    SettingsStorage.set(settings);
    toast.success('تم حفظ الإعدادات بنجاح');
  };

  const handleSaveProfile = () => {
    if (profile.newPassword && profile.newPassword !== profile.confirmPassword) {
      toast.error('كلمات المرور غير متطابقة');
      return;
    }

    const updates: any = {
      name: profile.name,
      email: profile.email,
      phone: profile.phone
    };

    if (profile.newPassword) {
      updates.password = profile.newPassword;
    }

    updateUser(updates);
    toast.success('تم حفظ الملف الشخصي بنجاح');
  };

  const handleExport = () => {
    const data = exportAllData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `erp-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    toast.success('تم تصدير البيانات بنجاح');
  };

  const handleImport = () => {
    try {
      if (importAllData(importData)) {
        toast.success('تم استيراد البيانات بنجاح');
        setImportData('');
        window.location.reload();
      } else {
        toast.error('فشل استيراد البيانات');
      }
    } catch (error) {
      toast.error('خطأ في استيراد البيانات');
    }
  };

  const handleClearData = () => {
    if (confirm('هل أنت متأكد من مسح جميع البيانات؟ لا يمكن التراجع عن هذا الإجراء.')) {
      clearAllData();
      toast.success('تم مسح جميع البيانات');
      logout();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">الإعدادات</h1>
        <p className="text-gray-500 mt-1">إدارة إعدادات النظام والحساب</p>
      </div>

      <Tabs defaultValue="company" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto">
          <TabsTrigger value="company">الشركة</TabsTrigger>
          <TabsTrigger value="profile">الحساب</TabsTrigger>
          <TabsTrigger value="appearance">المظهر</TabsTrigger>
          <TabsTrigger value="data">البيانات</TabsTrigger>
        </TabsList>

        {/* Company Settings */}
        <TabsContent value="company" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                بيانات الشركة
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>اسم الشركة</Label>
                <Input
                  value={settings.companyName}
                  onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                  placeholder="اسم الشركة"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>رقم الهاتف</Label>
                  <Input
                    value={settings.companyPhone}
                    onChange={(e) => setSettings({ ...settings, companyPhone: e.target.value })}
                    placeholder="01xxxxxxxxx"
                  />
                </div>
                <div className="space-y-2">
                  <Label>البريد الإلكتروني</Label>
                  <Input
                    value={settings.companyEmail}
                    onChange={(e) => setSettings({ ...settings, companyEmail: e.target.value })}
                    placeholder="company@email.com"
                    className="text-left"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>العنوان</Label>
                <Input
                  value={settings.companyAddress}
                  onChange={(e) => setSettings({ ...settings, companyAddress: e.target.value })}
                  placeholder="عنوان الشركة"
                />
              </div>
              <div className="space-y-2">
                <Label>الرقم الضريبي</Label>
                <Input
                  value={settings.companyTaxNumber}
                  onChange={(e) => setSettings({ ...settings, companyTaxNumber: e.target.value })}
                  placeholder="xxxxxxxxxxx"
                />
              </div>
              <Button onClick={handleSaveSettings}>
                <Save className="w-4 h-4 ml-2" />
                حفظ
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">إعدادات الفواتير</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>العملة</Label>
                  <Select
                    value={settings.currency}
                    onValueChange={(value) => setSettings({ ...settings, currency: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EGP">جنيه مصري (EGP)</SelectItem>
                      <SelectItem value="USD">دولار أمريكي (USD)</SelectItem>
                      <SelectItem value="SAR">ريال سعودي (SAR)</SelectItem>
                      <SelectItem value="AED">درهم إماراتي (AED)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>نسبة الضريبة الافتراضية (%)</Label>
                  <Input
                    type="number"
                    value={settings.defaultTaxRate}
                    onChange={(e) => setSettings({ ...settings, defaultTaxRate: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>بادئة رقم الفاتورة</Label>
                <Input
                  value={settings.invoicePrefix}
                  onChange={(e) => setSettings({ ...settings, invoicePrefix: e.target.value })}
                  placeholder="INV"
                />
              </div>
              <Button onClick={handleSaveSettings}>
                <Save className="w-4 h-4 ml-2" />
                حفظ
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Profile Settings */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="w-5 h-5" />
                الملف الشخصي
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>الاسم</Label>
                <Input
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>البريد الإلكتروني</Label>
                <Input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className="text-left"
                />
              </div>
              <div className="space-y-2">
                <Label>رقم الهاتف</Label>
                <Input
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                />
              </div>
              <Button onClick={handleSaveProfile}>
                <Save className="w-4 h-4 ml-2" />
                حفظ
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">تغيير كلمة المرور</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>كلمة المرور الحالية</Label>
                <Input
                  type="password"
                  value={profile.currentPassword}
                  onChange={(e) => setProfile({ ...profile, currentPassword: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>كلمة المرور الجديدة</Label>
                <Input
                  type="password"
                  value={profile.newPassword}
                  onChange={(e) => setProfile({ ...profile, newPassword: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>تأكيد كلمة المرور</Label>
                <Input
                  type="password"
                  value={profile.confirmPassword}
                  onChange={(e) => setProfile({ ...profile, confirmPassword: e.target.value })}
                />
              </div>
              <Button onClick={handleSaveProfile}>
                <Save className="w-4 h-4 ml-2" />
                تحديث
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Settings */}
        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Palette className="w-5 h-5" />
                المظهر
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>اللغة</Label>
                <Select
                  value={settings.language}
                  onValueChange={(value) => setSettings({ ...settings, language: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ar">العربية</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>التنسيق الزمني</Label>
                <Select
                  value={settings.timeFormat}
                  onValueChange={(value) => setSettings({ ...settings, timeFormat: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="12h">12 ساعة</SelectItem>
                    <SelectItem value="24h">24 ساعة</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleSaveSettings}>
                <Save className="w-4 h-4 ml-2" />
                حفظ
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data Settings */}
        <TabsContent value="data" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Database className="w-5 h-5" />
                النسخ الاحتياطي
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                قم بتصدير جميع بيانات النظام إلى ملف JSON للنسخ الاحتياطي.
              </p>
              <Button onClick={handleExport} variant="outline">
                <Download className="w-4 h-4 ml-2" />
                تصدير البيانات
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">استيراد البيانات</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                استيراد البيانات من ملف نسخ احتياطي سابق.
              </p>
              <textarea
                value={importData}
                onChange={(e) => setImportData(e.target.value)}
                placeholder="لصق بيانات JSON هنا..."
                className="w-full h-32 p-3 border rounded-md text-left"
              />
              <Button onClick={handleImport} variant="outline" disabled={!importData}>
                <Upload className="w-4 h-4 ml-2" />
                استيراد
              </Button>
            </CardContent>
          </Card>

          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-lg text-red-600 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                منطقة الخطر
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                مسح جميع البيانات سيحذف كل المعلومات من النظام. لا يمكن التراجع عن هذا الإجراء.
              </p>
              <Button onClick={handleClearData} variant="destructive">
                <Trash2 className="w-4 h-4 ml-2" />
                مسح جميع البيانات
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
