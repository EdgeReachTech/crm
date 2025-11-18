'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { EnvelopeIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { apiClient } from '@/lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await apiClient.requestPasswordReset({ email });
      
      if (response.status === 'success') {
        setIsSubmitted(true);
      } else {
        setError(response.message || 'Failed to send reset email. Please try again.');
      }
    } catch (err: any) {
      console.error('Password reset error:', err);
      if (err.code === 'USER_NOT_FOUND') {
        setError('No account found with this email address.');
      } else {
        setError('Failed to send reset email. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-neutral-950 dark:to-neutral-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card>
            <CardContent className="text-center py-8">
              <div className="animate-bounce-in">
                {/* Email sent icon */}
                <div className="mx-auto w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mb-6">
                  <EnvelopeIcon className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                </div>
                
                <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                  Check Your Email
                </h2>
                <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                  We&apos;ve sent password reset instructions to{' '}
                  <span className="font-medium text-neutral-900 dark:text-neutral-100">
                    {email}
                  </span>
                </p>
                
                <div className="space-y-4">
                  <Button
                    variant="outline"
                    fullWidth
                    onClick={() => {
                      setIsSubmitted(false);
                      setEmail('');
                    }}
                  >
                    Try Different Email
                  </Button>
                  
                  <div className="text-center">
                    <Link
                      href="/login"
                      className="inline-flex items-center gap-2 text-sm text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 font-medium transition-colors"
                    >
                      <ArrowLeftIcon className="w-4 h-4" />
                      Back to Sign In
                    </Link>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Help text */}
          <div className="mt-6 text-center">
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Didn&apos;t receive the email? Check your spam folder or{' '}
              <button
                onClick={() => {
                  setIsSubmitted(false);
                  setEmail('');
                }}
                className="text-primary-600 hover:text-primary-500 dark:text-primary-400 font-medium"
              >
                try again
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-neutral-950 dark:to-neutral-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-500 rounded-2xl mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            Reset Password
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-2">
            Enter your email to receive reset instructions
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Forgot Password</CardTitle>
            <CardDescription>
              No worries! Enter your email address and we&apos;ll send you instructions to reset your password.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError('');
                }}
                placeholder="Enter your email address"
                leftIcon={<EnvelopeIcon />}
                required
                disabled={isLoading}
                autoFocus
              />

              {error && (
                <div className="animate-slide-down bg-error-50 dark:bg-error-950 border border-error-200 dark:border-error-800 rounded-lg p-3">
                  <p className="text-sm text-error-700 dark:text-error-400">
                    {error}
                  </p>
                </div>
              )}

              <Button
                type="submit"
                fullWidth
                loading={isLoading}
                disabled={!email}
              >
                Send Reset Instructions
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-sm text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 font-medium transition-colors"
              >
                <ArrowLeftIcon className="w-4 h-4" />
                Back to Sign In
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Help section */}
        <div className="mt-8 bg-neutral-50 dark:bg-neutral-900 rounded-lg p-4">
          <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-2">
            Need Help?
          </h3>
          <div className="space-y-2 text-xs text-neutral-600 dark:text-neutral-400">
            <p>• Make sure you&apos;re using the email address associated with your account</p>
            <p>• Check your spam or junk folder for the reset email</p>
            <p>• The reset link will expire in 24 hours for security</p>
          </div>
          <div className="mt-3 pt-3 border-t border-neutral-200 dark:border-neutral-700">
            <p className="text-xs text-neutral-600 dark:text-neutral-400">
              Still having trouble?{' '}
              <Link 
                href="/support" 
                className="text-primary-600 hover:text-primary-500 dark:text-primary-400 font-medium"
              >
                Contact Support
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}