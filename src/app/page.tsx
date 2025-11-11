"use client";

import React, { useEffect, useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { DashboardStats } from '@/components/DashboardStats';
import { LowStockAlert } from '@/components/LowStockAlert';
import { ActivityFeed } from '@/components/ActivityFeed';
import { Skeleton } from '@/components/ui/skeleton';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { Separator } from '@/components/ui/separator';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';

interface DashboardData {
  totalItems: number;
  totalValue: number;
  lowStockCount: number;
  totalLocations: number;
  lowStockItems: Array<{
    id: number;
    name: string;
    sku: string;
    quantity: number;
    lowStockThreshold: number;
  }>;
  recentActivity: Array<{
    id: number;
    action: string;
    description: string;
    createdAt: string;
    user: {
      name: string;
      email: string;
    };
    inventoryItem: {
      name: string;
      sku: string;
    } | null;
  }>;
  categoryCounts: Array<{
    category: string;
    count: number;
  }>;
}

export default function Home() {
  const { user, currentOrganization } = useApp();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDashboardData() {
      if (!user || !currentOrganization) return;

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/dashboard/stats?userId=${user.id}&organizationId=${currentOrganization.id}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }

        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, [user, currentOrganization]);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>Dashboard</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
          {loading ? (
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground">
                  Welcome back, {user?.name}
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-32" />
                ))}
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Skeleton className="h-96" />
                <Skeleton className="h-96" />
              </div>
            </div>
          ) : error ? (
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground">
                  Welcome back, {user?.name}
                </p>
              </div>
              <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
                <p className="text-sm text-destructive">Error: {error}</p>
              </div>
            </div>
          ) : data ? (
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground">
                  Welcome back, {user?.name}
                </p>
              </div>

              <DashboardStats
                stats={{
                  totalItems: data.totalItems,
                  totalValue: data.totalValue,
                  lowStockCount: data.lowStockCount,
                  totalLocations: data.totalLocations,
                }}
              />

              <div className="grid gap-4 md:grid-cols-2">
                <LowStockAlert items={data.lowStockItems} />
                <ActivityFeed activities={data.recentActivity} />
              </div>
            </div>
          ) : null}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}