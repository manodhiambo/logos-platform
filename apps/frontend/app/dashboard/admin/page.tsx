'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { adminService, SystemStats } from '@/lib/services/admin.service';

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is admin
    if (user && !['admin', 'super_admin'].includes(user.role)) {
      router.push('/dashboard');
      return;
    }
    loadStats();
  }, [user]);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await adminService.getSystemStats();
      setStats(data.stats);
    } catch (error: any) {
      console.error('Failed to load stats:', error);
      if (error.response?.status === 403) {
        alert('You do not have permission to access the admin panel');
        router.push('/dashboard');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading admin panel...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
          <p className="text-slate-600 mt-2">Manage your LOGOS platform</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/dashboard/admin/users">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-5xl mb-3">👥</div>
                  <h3 className="font-semibold text-lg">User Management</h3>
                  <p className="text-sm text-slate-600 mt-1">Manage users and roles</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/admin/announcements">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-5xl mb-3">📢</div>
                  <h3 className="font-semibold text-lg">Announcements</h3>
                  <p className="text-sm text-slate-600 mt-1">Create and manage announcements</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-5xl mb-3">📊</div>
                <h3 className="font-semibold text-lg">Analytics</h3>
                <p className="text-sm text-slate-600 mt-1">View platform statistics</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Statistics */}
        {stats && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Platform Overview</CardTitle>
                <CardDescription>Key metrics and statistics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <StatCard
                    icon="👥"
                    label="Total Users"
                    value={stats.totalUsers.toLocaleString()}
                    color="blue"
                  />
                  <StatCard
                    icon="✅"
                    label="Active Users"
                    value={stats.activeUsers.toLocaleString()}
                    color="green"
                  />
                  <StatCard
                    icon="👨‍👩‍👧‍👦"
                    label="Communities"
                    value={stats.totalCommunities.toLocaleString()}
                    color="purple"
                  />
                  <StatCard
                    icon="📝"
                    label="Posts"
                    value={stats.totalPosts.toLocaleString()}
                    color="orange"
                  />
                  <StatCard
                    icon="🙏"
                    label="Prayer Requests"
                    value={stats.totalPrayers.toLocaleString()}
                    color="pink"
                  />
                  <StatCard
                    icon="📖"
                    label="Devotionals"
                    value={stats.totalDevotionals.toLocaleString()}
                    color="indigo"
                  />
                  <StatCard
                    icon="🆕"
                    label="New This Month"
                    value={stats.newUsersThisMonth.toLocaleString()}
                    color="cyan"
                  />
                  <StatCard
                    icon="🔥"
                    label="Active This Week"
                    value={stats.activeUsersThisWeek.toLocaleString()}
                    color="red"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest platform activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-slate-500">
                  <p>Activity feed coming soon...</p>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

interface StatCardProps {
  icon: string;
  label: string;
  value: string;
  color: string;
}

function StatCard({ icon, label, value, color }: StatCardProps) {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
    orange: 'bg-orange-50 text-orange-600 border-orange-200',
    pink: 'bg-pink-50 text-pink-600 border-pink-200',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-200',
    cyan: 'bg-cyan-50 text-cyan-600 border-cyan-200',
    red: 'bg-red-50 text-red-600 border-red-200',
  };

  return (
    <div className={`p-4 rounded-lg border ${colorClasses[color] || colorClasses.blue}`}>
      <div className="text-3xl mb-2">{icon}</div>
      <p className="text-sm font-medium opacity-80">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
}
