'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'manager' | 'sales_rep';
  redirectTo?: string;
}

export default function ProtectedRoute({
  children,
  requiredRole,
  redirectTo = '/login',
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (isLoading) return;

    // Check if user is authenticated
    if (!user) {
      const currentPath = window.location.pathname;
      router.push(`${redirectTo}?redirect=${encodeURIComponent(currentPath)}`);
      return;
    }

    // Check role-based authorization
    if (requiredRole) {
      const roleHierarchy: Record<string, number> = {
        'sales_rep': 1,
        'manager': 2
      };

      const userLevel = roleHierarchy[user.role] || 0;
      const requiredLevel = roleHierarchy[requiredRole] || 0;

      if (userLevel < requiredLevel) {
        // Redirect based on user role
        if (user.role === 'sales_rep') {
          router.push('/dashboard?error=insufficient_permissions');
        } else if (user.role === 'manager') {
          router.push('/manager?error=insufficient_permissions');
        } else {
          router.push('/dashboard?error=insufficient_permissions');
        }
        // Redirect based on user role
        if (user.role === 'sales_rep') {
          router.push('/dashboard?error=insufficient_permissions');
        } else if (user.role === 'manager') {
          router.push('/manager?error=insufficient_permissions');
        } else {
          router.push('/dashboard?error=insufficient_permissions');
        }
        return;
      }
    }

    setIsAuthorized(true);
  }, [user, isLoading, requiredRole, router, redirectTo]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50 dark:bg-neutral-950">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-primary-500"></div>
          <p className="text-neutral-600 dark:text-neutral-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Show nothing while redirecting
  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}
