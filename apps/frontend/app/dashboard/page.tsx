'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Welcome back, {user?.fullName}! 👋
        </h1>
        <p className="text-slate-600">
          Continue your faith journey with LOGOS
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-4 gap-4">
        <Link href="/dashboard/ai-assistant">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="text-lg">🤖 AI Assistant</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">Ask biblical questions</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/prayers">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="text-lg">🙏 Prayers</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">View prayer requests</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/devotionals">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="text-lg">📖 Devotionals</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">Read today's devotional</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/communities">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="text-lg">👥 Communities</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">Join discussions</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your latest interactions on LOGOS</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600 text-center py-8">
            No recent activity yet. Start exploring! 🚀
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
