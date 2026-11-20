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
