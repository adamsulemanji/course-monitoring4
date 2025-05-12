import { ReactNode } from "react";
import ProtectedRoute from "@/components/protected-route";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
} 