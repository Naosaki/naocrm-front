"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/AuthContext";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { SiteHeader } from "@/components/dashboard/site-header";
import { SectionCards } from "@/components/dashboard/section-cards";
import { ChartAreaInteractive } from "@/components/dashboard/chart-area-interactive";
import { ClientsTable } from "@/components/dashboard/clients-table";
import { InvoicesTable } from "@/components/dashboard/invoices-table";
import { ProductsTable } from "@/components/dashboard/products-table";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Redirection si l'utilisateur n'est pas authentifié ou n'est pas admin
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    } else if (!loading && user && user.role !== "admin") {
      router.push("/client");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <SectionCards />
              <div className="px-4 lg:px-6">
                <ChartAreaInteractive />
              </div>
              <div className="grid grid-cols-1 gap-4 px-4 md:grid-cols-2 lg:px-6">
                <ClientsTable />
                <InvoicesTable />
              </div>
              <div className="px-4 lg:px-6">
                <ProductsTable />
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
