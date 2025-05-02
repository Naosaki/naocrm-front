"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/AuthContext";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { SiteHeader } from "@/components/dashboard/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { getAllThirdParties } from "@/lib/services/thirdPartyService";
import { ThirdParty } from "@/types";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function ClientsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [clients, setClients] = useState<ThirdParty[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Redirection si l'utilisateur n'est pas authentifié ou n'est pas admin
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    } else if (!loading && user && user.role !== "admin") {
      router.push("/client");
    }
  }, [user, loading, router]);

  // Charger les clients depuis Firestore
  useEffect(() => {
    const fetchClients = async () => {
      try {
        setIsLoading(true);
        const clientsData = await getAllThirdParties();
        setClients(clientsData);
        setError(null);
      } catch (err) {
        console.error("Erreur lors du chargement des clients:", err);
        setError("Impossible de charger les clients. Veuillez réessayer plus tard.");
      } finally {
        setIsLoading(false);
      }
    };

    if (!loading && user) {
      fetchClients();
    }
  }, [loading, user]);

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
              <div className="flex items-center justify-between px-4 lg:px-6">
                <h1 className="text-2xl font-semibold tracking-tight">Clients</h1>
                <Button className="flex items-center gap-2">
                  <PlusCircle className="h-4 w-4" />
                  Ajouter un client
                </Button>
              </div>
              
              <div className="px-4 lg:px-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Liste des clients</CardTitle>
                    <CardDescription>
                      Gérez vos clients et leurs informations.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                      </div>
                    ) : error ? (
                      <div className="text-center py-8 text-red-500">{error}</div>
                    ) : clients.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        Aucun client trouvé. Ajoutez votre premier client en cliquant sur le bouton ci-dessus.
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Nom</TableHead>
                            <TableHead>Code Client</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Téléphone</TableHead>
                            <TableHead>Adresse</TableHead>
                            <TableHead>Contact</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {clients.map((client) => (
                            <TableRow key={client.id} className="cursor-pointer hover:bg-muted/50" onClick={() => router.push(`/admin/clients/${client.id}`)}>
                              <TableCell className="font-medium">{client.name}</TableCell>
                              <TableCell className="font-medium text-primary">{client.code_client || "-"}</TableCell>
                              <TableCell>{client.email}</TableCell>
                              <TableCell>{client.phone || "-"}</TableCell>
                              <TableCell>
                                {client.address ? (
                                  <>
                                    {client.address}, {client.postalCode} {client.city}, {client.country}
                                  </>
                                ) : (
                                  "-"
                                )}
                              </TableCell>
                              <TableCell>{client.contactPerson || "-"}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
