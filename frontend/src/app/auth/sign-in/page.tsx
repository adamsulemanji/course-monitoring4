'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import Link from 'next/link';
import { signIn } from '@/lib/auth/auth-service';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth/auth-context';
import { BookOpen, Loader2, Mail, Lock } from 'lucide-react';

const signInSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

type SignInFormValues = z.infer<typeof signInSchema>;

export default function SignInPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();
  
  const form = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: SignInFormValues) => {
    setIsLoading(true);
    
    try {
      const result = await signIn(data);
      
      if (result.success) {
        toast.success('Signed in successfully');
        login(result); // Update auth context
        router.push('/dashboard');
      } else {
        if (result.error?.includes('User is not confirmed')) {
          toast.error('Account not verified. Please check your email for verification code.');
          router.push(`/confirm-code?email=${encodeURIComponent(data.email)}`);
        } else {
          toast.error(result.error || 'Failed to sign in');
        }
      }
    } catch (error) {
      console.error('Sign in error:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-background to-muted/20 p-4">
      <div className="absolute top-8 flex items-center justify-center text-lg font-semibold">
        <BookOpen className="mr-2 h-6 w-6 text-primary" />
        <span>Course Monitor</span>
      </div>
      
      <Card className="w-full max-w-md border shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Welcome back</CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input 
                          placeholder="you@example.com" 
                          className="pl-10" 
                          {...field} 
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input 
                          type="password" 
                          placeholder="••••••••" 
                          className="pl-10" 
                          {...field} 
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> 
                    Signing In...
                  </span>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col items-center space-y-2 border-t bg-muted/10 p-6">
          <p className="text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link href="/auth/sign-up" className="font-medium text-primary hover:underline">
              Sign Up
            </Link>
          </p>
          <Link
            href="/auth/forgot-password"
            className="text-sm font-medium text-muted-foreground hover:text-primary"
          >
            Forgot password?
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
} 