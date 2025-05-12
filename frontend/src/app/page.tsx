"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Check if the user is logged in
    const accessToken = localStorage.getItem("accessToken");
    
    if (accessToken) {
      router.push("/dashboard");
    } else {
      router.push("/auth/signin");
    }
  }, [router]);

  // Show a simple loading state while redirecting
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
}
