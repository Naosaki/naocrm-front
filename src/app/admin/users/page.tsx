"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/AuthContext";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { SiteHeader } from "@/components/dashboard/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { User } from "@/types";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2, UserCog, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils/date-utils";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import { getAllClientUsers, getAllAdminUsers, deleteUser } from "@/lib/services/userService";
import { getClientCodeById } from "@/lib/services/thirdPartyService";
import { CreateClientUserModal } from "@/components/dashboard/create-client-user-modal";
import { CreateAdminUserModal } from "@/components/dashboard/create-admin-user-modal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "@/components/ui/use-toast";

export default function UsersPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [adminUsers, setAdminUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreateAdminModalOpen, setIsCreateAdminModalOpen] = useState(false);
  const [clientCodes, setClientCodes] = useState<Record<string, string>>({});
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState<"clients" | "admins">("clients");
  
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

  // Charger les utilisateurs depuis Firestore
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        const clientUsers = await getAllClientUsers();
        const adminUsersData = await getAllAdminUsers();
        setUsers(clientUsers);
        setAdminUsers(adminUsersData);
        
        // Récupérer les codes clients pour chaque utilisateur
        const codes: Record<string, string> = {};
        for (const user of clientUsers) {
          if (user.thirdPartyId) {
            const clientCode = await getClientCodeById(user.thirdPartyId);
            if (clientCode) {
              codes[user.thirdPartyId] = clientCode;
            }
          }
        }
        setClientCodes(codes);
        
        setError(null);
      } catch (err) {
        console.error("Erreur lors du chargement des utilisateurs:", err);
        setError("Impossible de charger les utilisateurs. Veuillez réessayer plus tard.");
      } finally {
        setIsLoading(false);
      }
    };

    if (!loading && user) {
      fetchUsers();
    }
  }, [loading, user]);
  
  // Rafraîchir la liste des utilisateurs après création
  const handleUserCreated = async () => {
    try {
      setIsLoading(true);
      const clientUsers = await getAllClientUsers();
      const adminUsersData = await getAllAdminUsers();
      setUsers(clientUsers);
      setAdminUsers(adminUsersData);
      
      // Récupérer les codes clients pour chaque utilisateur
      const codes: Record<string, string> = {};
      for (const user of clientUsers) {
        if (user.thirdPartyId) {
          const clientCode = await getClientCodeById(user.thirdPartyId);
          if (clientCode) {
            codes[user.thirdPartyId] = clientCode;
          }
        }
      }
      setClientCodes(codes);
      
      setError(null);
    } catch (err) {
      console.error("Erreur lors du rafraîchissement des utilisateurs:", err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Changer de page
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  // Changer le nombre d'éléments par page
  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1); // Revenir à la première page lors du changement de taille
  };
  
  // Supprimer un utilisateur
  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    
    try {
      setIsDeleting(true);
      await deleteUser(userToDelete.id);
      
      // Mettre à jour la liste des utilisateurs après la suppression
      if (activeTab === "clients") {
        setUsers(users.filter(u => u.id !== userToDelete.id));
      } else {
        setAdminUsers(adminUsers.filter(u => u.id !== userToDelete.id));
      }
      
      // Afficher un message de succès
      toast({
        title: "Utilisateur supprimé",
        description: `Le compte de ${userToDelete.displayName || userToDelete.email} a été supprimé avec succès.`,
      });
      
      // Fermer la boîte de dialogue
      setIsDeleteDialogOpen(false);
      setUserToDelete(null);
    } catch (err) {
      console.error("Erreur lors de la suppression de l'utilisateur:", err);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression de l'utilisateur.",
      });
    } finally {
      setIsDeleting(false);
    }
  };
  
  // Ouvrir la boîte de dialogue de confirmation de suppression
  const openDeleteDialog = (user: User) => {
    setUserToDelete(user);
    setIsDeleteDialogOpen(true);
  };
  
  // Calculer les utilisateurs à afficher pour la page actuelle
  const paginatedUsers = activeTab === "clients" 
    ? users.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : adminUsers.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Nombre total d'utilisateurs pour la pagination
  const totalUsers = activeTab === "clients" ? users.length : adminUsers.length;

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
                <div className="flex items-center gap-4">
                  <h1 className="text-2xl font-semibold tracking-tight">Utilisateurs</h1>
                  <div className="flex border rounded-md overflow-hidden">
                    <Button 
                      variant={activeTab === "clients" ? "default" : "ghost"}
                      className="rounded-none"
                      onClick={() => setActiveTab("clients")}
                    >
                      Clients
                    </Button>
                    <Button 
                      variant={activeTab === "admins" ? "default" : "ghost"}
                      className="rounded-none"
                      onClick={() => setActiveTab("admins")}
                    >
                      Administrateurs
                    </Button>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {activeTab === "clients" ? (
                    <Button 
                      className="flex items-center gap-2"
                      onClick={() => setIsCreateModalOpen(true)}
                    >
                      <PlusCircle className="h-4 w-4" />
                      Créer un compte client
                    </Button>
                  ) : (
                    <Button 
                      className="flex items-center gap-2"
                      onClick={() => setIsCreateAdminModalOpen(true)}
                    >
                      <UserCog className="h-4 w-4" />
                      Créer un compte admin
                    </Button>
                  )}
                </div>
              </div>
              
              <div className="px-4 lg:px-6">
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {activeTab === "clients" ? "Gestion des comptes clients" : "Gestion des comptes administrateurs"}
                    </CardTitle>
                    <CardDescription>
                      {activeTab === "clients" 
                        ? "Créez et gérez les comptes utilisateurs pour vos clients. Chaque client peut accéder à son propre tableau de bord."
                        : "Gérez les comptes administrateurs qui ont accès à toutes les fonctionnalités du portail."}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                      </div>
                    ) : error ? (
                      <div className="text-center py-8 text-red-500">{error}</div>
                    ) : (activeTab === "clients" && users.length === 0) || (activeTab === "admins" && adminUsers.length === 0) ? (
                      <div className="text-center py-8 text-muted-foreground">
                        {activeTab === "clients" 
                          ? "Aucun compte client trouvé. Créez votre premier compte client en cliquant sur le bouton ci-dessus."
                          : "Aucun compte administrateur trouvé. Créez votre premier compte administrateur en cliquant sur le bouton ci-dessus."}
                      </div>
                    ) : (
                      <>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Nom</TableHead>
                              <TableHead>Email</TableHead>
                              {activeTab === "clients" && <TableHead>Client associé</TableHead>}
                              <TableHead>Dernière connexion</TableHead>
                              <TableHead>Créé le</TableHead>
                              <TableHead className="text-center">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {paginatedUsers.map((user) => (
                              <TableRow key={user.id}>
                                <TableCell className="font-medium">{user.displayName || "-"}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                {activeTab === "clients" && (
                                  <TableCell>
                                    {user.thirdPartyId ? (
                                      <Badge variant="outline" className="bg-blue-50 text-blue-700">
                                        {clientCodes[user.thirdPartyId] || user.thirdPartyId}
                                      </Badge>
                                    ) : "-"}
                                  </TableCell>
                                )}
                                <TableCell>{user.lastLogin ? formatDate(user.lastLogin) : "-"}</TableCell>
                                <TableCell>{formatDate(user.createdAt)}</TableCell>
                                <TableCell className="text-center">
                                  <div className="flex justify-center gap-2">
                                    <Button variant="ghost" size="icon">
                                      <UserCog className="h-4 w-4" />
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      className="text-red-500"
                                      onClick={() => openDeleteDialog(user)}
                                    >
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
                          totalItems={totalUsers}
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
      
      {/* Modal pour créer un compte client */}
      <CreateClientUserModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)}
        onUserCreated={handleUserCreated}
      />
      
      {/* Modal pour créer un compte administrateur */}
      <CreateAdminUserModal 
        isOpen={isCreateAdminModalOpen} 
        onClose={() => setIsCreateAdminModalOpen(false)}
        onUserCreated={handleUserCreated}
      />
      
      {/* Boîte de dialogue de confirmation de suppression */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer cet utilisateur ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. L&apos;utilisateur {userToDelete?.displayName || userToDelete?.email} ne pourra plus se connecter à l&apos;application.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteUser} 
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600"
            >
              {isDeleting ? (
                <>
                  <span className="mr-2">Suppression...</span>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                </>
              ) : (
                <>
                  <AlertCircle className="mr-2 h-4 w-4" />
                  Supprimer
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarProvider>
  );
}
