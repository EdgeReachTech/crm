'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { CRMLogo, CRMIcons } from '@/components/ui/CRMLogo';
import { useRegister } from '@/contexts/AuthContext';
import { 
  EyeIcon, 
  EyeSlashIcon, 
  EnvelopeIcon, 
  LockClosedIcon, 
  UserIcon,
  BuildingOfficeIcon 
} from '@heroicons/react/24/outline';

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading, error, clearError } = useRegister();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);

  const validatePassword = (password: string): string[] => {
    const errors: string[] = [];
    if (password.length < 8) errors.push('At least 8 characters');
    if (!/[A-Z]/.test(password)) errors.push('One uppercase letter');
    if (!/[a-z]/.test(password)) errors.push('One lowercase letter');
    if (!/\d/.test(password)) errors.push('One number');
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) errors.push('One special character');
    return errors;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (error) {
      clearError();
    }

    // Validate password in real-time
    if (name === 'password') {
      setPasswordErrors(validatePassword(value));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    // Validate password strength
    const pwdErrors = validatePassword(formData.password);
    if (pwdErrors.length > 0) {
      alert('Please ensure your password meets all requirements');
      return;
    }
    
    try {
      const registerData = {
        email: formData.email,
        password: formData.password,
        first_name: formData.first_name,
        last_name: formData.last_name,
      };

      await register(registerData);
      setSuccess(true);
      
      // Don't redirect immediately since account needs approval
    } catch (err) {
      // Error is handled by the useRegister hook
      console.error('Registration error:', err);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-neutral-950 dark:to-neutral-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent>
            <div className="animate-bounce-in">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-success-500 to-emerald-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
                <CRMIcons.UserSuccess className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                Account Created!
              </h2>
              <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                Your account has been created successfully and is pending approval by an administrator.
              </p>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                You will receive an email notification once your account is approved and you can start using the CRM dashboard.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-neutral-950 dark:to-neutral-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background CRM Pattern */}
      <div className="absolute inset-0 opacity-5 dark:opacity-10">
        <svg className="w-full h-full" fill="none" viewBox="0 0 400 400">
          {/* CRM Dashboard Grid Pattern */}
          <defs>
            <pattern id="crm-pattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
              {/* Dashboard Cards */}
              <rect x="10" y="10" width="35" height="25" rx="3" fill="currentColor" opacity="0.3" />
              <rect x="55" y="10" width="35" height="25" rx="3" fill="currentColor" opacity="0.2" />
              <rect x="10" y="45" width="35" height="25" rx="3" fill="currentColor" opacity="0.4" />
              <rect x="55" y="45" width="35" height="25" rx="3" fill="currentColor" opacity="0.3" />
              
              {/* Connection Lines */}
              <line x1="27.5" y1="35" x2="27.5" y2="45" stroke="currentColor" strokeWidth="1" opacity="0.2" />
              <line x1="72.5" y1="35" x2="72.5" y2="45" stroke="currentColor" strokeWidth="1" opacity="0.2" />
              <line x1="45" y1="22.5" x2="55" y2="22.5" stroke="currentColor" strokeWidth="1" opacity="0.2" />
              <line x1="45" y1="57.5" x2="55" y2="57.5" stroke="currentColor" strokeWidth="1" opacity="0.2" />
              
              {/* Data Points */}
              <circle cx="20" cy="20" r="1.5" fill="currentColor" opacity="0.4" />
              <circle cx="35" cy="20" r="1.5" fill="currentColor" opacity="0.3" />
              <circle cx="65" cy="20" r="1.5" fill="currentColor" opacity="0.5" />
              <circle cx="80" cy="20" r="1.5" fill="currentColor" opacity="0.3" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#crm-pattern)" />
        </svg>
      </div>
      
      <div className="w-full max-w-md relative z-10">
        {/* Logo/Brand */}
        <CRMLogo size="lg" className="mb-8" />
        <p className="text-neutral-500 dark:text-neutral-500 text-sm text-center mb-8">
          Create your account to get started
        </p>

        <Card>
          <CardHeader>
            <CardTitle>Create Account</CardTitle>
            <CardDescription>
              Fill in your details to create your CRM account
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  placeholder="John"
                  leftIcon={<UserIcon />}
                  required
                  disabled={isLoading}
                />

                <Input
                  label="Last Name"
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  placeholder="Doe"
                  leftIcon={<UserIcon />}
                  required
                  disabled={isLoading}
                />
              </div>

              <Input
                label="Email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="john.doe@company.com"
                leftIcon={<EnvelopeIcon />}
                required
                disabled={isLoading}
              />

              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a strong password"
                leftIcon={<LockClosedIcon />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
                  >
                    {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                  </button>
                }
                required
                disabled={isLoading}
              />

              {/* Password requirements */}
              {formData.password && (
                <div className="bg-neutral-50 dark:bg-neutral-900 rounded-lg p-3">
                  <p className="text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Password Requirements:
                  </p>
                  <div className="grid grid-cols-2 gap-1 text-xs">
                    {[
                      'At least 8 characters',
                      'One uppercase letter',
                      'One lowercase letter',
                      'One number',
                      'One special character'
                    ].map((req, idx) => (
                      <div
                        key={idx}
                        className={`flex items-center gap-1 ${
                          passwordErrors.includes(req)
                            ? 'text-error-600 dark:text-error-400'
                            : 'text-success-600 dark:text-success-400'
                        }`}
                      >
                        <span className="text-xs">
                          {passwordErrors.includes(req) ? '○' : '●'}
                        </span>
                        {req}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Input
                label="Confirm Password"
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                leftIcon={<LockClosedIcon />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
                  >
                    {showConfirmPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                  </button>
                }
                error={
                  formData.confirmPassword && formData.password !== formData.confirmPassword
                    ? 'Passwords do not match'
                    : undefined
                }
                required
                disabled={isLoading}
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
                disabled={
                  !formData.email || 
                  !formData.password || 
                  !formData.confirmPassword ||
                  !formData.first_name ||
                  !formData.last_name ||
                  formData.password !== formData.confirmPassword ||
                  passwordErrors.length > 0
                }
              >
                Create Account
              </Button>
            </form>

            <div className="mt-6 text-center">
              <div className="border-t border-neutral-200 dark:border-neutral-700 pt-4">
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Already have an account?{' '}
                  <Link
                    href="/login"
                    className="text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 font-medium transition-colors"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            By creating an account, you agree to our{' '}
            <Link href="/terms" className="text-primary-600 hover:text-primary-500 dark:text-primary-400">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-primary-600 hover:text-primary-500 dark:text-primary-400">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}