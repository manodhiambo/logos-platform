'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Home, Users, MessageCircle, Bell, Search, User, Video,
  Heart, BookOpen, LogOut, Shield, BookMarked, Menu,
  Sparkles, Radio, Globe, Hash, PlusCircle,
} from 'lucide-react';
import AnnouncementBanner from '@/components/announcements/AnnouncementBanner';
import apiClient from '@/lib/api-client';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, loading, logout, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      apiClient.get('/messages/unread-count')
        .then(r => setUnreadCount(r.data?.data?.count || 0))
        .catch(() => {});
    }
  }, [isAuthenticated]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F0F2F5]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-3 text-gray-500 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const isAdmin = user && ['admin', 'super_admin'].includes(user.role || '');
  const avatarInitial = (user?.fullName?.[0] || user?.username?.[0] || 'U').toUpperCase();

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === '/dashboard' : pathname?.startsWith(href);

  const centerTabs = [
    { href: '/dashboard', icon: Home, label: 'Home' },
    { href: '/dashboard/friends', icon: Users, label: 'Friends' },
    { href: '/dashboard/posts', icon: Hash, label: 'Feed' },
    { href: '/dashboard/prayers', icon: Heart, label: 'Prayer' },
    { href: '/dashboard/video-calls', icon: Video, label: 'Watch' },
  ];

  const sideNavItems = [
    { href: '/dashboard/friends', icon: Users, label: 'Friends' },
    { href: '/dashboard/communities', icon: Globe, label: 'Communities' },
    { href: '/dashboard/messages', icon: MessageCircle, label: 'Messages', badge: unreadCount },
    { href: '/dashboard/status', icon: Radio, label: 'Status' },
    { href: '/dashboard/video-calls', icon: Video, label: 'Video Calls' },
    { href: '/dashboard/devotionals', icon: BookOpen, label: 'Devotionals' },
    { href: '/dashboard/bible', icon: BookMarked, label: 'Bible' },
    { href: '/dashboard/prayers', icon: Heart, label: 'Prayer Requests' },
    { href: '/dashboard/ai-assistant', icon: Sparkles, label: 'AI Assistant' },
    { href: '/dashboard/notifications', icon: Bell, label: 'Notifications' },
  ];

  const AvatarEl = ({ size = 9 }: { size?: number }) => (
    <div className={`w-${size} h-${size} rounded-full overflow-hidden shrink-0 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm`}>
      {user?.avatarUrl
        ? <img src={user.avatarUrl} alt={user.fullName} className="w-full h-full object-cover" />
        : avatarInitial}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F0F2F5]">

      {/* ── TOP NAVBAR ── */}
      <header className="fixed top-0 inset-x-0 h-14 bg-white shadow-md z-50 flex items-center px-2 gap-2">

        {/* Left: Logo + Search */}
        <div className="flex items-center gap-2 w-[60px] lg:w-[280px] shrink-0">
          <Link href="/dashboard" className="shrink-0">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-black text-xl select-none">
              L
            </div>
          </Link>
          <div className="relative hidden lg:block flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            <input
              type="text"
              placeholder="Search LOGOS..."
              className="w-full bg-gray-100 hover:bg-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-500 rounded-full py-2 pl-9 pr-3 text-sm outline-none transition"
            />
          </div>
        </div>

        {/* Center: Tab icons */}
        <div className="flex-1 hidden md:flex items-end justify-center gap-0 h-full">
          {centerTabs.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              title={label}
              className={`relative flex items-center justify-center w-24 h-full transition group ${
                isActive(href)
                  ? 'text-blue-600 border-b-[3px] border-blue-600'
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              <Icon className="w-6 h-6" />
              {/* tooltip */}
              <span className="absolute bottom-full mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap">
                {label}
              </span>
            </Link>
          ))}
        </div>

        {/* Right: Icon buttons + Avatar */}
        <div className="flex items-center gap-1.5 ml-auto">
          <Link
            href="/dashboard/messages"
            className="relative w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition"
            title="Messages"
          >
            <MessageCircle className="w-5 h-5 text-gray-800" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-0.5">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </Link>

          <Link
            href="/dashboard/notifications"
            className="relative w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition"
            title="Notifications"
          >
            <Bell className="w-5 h-5 text-gray-800" />
          </Link>

          <Link href="/dashboard/profile" className="rounded-full ring-2 ring-transparent hover:ring-blue-400 transition">
            <AvatarEl size={10} />
          </Link>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(v => !v)}
            className="md:hidden w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* ── BODY ── */}
      <div className="pt-14 flex min-h-screen">

        {/* ── LEFT SIDEBAR ── */}
        <aside className="hidden lg:flex flex-col w-[280px] shrink-0 fixed top-14 left-0 h-[calc(100vh-56px)] overflow-y-auto">
          <div className="flex flex-col h-full p-2">

            {/* Profile link */}
            <Link
              href="/dashboard/profile"
              className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-200 transition mb-1"
            >
              <AvatarEl size={9} />
              <span className="font-semibold text-[15px] text-gray-900 leading-tight">
                {user?.fullName}
              </span>
            </Link>

            {/* Nav items */}
            {sideNavItems.map(item => (
              <SideNavItem key={item.href} {...item} active={isActive(item.href)} />
            ))}

            {isAdmin && (
              <SideNavItem href="/dashboard/admin" icon={Shield} label="Admin Panel" active={isActive('/dashboard/admin')} />
            )}

            <div className="border-t border-gray-200 my-2" />

            <button
              onClick={logout}
              className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-200 transition text-gray-700 w-full"
            >
              <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                <LogOut className="w-5 h-5 text-gray-600" />
              </div>
              <span className="font-semibold text-[15px]">Log Out</span>
            </button>

            <div className="mt-auto pt-4 px-2">
              <p className="text-[11px] text-gray-400 leading-relaxed">
                Privacy · Terms · Cookies<br />© 2025 LOGOS Platform
              </p>
            </div>
          </div>
        </aside>

        {/* ── MAIN CONTENT ── */}
        <main className="flex-1 lg:ml-[280px] min-w-0 pb-16 lg:pb-0">
          <AnnouncementBanner />
          {children}
        </main>
      </div>

      {/* ── MOBILE BOTTOM NAV ── */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 h-14 bg-white border-t border-gray-200 z-40 flex items-center justify-around">
        {[
          { href: '/dashboard', icon: Home },
          { href: '/dashboard/friends', icon: Users },
          { href: '/dashboard/posts', icon: PlusCircle },
          { href: '/dashboard/messages', icon: MessageCircle, badge: unreadCount },
          { href: '/dashboard/profile', icon: User },
        ].map(({ href, icon: Icon, badge }) => (
          <Link
            key={href}
            href={href}
            className={`relative flex items-center justify-center w-14 h-14 ${
              isActive(href) ? 'text-blue-600' : 'text-gray-500'
            }`}
          >
            <Icon className="w-6 h-6" />
            {badge && badge > 0 ? (
              <span className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[15px] h-[15px] flex items-center justify-center px-0.5">
                {badge}
              </span>
            ) : null}
          </Link>
        ))}
      </nav>

      {/* ── MOBILE SLIDE-OUT MENU ── */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
          <div className="absolute top-14 right-0 bottom-14 w-72 bg-white shadow-2xl overflow-y-auto p-2">
            <Link href="/dashboard/profile" className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-100 mb-2" onClick={() => setMobileMenuOpen(false)}>
              <AvatarEl size={10} />
              <div>
                <div className="font-semibold text-gray-900">{user?.fullName}</div>
                <div className="text-xs text-gray-500">View profile</div>
              </div>
            </Link>
            <div className="border-t border-gray-100 mb-2" />
            {sideNavItems.map(item => (
              <SideNavItem key={item.href} {...item} active={isActive(item.href)} onClick={() => setMobileMenuOpen(false)} />
            ))}
            {isAdmin && (
              <SideNavItem href="/dashboard/admin" icon={Shield} label="Admin Panel" active={isActive('/dashboard/admin')} onClick={() => setMobileMenuOpen(false)} />
            )}
            <div className="border-t border-gray-100 my-2" />
            <button
              onClick={() => { logout(); setMobileMenuOpen(false); }}
              className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-100 w-full text-gray-700"
            >
              <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center">
                <LogOut className="w-5 h-5" />
              </div>
              <span className="font-semibold">Log Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function SideNavItem({
  href, icon: Icon, label, active, badge, onClick,
}: {
  href: string;
  icon: any;
  label: string;
  active?: boolean;
  badge?: number;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-3 p-2 rounded-xl transition mb-0.5 ${
        active ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-200'
      }`}
    >
      <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
        active ? 'bg-blue-100' : 'bg-gray-200'
      }`}>
        <Icon className={`w-5 h-5 ${active ? 'text-blue-700' : 'text-gray-700'}`} />
      </div>
      <span className="font-semibold text-[15px] flex-1 truncate">{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className="bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1">
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </Link>
  );
}
