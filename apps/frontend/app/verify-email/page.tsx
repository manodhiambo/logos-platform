'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Mail, Phone } from 'lucide-react';
import apiClient from '@/lib/api-client';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const phoneFromUrl = searchParams.get('phone') || '';

  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const [showSmsSection, setShowSmsSection] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState(phoneFromUrl);
  const [sendingSms, setSendingSms] = useState(false);
  const [smsSent, setSmsSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await apiClient.post('/auth/verify-email', { email, code });

      localStorage.setItem('token', response.data.data.accessToken);
      localStorage.setItem('refreshToken', response.data.data.refreshToken);

      setSuccess('Email verified successfully! Redirecting...');
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Invalid verification code');
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    setError('');
    setSuccess('');
    setResending(true);

    try {
      await apiClient.post('/auth/resend-verification', { email });
      setSuccess('Verification code resent! Please check your email (and spam folder).');
    } catch (err: any) {
      setError(err.message || 'Failed to resend code');
    } finally {
      setResending(false);
    }
  };

  const handleSendSms = async () => {
    if (!phoneNumber.trim()) {
      setError('Please enter your phone number');
      return;
    }
    setError('');
    setSuccess('');
    setSendingSms(true);

    try {
      await apiClient.post('/auth/resend-verification-sms', { email, phoneNumber: phoneNumber.trim() });
      setSmsSent(true);
      setSuccess(`Verification code sent to ${phoneNumber}!`);
    } catch (err: any) {
      setError(err.message || 'Failed to send SMS. Please ensure SMS service is configured.');
    } finally {
      setSendingSms(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Mail className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">
            Verify Your Email
          </CardTitle>
          <CardDescription>
            We've sent a 6-digit verification code to<br />
            <strong className="text-slate-700">{email}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-700 p-4 rounded-lg text-sm border border-red-200">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 text-green-700 p-4 rounded-lg text-sm border border-green-200">
                {success}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="code" className="text-sm font-medium">
                Verification Code
              </label>
              <Input
                id="code"
                type="text"
                inputMode="numeric"
                placeholder="Enter 6-digit code"
                value={code}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setCode(value);
                  setError('');
                }}
                maxLength={6}
                required
                disabled={loading}
                className="text-center text-2xl tracking-widest font-mono"
              />
              <p className="text-xs text-slate-500 text-center">
                Code expires in 15 minutes
              </p>
            </div>

            <Button type="submit" className="w-full" disabled={loading || code.length !== 6}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify Email'
              )}
            </Button>
          </form>

          {/* Resend options */}
          <div className="mt-4 pt-4 border-t space-y-3">
            <p className="text-xs text-slate-500 text-center font-medium uppercase tracking-wide">
              Didn't receive the code?
            </p>

            <button
              type="button"
              onClick={handleResendEmail}
              disabled={resending}
              className="w-full flex items-center justify-center gap-2 text-sm text-primary hover:underline disabled:text-slate-400 py-1"
            >
              <Mail className="h-4 w-4" />
              {resending ? 'Sending...' : 'Resend to email (check spam too)'}
            </button>

            {!showSmsSection ? (
              <button
                type="button"
                onClick={() => setShowSmsSection(true)}
                className="w-full flex items-center justify-center gap-2 text-sm text-slate-600 hover:text-primary py-1"
              >
                <Phone className="h-4 w-4" />
                Send code via SMS instead
              </button>
            ) : (
              <div className="space-y-2 p-3 bg-slate-50 rounded-lg border">
                <div className="flex items-center gap-2 mb-2">
                  <Phone className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Send via SMS</span>
                </div>
                <Input
                  type="tel"
                  placeholder="+254712345678"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  disabled={sendingSms}
                  className="text-sm"
                />
                <p className="text-xs text-slate-500">Include country code (e.g. +254 for Kenya)</p>
                <Button
                  type="button"
                  onClick={handleSendSms}
                  disabled={sendingSms || !phoneNumber.trim()}
                  className="w-full"
                  size="sm"
                >
                  {sendingSms ? (
                    <>
                      <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                      Sending SMS...
                    </>
                  ) : smsSent ? (
                    'Resend SMS'
                  ) : (
                    'Send Code via SMS'
                  )}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
