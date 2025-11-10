"use client";

import React, { useEffect, useState } from 'react';
import { apiClient, type User } from '../../lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  UserGroupIcon,
  Cog6ToothIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  UsersIcon,
  SunIcon,
  MoonIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';

interface AdminStats {
  totalUsers: number;
  pendingUsers: number;
  activeUsers: number;
  inactiveUsers: number;
}

export default function AdminDashboardPage() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [activeUsers, setActiveUsers] = useState<User[]>([]);
  const [inactiveUsers, setInactiveUsers] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [currentTab, setCurrentTab] = useState<'pending' | 'active' | 'inactive' | 'all'>('pending');
  const [roles, setRoles] = useState<Record<string, 'admin' | 'manager' | 'sales_rep' | 'marketer'>>({});
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    pendingUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0
  });

  useEffect(() => {
    fetchAllUserData();
  }, []);

  async function fetchAllUserData() {
    setLoading(true);
    try {
      console.log('🔍 Fetching all user data...');
      
      // Fetch all user categories
      await Promise.all([
        fetchPendingUsers(),
        fetchActiveUsers(),
        fetchInactiveUsers(),
        fetchAllUsers()
      ]);
      
    } catch (err) {
      console.error('❌ Failed to fetch user data:', err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchPendingUsers() {
    try {
      console.log('🔍 Fetching pending users...');
      const res = await apiClient.getPendingUsers();
      console.log('✅ Pending users response:', res);
      
      if (res && res.data) {
        setPendingUsers(res.data);
        setStats(prev => ({ ...prev, pendingUsers: res.data?.length || 0 }));
      }
    } catch (err) {
      console.error('❌ Failed to fetch pending users:', err);
    }
  }

  async function fetchActiveUsers() {
    try {
      console.log('🔍 Fetching active users...');
      const res = await apiClient.getUsersByStatus('active');
      console.log('✅ Active users response:', res);
      
      if (res && res.data) {
        setActiveUsers(res.data);
        setStats(prev => ({ ...prev, activeUsers: res.data?.length || 0 }));
      }
    } catch (err) {
      console.error('❌ Failed to fetch active users:', err);
    }
  }

  async function fetchInactiveUsers() {
    try {
      console.log('🔍 Fetching inactive users...');
      const res = await apiClient.getUsersByStatus('inactive');
      console.log('✅ Inactive users response:', res);
      
      if (res && res.data) {
        setInactiveUsers(res.data);
        setStats(prev => ({ ...prev, inactiveUsers: res.data?.length || 0 }));
      }
    } catch (err) {
      console.error('❌ Failed to fetch inactive users:', err);
    }
  }

  async function fetchAllUsers() {
    try {
      console.log('🔍 Fetching all users...');
      const res = await apiClient.getAllUsers();
      console.log('✅ All users response:', res);
      
      if (res && res.data) {
        setAllUsers(res.data);
        setStats(prev => ({ ...prev, totalUsers: res.data?.length || 0 }));
      }
    } catch (err) {
      console.error('❌ Failed to fetch all users:', err);
    }
  }

  async function handleApprove(userId: string) {
    console.log('🔍 Frontend handleApprove called with userId:', userId);
    const role: 'admin' | 'manager' | 'sales_rep' | 'marketer' = roles[userId] || 'sales_rep';
    console.log('🔍 Selected role:', role);
    setActionLoading(s => ({ ...s, [userId]: true }));
    try {
      console.log('📡 Calling apiClient.approveUser with:', { userId, role });
      const res = await apiClient.approveUser(userId, role);
      console.log('✅ API response:', res);
      if (res && res.status === 'success') {
        // Remove from pending list
        setPendingUsers(u => u.filter(x => x.id !== userId));
        setStats(prev => ({
          ...prev,
          pendingUsers: prev.pendingUsers - 1,
          activeUsers: prev.activeUsers + 1
        }));
        // Show success message
        alert(`User approved successfully as ${role}`);
        // Refresh data to sync all tabs
        await fetchAllUserData();
      }
    } catch (err) {
      console.error('❌ Approval failed', err);
      alert('Approval failed: ' + ((err as any)?.message || 'Unknown error'));
    } finally {
      setActionLoading(s => ({ ...s, [userId]: false }));
    }
  }

  async function handleReject(userId: string) {
    console.log('🔍 Frontend handleReject called with userId:', userId);
    if (!confirm('Are you sure you want to reject this user registration? This will permanently delete their account.')) {
      return;
    }
    
    setActionLoading(s => ({ ...s, [`reject_${userId}`]: true }));
    try {
      console.log('📡 Calling apiClient.rejectUser with:', userId);
      const res = await apiClient.rejectUser(userId);
      console.log('✅ API response:', res);
      if (res && res.status === 'success') {
        // Remove from pending list
        setPendingUsers(u => u.filter(x => x.id !== userId));
        setStats(prev => ({
          ...prev,
          pendingUsers: prev.pendingUsers - 1
        }));
        alert('User registration rejected successfully');
        // Refresh data to sync all tabs
        await fetchAllUserData();
      }
    } catch (err) {
      console.error('❌ Rejection failed', err);
      alert('Rejection failed: ' + ((err as any)?.message || 'Unknown error'));
    } finally {
      setActionLoading(s => ({ ...s, [`reject_${userId}`]: false }));
    }
  }

  async function handleUpdateStatus(userId: string, newStatus: 'active' | 'inactive') {
    console.log('🔍 Frontend handleUpdateStatus called with:', { userId, newStatus });
    
    if (!confirm(`Are you sure you want to change this user's status to ${newStatus}?`)) {
      return;
    }
    
    setActionLoading(s => ({ ...s, [`status_${userId}`]: true }));
    try {
      console.log('📡 Calling apiClient.updateUserStatus with:', { userId, newStatus });
      const res = await apiClient.updateUserStatus(userId, newStatus);
      console.log('✅ API response:', res);
      
      if (res && res.status === 'success') {
        alert(`User status updated to ${newStatus} successfully`);
        // Refresh data to sync all tabs
        await fetchAllUserData();
      }
    } catch (err) {
      console.error('❌ Status update failed', err);
      alert('Status update failed: ' + ((err as any)?.message || 'Unknown error'));
    } finally {
      setActionLoading(s => ({ ...s, [`status_${userId}`]: false }));
    }
  }

  async function handleUpdateRole(userId: string, newRole: 'admin' | 'manager' | 'sales_rep' | 'marketer') {
    console.log('🔍 Frontend handleUpdateRole called with:', { userId, newRole });
    
    if (!confirm(`Are you sure you want to change this user's role to ${newRole}?`)) {
      return;
    }
    
    setActionLoading(s => ({ ...s, [`role_${userId}`]: true }));
    try {
      console.log('📡 Calling apiClient.updateUserRole with:', { userId, newRole });
      const res = await apiClient.updateUserRole(userId, newRole);
      console.log('✅ API response:', res);
      
      if (res && res.status === 'success') {
        alert(`User role updated to ${newRole} successfully`);
        // Refresh data to sync all tabs
        await fetchAllUserData();
      }
    } catch (err) {
      console.error('❌ Role update failed', err);
      alert('Role update failed: ' + ((err as any)?.message || 'Unknown error'));
    } finally {
      setActionLoading(s => ({ ...s, [`role_${userId}`]: false }));
    }
  }

  function renderUserCard(user: User, userType: 'pending' | 'active' | 'inactive' | 'all') {
    const showApprovalActions = userType === 'pending';
    const showStatusActions = userType === 'active' || userType === 'inactive';
    const showRoleEditor = userType === 'active' || userType === 'all';

    return (
      <div key={user.id} className="flex items-center justify-between gap-4 p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center">
              <span className="text-white font-medium">
                {user.first_name?.[0]}{user.last_name?.[0]}
              </span>
            </div>
            <div>
              <div className="font-semibold text-neutral-900 dark:text-neutral-100">
                {user.first_name} {user.last_name}
              </div>
              <div className="text-sm text-neutral-500">{user.email}</div>
              <div className="flex items-center gap-2 text-xs">
                <span className={`px-2 py-1 rounded-full font-medium ${
                  user.status === 'active' ? 'bg-green-100 text-green-800' :
                  user.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {user.status}
                </span>
                <span className={`px-2 py-1 rounded-full font-medium ${
                  user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                  user.role === 'manager' ? 'bg-blue-100 text-blue-800' :
                  user.role === 'marketer' ? 'bg-pink-100 text-pink-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {user.role}
                </span>
                <span className="text-neutral-400">
                  {new Date(user.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Role Editor for Active Users */}
          {showRoleEditor && (
            <select
              value={user.role}
              onChange={(e) => handleUpdateRole(user.id, e.target.value as 'admin' | 'manager' | 'sales_rep' | 'marketer')}
              className="border border-neutral-300 dark:border-neutral-600 rounded-md px-3 py-2 bg-white dark:bg-neutral-800 text-sm"
              disabled={!!actionLoading[`role_${user.id}`]}
            >
              <option value="sales_rep">Sales Rep</option>
              <option value="manager">Manager</option>
              <option value="marketer">Marketer</option>
              <option value="admin">Admin</option>
            </select>
          )}

          {/* Approval Actions for Pending Users */}
          {showApprovalActions && (
            <>
              <select
                value={roles[user.id] || 'sales_rep'}
                onChange={(e) => setRoles(r => ({ ...r, [user.id]: e.target.value as 'admin' | 'manager' | 'sales_rep' | 'marketer' }))}
                className="border border-neutral-300 dark:border-neutral-600 rounded-md px-3 py-2 bg-white dark:bg-neutral-800 text-sm"
              >
                <option value="sales_rep">Sales Rep</option>
                <option value="manager">Manager</option>
                <option value="marketer">Marketer</option>
                <option value="admin">Admin</option>
              </select>

              <Button
                variant="primary"
                size="sm"
                onClick={() => handleApprove(user.id)}
                loading={!!actionLoading[user.id]}
                leftIcon={<CheckCircleIcon className="h-4 w-4" />}
              >
                Approve
              </Button>

              <Button
                variant="danger"
                size="sm"
                onClick={() => handleReject(user.id)}
                loading={!!actionLoading[`reject_${user.id}`]}
                leftIcon={<XCircleIcon className="h-4 w-4" />}
              >
                Reject
              </Button>
            </>
          )}

          {/* Status Actions for Active/Inactive Users */}
          {showStatusActions && (
            <Button
              variant={user.status === 'active' ? 'danger' : 'primary'}
              size="sm"
              onClick={() => handleUpdateStatus(user.id, user.status === 'active' ? 'inactive' : 'active')}
              loading={!!actionLoading[`status_${user.id}`]}
              leftIcon={user.status === 'active' ? <XCircleIcon className="h-4 w-4" /> : <CheckCircleIcon className="h-4 w-4" />}
            >
              {user.status === 'active' ? 'Deactivate' : 'Activate'}
            </Button>
          )}
        </div>
      </div>
    );
  }

  const adminStatsCards = [
    {
      name: 'Total Users',
      value: stats.totalUsers.toString(),
      icon: UsersIcon,
      color: 'bg-blue-500',
    },
    {
      name: 'Pending Approvals',
      value: stats.pendingUsers.toString(),
      icon: ClockIcon,
      color: 'bg-yellow-500',
    },
    {
      name: 'Active Users',
      value: stats.activeUsers.toString(),
      icon: CheckCircleIcon,
      color: 'bg-green-500',
    },
    {
      name: 'Inactive Users',
      value: stats.inactiveUsers.toString(),
      icon: XCircleIcon,
      color: 'bg-red-500',
    },
  ];

  const quickActions = [
    {
      name: 'User Management',
      description: 'Manage user accounts and permissions',
      icon: UserGroupIcon,
      href: '/admin/users',
      color: 'bg-blue-500',
    },
    {
      name: 'System Settings',
      description: 'Configure system-wide settings',
      icon: Cog6ToothIcon,
      href: '/admin/settings',
      color: 'bg-purple-500',
    },
    {
      name: 'Security & Roles',
      description: 'Manage roles and security policies',
      icon: ShieldCheckIcon,
      href: '/admin/security',
      color: 'bg-indigo-500',
    },
    {
      name: 'System Analytics',
      description: 'View system usage and performance',
      icon: ChartBarIcon,
      href: '/admin/analytics',
      color: 'bg-green-500',
    },
  ];

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
        {/* Header */}
        <header className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                  Admin Dashboard
                </h1>
              </div>
              
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleTheme}
                  leftIcon={theme === 'dark' ? <SunIcon className="h-4 w-4" /> : <MoonIcon className="h-4 w-4" />}
                >
                  {theme === 'dark' ? 'Light' : 'Dark'}
                </Button>
                
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                      {user?.first_name} {user?.last_name}
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 capitalize">
                      {user?.role} Administrator
                    </p>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={logout}
                    leftIcon={<ArrowRightOnRectangleIcon className="h-4 w-4" />}
                  >
                    Logout
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
              Welcome back, {user?.first_name}!
            </h2>
            <p className="text-neutral-600 dark:text-neutral-400">
              Manage your CRM system, users, and settings from this central dashboard.
            </p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {adminStatsCards.map((stat) => (
              <Card key={stat.name} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                        {stat.name}
                      </p>
                      <p className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                        {stat.value}
                      </p>
                    </div>
                    <div className={`p-3 rounded-lg ${stat.color}`}>
                      <stat.icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4">
                  {quickActions.map((action) => (
                    <div
                      key={action.name}
                      className="flex items-center p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                    >
                      <div className={`p-2 rounded-lg ${action.color} mr-4`}>
                        <action.icon className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-neutral-900 dark:text-neutral-100">
                          {action.name}
                        </h4>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                          {action.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent System Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent System Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-600 dark:text-neutral-400">New user registration</span>
                    <span className="text-xs text-neutral-500">2 minutes ago</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-600 dark:text-neutral-400">System backup completed</span>
                    <span className="text-xs text-neutral-500">1 hour ago</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-600 dark:text-neutral-400">User role updated</span>
                    <span className="text-xs text-neutral-500">3 hours ago</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-600 dark:text-neutral-400">Security policy updated</span>
                    <span className="text-xs text-neutral-500">Yesterday</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* User Management Section */}
          <Card>
            <CardHeader>
              <CardTitle size="lg">User Management</CardTitle>
              <div className="flex space-x-1 mt-4">
                {[
                  { key: 'pending', label: 'Pending', count: stats.pendingUsers },
                  { key: 'active', label: 'Active', count: stats.activeUsers },
                  { key: 'inactive', label: 'Inactive', count: stats.inactiveUsers },
                  { key: 'all', label: 'All Users', count: stats.totalUsers }
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setCurrentTab(tab.key as typeof currentTab)}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      currentTab === tab.key
                        ? 'bg-primary-500 text-white'
                        : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                    }`}
                  >
                    {tab.label} ({tab.count})
                  </button>
                ))}
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                  <span className="ml-3 text-neutral-600 dark:text-neutral-400">Loading users...</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Render users based on current tab */}
                  {currentTab === 'pending' && (
                    pendingUsers.length === 0 ? (
                      <div className="text-center py-8">
                        <CheckCircleIcon className="h-12 w-12 text-green-500 mx-auto mb-4" />
                        <p className="text-neutral-600 dark:text-neutral-400">No pending user approvals at the moment.</p>
                      </div>
                    ) : (
                      pendingUsers.map(user => renderUserCard(user, 'pending'))
                    )
                  )}

                  {currentTab === 'active' && (
                    activeUsers.length === 0 ? (
                      <div className="text-center py-8">
                        <UsersIcon className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                        <p className="text-neutral-600 dark:text-neutral-400">No active users found.</p>
                      </div>
                    ) : (
                      activeUsers.map(user => renderUserCard(user, 'active'))
                    )
                  )}

                  {currentTab === 'inactive' && (
                    inactiveUsers.length === 0 ? (
                      <div className="text-center py-8">
                        <XCircleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
                        <p className="text-neutral-600 dark:text-neutral-400">No inactive users found.</p>
                      </div>
                    ) : (
                      inactiveUsers.map(user => renderUserCard(user, 'inactive'))
                    )
                  )}

                  {currentTab === 'all' && (
                    allUsers.length === 0 ? (
                      <div className="text-center py-8">
                        <UsersIcon className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                        <p className="text-neutral-600 dark:text-neutral-400">No users found.</p>
                      </div>
                    ) : (
                      allUsers.map(user => renderUserCard(user, 'all'))
                    )
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </ProtectedRoute>
  );
}