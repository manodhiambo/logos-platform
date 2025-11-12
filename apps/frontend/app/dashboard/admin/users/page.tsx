'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { adminService, AdminUser } from '@/lib/services/admin.service';

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadUsers();
  }, [roleFilter, statusFilter]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (roleFilter !== 'all') params.role = roleFilter;
      if (statusFilter !== 'all') params.status = statusFilter;

      const data = await adminService.getAllUsers(params);
      setUsers(data.data || []);
    } catch (error: any) {
      console.error('Failed to load users:', error);
      if (error.response?.status === 403) {
        alert('You do not have permission to access user management');
        router.push('/dashboard');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async (userId: string, newRole: string) => {
    try {
      await adminService.updateUserRole(userId, newRole);
      await loadUsers();
      alert('User role updated successfully');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to update user role');
    }
  };

  const handleUpdateStatus = async (userId: string, newStatus: string) => {
    try {
      await adminService.updateUserStatus(userId, newStatus);
      await loadUsers();
      alert('User status updated successfully');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to update user status');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.'))
      return;

    try {
      await adminService.deleteUser(userId);
      await loadUsers();
      alert('User deleted successfully');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to delete user');
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Button variant="outline" onClick={() => router.back()}>
              ← Back to Admin
            </Button>
            <h1 className="text-3xl font-bold text-slate-900 mt-4">User Management</h1>
            <p className="text-slate-600 mt-2">Manage platform users and permissions</p>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">All Roles</option>
                <option value="user">User</option>
                <option value="moderator">Moderator</option>
                <option value="admin">Admin</option>
                <option value="super_admin">Super Admin</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
                <option value="banned">Banned</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>Users ({filteredUsers.length})</CardTitle>
            <CardDescription>All registered users on the platform</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-slate-600">Loading users...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-12 text-slate-500">No users found</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="text-left p-3 text-sm font-semibold text-slate-600">User</th>
                      <th className="text-left p-3 text-sm font-semibold text-slate-600">Role</th>
                      <th className="text-left p-3 text-sm font-semibold text-slate-600">Status</th>
                      <th className="text-left p-3 text-sm font-semibold text-slate-600">
                        Joined
                      </th>
                      <th className="text-left p-3 text-sm font-semibold text-slate-600">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <UserRow
                        key={user.id}
                        user={user}
                        onUpdateRole={handleUpdateRole}
                        onUpdateStatus={handleUpdateStatus}
                        onDelete={handleDeleteUser}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

interface UserRowProps {
  user: AdminUser;
  onUpdateRole: (userId: string, role: string) => void;
  onUpdateStatus: (userId: string, status: string) => void;
  onDelete: (userId: string) => void;
}

function UserRow({ user, onUpdateRole, onUpdateStatus, onDelete }: UserRowProps) {
  const [showActions, setShowActions] = useState(false);

  const roleColors: Record<string, string> = {
    super_admin: 'bg-purple-100 text-purple-800',
    admin: 'bg-blue-100 text-blue-800',
    moderator: 'bg-green-100 text-green-800',
    user: 'bg-slate-100 text-slate-800',
  };

  const statusColors: Record<string, string> = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-slate-100 text-slate-600',
    suspended: 'bg-yellow-100 text-yellow-800',
    banned: 'bg-red-100 text-red-800',
  };

  return (
    <tr className="border-b border-slate-100 hover:bg-slate-50">
      <td className="p-3">
        <div>
          <p className="font-medium text-slate-900">{user.fullName}</p>
          <p className="text-sm text-slate-500">@{user.username}</p>
          <p className="text-xs text-slate-400">{user.email}</p>
        </div>
      </td>
      <td className="p-3">
        <span className={`text-xs px-2 py-1 rounded ${roleColors[user.role] || roleColors.user}`}>
          {user.role.replace('_', ' ')}
        </span>
      </td>
      <td className="p-3">
        <span
          className={`text-xs px-2 py-1 rounded ${statusColors[user.status] || statusColors.active}`}
        >
          {user.status}
        </span>
      </td>
      <td className="p-3 text-sm text-slate-600">
        {new Date(user.createdAt).toLocaleDateString()}
      </td>
      <td className="p-3">
        <div className="relative">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowActions(!showActions)}
          >
            ⚙️
          </Button>
          {showActions && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 z-10">
              <button
                onClick={() => {
                  const newRole = prompt('Enter new role (user, moderator, admin, super_admin):');
                  if (newRole) onUpdateRole(user.id, newRole);
                  setShowActions(false);
                }}
                className="block w-full text-left px-4 py-2 text-sm hover:bg-slate-50"
              >
                Change Role
              </button>
              <button
                onClick={() => {
                  const newStatus = prompt(
                    'Enter new status (active, inactive, suspended, banned):'
                  );
                  if (newStatus) onUpdateStatus(user.id, newStatus);
                  setShowActions(false);
                }}
                className="block w-full text-left px-4 py-2 text-sm hover:bg-slate-50"
              >
                Change Status
              </button>
              <button
                onClick={() => {
                  onDelete(user.id);
                  setShowActions(false);
                }}
                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                Delete User
              </button>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
}
