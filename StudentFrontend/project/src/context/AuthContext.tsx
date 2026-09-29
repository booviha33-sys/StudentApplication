import { createContext, useContext, useState, type ReactNode } from 'react';

interface AuthContextType {
  studentName: string | null;
  login: (name: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [studentName, setStudentName] = useState<string | null>(
    () => sessionStorage.getItem('studentName')
  );

  const login = (name: string) => {
    setStudentName(name);
    sessionStorage.setItem('studentName', name);
  };

  const logout = () => {
    setStudentName(null);
    sessionStorage.removeItem('studentName');
  };

  return (
    <AuthContext.Provider value={{ studentName, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
