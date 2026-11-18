'use client';

/* MOCK, replaced by Better Auth in Phase 3 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { User, UserRole } from './types';
import { mockUsers } from './mock-data';
import { updateUserProfile } from './data';

interface MockSessionContextType {
  user: User | null;
  role: UserRole | 'guest';
  isLoading: boolean;
  setMockRole: (role: UserRole | 'guest') => void;
  signIn: (email: string, password?: string) => Promise<boolean>;
  signUp: (userData: { name: string; email: string; role: UserRole }) => Promise<boolean>;
  signOut: () => void;
  updateUser: (updates: Partial<User>) => Promise<void>;
}

const MockSessionContext = createContext<MockSessionContextType | undefined>(
  undefined
);

const MOCK_STORAGE_KEY = 'fixmate_mock_active_email';

export function MockSessionProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentRole, setCurrentRole] = useState<UserRole | 'guest'>('customer');
  const [isLoading, setIsLoading] = useState(true);

  // Initialize session from localStorage or default to customer
  useEffect(() => {
    try {
      const storedEmail = localStorage.getItem(MOCK_STORAGE_KEY);
      if (storedEmail === 'guest') {
        setCurrentUser(null);
        setCurrentRole('guest');
      } else if (storedEmail) {
        // Read persisted users list or mockUsers
        const rawUsers = localStorage.getItem('fixmate_mock_users');
        const usersList: User[] = rawUsers ? JSON.parse(rawUsers) : mockUsers;
        const matched = usersList.find(
          (u) => u.email.toLowerCase() === storedEmail.toLowerCase()
        );
        if (matched) {
          setCurrentUser(matched);
          setCurrentRole(matched.role);
        } else {
          // Default to Sarah Jenkins (Customer)
          const defaultUser = mockUsers.find((u) => u.role === 'customer') || mockUsers[4];
          setCurrentUser(defaultUser);
          setCurrentRole('customer');
          localStorage.setItem(MOCK_STORAGE_KEY, defaultUser.email);
        }
      } else {
        // Default to first customer
        const defaultUser = mockUsers.find((u) => u.role === 'customer') || mockUsers[4];
        setCurrentUser(defaultUser);
        setCurrentRole('customer');
        localStorage.setItem(MOCK_STORAGE_KEY, defaultUser.email);
      }
    } catch {
      const defaultUser = mockUsers[4];
      setCurrentUser(defaultUser);
      setCurrentRole('customer');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const setMockRole = useCallback((role: UserRole | 'guest') => {
    if (role === 'guest') {
      setCurrentUser(null);
      setCurrentRole('guest');
      if (typeof window !== 'undefined') {
        localStorage.setItem(MOCK_STORAGE_KEY, 'guest');
      }
      return;
    }

    const rawUsers = typeof window !== 'undefined' ? localStorage.getItem('fixmate_mock_users') : null;
    const usersList: User[] = rawUsers ? JSON.parse(rawUsers) : mockUsers;
    const target = usersList.find((u) => u.role === role);

    if (target) {
      setCurrentUser(target);
      setCurrentRole(role);
      if (typeof window !== 'undefined') {
        localStorage.setItem(MOCK_STORAGE_KEY, target.email);
      }
    }
  }, []);

  const signIn = useCallback(async (email: string): Promise<boolean> => {
    setIsLoading(true);
    await new Promise((res) => setTimeout(res, 250));

    const rawUsers = typeof window !== 'undefined' ? localStorage.getItem('fixmate_mock_users') : null;
    const usersList: User[] = rawUsers ? JSON.parse(rawUsers) : mockUsers;
    const found = usersList.find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );

    if (found) {
      setCurrentUser(found);
      setCurrentRole(found.role);
      if (typeof window !== 'undefined') {
        localStorage.setItem(MOCK_STORAGE_KEY, found.email);
      }
      setIsLoading(false);
      return true;
    }

    setIsLoading(false);
    return false;
  }, []);

  const signUp = useCallback(
    async (userData: { name: string; email: string; role: UserRole }): Promise<boolean> => {
      setIsLoading(true);
      await new Promise((res) => setTimeout(res, 250));

      const rawUsers = typeof window !== 'undefined' ? localStorage.getItem('fixmate_mock_users') : null;
      const usersList: User[] = rawUsers ? JSON.parse(rawUsers) : [...mockUsers];
      const exists = usersList.some(
        (u) => u.email.toLowerCase() === userData.email.toLowerCase()
      );

      if (exists) {
        setIsLoading(false);
        throw new Error('This email is already registered. Please sign in or use another email.');
      }

      const newUser: User = {
        _id: `usr_${Date.now()}`,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        createdAt: new Date().toISOString(),
      };

      usersList.push(newUser);
      setCurrentUser(newUser);
      setCurrentRole(userData.role);
      if (typeof window !== 'undefined') {
        localStorage.setItem('fixmate_mock_users', JSON.stringify(usersList));
        localStorage.setItem(MOCK_STORAGE_KEY, newUser.email);
      }
      setIsLoading(false);
      return true;
    },
    []
  );

  const signOut = useCallback(() => {
    setCurrentUser(null);
    setCurrentRole('guest');
    if (typeof window !== 'undefined') {
      localStorage.setItem(MOCK_STORAGE_KEY, 'guest');
    }
  }, []);

  const updateUser = useCallback(
    async (updates: Partial<User>) => {
      if (!currentUser) return;
      const updated = await updateUserProfile(currentUser.email, updates);
      setCurrentUser(updated);
    },
    [currentUser]
  );

  return (
    <MockSessionContext.Provider
      value={{
        user: currentUser,
        role: currentRole,
        isLoading,
        setMockRole,
        signIn,
        signUp,
        signOut,
        updateUser,
      }}
    >
      {children}
      <DevRoleSwitcher />
    </MockSessionContext.Provider>
  );
}

export function useMockSession() {
  const context = useContext(MockSessionContext);
  if (!context) {
    throw new Error('useMockSession must be used within a MockSessionProvider');
  }
  return context;
}

/**
 * Floating dev role switcher for quick testing between Customer, Technician, Admin, and Guest.
 * Only visible in mock mode.
 */
function DevRoleSwitcher() {
  const { role, user, setMockRole } = useMockSession();
  const [isOpen, setIsOpen] = useState(false);

  const roleColors: Record<UserRole | 'guest', { badge: string; bg: string }> = {
    customer: { badge: 'bg-emerald-500 text-white', bg: 'border-emerald-500' },
    technician: { badge: 'bg-sky-500 text-white', bg: 'border-sky-500' },
    admin: { badge: 'bg-purple-600 text-white', bg: 'border-purple-600' },
    guest: { badge: 'bg-zinc-600 text-white', bg: 'border-zinc-500' },
  };

  return (
    <div className="fixed bottom-4 right-4 z-[9999] font-sans">
      {isOpen ? (
        <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-2xl border border-zinc-200 p-3.5 w-64 text-zinc-900 transition-all animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-200">
            <div className="flex items-center space-x-1.5">
              <span className="h-2 w-2 rounded-full bg-teal-500 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-600">
                FixMate Dev Switcher
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-zinc-400 hover:text-zinc-700 text-xs px-1 rounded transition"
              aria-label="Close role switcher"
            >
              ✕
            </button>
          </div>

          <div className="text-[11px] text-zinc-500 mb-2 truncate">
            Active: <span className="font-semibold text-zinc-800">{user?.name || 'Guest / Logged out'}</span>
          </div>

          <div className="grid grid-cols-1 gap-1.5">
            <button
              onClick={() => setMockRole('customer')}
              className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${
                role === 'customer'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 font-semibold'
                  : 'hover:bg-zinc-100 text-zinc-700'
              }`}
            >
              <span>Customer</span>
              <span className="text-[10px] text-zinc-500">Sarah</span>
            </button>

            <button
              onClick={() => setMockRole('technician')}
              className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${
                role === 'technician'
                  ? 'bg-sky-50 text-sky-800 border border-sky-300 font-semibold'
                  : 'hover:bg-zinc-100 text-zinc-700'
              }`}
            >
              <span>Technician</span>
              <span className="text-[10px] text-zinc-500">Alex</span>
            </button>

            <button
              onClick={() => setMockRole('admin')}
              className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${
                role === 'admin'
                  ? 'bg-purple-50 text-purple-800 border border-purple-300 font-semibold'
                  : 'hover:bg-zinc-100 text-zinc-700'
              }`}
            >
              <span>Admin</span>
              <span className="text-[10px] text-zinc-500">Arthur</span>
            </button>

            <button
              onClick={() => setMockRole('guest')}
              className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${
                role === 'guest'
                  ? 'bg-zinc-200 text-zinc-900 border border-zinc-400 font-semibold'
                  : 'hover:bg-zinc-100 text-zinc-700'
              }`}
            >
              <span>Logged Out</span>
              <span className="text-[10px] text-zinc-500">Guest</span>
            </button>
          </div>

          <div className="mt-2.5 pt-2 border-t border-zinc-200 text-[10px] text-zinc-400 text-center">
            Mock session • Replaced by Better Auth in Phase 3
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className={`flex items-center space-x-2 px-3 py-1.5 rounded-full shadow-lg border bg-white/95 backdrop-blur-sm hover:scale-105 active:scale-95 transition-all text-xs font-medium ${
            roleColors[role]?.bg || 'border-zinc-300'
          }`}
          title="Click to switch mock role"
        >
          <span
            className={`w-2 h-2 rounded-full ${
              role === 'guest' ? 'bg-zinc-400' : 'bg-teal-600'
            }`}
          />
          <span className="capitalize text-zinc-800 font-semibold">
            {role === 'guest' ? 'Logged Out' : role}
          </span>
          <span
            className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
              roleColors[role]?.badge || 'bg-zinc-600 text-white'
            }`}
          >
            Dev
          </span>
        </button>
      )}
    </div>
  );
}
