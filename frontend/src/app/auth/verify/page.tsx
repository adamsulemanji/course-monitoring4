"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@/lib/api";

const formSchema = z.object({
  confirmation_code: z.string().length(6, "Confirmation code must be exactly 6 characters"),
});

export default function VerifyAccountPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState("");
  const [resendSuccess, setResendSuccess] = useState("");

  useEffect(() => {
    if (!email) {
      router.push("/auth/signup");
    }
  }, [email, router]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      confirmation_code: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!email) return;
    
    setIsLoading(true);
    setError("");

    try {
      await auth.verify({
        email,
        confirmation_code: values.confirmation_code,
      });

      // Redirect to sign in page after successful verification
      router.push("/auth/signin");
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }

  const resendCode = async () => {
    if (!email) return;
    
    setIsResending(true);
    setError("");
    setResendSuccess("");

    try {
      await auth.resendCode(email);
      setResendSuccess("Confirmation code resent successfully");
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsResending(false);
    }
  };

  if (!email) {
    return null;
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-2xl font-bold text-center">Verify Your Account</CardTitle>
        <CardDescription className="text-center">
          Please enter the 6-digit code sent to {email}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-2">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="confirmation_code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirmation Code</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="123456"
                      maxLength={6}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            {resendSuccess && <p className="text-green-500 text-sm">{resendSuccess}</p>}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Verifying..." : "Verify Account"}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4">
        <Button
          variant="outline"
          type="button"
          onClick={resendCode}
          disabled={isResending}
          className="w-full"
        >
          {isResending ? "Resending..." : "Resend Code"}
        </Button>
        <p className="text-sm text-gray-500 text-center">
          <Link href="/auth/signup" className="text-blue-600 hover:text-blue-800">
            Back to Sign Up
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
} 