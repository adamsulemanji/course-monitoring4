import { ReactNode } from "react";
// Temporarily commenting out ProtectedRoute for development
// import ProtectedRoute from "@/components/protected-route";
 
export default function DashboardLayout({ children }: { children: ReactNode }) {
  // Temporarily disabled auth protection
  // return <ProtectedRoute>{children}</ProtectedRoute>;
  return <>{children}</>;
} 