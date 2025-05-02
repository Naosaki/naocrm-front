"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/AuthContext";
import ClientLayout from "@/components/layout/ClientLayout";

export default function ClientDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Redirection si l'utilisateur n'est pas authentifiu00e9 ou n'est pas client
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    } else if (!loading && user && user.role !== "client") {
      router.push("/admin");
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
    <ClientLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Tableau de bord client</h1>
        <p className="text-muted-foreground">Bienvenue dans votre espace client.</p>
        
        {/* Contenu du tableau de bord u00e0 du00e9velopper */}
        <div className="grid gap-6 md:grid-cols-2">
          <div className="bg-card rounded-lg shadow p-4">
            <h2 className="font-semibold mb-2">Mes factures</h2>
            <p className="text-3xl font-bold">0</p>
          </div>
          <div className="bg-card rounded-lg shadow p-4">
            <h2 className="font-semibold mb-2">Factures en attente</h2>
            <p className="text-3xl font-bold">0</p>
          </div>
        </div>
      </div>
    </ClientLayout>
  );
}
