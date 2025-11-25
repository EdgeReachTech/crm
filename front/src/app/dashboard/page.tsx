'use client';

import React, { useEffect, useState, useCallback } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  ChartBarIcon,
  UsersIcon,
  BuildingOfficeIcon,
  PhoneIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import LeadDetailsCard from './components/LeadDetailsCard';
import { useLeads } from '@/contexts/LeadContext';
import Pagination from '@/components/Pagination';

interface ILeads {
  items: any;
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

interface FilterState {
  search?: string;
  source?: string;
  status?: string;
  score?: string;
  owner?: string;
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
  const { 
    fetchLeads, 
    isLoading, 
    leads, 
    error, 
    filters: contextFilters,
    setFilters,
    clearFilters,
    leadstatistics,
    statistics
  } = useLeads();
  
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [localFilters, setLocalFilters] = useState<FilterState>({
    search: '',
    source: '',
    status: '',
    score: '',
  });
  const [searchInput, setSearchInput] = useState('');

  const leadData = leads.items as unknown as ILeads;
  const items = leadData?.items || [];
  const pagination = leadData?.pagination;

  const stats = [
    {
      name: "Total Leads",
      value: statistics.totalLeads ?? 0,
      change: statistics.monthOverMonth.leads || "0%",
      changeType: statistics.monthOverMonth.leads.startsWith("-")
        ? "negative"
        : "positive",
      icon: UsersIcon,
      color: "text-blue-600 dark:text-blue-400",
    },
    {
      name: "Active Opportunities",
      value: statistics.activeOpportunities ?? 0,
      change: "",
      changeType: "positive",
      icon: ChartBarIcon,
      color: "text-green-600 dark:text-green-400",
    },
    {
      name: "Companies",
      value: statistics.totalCompanies ?? 0,
      change: "",
      changeType: "positive",
      icon: BuildingOfficeIcon,
      color: "text-purple-600 dark:text-purple-400",
    },
    {
      name: "Contacts",
      value: statistics.totalContacts ?? 0,
      change: "",
      changeType: "positive",
      icon: PhoneIcon,
      color: "text-orange-600 dark:text-orange-400",
    },
  ];


  const filterOptions = {
    sources: ['Website', 'Referral', 'Social Media', 'Cold Call', 'Email Campaign', 'Event'],
    statuses: ['New', 'Contacted', 'Qualified', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'],
    scores: ['High', 'Medium', 'Low'],
    // owners:uniqueName,
  };

  // Initial load
  useEffect(() => {
    fetchLeads({ page: 1 });
    leadstatistics()
  }, []);

  // Fetch leads when page changes
  useEffect(() => {
    const filtersToSend = { ...localFilters };
    
    // Remove empty filters
    Object.keys(filtersToSend).forEach(key => {
      if (filtersToSend[key as keyof FilterState] === '') {
        delete filtersToSend[key as keyof FilterState];
      }
    });

    fetchLeads({ 
      page: currentPage, 
      ...filtersToSend 
    });
    leadstatistics()
  }, [currentPage]);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchInput !== localFilters.search) {
        handleFilterChange('search', searchInput);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchInput]);

  // Sync local filters with context filters on initial load
  useEffect(() => {
    if (contextFilters && Object.keys(contextFilters).length > 0) {
      setLocalFilters(prev => ({
        ...prev,
        ...contextFilters
      }));
      if (contextFilters.search) {
        setSearchInput(contextFilters.search);
      }
    }
  }, []); // Only run once on mount

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
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

  const handleFilterChange = useCallback((key: keyof FilterState, value: string) => {
    setLocalFilters(prev => ({ 
      ...prev, 
      [key]: value 
    }));
    
    // Update context filters for persistence
    const updatedFilters = { ...localFilters, [key]: value };
    const cleanFilters = Object.fromEntries(
      Object.entries(updatedFilters).filter(([_, v]) => v !== '')
    );
    
    setFilters(cleanFilters);
    setCurrentPage(1); // Reset to first page when filters change
    
    // Trigger API call immediately for non-search filters
    // if (key !== 'search') {
      const filtersToSend = { ...updatedFilters };
      Object.keys(filtersToSend).forEach(filterKey => {
        if (filtersToSend[filterKey as keyof FilterState] === '') {
          delete filtersToSend[filterKey as keyof FilterState];
        }
      });
      
      fetchLeads({ 
        page: 1, 
        ...filtersToSend 
      });
      
      leadstatistics();
  }, [localFilters, setFilters, fetchLeads]);

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
  };

  const handleClearFilters = () => {
    setLocalFilters({
      search: '',
      source: '',
      status: '',
      score: '',
    });
    setSearchInput('');
    setCurrentPage(1);
    clearFilters();
    fetchLeads({
      search: '',
      source: '',
      status: '',
      score: '',
    });
  };

  const hasActiveFilters = 
    localFilters.source || 
    localFilters.status || 
    localFilters.score || 
    // localFilters.owner || 
    localFilters.search;

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    if (!pagination?.totalPages) return [];
    
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(pagination.totalPages, startPage + maxVisiblePages - 1);

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
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      {/* Left Section */}
      <div className="text-center md:text-left">
        <h2 className="mb-2 text-2xl md:text-3xl font-bold text-neutral-900 dark:text-neutral-100">
          Welcome back, {user?.first_name}!
        </h2>
        <p className="text-md md:text-lg text-neutral-600 dark:text-neutral-400">
          Here&apos;s what&apos;s happening with your sales pipeline today.
        </p>
      </div>

      {/* Right Section */}
      <div className="flex justify-center md:justify-end">
        <Button
          variant="outline"
          onClick={() => (window.location.href = "/lead/create-lead")}
          leftIcon={<PlusIcon className="h-5 w-5" />}
          className="w-full md:w-auto"
        >
          Add Lead
        </Button>
      </div>
    </div>


      {/* Stats Grid */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 sm:gap-6">
        {stats.map((stat, index) => (
          <Card
            key={index}
            className="transition-all duration-300 hover:shadow-lg hover:scale-[1.02] border-neutral-200 dark:border-neutral-700 bg-gradient-to-br from-white to-neutral-50 dark:from-neutral-800 dark:to-neutral-900 overflow-hidden"
          >
            <CardContent className="p-4 sm:p-6 relative">
              {/* Background accent */}
              <div className={`absolute top-0 right-0 w-16 h-16 ${stat.color} bg-opacity-5 rounded-full -translate-y-8 translate-x-8`}></div>
              
              <div className="flex items-start justify-between relative z-10">
                <div className="flex-1 min-w-0">
                  <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 sm:text-3xl lg:text-2xl xl:text-3xl truncate mb-1">
                    {stat.value}
                  </p>
                  <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400 truncate mb-2">
                    {stat.name}
                  </p>
                  {stat.change && (
                    <div className="flex items-center">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          stat.changeType === 'positive'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}
                      >
                        {stat.changeType === 'positive' ? (
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                        {stat.change}
                      </span>
                    </div>
                  )}
                </div>
                <div className={`rounded-xl p-2 sm:p-3 ${stat.color} bg-opacity-10 flex-shrink-0 ml-3`}>
                  <stat.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

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
              All Leads ({pagination?.total || 0})
            </h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Page {currentPage} of {pagination?.totalPages || 1}
              {hasActiveFilters && ' • Filters applied'}
            </p>
          </div>
          
          {/* Filter Toggle Button for Mobile */}
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            leftIcon={<FunnelIcon className="h-4 w-4" />}
            className="md:hidden"
          >
            Filters
          </Button>
        </div>

        {/* Search and Filter Bar */}
        <div className="mb-6 space-y-4">
          {/* Main Search Bar */}
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <MagnifyingGlassIcon className="h-5 w-5 text-neutral-400" />
            </div>
            <input
              type="text"
              placeholder="Search by name, email, company, or phone..."
              value={searchInput}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full rounded-lg border border-neutral-300 bg-white py-2 pl-10 pr-4 shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-white"
            />
            {searchInput && (
              <button
                onClick={() => handleSearchChange('')}
                className="absolute inset-y-0 right-0 flex items-center pr-3"
              >
                <XMarkIcon className="h-5 w-5 text-neutral-400 hover:text-neutral-600" />
              </button>
            )}
          </div>

          {/* Expandable Filters */}
          <div className={`space-y-4 ${showFilters ? 'block' : 'hidden md:block'}`}>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {/* Filter by Source */}
              <div>
                <label htmlFor="filter-source" className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Source
                </label>
                <select
                  id="filter-source"
                  value={localFilters.source || ''}
                  onChange={(e) => handleFilterChange('source', e.target.value)}
                  className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-white"
                >
                  <option value="">All Sources</option>
                    <option value={"website"}>Website</option>
                    <option value={"linkedin"}>LinkedIn</option>
                    <option value={"referral"}>Referral</option>
                    <option value={"cold_outreach"}>Cold Outreach</option>
                    <option value={"event"}>Event</option>
                    <option value={"partner"}>Partner</option>
                    <option value={"other"}>Other</option>
                </select>
              </div>

              {/* Filter by Status */}
              <div>
                <label htmlFor="filter-status" className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Status
                </label>
                <select
                  id="filter-status"
                  value={localFilters.status || ''}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-white"
                >
                  <option value="">All Status</option>
                    <option value={"new"}>New</option>
                    <option value={"contacted"}>Contacted</option>
                    <option value={"qualified"}>Qualified</option>
                    <option value={"unqualified"}>Unqualified</option>
                </select>
              </div>

              {/* Filter by Score */}
              <div>
                <label htmlFor="filter-score" className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Score
                </label>
                <select
                  id="filter-score"
                  value={localFilters.score || ''}
                  onChange={(e) => handleFilterChange('score', e.target.value)}
                  className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-white"
                >
                  <option value="">All Scores</option>
                  {filterOptions.scores.map((score) => (
                    <option key={score} value={score}>
                      {score}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  onClick={handleClearFilters}
                  leftIcon={<XMarkIcon className="h-4 w-4" />}
                  size="sm"
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Leads Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="py-8 text-center text-red-500">Error: {error}</div>
        ) : items.length === 0 ? (
          <div className="py-12 text-center">
            <p className="mb-4 text-lg text-neutral-600 dark:text-neutral-400">
              {hasActiveFilters ? 'No leads match your filters' : 'No leads found'}
            </p>
            {hasActiveFilters ? (
              <Button
                onClick={handleClearFilters}
                variant="outline"
              >
                Clear Filters
              </Button>
            ) : (
              <Button
                onClick={() => (window.location.href = '/lead/create-lead')}
                leftIcon={<PlusIcon className="h-5 w-5" />}
              >
                Create Your First Lead
              </Button>
            )}
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
            {pagination && pagination.totalPages > 1 && (
              <Pagination
                pagination={pagination}
                handlePrevious={handlePrevious}
                currentPage={currentPage}
                handleNext={handleNext}
                getPageNumbers={getPageNumbers}
                handlePageChange={handlePageChange}            
              />
            )}
          </>
        )}
      </div>
    </main>
  );
}