'use client';

import React, { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  ChartBarIcon,
  UsersIcon,
  BuildingOfficeIcon,
  PhoneIcon,
  EnvelopeIcon,
  PlusIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import LeadDetailsCard from './components/LeadDetailsCard';
import { useLeads } from '@/contexts/LeadContext';
import Pagination from '@/components/Pagination';

interface ILeads {
  items: any;
  pagination:{
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}

function DashboardContent() {
  const { user } = useAuth();
  const { fetchLeads, isLoading, leads, error } = useLeads();
  const [currentPage, setCurrentPage] = useState(1);

  const leadData = leads.items as unknown as ILeads;
  const items = leadData.items || [];
  const pagination = leadData?.pagination;

  const stats = [
    {
      name: 'Total Leads',
      value: pagination?.total.toString(),
      change: '+12%',
      changeType: 'positive' as const,
      icon: UsersIcon,
      color: 'text-blue-600 dark:text-blue-400',
    },
    {
      name: 'Active Opportunities',
      value: '89',
      change: '+8%',
      changeType: 'positive' as const,
      icon: ChartBarIcon,
      color: 'text-green-600 dark:text-green-400',
    },
    {
      name: 'Companies',
      value: '45',
      change: '+3%',
      changeType: 'positive' as const,
      icon: BuildingOfficeIcon,
      color: 'text-purple-600 dark:text-purple-400',
    },
    {
      name: 'Contacts',
      value: '234',
      change: '+15%',
      changeType: 'positive' as const,
      icon: PhoneIcon,
      color: 'text-orange-600 dark:text-orange-400',
    },
  ];

  const recentActivities = [
    {
      id: 1,
      action: 'New lead created',
      target: 'John Smith - ABC Corp',
      time: '2 minutes ago',
      type: 'lead',
      icon: '👤',
    },
    {
      id: 2,
      action: 'Opportunity updated',
      target: 'Q1 Software License - $25,000',
      time: '15 minutes ago',
      type: 'opportunity',
      icon: '📊',
    },
    {
      id: 3,
      action: 'Contact added',
      target: 'Sarah Johnson - XYZ Inc',
      time: '1 hour ago',
      type: 'contact',
      icon: '📞',
    },
    {
      id: 4,
      action: 'Email campaign sent',
      target: 'Monthly Newsletter - 150 recipients',
      time: '2 hours ago',
      type: 'campaign',
      icon: '✉️',
    },
  ];

  useEffect(() => {
    fetchLeads()
  },[])

  useEffect(() => {
    fetchLeads({ page: currentPage });
  }, [currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < pagination?.totalPages) {
      handlePageChange(currentPage + 1);
    }
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(pagination?.totalPages, startPage + maxVisiblePages - 1);

    // Adjust start page if we're near the end
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header Section */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="mb-2 text-3xl font-bold text-neutral-900 dark:text-neutral-100">
            Welcome back, {user?.first_name}!
          </h2>
          <p className="text-lg text-neutral-600 dark:text-neutral-400">
            Here&apos;s what&apos;s happening with your sales pipeline today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => (window.location.href = '/lead/create-lead')}
            leftIcon={<PlusIcon className="h-5 w-5" />}
          >
            Add Lead
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card
            key={index}
            className="transition-shadow duration-200 hover:shadow-lg"
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="mb-1 text-sm font-medium text-neutral-600 dark:text-neutral-400">
                    {stat.name}
                  </p>
                  <div className="flex items-baseline">
                    <p className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                      {stat.value}
                    </p>
                    <p
                      className={`ml-2 text-sm font-medium ${
                        stat.changeType === 'positive'
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}
                    >
                      {stat.change}
                    </p>
                  </div>
                </div>
                <div className={`rounded-full p-3 ${stat.color} bg-opacity-10`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      {/* <div className="grid grid-cols-1"> */}
        {/* Recent Activity */}
        {/* <Card className="transition-shadow duration-200 hover:shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-xl">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 space-y-4">
              {recentActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start space-x-4 rounded-lg p-3 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800"
                >
                  <div className="flex-shrink-0 text-2xl">{activity.icon}</div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                      {activity.action}
                    </p>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      {activity.target}
                    </p>
                    <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card> */}
      {/* </div> */}

      {/* Role-specific content */}
      {user?.role === 'manager' && (
        <div className="mt-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Management Dashboard</CardTitle>
              <Button variant="outline" className="border-none" size="sm">
                Generate Report
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <Button variant="outline" className="h-12 border-none">
                  <ChartBarIcon className="mr-2 h-5 w-5" />
                  Team Performance
                </Button>
                <Button variant="outline" className="h-12 border-none">
                  <UsersIcon className="mr-2 h-5 w-5" />
                  Sales Reports
                </Button>
                <Button variant="outline" className="h-12 border-none">
                  <BuildingOfficeIcon className="mr-2 h-5 w-5" />
                  User Management
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Leads Section */}
      <div className="mt-12">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
              All Leads ({pagination?.total})
            </h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Page {currentPage} of {pagination?.totalPages}
            </p>
          </div>
          <div className="flex gap-3">
            <Button className="border-none px-10">Filter</Button>
            <Button className="border-none px-10">Sort</Button>
          </div>
        </div>

        {/* Leads Grid */}
        {(isLoading && !items.length) ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
          </div>
        ) : (error && items.length === 0) ? (
          <div className="py-8 text-center text-red-500">Error: {error}</div>
        ) : items.length === 0 ? (
          <div className="py-12 text-center">
            <p className="mb-4 text-lg text-neutral-600 dark:text-neutral-400">
              No leads found
            </p>
            <Button
              onClick={() => (window.location.href = '/lead/create-lead')}
              leftIcon={<PlusIcon className="h-5 w-5" />}
            >
              Create Your First Lead
            </Button>
          </div>
        ) : (
          <>
            <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {items.map((lead: any) => (
                <LeadDetailsCard
                  key={lead.id}
                  lead={lead}
                  onDelete={() => {
                    console.log({
                      lead: lead.id,
                    });
                  }}
                />
              ))}
            </div>

            {/* Pagination Controls */}
            <Pagination
              pagination={pagination}
              handlePrevious={handlePrevious}
              currentPage={currentPage}
              handleNext={handleNext}
              getPageNumbers={getPageNumbers}
              handlePageChange={handlePageChange}            
            />
          </>
        )}
      </div>
    </main>
  );
}
