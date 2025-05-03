"use client";

import { useState, useEffect } from "react";
import { ThirdParty } from "@/types";
import { getThirdPartyById } from "@/lib/services/thirdPartyService";
import { getClientInvoiceStats } from "@/lib/services/invoiceService";
import { formatPhoneNumber } from "@/lib/utils/phone-utils";
import { formatAmount, formatDate } from "@/lib/utils/format-utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

interface ClientDetailsModalProps {
  clientId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ClientDetailsModal({ clientId, isOpen, onClose }: ClientDetailsModalProps) {
  const [client, setClient] = useState<ThirdParty | null>(null);
  const [stats, setStats] = useState<{ invoiceCount: number; totalAmount: number }>({ invoiceCount: 0, totalAmount: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClientDetails = async () => {
      if (!clientId) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Récupérer les détails du client
        const clientData = await getThirdPartyById(clientId);
        
        if (clientData) {
          setClient(clientData);
          
          // Récupérer les statistiques des factures du client
          if (clientData.code_client) {
            const clientStats = await getClientInvoiceStats(clientData.code_client);
            setStats(clientStats);
          }
        } else {
          setError("Client non trouvé");
        }
      } catch (err) {
        console.error("Erreur lors du chargement des détails du client:", err);
        setError("Impossible de charger les détails du client. Veuillez réessayer plus tard.");
      } finally {
        setLoading(false);
      }
    };

    if (isOpen && clientId) {
      fetchClientDetails();
    }
  }, [clientId, isOpen]);

  // Réinitialiser les données lorsque la modal se ferme
  useEffect(() => {
    if (!isOpen) {
      setClient(null);
      setStats({ invoiceCount: 0, totalAmount: 0 });
      setError(null);
    }
  }, [isOpen]);

  // Fonction pour afficher les informations non nulles
  const renderClientInfo = () => {
    if (!client) return null;

    // Créer un tableau de toutes les propriétés non nulles du client
    const infoItems: { label: string; value: React.ReactNode }[] = [];

    // Informations de base
    if (client.name) infoItems.push({ label: "Nom", value: client.name });
    if (client.code_client) infoItems.push({ label: "Code client", value: client.code_client });
    if (client.email) infoItems.push({ label: "Email", value: client.email });
    if (client.phone) infoItems.push({ label: "Téléphone", value: formatPhoneNumber(client.phone) });
    
    // Adresse
    if (client.address) infoItems.push({ label: "Adresse", value: client.address });
    if (client.postalCode) infoItems.push({ label: "Code postal", value: client.postalCode });
    if (client.city) infoItems.push({ label: "Ville", value: client.city });
    if (client.country) infoItems.push({ label: "Pays", value: client.country });
    
    // Informations supplémentaires
    if (client.contactPerson) infoItems.push({ label: "Personne de contact", value: client.contactPerson });
    if (client.notes) infoItems.push({ label: "Notes", value: client.notes });
    
    // Dates
    if (client.createdAt) infoItems.push({ label: "Créé le", value: formatDate(client.createdAt) });
    if (client.updatedAt) infoItems.push({ label: "Mis à jour le", value: formatDate(client.updatedAt) });

    return (
      <div className="grid grid-cols-1 gap-6 mt-4">
        {/* Informations de base */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {infoItems.slice(0, 4).map((item, index) => (
            <div key={index} className="flex flex-col space-y-1">
              <span className="text-sm text-muted-foreground">{item.label}</span>
              <span className="font-medium break-words">{item.value}</span>
            </div>
          ))}
        </div>
        
        {/* Adresse */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {infoItems.slice(4, 8).map((item, index) => (
            <div key={index} className="flex flex-col space-y-1">
              <span className="text-sm text-muted-foreground">{item.label}</span>
              <span className="font-medium break-words">{item.value}</span>
            </div>
          ))}
        </div>
        
        {/* Informations supplémentaires et dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {infoItems.slice(8).map((item, index) => (
            <div key={index} className="flex flex-col space-y-1">
              <span className="text-sm text-muted-foreground">{item.label}</span>
              <span className="font-medium break-words">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {loading ? "Chargement..." : error ? "Erreur" : client?.name || "Détails du client"}
          </DialogTitle>
          {!loading && !error && client && (
            <DialogDescription>
              {client.code_client && (
                <span className="font-medium text-primary">{client.code_client}</span>
              )}
            </DialogDescription>
          )}
        </DialogHeader>
        
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">{error}</div>
        ) : client ? (
          <>
            <div className="flex flex-wrap gap-4 mt-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Factures:</span>
                <Badge variant="outline" className="bg-blue-50 text-blue-700">
                  {stats.invoiceCount}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Montant total HT:</span>
                <span className="font-medium">{formatAmount(stats.totalAmount)}</span>
              </div>
            </div>

            <Separator className="my-4" />

            {renderClientInfo()}
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
