"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/AuthContext";
import ClientLayout from "@/components/layout/ClientLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ThirdParty } from "@/types";
import { getThirdPartyById } from "@/lib/services/thirdPartyService";
import { formatPhoneNumber } from "@/lib/utils/phone-utils";
import { formatDate } from "@/lib/utils/date-utils";

export default function ClientProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [clientInfo, setClientInfo] = useState<ThirdParty | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Redirection si l'utilisateur n'est pas authentifiu00e9 ou n'est pas client
  useEffect(() => {
    // N'effectuer la redirection que si le chargement est terminu00e9
    if (loading) {
      return;
    }
    
    // Redirection vers login si non authentifiu00e9
    if (!user) {
      router.push("/login");
      return;
    }
    
    // Redirection vers admin si l'utilisateur est explicitement admin
    if (user.role === "admin") {
      router.push("/admin");
      return;
    }
    
    // Si l'utilisateur est client ou si le ru00f4le est indu00e9fini, on reste sur cette page
  }, [user, loading, router]);

  // Charger les informations du client
  useEffect(() => {
    const fetchClientInfo = async () => {
      if (!user || !user.thirdPartyId) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        // Ru00e9cupu00e9rer les informations du client
        const thirdPartyData = await getThirdPartyById(user.thirdPartyId);
        setClientInfo(thirdPartyData);
      } catch (err) {
        console.error("Erreur lors du chargement des informations client:", err);
        setError("Impossible de charger vos informations. Veuillez ru00e9essayer plus tard.");
      } finally {
        setIsLoading(false);
      }
    };

    if (!loading && user) {
      fetchClientInfo();
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
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Mon profil</h1>
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
          <div className="grid gap-6 md:grid-cols-2">
            {/* Informations utilisateur */}
            <Card>
              <CardHeader>
                <CardTitle>Informations utilisateur</CardTitle>
                <CardDescription>
                  Vos informations de connexion au portail client.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4 mb-6">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'Client'} />
                    <AvatarFallback className="text-xl">{user.displayName?.charAt(0) || user.email?.charAt(0) || 'C'}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-medium">{user.displayName || 'Client'}</h3>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Adresse email</p>
                    <p>{user.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Ru00f4le</p>
                    <p>Client</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Derniu00e8re connexion</p>
                    <p>{user.lastLogin ? formatDate(user.lastLogin) : 'Non disponible'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Compte cru00e9u00e9 le</p>
                    <p>{formatDate(user.createdAt)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Informations entreprise */}
            <Card>
              <CardHeader>
                <CardTitle>Informations entreprise</CardTitle>
                <CardDescription>
                  Les informations de votre entreprise.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {clientInfo ? (
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Nom de l'entreprise</p>
                      <p className="font-medium">{clientInfo.name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Code client</p>
                      <p>{clientInfo.code_client || 'Non disponible'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Email</p>
                      <p>{clientInfo.email || 'Non disponible'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Tu00e9lu00e9phone</p>
                      <p>{clientInfo.phone ? formatPhoneNumber(clientInfo.phone) : 'Non disponible'}</p>
                    </div>
                    
                    <Separator className="my-4" />
                    
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Adresse</p>
                      <p>{clientInfo.address || 'Non disponible'}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Code postal</p>
                        <p>{clientInfo.postalCode || 'Non disponible'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Ville</p>
                        <p>{clientInfo.city || 'Non disponible'}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Pays</p>
                      <p>{clientInfo.country || 'Non disponible'}</p>
                    </div>
                    
                    {clientInfo.contactPerson && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Personne de contact</p>
                        <p>{clientInfo.contactPerson}</p>
                      </div>
                    )}
                    
                    {clientInfo.notes && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Notes</p>
                        <p className="whitespace-pre-line">{clientInfo.notes}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Aucune information d'entreprise disponible.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </ClientLayout>
  );
}
