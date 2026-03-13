import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User } from '@/types';
import { UserStorage, AuthStorage, ActivityStorage } from '@/lib/storage';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isManager: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // التحقق من المستخدم الحالي عند تحميل التطبيق
    const currentUser = AuthStorage.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      // البحث عن المستخدم بالبريد الإلكتروني
      const foundUser = UserStorage.getByEmail(email);
      
      if (!foundUser) {
        return { success: false, message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' };
      }

      if (foundUser.status !== 'active') {
        return { success: false, message: 'الحساب معطل، يرجى التواصل مع الإدارة' };
      }

      // التحقق من كلمة المرور
      if (foundUser.password !== password) {
        return { success: false, message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' };
      }

      // تحديث وقت آخر تسجيل دخول
      const updatedUser = UserStorage.update(foundUser.id, { 
        lastLogin: new Date().toISOString() 
      });

      if (updatedUser) {
        setUser(updatedUser);
        AuthStorage.setCurrentUser(updatedUser);
        AuthStorage.setToken(generateToken());

        // تسجيل النشاط
        ActivityStorage.create({
          userId: updatedUser.id,
          userName: updatedUser.name,
          userRole: updatedUser.role,
          action: 'login',
          entityType: 'user',
          entityId: updatedUser.id,
          entityName: updatedUser.name,
          details: 'تسجيل دخول إلى النظام'
        });

        return { success: true };
      }

      return { success: false, message: 'حدث خطأ أثناء تسجيل الدخول' };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'حدث خطأ غير متوقع' };
    }
  };

  const logout = () => {
    if (user) {
      ActivityStorage.create({
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        action: 'logout',
        entityType: 'user',
        entityId: user.id,
        entityName: user.name,
        details: 'تسجيل خروج من النظام'
      });
    }
    setUser(null);
    AuthStorage.logout();
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = UserStorage.update(user.id, updates);
      if (updatedUser) {
        setUser(updatedUser);
        AuthStorage.setCurrentUser(updatedUser);
      }
    }
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    return user.permissions?.includes(permission) || false;
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isManager: user?.role === 'admin' || user?.role === 'manager',
    login,
    logout,
    updateUser,
    hasPermission
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

function generateToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}
