"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Product } from "@/types"
import { getAllProducts } from "@/lib/services/productService"
import { Button } from "@/components/ui/button"
import { ExternalLink } from "lucide-react"
import { formatDate } from "@/lib/utils/date-utils"

export function ProductsTable() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true)
        const productsData = await getAllProducts()
        // Trier les produits par date de création (les plus récents d'abord)
        productsData.sort((a, b) => {
          const dateA = a.date_creation ? (typeof a.date_creation === 'number' ? a.date_creation : new Date(a.date_creation).getTime() / 1000) : 0
          const dateB = b.date_creation ? (typeof b.date_creation === 'number' ? b.date_creation : new Date(b.date_creation).getTime() / 1000) : 0
          return dateB - dateA
        })
        // Limiter à 5 produits pour l'affichage dans le dashboard
        setProducts(productsData.slice(0, 5))
        setError(null)
      } catch (err) {
        console.error("Erreur lors du chargement des produits:", err)
        setError("Impossible de charger les produits.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()
  }, [])

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle>Produits récents</CardTitle>
          <CardDescription>
            Liste des derniers produits ajoutés
          </CardDescription>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-1"
          onClick={() => router.push('/admin/products')}
        >
          <span>Voir tous</span>
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
        ) : products.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            <p>Aucun produit trouvé.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Référence</TableHead>
                <TableHead>Libellé</TableHead>
                <TableHead>Date de création</TableHead>
                <TableHead className="text-right">Stock réel</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow 
                  key={product.id} 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => router.push(`/admin/products/${product.id}`)}
                >
                  <TableCell className="font-medium">{product.ref || "-"}</TableCell>
                  <TableCell>{product.label || "-"}</TableCell>
                  <TableCell>{formatDate(product.date_creation)}</TableCell>
                  <TableCell className="text-right">
                    <span className={`font-medium ${(product.stock_reel || 0) <= 5 ? 'text-red-500' : (product.stock_reel || 0) <= 20 ? 'text-amber-500' : 'text-green-500'}`}>
                      {product.stock_reel || 0}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
