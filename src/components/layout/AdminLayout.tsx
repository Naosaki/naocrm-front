"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { signOut } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Home, Users, FileText, Package, BarChart2, LogOut, Menu, Settings } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useSettingsStore } from '@/lib/store/settingsStore';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { logo } = useSettingsStore();

  // Rediriger vers la page de connexion si l'utilisateur n'est pas authentifié
  React.useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (!loading && user && user.role !== 'admin') {
      // Rediriger vers le tableau de bord client si l'utilisateur n'est pas un admin
      router.push('/user-dashboard');
    }
  }, [user, loading, router]);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/login');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return null; // Ne rien afficher pendant la redirection
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar pour desktop */}
      <aside className="hidden md:flex flex-col w-64 border-r bg-card">
        <div className="p-6 border-b flex flex-col items-center">
          {logo ? (
            <div className="relative w-[200px] h-[60px] -mt-4 mb-2">
              <Image 
                src={logo} 
                alt="Logo" 
                fill
                className="object-contain"
                priority
              />
            </div>
          ) : (
            <h1 className="text-2xl font-bold">CRM Admin</h1>
          )}
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/admin" className="flex items-center p-2 rounded-md hover:bg-accent">
            <Home className="mr-2 h-5 w-5" />
            <span>Tableau de bord</span>
          </Link>
          <Link href="/admin/clients" className="flex items-center p-2 rounded-md hover:bg-accent">
            <Users className="mr-2 h-5 w-5" />
            <span>Clients</span>
          </Link>
          <Link href="/admin/invoices" className="flex items-center p-2 rounded-md hover:bg-accent">
            <FileText className="mr-2 h-5 w-5" />
            <span>Factures</span>
          </Link>
          <Link href="/admin/products" className="flex items-center p-2 rounded-md hover:bg-accent">
            <Package className="mr-2 h-5 w-5" />
            <span>Produits</span>
          </Link>
          <Link href="/admin/reports" className="flex items-center p-2 rounded-md hover:bg-accent">
            <BarChart2 className="mr-2 h-5 w-5" />
            <span>Rapports</span>
          </Link>
          <Link href="/admin/settings" className="flex items-center p-2 rounded-md hover:bg-accent">
            <Settings className="mr-2 h-5 w-5" />
            <span>Paramètres</span>
          </Link>
        </nav>
        <div className="p-4 border-t">
          <Button variant="outline" className="w-full justify-start" onClick={handleSignOut}>
            <LogOut className="mr-2 h-5 w-5" />
            <span>Déconnexion</span>
          </Button>
        </div>
      </aside>

      {/* Contenu principal */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 border-b flex items-center justify-between px-6">
          {/* Menu mobile */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64">
              <div className="p-6 border-b flex flex-col items-center">
                {logo ? (
                  <div className="relative w-[200px] h-[60px] -mt-4 mb-2">
                    <Image 
                      src={logo} 
                      alt="Logo" 
                      fill
                      className="object-contain"
                      priority
                    />
                  </div>
                ) : (
                  <h1 className="text-2xl font-bold">CRM Admin</h1>
                )}
              </div>
              <nav className="flex-1 p-4 space-y-2">
                <Link href="/admin" className="flex items-center p-2 rounded-md hover:bg-accent">
                  <Home className="mr-2 h-5 w-5" />
                  <span>Tableau de bord</span>
                </Link>
                <Link href="/admin/clients" className="flex items-center p-2 rounded-md hover:bg-accent">
                  <Users className="mr-2 h-5 w-5" />
                  <span>Clients</span>
                </Link>
                <Link href="/admin/invoices" className="flex items-center p-2 rounded-md hover:bg-accent">
                  <FileText className="mr-2 h-5 w-5" />
                  <span>Factures</span>
                </Link>
                <Link href="/admin/products" className="flex items-center p-2 rounded-md hover:bg-accent">
                  <Package className="mr-2 h-5 w-5" />
                  <span>Produits</span>
                </Link>
                <Link href="/admin/reports" className="flex items-center p-2 rounded-md hover:bg-accent">
                  <BarChart2 className="mr-2 h-5 w-5" />
                  <span>Rapports</span>
                </Link>
                <Link href="/admin/settings" className="flex items-center p-2 rounded-md hover:bg-accent">
                  <Settings className="mr-2 h-5 w-5" />
                  <span>Paramètres</span>
                </Link>
              </nav>
              <div className="p-4 border-t">
                <Button variant="outline" className="w-full justify-start" onClick={handleSignOut}>
                  <LogOut className="mr-2 h-5 w-5" />
                  <span>Déconnexion</span>
                </Button>
              </div>
            </SheetContent>
          </Sheet>

          {/* Profil utilisateur */}
          <div className="ml-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar>
                    <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'Admin'} />
                    <AvatarFallback>{user.displayName?.charAt(0) || 'A'}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{user.displayName || user.email}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/admin/profile">Profil</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/admin/settings">Paramètres</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>Déconnexion</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Contenu de la page */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
