"use client"

import React from "react"
import { DashboardLayout } from "@/components/dashboard-layout"

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return <DashboardLayout>{children}</DashboardLayout>
} 