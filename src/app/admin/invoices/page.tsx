"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/AuthContext";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { SiteHeader } from "@/components/dashboard/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { getAllInvoicesWithClientInfo } from "@/lib/services/invoiceService";
import { Invoice } from "@/types";
import { Button } from "@/components/ui/button";
import { PlusCircle, Download, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils/date-utils";
import { getInvoiceStatusLabel, getInvoiceStatusColor } from "@/lib/utils/invoice-utils";
import { DataTablePagination } from "@/components/ui/data-table-pagination";

export default function InvoicesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
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

  // Charger les factures depuis Firestore
  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        setIsLoading(true);
        const invoicesData = await getAllInvoicesWithClientInfo();
        // Trier les factures par date (les plus récentes d'abord)
        invoicesData.sort((a, b) => {
          const dateA = a.date instanceof Date ? a.date.getTime() : new Date(a.date || 0).getTime();
          const dateB = b.date instanceof Date ? b.date.getTime() : new Date(b.date || 0).getTime();
          return dateB - dateA;
        });
        setInvoices(invoicesData);
        setError(null);
      } catch (err) {
        console.error("Erreur lors du chargement des factures:", err);
        setError("Impossible de charger les factures. Veuillez réessayer plus tard.");
      } finally {
        setIsLoading(false);
      }
    };

    if (!loading && user) {
      fetchInvoices();
    }
  }, [loading, user]);
  
  // Changer de page
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  // Changer le nombre d'éléments par page
  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1); // Revenir à la première page lors du changement de taille
  };
  
  // Calculer les factures à afficher pour la page actuelle
  const paginatedInvoices = invoices.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Fonction pour formater les montants
  const formatAmount = (amount: number | null | undefined): string => {
    if (amount === null || amount === undefined || isNaN(amount)) return '0,00 €';
    
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2
    }).format(amount);
  };

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
                <h1 className="text-2xl font-semibold tracking-tight">Factures</h1>
                <Button className="flex items-center gap-2">
                  <PlusCircle className="h-4 w-4" />
                  Ajouter une facture
                </Button>
              </div>
              
              <div className="px-4 lg:px-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Liste des factures</CardTitle>
                    <CardDescription>
                      Gérez vos factures et suivez leur statut.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                      </div>
                    ) : error ? (
                      <div className="text-center py-8 text-red-500">{error}</div>
                    ) : invoices.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        Aucune facture trouvée. Ajoutez votre première facture en cliquant sur le bouton ci-dessus.
                      </div>
                    ) : (
                      <>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Numéro</TableHead>
                              <TableHead className="font-medium">Client</TableHead>
                              <TableHead>Réf. Client</TableHead>
                              <TableHead>Date validation</TableHead>
                              <TableHead>Statut</TableHead>
                              <TableHead className="text-right">Montant HT</TableHead>
                              <TableHead className="text-right">Montant TTC</TableHead>
                              <TableHead className="text-center">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {paginatedInvoices.map((invoice) => (
                              <TableRow key={invoice.id}>
                                <TableCell className="font-medium">{invoice.number || invoice.id}</TableCell>
                                <TableCell className="font-medium text-primary">{invoice.thirdPartyName || "-"}</TableCell>
                                <TableCell>{invoice.ref_client || "-"}</TableCell>
                                <TableCell>{formatDate(invoice.date_validation || invoice.date)}</TableCell>
                                <TableCell>
                                  <Badge className={getInvoiceStatusColor(invoice.status)} variant="outline">
                                    {getInvoiceStatusLabel(invoice.status)}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-right">{formatAmount(invoice.multicurrency_total_ht || invoice.subtotal)}</TableCell>
                                <TableCell className="text-right">{formatAmount(invoice.multicurrency_total_ttc || invoice.total)}</TableCell>
                                <TableCell className="text-center">
                                  <div className="flex justify-center gap-2">
                                    {invoice.pdfUrl && (
                                      <Button variant="ghost" size="icon" onClick={() => window.open(invoice.pdfUrl, '_blank')}>
                                        <Download className="h-4 w-4" />
                                      </Button>
                                    )}
                                    <Button variant="ghost" size="icon" className="text-red-500">
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                        
                        {/* Composant de pagination */}
                        <DataTablePagination
                          totalItems={invoices.length}
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
    </SidebarProvider>
  );
}
