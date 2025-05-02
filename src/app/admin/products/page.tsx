"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/AuthContext";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { SiteHeader } from "@/components/dashboard/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { getAllProducts, getProductsStats } from "@/lib/services/productService";
import { Product } from "@/types";
import { Button } from "@/components/ui/button";
import { PlusCircle, Tag, Package, Clipboard } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils/date-utils";

export default function ProductsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStockProducts: 0,
    outOfStockProducts: 0
  });

  // Redirection si l'utilisateur n'est pas authentifié ou n'est pas admin
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    } else if (!loading && user && user.role !== "admin") {
      router.push("/client");
    }
  }, [user, loading, router]);

  // Charger les produits depuis Firestore
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const productsData = await getAllProducts();
        // Trier les produits par date de création (les plus récents d'abord)
        productsData.sort((a, b) => {
          const dateA = a.date_creation ? (typeof a.date_creation === 'number' ? a.date_creation : new Date(a.date_creation).getTime() / 1000) : 0;
          const dateB = b.date_creation ? (typeof b.date_creation === 'number' ? b.date_creation : new Date(b.date_creation).getTime() / 1000) : 0;
          return dateB - dateA;
        });
        setProducts(productsData);
        setError(null);
      } catch (err) {
        console.error("Erreur lors du chargement des produits:", err);
        setError("Impossible de charger les produits. Veuillez réessayer plus tard.");
      } finally {
        setIsLoading(false);
      }
    };

    if (!loading && user) {
      fetchProducts();
    }
  }, [loading, user]);

  // Charger les statistiques
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const productsStats = await getProductsStats();
        setStats(productsStats);
      } catch (err) {
        console.error("Erreur lors du chargement des statistiques:", err);
      }
    };

    if (!loading && user) {
      fetchStats();
    }
  }, [loading, user]);

  // Fonction pour formater le prix (utilisé pour les statistiques)
  const formatPrice = (price: number | undefined) => {
    if (price === undefined) return "-";
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  // Fonction pour obtenir la couleur du badge de stock
  const getStockColor = (stock: number) => {
    if (stock <= 5) return "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100";
    if (stock <= 20) return "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100";
    return "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100";
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
                <h1 className="text-2xl font-semibold tracking-tight">Produits</h1>
                <Button className="flex items-center gap-2" onClick={() => router.push('/admin/products/new')}>
                  <PlusCircle className="h-4 w-4" />
                  Ajouter un produit
                </Button>
              </div>
              
              {/* Statistiques des produits */}
              <div className="grid gap-4 px-4 md:grid-cols-3 lg:px-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total des produits</CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalProducts}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Catégories</CardTitle>
                    <Tag className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {new Set(products.map(p => p.category).filter(Boolean)).size}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Produits en rupture</CardTitle>
                    <Clipboard className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {stats.lowStockProducts}
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="px-4 lg:px-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Liste des produits</CardTitle>
                    <CardDescription>
                      Gérez vos produits et leur stock.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                      </div>
                    ) : error ? (
                      <div className="text-center py-8 text-red-500">{error}</div>
                    ) : products.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        Aucun produit trouvé. Ajoutez votre premier produit en cliquant sur le bouton ci-dessus.
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Référence</TableHead>
                            <TableHead>Libellé</TableHead>
                            <TableHead>Date de création</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead className="text-right">Stock réel</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {products.map((product) => (
                            <TableRow key={product.id} className="cursor-pointer hover:bg-muted/50" onClick={() => router.push(`/admin/products/${product.id}`)}>
                              <TableCell className="font-medium">{product.ref || "-"}</TableCell>
                              <TableCell>{product.label || "-"}</TableCell>
                              <TableCell>{formatDate(product.date_creation)}</TableCell>
                              <TableCell className="max-w-xs truncate">{product.description || "-"}</TableCell>
                              <TableCell className="text-right">
                                <Badge className={getStockColor(product.stock_reel || 0)} variant="outline">
                                  {product.stock_reel || 0}
                                </Badge>
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
