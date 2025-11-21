'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/Card';
import { CRMLogo, CRMIcons } from '@/components/ui/CRMLogo';
import { useLogin } from '@/contexts/AuthContext';
import {
  EyeIcon,
  EyeSlashIcon,
  EnvelopeIcon,
  LockClosedIcon,
} from '@heroicons/react/24/outline';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, error, clearError } = useLogin();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const [pendingApproval, setPendingApproval] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (error) {
      clearError();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const authResult = await login(formData);
      setSuccess(true);

      // Get redirect parameter from URL
      const searchParams = new URLSearchParams(window.location.search);
      let redirectTo = searchParams.get('redirect');

      // If no redirect specified, determine based on user role
      if (!redirectTo) {
        // The login function should return the user data
        // We'll redirect to / and let the root page handle role-based redirects
        redirectTo = '/';
      }

      // Redirect after successful login
      setTimeout(() => {
        router.push(redirectTo!);
      }, 1000);
    } catch (err: any) {
      // Check if it's a pending approval error
      if (err?.code === 'ACCOUNT_PENDING') {
        setPendingApproval(true);
        return;
      }

      // Error is handled by the useLogin hook
      console.error('Login error:', err);
    }
  };

  if (pendingApproval) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 p-4 dark:from-neutral-950 dark:to-neutral-900">
        <Card className="w-full max-w-md text-center">
          <CardContent>
            <div className="animate-bounce-in">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg">
                <CRMIcons.PendingApproval className="h-8 w-8 text-white" />
              </div>
              <h2 className="mb-2 text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                Account Pending Approval
              </h2>
              <p className="mb-4 text-neutral-600 dark:text-neutral-400">
                Your account has been successfully created but is currently
                pending approval by an administrator.
              </p>
              <p className="mb-6 text-sm text-neutral-500 dark:text-neutral-400">
                You will receive an email notification once your account is
                approved and you can access the CRM dashboard.
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => setPendingApproval(false)}
                  className="w-full rounded-lg bg-primary-600 px-4 py-2 text-white transition-colors hover:bg-primary-700"
                >
                  Try Again
                </button>
                <Link
                  href="/register"
                  className="block w-full rounded-lg border border-primary-600 px-4 py-2 text-primary-600 transition-colors hover:bg-primary-50"
                >
                  Create New Account
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 p-4 dark:from-neutral-950 dark:to-neutral-900">
        <Card className="w-full max-w-md text-center">
          <CardContent>
            <div className="animate-bounce-in">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-success-500 to-success-600 shadow-lg">
                {/* Custom Success with CRM Elements */}
                <svg
                  className="h-8 w-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M8 21h8"
                  />
                </svg>
              </div>
              <h2 className="mb-2 text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                Welcome back!
              </h2>
              <p className="text-neutral-600 dark:text-neutral-400">
                Redirecting to your dashboard...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-primary-50 to-secondary-50 p-4 dark:from-neutral-950 dark:to-neutral-900">
      {/* Background CRM Pattern */}
      <div className="absolute inset-0 opacity-5 dark:opacity-10">
        <svg className="h-full w-full" fill="none" viewBox="0 0 400 400">
          {/* CRM Dashboard Grid Pattern */}
          <defs>
            <pattern
              id="crm-pattern"
              x="0"
              y="0"
              width="100"
              height="100"
              patternUnits="userSpaceOnUse"
            >
              {/* Dashboard Cards */}
              <rect
                x="10"
                y="10"
                width="35"
                height="25"
                rx="3"
                fill="currentColor"
                opacity="0.3"
              />
              <rect
                x="55"
                y="10"
                width="35"
                height="25"
                rx="3"
                fill="currentColor"
                opacity="0.2"
              />
              <rect
                x="10"
                y="45"
                width="35"
                height="25"
                rx="3"
                fill="currentColor"
                opacity="0.4"
              />
              <rect
                x="55"
                y="45"
                width="35"
                height="25"
                rx="3"
                fill="currentColor"
                opacity="0.3"
              />

              {/* Connection Lines */}
              <line
                x1="27.5"
                y1="35"
                x2="27.5"
                y2="45"
                stroke="currentColor"
                strokeWidth="1"
                opacity="0.2"
              />
              <line
                x1="72.5"
                y1="35"
                x2="72.5"
                y2="45"
                stroke="currentColor"
                strokeWidth="1"
                opacity="0.2"
              />
              <line
                x1="45"
                y1="22.5"
                x2="55"
                y2="22.5"
                stroke="currentColor"
                strokeWidth="1"
                opacity="0.2"
              />
              <line
                x1="45"
                y1="57.5"
                x2="55"
                y2="57.5"
                stroke="currentColor"
                strokeWidth="1"
                opacity="0.2"
              />

              {/* Data Points */}
              <circle
                cx="20"
                cy="20"
                r="1.5"
                fill="currentColor"
                opacity="0.4"
              />
              <circle
                cx="35"
                cy="20"
                r="1.5"
                fill="currentColor"
                opacity="0.3"
              />
              <circle
                cx="65"
                cy="20"
                r="1.5"
                fill="currentColor"
                opacity="0.5"
              />
              <circle
                cx="80"
                cy="20"
                r="1.5"
                fill="currentColor"
                opacity="0.3"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#crm-pattern)" />
        </svg>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo/Brand */}
        <CRMLogo size="lg" className="mb-8" />
        <p className="mb-8 text-center text-sm text-neutral-500 dark:text-neutral-500">
          Sign in to access your dashboard
        </p>

        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>
              Enter your email and password to access your account
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form
              onSubmit={handleSubmit}
              className="space-y-6"
              autoComplete="on"
            >
              <Input
                label="Email"
                type="email"
                name="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                leftIcon={<EnvelopeIcon />}
                required
                disabled={isLoading}
              />

              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                autoComplete="current-password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                leftIcon={<LockClosedIcon />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-neutral-400 transition-colors hover:text-neutral-600 dark:hover:text-neutral-300"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                }
                required
                disabled={isLoading}
              />

              {error && (
                <div className="animate-slide-down rounded-lg border border-error-200 bg-error-50 p-3 dark:border-error-800 dark:bg-error-950">
                  <p className="text-sm text-error-700 dark:text-error-400">
                    {error}
                  </p>
                </div>
              )}

              <Button
                type="submit"
                fullWidth
                loading={isLoading}
                disabled={!formData.email || !formData.password}
              >
                Sign In
              </Button>
            </form>

            <div className="mt-6 space-y-4 text-center">
              <Link
                href="/forgot-password"
                className="text-sm text-primary-600 transition-colors hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
              >
                Forgot your password?
              </Link>

              <div className="border-t border-neutral-200 pt-4 dark:border-neutral-700">
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Don&apos;t have an account?{' '}
                  <Link
                    href="/register"
                    className="font-medium text-primary-600 transition-colors hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
                  >
                    Sign up
                  </Link>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            By signing in, you agree to our{' '}
            <Link
              href="/terms"
              className="text-primary-600 hover:text-primary-500 dark:text-primary-400"
            >
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link
              href="/privacy"
              className="text-primary-600 hover:text-primary-500 dark:text-primary-400"
            >
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
