'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function RegisterSuccessPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <span className="text-4xl">✅</span>
          </div>
          <CardTitle className="text-2xl font-bold">
            Registration Successful!
          </CardTitle>
          <CardDescription>
            Welcome to the LOGOS community
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-900 mb-2">
              <strong>📧 Verify Your Email</strong>
            </p>
            <p className="text-sm text-blue-800">
              We've sent a verification link to:
            </p>
            <p className="text-sm font-semibold text-blue-900 mt-1">
              {email}
            </p>
            <p className="text-sm text-blue-800 mt-2">
              Please check your inbox and click the verification link to activate your account.
            </p>
          </div>

          <div className="text-sm text-slate-600 space-y-2">
            <p><strong>Next steps:</strong></p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>Check your email inbox (and spam folder)</li>
              <li>Click the verification link</li>
              <li>Return to login and access your account</li>
            </ol>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Link href="/login" className="w-full">
            <Button className="w-full">
              Go to Login
            </Button>
          </Link>
          <p className="text-xs text-center text-slate-500">
            Didn't receive the email? Check your spam folder or contact support
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
