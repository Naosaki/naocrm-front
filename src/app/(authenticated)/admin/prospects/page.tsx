"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/context/AuthContext";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { SiteHeader } from "@/components/dashboard/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { getAllProspects } from "@/lib/services/thirdPartyService";
import { ThirdParty } from "@/types";
import { Button } from "@/components/ui/button";
import { PlusCircle, Eye } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatPhoneNumber } from "@/lib/utils/phone-utils";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import { ClientDetailsModal } from "@/components/dashboard/client-details-modal";

export default function ProspectsPage() {
  const { user, loading } = useAuth();
  const [prospects, setProspects] = useState<ThirdParty[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // États pour la pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Charger les prospects depuis Firestore
  useEffect(() => {
    const fetchProspects = async () => {
      try {
        setIsLoading(true);
        const prospectsData = await getAllProspects();
        setProspects(prospectsData);
        setError(null);
      } catch (err) {
        console.error("Erreur lors du chargement des prospects:", err);
        setError("Impossible de charger les prospects. Veuillez réessayer plus tard.");
      } finally {
        setIsLoading(false);
      }
    };

    if (!loading && user) {
      fetchProspects();
    }
  }, [loading, user]);
  
  // Ouvrir la modal avec les détails du prospect
  const handleViewProspect = (clientId: string) => {
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
  
  // Calculer les prospects à afficher pour la page actuelle
  const paginatedProspects = prospects.slice(
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
                <h1 className="text-2xl font-semibold tracking-tight">Prospects</h1>
                <Button className="flex items-center gap-2">
                  <PlusCircle className="h-4 w-4" />
                  Ajouter un prospect
                </Button>
              </div>
              
              <div className="px-4 lg:px-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Liste des prospects</CardTitle>
                    <CardDescription>
                      Gérez vos prospects et leurs informations. Les prospects sont des entreprises qui n&apos;ont pas encore de facture.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                      </div>
                    ) : error ? (
                      <div className="text-center py-8 text-red-500">{error}</div>
                    ) : prospects.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        Aucun prospect trouvé. Ajoutez votre premier prospect en cliquant sur le bouton ci-dessus.
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
                              <TableHead className="text-center">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {paginatedProspects.map((prospect) => (
                              <TableRow key={prospect.id}>
                                <TableCell className="font-medium">{prospect.name}</TableCell>
                                <TableCell className="font-medium text-primary">{prospect.code_client || "-"}</TableCell>
                                <TableCell>{prospect.email}</TableCell>
                                <TableCell>{formatPhoneNumber(prospect.phone)}</TableCell>
                                <TableCell className="text-center">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleViewProspect(prospect.id)}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                        
                        {/* Composant de pagination */}
                        <DataTablePagination
                          totalItems={prospects.length}
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
      
      {/* Modal pour afficher les détails du prospect */}
      <ClientDetailsModal
        clientId={selectedClientId}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </SidebarProvider>
  );
}
