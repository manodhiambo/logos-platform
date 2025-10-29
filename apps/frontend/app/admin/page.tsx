'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api-client';

interface Stats {
  totalUsers: number;
  totalCommunities: number;
  totalPosts: number;
  totalPrayers: number;
  activeUsers: number;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, []);

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
        alert('You do not have admin access');
        router.push('/');
      }
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      await apiClient.patch(`/admin/users/${userId}/role`, { role: newRole });
      alert('User role updated successfully');
      fetchAdminData();
    } catch (error) {
      alert('Failed to update user role');
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
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
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">🛡️ Admin Dashboard</h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <StatCard title="Total Users" value={stats?.totalUsers || 0} icon="👥" />
          <StatCard title="Communities" value={stats?.totalCommunities || 0} icon="🏘️" />
          <StatCard title="Posts" value={stats?.totalPosts || 0} icon="📝" />
          <StatCard title="Prayer Requests" value={stats?.totalPrayers || 0} icon="🙏" />
          <StatCard title="Active Users" value={stats?.activeUsers || 0} icon="✨" />
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4">Recent Users</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Name</th>
                  <th className="text-left py-3 px-4">Email</th>
                  <th className="text-left py-3 px-4">Role</th>
                  <th className="text-left py-3 px-4">Joined</th>
                  <th className="text-left py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">{user.name}</td>
                    <td className="py-3 px-4">{user.email}</td>
                    <td className="py-3 px-4">
                      <select
                        value={user.role}
                        onChange={(e) => updateUserRole(user.id, e.target.value)}
                        className="border rounded px-2 py-1"
                      >
                        <option value="user">User</option>
                        <option value="moderator">Moderator</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="py-3 px-4">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => deleteUser(user.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
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

function StatCard({ title, value, icon }: { title: string; value: number; icon: string }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="text-3xl mb-2">{icon}</div>
      <div className="text-3xl font-bold text-blue-600">{value}</div>
      <div className="text-sm text-gray-600">{title}</div>
    </div>
  );
}
