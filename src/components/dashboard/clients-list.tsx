"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ThirdParty } from "@/types";
import { getAllThirdParties } from "@/lib/services/thirdPartyService";
import { PlusCircle, ExternalLink } from "lucide-react";
import { formatPhoneNumber } from "@/lib/utils/phone-utils";

export function ClientsList() {
  const [clients, setClients] = useState<ThirdParty[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchClients = async () => {
      try {
        setIsLoading(true);
        const clientsData = await getAllThirdParties();
        // Trier les clients par nom
        clientsData.sort((a, b) => a.name.localeCompare(b.name));
        // Limiter à 5 clients pour l'affichage dans le dashboard
        setClients(clientsData.slice(0, 5));
        setError(null);
      } catch (err) {
        console.error("Erreur lors du chargement des clients:", err);
        setError("Impossible de charger les clients.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchClients();
  }, []);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>Clients récents</CardTitle>
          <CardDescription>
            Liste des derniers clients ajoutés
          </CardDescription>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-1"
          onClick={() => router.push('/admin/clients')}
        >
          <span>Voir tous</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="text-center py-4 text-red-500">{error}</div>
        ) : clients.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            <p>Aucun client trouvé.</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2 flex items-center gap-1 mx-auto"
              onClick={() => router.push('/admin/clients')}
            >
              <PlusCircle className="h-3.5 w-3.5" />
              <span>Ajouter un client</span>
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Téléphone</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((client) => (
                <TableRow 
                  key={client.id} 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => router.push(`/admin/clients/${client.id}`)}
                >
                  <TableCell className="font-medium">{client.name}</TableCell>
                  <TableCell>{client.email}</TableCell>
                  <TableCell>{formatPhoneNumber(client.phone) || "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
