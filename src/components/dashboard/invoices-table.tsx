"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink } from "lucide-react"
import { Invoice } from "@/types"
import { getAllInvoicesWithClientInfo } from "@/lib/services/invoiceService"
import { formatDate } from "@/lib/utils/date-utils"

export function InvoicesTable() {
  const router = useRouter()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        setIsLoading(true)
        const invoicesData = await getAllInvoicesWithClientInfo()
        // Trier les factures par date (les plus récentes d'abord)
        invoicesData.sort((a, b) => {
          const dateA = a.date instanceof Date ? a.date.getTime() : new Date(a.date || 0).getTime()
          const dateB = b.date instanceof Date ? b.date.getTime() : new Date(b.date || 0).getTime()
          return dateB - dateA
        })
        // Limiter à 5 factures pour l'affichage dans le dashboard
        setInvoices(invoicesData.slice(0, 5))
        setError(null)
      } catch (err) {
        console.error("Erreur lors du chargement des factures:", err)
        setError("Impossible de charger les factures.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchInvoices()
  }, [])
  
  // Fonction pour formater le montant
  const formatAmount = (amount: number | null | undefined) => {
    if (amount === null || amount === undefined) return "-"
    
    try {
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR'
      }).format(amount)
    } catch (error) {
      console.error("Erreur lors du formatage du montant:", error)
      return "-"
    }
  }

  // Fonction pour déterminer la couleur du badge en fonction du statut
  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
      case "sent":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100"
      case "overdue":
        return "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"
      case "draft":
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100"
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100"
    }
  }

  // Fonction pour traduire le statut en français
  const translateStatus = (status: string) => {
    switch (status) {
      case "paid":
        return "Payée"
      case "sent":
        return "Envoyée"
      case "overdue":
        return "En retard"
      case "draft":
        return "Brouillon"
      case "cancelled":
        return "Annulée"
      default:
        return status
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle>Factures récentes</CardTitle>
          <CardDescription>
            Liste des dernières factures émises
          </CardDescription>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-1"
          onClick={() => router.push('/admin/invoices')}
        >
          <span>Voir toutes</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-6">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="text-center py-4 text-red-500">{error}</div>
        ) : invoices.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            <p>Aucune facture trouvée.</p>
          </div>
        ) : (
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow 
                  key={invoice.id} 
                  className={`hover:bg-muted/50 ${invoice.pdfUrl ? 'cursor-pointer' : ''}`}
                  onClick={() => invoice.pdfUrl ? window.open(invoice.pdfUrl, '_blank') : null}
                >
                  <TableCell className="font-medium">{invoice.number || invoice.id}</TableCell>
                  <TableCell className="font-medium text-primary">{invoice.thirdPartyName || "-"}</TableCell>
                  <TableCell>{invoice.ref_client || "-"}</TableCell>
                  <TableCell>{formatDate(invoice.date_validation || invoice.date)}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(invoice.status)} variant="outline">
                      {translateStatus(invoice.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">{formatAmount(invoice.multicurrency_total_ht || invoice.subtotal)}</TableCell>
                  <TableCell className="text-right">{formatAmount(invoice.multicurrency_total_ttc || invoice.total)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
