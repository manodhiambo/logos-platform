'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import AnnouncementBanner from '@/components/announcements/AnnouncementBanner';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, loading, logout, isAuthenticated } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const isAdmin = user && ['admin', 'super_admin'].includes(user.role || '');

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Navigation Bar - Sticky */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Menu Toggle */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-md hover:bg-slate-100 transition-colors"
                aria-label="Toggle sidebar"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <Link href="/dashboard" className="flex items-center gap-2">
                <span className="text-2xl">✝️</span>
                <span className="text-xl font-bold text-primary hidden sm:block">LOGOS</span>
              </Link>
            </div>

            {/* Center - Quick Links (hidden on mobile) */}
            <div className="hidden lg:flex items-center gap-1">
              <Link href="/dashboard/messages">
                <Button variant="ghost" size="sm" className="relative">
                  💬 Messages
                  {unreadCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 bg-red-500 text-white px-1.5 py-0.5 text-xs">
                      {unreadCount}
                    </Badge>
                  )}
                </Button>
              </Link>
              <Link href="/dashboard/notifications">
                <Button variant="ghost" size="sm">
                  🔔 Notifications
                </Button>
              </Link>
              <Link href="/dashboard/prayers">
                <Button variant="ghost" size="sm">
                  🙏 Prayers
                </Button>
              </Link>
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-600 hidden md:block">
                {user?.fullName}
              </span>
              <Link href="/dashboard/profile">
                <Avatar className="w-9 h-9 cursor-pointer hover:ring-2 ring-primary transition-all">
                  <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center font-semibold">
                    {user?.avatarUrl ? (
                      <img src={user.avatarUrl} alt={user.fullName} className="w-full h-full object-cover" />
                    ) : (
                      user?.fullName?.charAt(0).toUpperCase()
                    )}
                  </div>
                </Avatar>
              </Link>
              {isAdmin && (
                <Link href="/dashboard/admin">
                  <Button variant="outline" size="sm" className="hidden sm:flex">
                    🛡️ Admin
                  </Button>
                </Link>
              )}
              <Button variant="outline" size="sm" onClick={logout} className="hidden sm:flex">
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 transition-transform duration-300 ease-in-out mt-0 overflow-y-auto`}
          style={{ top: '64px', height: 'calc(100vh - 64px)' }}
        >
          <nav className="p-4 space-y-2">
            <NavLink href="/dashboard" icon="🏠">
              Dashboard
            </NavLink>
            <NavLink href="/dashboard/profile" icon="👤">
              My Profile
            </NavLink>
            <NavLink href="/dashboard/messages" icon="💬">
              Messages
              {unreadCount > 0 && (
                <Badge className="ml-auto bg-red-500 text-white">{unreadCount}</Badge>
              )}
            </NavLink>
            <NavLink href="/dashboard/ai-assistant" icon="🤖">
              AI Assistant
            </NavLink>

            <div className="border-t border-slate-200 my-2 pt-2">
              <p className="text-xs font-semibold text-slate-500 uppercase px-4 mb-2">
                🤝 Social
              </p>
            </div>

            <NavLink href="/dashboard/friends" icon="👥">
              Friends
            </NavLink>
            <NavLink href="/dashboard/friends/requests" icon="📨">
              Friend Requests
            </NavLink>
            <NavLink href="/dashboard/friends/find" icon="🔍">
              Find Friends
            </NavLink>
            <NavLink href="/dashboard/followers" icon="👁️">
              Followers
            </NavLink>
            <NavLink href="/dashboard/following" icon="➕">
              Following
            </NavLink>

            <div className="border-t border-slate-200 my-2 pt-2">
              <p className="text-xs font-semibold text-slate-500 uppercase px-4 mb-2">
                Community
              </p>
            </div>

            <NavLink href="/dashboard/communities" icon="🏘️">
              Communities
            </NavLink>
            <NavLink href="/dashboard/posts" icon="📝">
              Posts
            </NavLink>

            <div className="border-t border-slate-200 my-2 pt-2">
              <p className="text-xs font-semibold text-slate-500 uppercase px-4 mb-2">
                Spiritual
              </p>
            </div>

            <NavLink href="/dashboard/prayers" icon="🙏">
              Prayer Requests
            </NavLink>
            <NavLink href="/dashboard/devotionals" icon="📖">
              Devotionals
            </NavLink>
            <NavLink href="/dashboard/bible" icon="📕">
              Bible
            </NavLink>

            <div className="border-t border-slate-200 my-2 pt-2">
              <p className="text-xs font-semibold text-slate-500 uppercase px-4 mb-2">
                Media
              </p>
            </div>

            <NavLink href="/dashboard/video-calls" icon="🎥">
              Video Calls
            </NavLink>
            <NavLink href="/dashboard/notifications" icon="🔔">
              Notifications
            </NavLink>

            {isAdmin && (
              <>
                <div className="border-t border-slate-200 my-2 pt-2">
                  <p className="text-xs font-semibold text-slate-500 uppercase px-4 mb-2">
                    🛡️ Admin
                  </p>
                </div>
                <NavLink href="/dashboard/admin" icon="📊">
                  Admin Dashboard
                </NavLink>
                <NavLink href="/dashboard/admin/users" icon="👥">
                  User Management
                </NavLink>
                <NavLink href="/dashboard/admin/announcements" icon="📢">
                  Announcements
                </NavLink>
              </>
            )}

            <div className="border-t border-slate-200 my-2 pt-2 lg:hidden">
              <Button variant="outline" size="sm" onClick={logout} className="w-full">
                Logout
              </Button>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-h-screen lg:ml-0" style={{ marginTop: '0' }}>
          <div className="p-4 sm:p-6 lg:p-8">
            {/* Admin Announcements Banner */}
            <AnnouncementBanner />
            
            {children}
          </div>
        </main>
      </div>

      {/* Overlay for mobile when sidebar is open */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          style={{ top: '64px' }}
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}

interface NavLinkProps {
  href: string;
  icon: string;
  children: React.ReactNode;
}

function NavLink({ href, icon, children }: NavLinkProps) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-100 transition-colors text-slate-700 hover:text-primary group"
    >
      <span className="text-xl group-hover:scale-110 transition-transform">{icon}</span>
      <span className="font-medium flex-1">{children}</span>
    </Link>
  );
}
