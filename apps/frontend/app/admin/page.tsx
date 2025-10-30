'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import apiClient from '@/lib/api-client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Stats {
  totalUsers: number;
  totalCommunities: number;
  totalPosts: number;
  totalPrayers: number;
  activeUsers: number;
}

interface User {
  id: string;
  full_name: string;
  email: string;
  username: string;
  role: string;
  created_at: string;
  status: string;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && !['admin', 'super_admin'].includes(user.role)) {
      alert('Access denied. Admin only.');
      router.push('/dashboard');
      return;
    }
    fetchAdminData();
  }, [user]);

  const fetchAdminData = async () => {
    try {
      const [statsRes, usersRes] = await Promise.all([
        apiClient.get('/admin/stats'),
        apiClient.get('/admin/users?page=1&limit=10'),
      ]);
      
      setStats(statsRes.data.data);
      setUsers(usersRes.data.data.users);
    } catch (error: any) {
      console.error('Failed to fetch admin data:', error);
      if (error.response?.status === 403) {
        alert('Access denied');
        router.push('/dashboard');
      }
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    if (!confirm(`Change user role to ${newRole}?`)) return;
    
    try {
      await apiClient.patch(`/admin/users/${userId}/role`, { role: newRole });
      alert('User role updated successfully!');
      fetchAdminData();
    } catch (error) {
      alert('Failed to update user role');
    }
  };

  const updateUserStatus = async (userId: string, newStatus: string) => {
    if (!confirm(`Change user status to ${newStatus}?`)) return;
    
    try {
      await apiClient.patch(`/admin/users/${userId}/status`, { status: newStatus });
      alert('User status updated successfully!');
      fetchAdminData();
    } catch (error) {
      alert('Failed to update user status');
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone!')) return;
    
    try {
      await apiClient.delete(`/admin/users/${userId}`);
      alert('User deleted successfully');
      fetchAdminData();
    } catch (error) {
      alert('Failed to delete user');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading admin dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 md:mb-8">
          <h1 className="text-3xl md:text-4xl font-bold">🛡️ Admin Dashboard</h1>
          <p className="text-sm md:text-base text-gray-600 mt-2">
            Welcome back, {user?.fullName} • Role: {user?.role}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-6 mb-6 md:mb-8">
          <StatCard title="Total Users" value={stats?.totalUsers || 0} icon="👥" color="blue" />
          <StatCard title="Communities" value={stats?.totalCommunities || 0} icon="🏘️" color="green" />
          <StatCard title="Posts" value={stats?.totalPosts || 0} icon="📝" color="purple" />
          <StatCard title="Prayers" value={stats?.totalPrayers || 0} icon="🙏" color="pink" />
          <StatCard title="Active Users" value={stats?.activeUsers || 0} icon="✨" color="yellow" />
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-md p-4 md:p-6 overflow-x-auto">
          <h2 className="text-xl md:text-2xl font-bold mb-4">Recent Users</h2>
          <div className="min-w-full">
            <table className="w-full text-sm md:text-base">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-2 md:px-4">Name</th>
                  <th className="text-left py-3 px-2 md:px-4 hidden sm:table-cell">Email</th>
                  <th className="text-left py-3 px-2 md:px-4">Role</th>
                  <th className="text-left py-3 px-2 md:px-4 hidden md:table-cell">Status</th>
                  <th className="text-left py-3 px-2 md:px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-2 md:px-4">
                      <div>
                        <div className="font-semibold">{user.full_name}</div>
                        <div className="text-xs text-gray-500 sm:hidden">{user.email}</div>
                      </div>
                    </td>
                    <td className="py-3 px-2 md:px-4 hidden sm:table-cell text-sm">{user.email}</td>
                    <td className="py-3 px-2 md:px-4">
                      <select
                        value={user.role}
                        onChange={(e) => updateUserRole(user.id, e.target.value)}
                        className="border rounded px-2 py-1 text-xs md:text-sm"
                      >
                        <option value="user">User</option>
                        <option value="moderator">Moderator</option>
                        <option value="admin">Admin</option>
                        <option value="super_admin">Super Admin</option>
                      </select>
                    </td>
                    <td className="py-3 px-2 md:px-4 hidden md:table-cell">
                      <select
                        value={user.status}
                        onChange={(e) => updateUserStatus(user.id, e.target.value)}
                        className="border rounded px-2 py-1 text-sm"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="suspended">Suspended</option>
                        <option value="banned">Banned</option>
                      </select>
                    </td>
                    <td className="py-3 px-2 md:px-4">
                      <Button
                        onClick={() => deleteUser(user.id)}
                        variant="destructive"
                        size="sm"
                        className="text-xs"
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }: { title: string; value: number; icon: string; color: string }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    pink: 'bg-pink-50 text-pink-600',
    yellow: 'bg-yellow-50 text-yellow-600',
  };

  return (
    <Card className={`p-4 md:p-6 ${colors[color as keyof typeof colors]}`}>
      <div className="text-2xl md:text-3xl mb-2">{icon}</div>
      <div className="text-2xl md:text-3xl font-bold">{value}</div>
      <div className="text-xs md:text-sm opacity-80">{title}</div>
    </Card>
  );
}
