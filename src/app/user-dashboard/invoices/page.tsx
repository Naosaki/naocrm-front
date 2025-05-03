"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/AuthContext";
import ClientLayout from "@/components/layout/ClientLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { getInvoicesByConnectedClient } from "@/lib/services/invoiceService";
import { Invoice } from "@/types";
import { formatDate } from "@/lib/utils/date-utils";
import { formatAmount } from "@/lib/utils/format-utils";
import { getInvoiceStatusLabel, getInvoiceStatusColor } from "@/lib/utils/invoice-utils";
import { DataTablePagination } from "@/components/ui/data-table-pagination";

export default function ClientInvoicesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // États pour la pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

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
    
    // Redirection vers admin si l'utilisateur est explicitement admin
    if (user.role === "admin") {
      router.push("/admin");
      return;
    }
    
    // Si l'utilisateur est client ou si le rôle est indéfini, on reste sur cette page
  }, [user, loading, router]);

  // Charger les factures du client
  useEffect(() => {
    const fetchInvoices = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        // Vérifier si l'utilisateur est un client ou un administrateur
        if (user.role === 'admin') {
          // Pour les administrateurs, définir un tableau vide de factures
          setInvoices([]);
        } else {
          // Pour les clients, récupérer les factures normalement
          try {
            const clientInvoices = await getInvoicesByConnectedClient(user.id);
            setInvoices(clientInvoices);
          } catch (err) {
            console.error("Erreur lors du chargement des factures client:", err);
            // Si l'erreur est due à l'absence de thirdPartyId, définir un tableau vide
            setInvoices([]);
          }
        }
      } catch (err) {
        console.error("Erreur lors du chargement des factures:", err);
        setError("Impossible de charger vos factures. Veuillez réessayer plus tard.");
      } finally {
        setIsLoading(false);
      }
    };

    if (!loading && user) {
      fetchInvoices();
    }
  }, [user, loading]);
  
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
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Mes factures</h1>
          <Button variant="outline" onClick={() => router.push('/user-dashboard')}>
            Retour au tableau de bord
          </Button>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="bg-destructive/10 text-destructive p-4 rounded-md">{error}</div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Historique des factures</CardTitle>
              <CardDescription>
                Consultez l&apos;ensemble de vos factures et leur statut.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {invoices.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Aucune facture trouvée.
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Numéro</TableHead>
                        <TableHead>Date</TableHead>
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
                          <TableCell>{formatDate(invoice.date_validation || invoice.date)}</TableCell>
                          <TableCell>
                            <Badge className={getInvoiceStatusColor(invoice.status)} variant="outline">
                              {getInvoiceStatusLabel(invoice.status)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">{formatAmount(invoice.multicurrency_total_ht || invoice.subtotal)}</TableCell>
                          <TableCell className="text-right">{formatAmount(invoice.multicurrency_total_ttc || invoice.total)}</TableCell>
                          <TableCell className="text-center">
                            {invoice.pdfUrl && (
                              <Button variant="ghost" size="icon" onClick={() => window.open(invoice.pdfUrl, '_blank')}>
                                <Download className="h-4 w-4" />
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  
                  {/* Composant de pagination */}
                  <div className="mt-4">
                    <DataTablePagination
                      totalItems={invoices.length}
                      pageSize={pageSize}
                      currentPage={currentPage}
                      onPageChange={handlePageChange}
                      onPageSizeChange={handlePageSizeChange}
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </ClientLayout>
  );
}
