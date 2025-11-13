'use client';

import React from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  UserCircleIcon,
  ChartBarIcon,
  UsersIcon,
  BuildingOfficeIcon,
  PhoneIcon,
  EnvelopeIcon,
  SunIcon,
  MoonIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}

function DashboardContent() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const stats = [
    {
      name: 'Total Leads',
      value: '127',
      change: '+12%',
      changeType: 'positive' as const,
      icon: UsersIcon,
    },
    {
      name: 'Active Opportunities',
      value: '89',
      change: '+8%',
      changeType: 'positive' as const,
      icon: ChartBarIcon,
    },
    {
      name: 'Companies',
      value: '45',
      change: '+3%',
      changeType: 'positive' as const,
      icon: BuildingOfficeIcon,
    },
    {
      name: 'Contacts',
      value: '234',
      change: '+15%',
      changeType: 'positive' as const,
      icon: PhoneIcon,
    },
  ];

  const recentActivities = [
    {
      id: 1,
      action: 'New lead created',
      target: 'John Smith - ABC Corp',
      time: '2 minutes ago',
      type: 'lead',
    },
    {
      id: 2,
      action: 'Opportunity updated',
      target: 'Q1 Software License - $25,000',
      time: '15 minutes ago',
      type: 'opportunity',
    },
    {
      id: 3,
      action: 'Contact added',
      target: 'Sarah Johnson - XYZ Inc',
      time: '1 hour ago',
      type: 'contact',
    },
    {
      id: 4,
      action: 'Email campaign sent',
      target: 'Monthly Newsletter - 150 recipients',
      time: '2 hours ago',
      type: 'campaign',
    },
  ];

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      {/* Header */}
      <header className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                  CRM Dashboard
                </h1>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Manager Dashboard Link */}
              {user?.role === 'manager' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.location.href = '/manager'}
                  leftIcon={<Cog6ToothIcon className="w-4 h-4" />}
                >
                  Manager Dashboard
                </Button>
              )}
              
              {/* Theme toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="p-2"
              >
                {theme === 'dark' ? (
                  <SunIcon className="w-5 h-5" />
                ) : (
                  <MoonIcon className="w-5 h-5" />
                )}
              </Button>

              {/* User menu */}
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    {user?.first_name} {user?.last_name}
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 capitalize">
                    {user?.role?.replace('_', ' ')}
                  </p>
                </div>
                <UserCircleIcon className="w-8 h-8 text-neutral-400" />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={logout}
                >
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
            Welcome back, {user?.first_name}!
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400">
            Here's what's happening with your sales pipeline today.
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <stat.icon className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400 truncate">
                      {stat.name}
                    </p>
                    <div className="flex items-baseline">
                      <p className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
                        {stat.value}
                      </p>
                      <p className={`ml-2 text-sm font-medium ${
                        stat.changeType === 'positive' 
                          ? 'text-success-600 dark:text-success-400' 
                          : 'text-error-600 dark:text-error-400'
                      }`}>
                        {stat.change}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-2 h-2 bg-primary-500 rounded-full mt-2"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                        {activity.action}
                      </p>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        {activity.target}
                      </p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6">
                <Button variant="outline" fullWidth>
                  View All Activity
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <Button className="h-20 flex-col">
                  <UsersIcon className="w-6 h-6 mb-2" />
                  Add Lead
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <BuildingOfficeIcon className="w-6 h-6 mb-2" />
                  New Company
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <PhoneIcon className="w-6 h-6 mb-2" />
                  Add Contact
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <EnvelopeIcon className="w-6 h-6 mb-2" />
                  Send Email
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Role-specific content */}
        {user?.role === 'manager' && (
          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle>Management Dashboard</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button variant="outline">
                    Team Performance
                  </Button>
                  <Button variant="outline">
                    Sales Reports
                  </Button>
                  <Button variant="outline">
                    User Management
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}