"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/AuthContext";
import ClientLayout from "@/components/layout/ClientLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, FileText } from "lucide-react";
import { getInvoicesByConnectedClient, getConnectedClientInvoiceStats } from "@/lib/services/invoiceService";
import { Invoice } from "@/types";
import { formatDate } from "@/lib/utils/date-utils";
import { formatAmount } from "@/lib/utils/format-utils";
import { getInvoiceStatusLabel, getInvoiceStatusColor } from "@/lib/utils/invoice-utils";

export default function ClientDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [stats, setStats] = useState({
    totalInvoices: 0,
    paidInvoices: 0,
    pendingInvoices: 0,
    overdueInvoices: 0,
    totalAmount: 0,
    paidAmount: 0,
    pendingAmount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger les factures et statistiques du client
  useEffect(() => {
    const fetchClientData = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        // Vérifier si l'utilisateur est un client ou un administrateur
        if (user.role === 'admin') {
          // Pour les administrateurs, définir des valeurs par défaut
          setInvoices([]);
          setStats({
            totalInvoices: 0,
            paidInvoices: 0,
            pendingInvoices: 0,
            overdueInvoices: 0,
            totalAmount: 0,
            paidAmount: 0,
            pendingAmount: 0,
          });
        } else {
          // Pour les clients, récupérer les données normalement
          try {
            // Récupérer les factures du client
            const clientInvoices = await getInvoicesByConnectedClient(user.id);
            setInvoices(clientInvoices);
            
            // Récupérer les statistiques du client
            const clientStats = await getConnectedClientInvoiceStats(user.id);
            setStats(clientStats);
          } catch (err) {
            console.error("Erreur lors du chargement des données client:", err);
            // Si l'erreur est due à l'absence de thirdPartyId, définir des valeurs par défaut
            setInvoices([]);
            setStats({
              totalInvoices: 0,
              paidInvoices: 0,
              pendingInvoices: 0,
              overdueInvoices: 0,
              totalAmount: 0,
              paidAmount: 0,
              pendingAmount: 0,
            });
          }
        }
      } catch (err) {
        console.error("Erreur lors du chargement des données client:", err);
        setError("Impossible de charger vos données. Veuillez réessayer plus tard.");
      } finally {
        setIsLoading(false);
      }
    };

    if (!loading && user) {
      fetchClientData();
    }
  }, [user, loading]);

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
        <p className="text-muted-foreground">Bienvenue dans votre espace client, {user.displayName || user.email}.</p>
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="bg-destructive/10 text-destructive p-4 rounded-md">{error}</div>
        ) : (
          <>
            {/* Cartes de statistiques */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total factures</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalInvoices}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Factures payées</CardTitle>
                  <Badge variant="outline" className="bg-green-100 text-green-800">{stats.paidInvoices}</Badge>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatAmount(stats.paidAmount)}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Factures en attente</CardTitle>
                  <Badge variant="outline" className="bg-yellow-100 text-yellow-800">{stats.pendingInvoices}</Badge>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatAmount(stats.pendingAmount)}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Factures en retard</CardTitle>
                  <Badge variant="outline" className="bg-red-100 text-red-800">{stats.overdueInvoices}</Badge>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatAmount(stats.pendingAmount)}</div>
                </CardContent>
              </Card>
            </div>
            
            {/* Liste des dernières factures */}
            <Card>
              <CardHeader>
                <CardTitle>Mes dernières factures</CardTitle>
                <CardDescription>
                  Consultez vos factures récentes et leur statut. Cliquez sur une facture pour la télécharger.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {invoices.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Aucune facture trouvée.
                  </div>
                ) : (
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
                      {invoices.slice(0, 5).map((invoice) => (
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
                )}
                
                {invoices.length > 5 && (
                  <div className="mt-4 text-center">
                    <Button variant="outline" onClick={() => router.push('/client/invoices')}>
                      Voir toutes mes factures
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </ClientLayout>
  );
}
