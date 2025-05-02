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
import { PlusCircle, Download, Eye, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils/date-utils";

export default function InvoicesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
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

  // Fonction pour formater le montant
  const formatAmount = (amount: number | null | undefined) => {
    if (amount === null || amount === undefined) return "-";
    
    try {
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR'
      }).format(amount);
    } catch (error) {
      console.error("Erreur lors du formatage du montant:", error);
      return "-";
    }
  };

  // Fonction pour déterminer la couleur du badge en fonction du statut
  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100";
      case "sent":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100";
      case "overdue":
        return "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100";
      case "draft":
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100";
    }
  };

  // Fonction pour traduire le statut en français
  const translateStatus = (status: string) => {
    switch (status) {
      case "paid":
        return "Payée";
      case "sent":
        return "Envoyée";
      case "overdue":
        return "En retard";
      case "draft":
        return "Brouillon";
      case "cancelled":
        return "Annulée";
      default:
        return status;
    }
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
                  Créer une facture
                </Button>
              </div>
              
              <div className="px-4 lg:px-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Liste des factures</CardTitle>
                    <CardDescription>
                      Gérez vos factures et leur statut.
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
                        Aucune facture trouvée. Créez votre première facture en cliquant sur le bouton ci-dessus.
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Numéro</TableHead>
                            <TableHead className="font-medium">Client</TableHead>
                            <TableHead>Réf. Client</TableHead>
                            <TableHead>Date validation</TableHead>
                            <TableHead>Échéance</TableHead>
                            <TableHead>Statut</TableHead>
                            <TableHead className="text-right">Montant HT</TableHead>
                            <TableHead className="text-right">Montant TTC</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {invoices.map((invoice) => (
                            <TableRow key={invoice.id}>
                              <TableCell className="font-medium">{invoice.number || invoice.id}</TableCell>
                              <TableCell className="font-medium text-primary">{invoice.thirdPartyName || "-"}</TableCell>
                              <TableCell>{invoice.ref_client || "-"}</TableCell>
                              <TableCell>{formatDate(invoice.date_validation || invoice.date)}</TableCell>
                              <TableCell>{formatDate(invoice.dueDate)}</TableCell>
                              <TableCell>
                                <Badge className={getStatusColor(invoice.status)} variant="outline">
                                  {translateStatus(invoice.status)}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">{formatAmount(invoice.multicurrency_total_ht || invoice.subtotal)}</TableCell>
                              <TableCell className="text-right">{formatAmount(invoice.multicurrency_total_ttc || invoice.total)}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  {invoice.pdfUrl ? (
                                    <Button variant="ghost" size="icon" onClick={() => window.open(invoice.pdfUrl, '_blank')}>
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                  ) : (
                                    <Button variant="ghost" size="icon" disabled>
                                      <Eye className="h-4 w-4 text-muted-foreground" />
                                    </Button>
                                  )}
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
