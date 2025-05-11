'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
import { verifyAccount, resendConfirmationCode } from '@/lib/auth/auth-service';
import { toast } from 'sonner';
import { BookOpen, Loader2, Mail, KeyRound } from 'lucide-react';

const confirmCodeSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  confirmation_code: z
    .string()
    .min(6, { message: 'Confirmation code must be at least 6 characters.' })
    .max(6, { message: 'Confirmation code must be at most 6 characters.' }),
});

type ConfirmCodeFormValues = z.infer<typeof confirmCodeSchema>;

export default function ConfirmCodePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  
  const form = useForm<ConfirmCodeFormValues>({
    resolver: zodResolver(confirmCodeSchema),
    defaultValues: {
      email: email,
      confirmation_code: '',
    },
  });

  // Update form if email query param changes
  if (email && form.getValues('email') !== email) {
    form.setValue('email', email);
  }

  const onSubmit = async (data: ConfirmCodeFormValues) => {
    setIsLoading(true);
    
    try {
      const result = await verifyAccount(data);
      
      if (result.success) {
        toast.success('Account verified successfully! You can now sign in.');
        router.push('/auth/sign-in');
      } else {
        toast.error(result.error || 'Failed to verify account');
      }
    } catch (error) {
      console.error('Verification error:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    const currentEmail = form.getValues('email');
    
    if (!currentEmail) {
      toast.error('Email is required to resend code');
      return;
    }
    
    setIsResending(true);
    
    try {
      const result = await resendConfirmationCode(currentEmail);
      
      if (result.success) {
        toast.success('Verification code resent. Please check your email.');
      } else {
        toast.error(result.error || 'Failed to resend verification code');
      }
    } catch (error) {
      console.error('Resend code error:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-background to-muted/20 p-4 w-full">
      <div className="absolute top-8 flex items-center justify-center text-lg font-semibold">
        <BookOpen className="mr-2 h-6 w-6 text-primary" />
        <span>Course Monitor</span>
      </div>
      
      <Card className="w-full max-w-md border shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Confirm Your Account</CardTitle>
          <CardDescription className="text-center">
            We&apos;ve sent a verification code to <strong>{email || 'your email'}</strong>.
            Please enter it below.
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
                          className="pl-10" 
                          {...field} 
                          disabled={!!email} 
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmation_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Verification Code</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <KeyRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input 
                          placeholder="123456" 
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
                    Verifying...
                  </span>
                ) : (
                  'Verify Account'
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col items-center space-y-3 border-t bg-muted/10 p-6">
          <div className="flex items-center gap-2">
            <p className="text-sm text-muted-foreground">
              Didn&apos;t receive a code?
            </p>
            <Button 
              variant="link" 
              size="sm" 
              onClick={handleResendCode} 
              disabled={isResending} 
              className="h-auto p-0 text-primary"
            >
              {isResending ? (
                <span className="flex items-center gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Sending...
                </span>
              ) : (
                'Resend Code'
              )}
            </Button>
          </div>
          <Link href="/auth/sign-in" className="text-sm font-medium text-primary hover:underline">
            Back to Sign In
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
} 