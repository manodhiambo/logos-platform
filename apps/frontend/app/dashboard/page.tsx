'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Welcome back, {user?.fullName}! 🙏
          </h1>
          <p className="text-slate-600 mt-2">
            Here's what's happening in your spiritual journey today
          </p>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Prayer Requests"
            value="0"
            icon="🙏"
            description="Active requests"
            href="/dashboard/prayers"
          />
          <StatCard
            title="Communities"
            value="0"
            icon="👥"
            description="Joined communities"
            href="/dashboard/communities"
          />
          <StatCard
            title="Devotionals"
            value="0"
            icon="📖"
            description="Completed this week"
            href="/dashboard/devotionals"
          />
          <StatCard
            title="Posts"
            value="0"
            icon="📝"
            description="Your posts"
            href="/dashboard/posts"
          />
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Get started with these common actions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link href="/dashboard/ai-assistant">
                <Button variant="outline" className="w-full h-24 flex flex-col gap-2">
                  <span className="text-3xl">🤖</span>
                  <span>Chat with AI</span>
                </Button>
              </Link>
              <Link href="/dashboard/prayers/new">
                <Button variant="outline" className="w-full h-24 flex flex-col gap-2">
                  <span className="text-3xl">🙏</span>
                  <span>New Prayer</span>
                </Button>
              </Link>
              <Link href="/dashboard/posts/new">
                <Button variant="outline" className="w-full h-24 flex flex-col gap-2">
                  <span className="text-3xl">📝</span>
                  <span>Create Post</span>
                </Button>
              </Link>
              <Link href="/dashboard/bible">
                <Button variant="outline" className="w-full h-24 flex flex-col gap-2">
                  <span className="text-3xl">📕</span>
                  <span>Read Bible</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Today's Devotional Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Today's Devotional</CardTitle>
            <CardDescription>Daily spiritual nourishment</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <p className="text-slate-500 mb-4">
                No devotional available yet
              </p>
              <Link href="/dashboard/devotionals">
                <Button>Browse Devotionals</Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest interactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-slate-500">
              No recent activity
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  icon: string;
  description: string;
  href: string;
}

function StatCard({ title, value, icon, description, href }: StatCardProps) {
  return (
    <Link href={href}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">{title}</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">{value}</p>
              <p className="text-xs text-slate-500 mt-1">{description}</p>
            </div>
            <div className="text-4xl">{icon}</div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
