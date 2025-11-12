'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/95 backdrop-blur-sm shadow-md' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="relative">
                {/* Cross with sunset gradient */}
                <svg width="40" height="40" viewBox="0 0 40 40" className="relative z-10">
                  <defs>
                    <linearGradient id="sunsetGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" style={{ stopColor: '#ff6b6b', stopOpacity: 1 }} />
                      <stop offset="50%" style={{ stopColor: '#ffa500', stopOpacity: 1 }} />
                      <stop offset="100%" style={{ stopColor: '#ffed4e', stopOpacity: 1 }} />
                    </linearGradient>
                  </defs>
                  {/* Cross */}
                  <rect x="17" y="5" width="6" height="30" fill="url(#sunsetGradient)" rx="2"/>
                  <rect x="10" y="15" width="20" height="6" fill="url(#sunsetGradient)" rx="2"/>
                </svg>
                {/* Glow effect */}
                <div className="absolute inset-0 blur-xl opacity-30 bg-gradient-to-br from-orange-400 via-red-400 to-yellow-400"></div>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-orange-600 via-red-600 to-yellow-600 bg-clip-text text-transparent">
                LOGOS
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/register">
                <Button className="bg-gradient-to-r from-orange-500 via-red-500 to-yellow-500 hover:from-orange-600 hover:via-red-600 hover:to-yellow-600">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <svg width="120" height="120" viewBox="0 0 120 120">
                <defs>
                  <linearGradient id="heroSunset" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{ stopColor: '#ff6b6b', stopOpacity: 1 }} />
                    <stop offset="33%" style={{ stopColor: '#ffa500', stopOpacity: 1 }} />
                    <stop offset="66%" style={{ stopColor: '#ffed4e', stopOpacity: 1 }} />
                    <stop offset="100%" style={{ stopColor: '#ff6b6b', stopOpacity: 1 }} />
                  </linearGradient>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
                <rect x="52" y="20" width="16" height="80" fill="url(#heroSunset)" rx="4" filter="url(#glow)"/>
                <rect x="30" y="50" width="60" height="16" fill="url(#heroSunset)" rx="4" filter="url(#glow)"/>
              </svg>
              <div className="absolute inset-0 blur-3xl opacity-40 bg-gradient-to-br from-orange-400 via-red-400 to-yellow-400 animate-pulse"></div>
            </div>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-transparent">
            Your Faith Journey,
            <br />
            <span className="bg-gradient-to-r from-orange-600 via-red-600 to-yellow-600 bg-clip-text text-transparent">
              Connected
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-600 mb-8 max-w-3xl mx-auto">
            Join a thriving Christian community where faith meets fellowship. 
            Pray together, grow spiritually, and connect with believers worldwide.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="text-lg px-8 py-6 bg-gradient-to-r from-orange-500 via-red-500 to-yellow-500 hover:from-orange-600 hover:via-red-600 hover:to-yellow-600 shadow-xl hover:shadow-2xl transition-all">
                Join Free Today
              </Button>
            </Link>
            <Link href="#features">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-2">
                Explore Features
              </Button>
            </Link>
          </div>

          <div className="mt-12 flex flex-wrap justify-center gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-slate-900">10K+</div>
              <div className="text-slate-600">Active Members</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-slate-900">50K+</div>
              <div className="text-slate-600">Prayers Shared</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-slate-900">100+</div>
              <div className="text-slate-600">Communities</div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-gradient-to-r from-orange-50 via-red-50 to-yellow-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8 text-center hover:shadow-xl transition-shadow bg-white/80 backdrop-blur">
              <div className="text-5xl mb-4">🎯</div>
              <h3 className="text-2xl font-bold mb-4 text-slate-900">Our Mission</h3>
              <p className="text-slate-600">
                To create a digital sanctuary where Christians worldwide can connect, 
                grow in faith, and support each other through prayer and fellowship.
              </p>
            </Card>
            
            <Card className="p-8 text-center hover:shadow-xl transition-shadow bg-white/80 backdrop-blur">
              <div className="text-5xl mb-4">👁️</div>
              <h3 className="text-2xl font-bold mb-4 text-slate-900">Our Vision</h3>
              <p className="text-slate-600">
                A world where every believer has access to a supportive Christian community, 
                regardless of location, fostering spiritual growth and unity in Christ.
              </p>
            </Card>
            
            <Card className="p-8 text-center hover:shadow-xl transition-shadow bg-white/80 backdrop-blur">
              <div className="text-5xl mb-4">❤️</div>
              <h3 className="text-2xl font-bold mb-4 text-slate-900">Our Values</h3>
              <p className="text-slate-600">
                Faith, Community, Love, and Service guide everything we do. 
                We believe in building authentic relationships centered on Christ.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900">
              Everything You Need for
              <br />
              <span className="bg-gradient-to-r from-orange-600 via-red-600 to-yellow-600 bg-clip-text text-transparent">
                Spiritual Growth
              </span>
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Powerful features designed to strengthen your faith journey
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature Cards */}
            <FeatureCard
              icon="🙏"
              title="Prayer Requests"
              description="Share your prayer needs and intercede for others. Build a powerful prayer network."
            />
            <FeatureCard
              icon="🏘️"
              title="Communities"
              description="Join or create faith-based communities. Connect with believers who share your interests."
            />
            <FeatureCard
              icon="📖"
              title="Daily Devotionals"
              description="Start each day with inspiring devotionals. Track your spiritual reading journey."
            />
            <FeatureCard
              icon="💬"
              title="Direct Messaging"
              description="Connect privately with friends, mentors, and prayer partners."
            />
            <FeatureCard
              icon="📹"
              title="Video Calls"
              description="Host virtual Bible studies, prayer meetings, and fellowship sessions."
            />
            <FeatureCard
              icon="👥"
              title="Friendships"
              description="Build meaningful Christian friendships. Follow and support fellow believers."
            />
            <FeatureCard
              icon="🤖"
              title="AI Faith Assistant"
              description="Get biblical insights and spiritual guidance powered by AI technology."
            />
            <FeatureCard
              icon="📝"
              title="Posts & Sharing"
              description="Share testimonies, encouragements, and insights with the community."
            />
            <FeatureCard
              icon="🎤"
              title="Live Events"
              description="Participate in live worship, teachings, and community gatherings."
            />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-slate-100">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16 text-slate-900">
            Stories of <span className="bg-gradient-to-r from-orange-600 via-red-600 to-yellow-600 bg-clip-text text-transparent">Transformation</span>
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <TestimonialCard
              quote="LOGOS has been a blessing! I found a prayer group that prays for me daily. My faith has grown tremendously."
              author="Sarah M."
              role="Member since 2024"
            />
            <TestimonialCard
              quote="The daily devotionals keep me grounded. It's like having a pastor in my pocket!"
              author="John D."
              role="Youth Leader"
            />
            <TestimonialCard
              quote="I've made lifelong Christian friends here. This community is truly special."
              author="Grace K."
              role="Community Leader"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-orange-500 via-red-500 to-yellow-500 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Begin Your Journey?
          </h2>
          <p className="text-xl mb-8 text-white/90">
            Join thousands of believers growing in faith together. It's free, forever.
          </p>
          <Link href="/register">
            <Button size="lg" className="bg-white text-orange-600 hover:bg-slate-100 text-lg px-12 py-6 shadow-2xl">
              Create Your Free Account
            </Button>
          </Link>
          <p className="mt-4 text-white/80">No credit card required • Start in 30 seconds</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <svg width="32" height="32" viewBox="0 0 32 32">
                  <defs>
                    <linearGradient id="footerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" style={{ stopColor: '#ff6b6b' }} />
                      <stop offset="50%" style={{ stopColor: '#ffa500' }} />
                      <stop offset="100%" style={{ stopColor: '#ffed4e' }} />
                    </linearGradient>
                  </defs>
                  <rect x="13" y="4" width="6" height="24" fill="url(#footerGradient)" rx="2"/>
                  <rect x="8" y="12" width="16" height="6" fill="url(#footerGradient)" rx="2"/>
                </svg>
                <span className="text-xl font-bold">LOGOS</span>
              </div>
              <p className="text-slate-400 mb-4">
                Building Christian community, one connection at a time.
              </p>
              <a href="mailto:manodhiambo@gmail.com" className="text-slate-400 hover:text-white transition flex items-center gap-2">
                <span>✉️</span>
                <span>manodhiambo@gmail.com</span>
              </a>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Platform</h4>
              <ul className="space-y-2 text-slate-400">
                <li><Link href="#features" className="hover:text-white">Features</Link></li>
                <li><Link href="/about" className="hover:text-white">About Us</Link></li>
                <li><a href="mailto:manodhiambo@gmail.com" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Resources</h4>
              <ul className="space-y-2 text-slate-400">
                <li><Link href="/blog" className="hover:text-white">Blog</Link></li>
                <li><Link href="/help" className="hover:text-white">Help Center</Link></li>
                <li><Link href="/faq" className="hover:text-white">FAQ</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-slate-400">
                <li><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-white">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-800 pt-8 text-center text-slate-400">
            <p>&copy; {currentYear} LOGOS Platform. All rights reserved. Built with ❤️ for the Body of Christ.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <Card className="p-6 hover:shadow-xl transition-all hover:-translate-y-1 bg-white">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-2 text-slate-900">{title}</h3>
      <p className="text-slate-600">{description}</p>
    </Card>
  );
}

interface TestimonialCardProps {
  quote: string;
  author: string;
  role: string;
}

function TestimonialCard({ quote, author, role }: TestimonialCardProps) {
  return (
    <Card className="p-6 bg-white">
      <div className="text-yellow-500 text-3xl mb-4">★★★★★</div>
      <p className="text-slate-700 mb-4 italic">"{quote}"</p>
      <div>
        <p className="font-bold text-slate-900">{author}</p>
        <p className="text-sm text-slate-500">{role}</p>
      </div>
    </Card>
  );
}
