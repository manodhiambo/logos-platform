import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-slate-900 mb-4">
            Welcome to LOGOS
          </h1>
          <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
            A faith-based community platform for spiritual growth, Bible study, and Christian fellowship
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="text-lg px-8">
                Get Started
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="text-lg px-8">
                Sign In
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🤖 AI Bible Assistant
              </CardTitle>
              <CardDescription>
                Get biblical guidance and answers powered by AI
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">
                Ask questions about faith, get scripture references, and receive biblical insights instantly.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🙏 Prayer Wall
              </CardTitle>
              <CardDescription>
                Share and support prayer requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">
                Join a community of believers in prayer. Share your needs and pray for others.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                📖 Daily Devotionals
              </CardTitle>
              <CardDescription>
                Grow in faith every day
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">
                Read inspiring devotionals, track your spiritual journey, and build consistent habits.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                👥 Communities
              </CardTitle>
              <CardDescription>
                Connect with fellow believers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">
                Join communities, participate in discussions, and grow together in faith.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                📚 Bible Study
              </CardTitle>
              <CardDescription>
                Search and study Scripture
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">
                Access multiple translations, search verses, and deepen your understanding of God's Word.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                ✝️ Faith Journey
              </CardTitle>
              <CardDescription>
                Track your spiritual growth
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">
                Monitor your devotional streaks, prayer life, and engagement with the community.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center mt-16 text-slate-600">
          <p className="text-sm">
            © 2025 LOGOS Platform. Built for the glory of God. ✝️
          </p>
        </div>
      </div>
    </div>
  );
}
