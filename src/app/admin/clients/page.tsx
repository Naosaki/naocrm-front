"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/AuthContext";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { SiteHeader } from "@/components/dashboard/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { getAllClients } from "@/lib/services/thirdPartyService";
import { getAllClientsInvoiceStats } from "@/lib/services/invoiceService";
import { ThirdParty } from "@/types";
import { Button } from "@/components/ui/button";
import { PlusCircle, Eye } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatPhoneNumber } from "@/lib/utils/phone-utils";
import { formatAmount } from "@/lib/utils/format-utils";
import { Badge } from "@/components/ui/badge";
import { ClientDetailsModal } from "@/components/dashboard/client-details-modal";
import { DataTablePagination } from "@/components/ui/data-table-pagination";

// Type pour les statistiques des clients
type ClientStats = {
  [clientCode: string]: { invoiceCount: number; totalAmount: number };
};

export default function ClientsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [clients, setClients] = useState<ThirdParty[]>([]);
  const [clientStats, setClientStats] = useState<ClientStats>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // États pour la pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Redirection si l'utilisateur n'est pas authentifié ou n'est pas admin
  useEffect(() => {
    // N'effectuer la redirection que si le chargement est terminé
    if (loading) {
      return;
    }
    
    // Redirection vers login si non authentifié
    if (!user) {
      router.push("/login");
      return;
    }
    
    // Redirection vers user-dashboard si l'utilisateur n'est pas admin
    if (user.role !== "admin") {
      router.push("/user-dashboard");
      return;
    }
    
    // Si l'utilisateur est admin, on reste sur cette page
  }, [user, loading, router]);

  // Charger les clients et leurs statistiques depuis Firestore
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Récupérer les clients et leurs statistiques en parallèle
        const [clientsData, statsData] = await Promise.all([
          getAllClients(),
          getAllClientsInvoiceStats()
        ]);
        
        setClients(clientsData);
        setClientStats(statsData);
        setError(null);
      } catch (err) {
        console.error("Erreur lors du chargement des données:", err);
        setError("Impossible de charger les données. Veuillez réessayer plus tard.");
      } finally {
        setIsLoading(false);
      }
    };

    if (!loading && user) {
      fetchData();
    }
  }, [loading, user]);

  // Ouvrir la modal avec les détails du client
  const handleViewClient = (clientId: string) => {
    setSelectedClientId(clientId);
    setIsModalOpen(true);
  };

  // Fermer la modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedClientId(null);
  };
  
  // Changer de page
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  // Changer le nombre d'éléments par page
  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1); // Revenir à la première page lors du changement de taille
  };
  
  // Calculer les clients à afficher pour la page actuelle
  const paginatedClients = clients.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

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
                      <>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Nom</TableHead>
                              <TableHead>Code Client</TableHead>
                              <TableHead>Email</TableHead>
                              <TableHead>Téléphone</TableHead>
                              <TableHead className="text-center">Factures</TableHead>
                              <TableHead className="text-right">Montant total HT</TableHead>
                              <TableHead className="text-center">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {paginatedClients.map((client) => {
                              // Récupérer les statistiques du client
                              const stats = clientStats[client.code_client || ''] || { invoiceCount: 0, totalAmount: 0 };
                              
                              return (
                                <TableRow key={client.id}>
                                  <TableCell className="font-medium">{client.name}</TableCell>
                                  <TableCell className="font-medium text-primary">{client.code_client || "-"}</TableCell>
                                  <TableCell>{client.email}</TableCell>
                                  <TableCell>{formatPhoneNumber(client.phone)}</TableCell>
                                  <TableCell className="text-center">
                                    <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-100">
                                      {stats.invoiceCount}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-right font-medium">
                                    {formatAmount(stats.totalAmount)}
                                  </TableCell>
                                  <TableCell className="text-center">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleViewClient(client.id)}
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                        
                        {/* Composant de pagination */}
                        <DataTablePagination
                          totalItems={clients.length}
                          pageSize={pageSize}
                          currentPage={currentPage}
                          onPageChange={handlePageChange}
                          onPageSizeChange={handlePageSizeChange}
                        />
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
      
      {/* Modal pour afficher les détails du client */}
      <ClientDetailsModal
        clientId={selectedClientId}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </SidebarProvider>
  );
}
