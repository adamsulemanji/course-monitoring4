'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function HomePage() {
  const router = useRouter();
  const { isLoggedIn, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (isLoggedIn) {
        router.push('/dashboard');
      } else {
        router.push('/dashboard');
      }
    }
  }, [isLoggedIn, loading, router]);

  // Loading state
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md border shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Course Monitoring</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4 pt-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </CardContent>
      </Card>
    </div>
  );
} 