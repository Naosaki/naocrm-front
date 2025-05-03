"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { signOut } from '@/lib/auth';
import {
  FileTextIcon,
  HomeIcon,
  UserIcon,
  LogOutIcon,
  SettingsIcon,
  HelpCircleIcon,
  LayoutDashboardIcon,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarInset,
  SidebarProvider,
  useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MenuIcon } from "lucide-react";
import Image from 'next/image';
import { useSettingsStore } from '@/lib/store/settingsStore';

interface ClientLayoutProps {
  children: React.ReactNode;
}

// Items de navigation pour le client
const navItems = [
  {
    title: "Tableau de bord",
    url: "/user-dashboard",
    icon: LayoutDashboardIcon,
  },
  {
    title: "Mes factures",
    url: "/user-dashboard/invoices",
    icon: FileTextIcon,
  },
  {
    title: "Mon profil",
    url: "/user-dashboard/profile",
    icon: UserIcon,
  },
];

// Items secondaires
const secondaryNavItems = [
  {
    title: "Paramètres",
    url: "/user-dashboard/settings",
    icon: SettingsIcon,
  },
  {
    title: "Aide",
    url: "/user-dashboard/help",
    icon: HelpCircleIcon,
  },
];

// Header pour le client
function ClientHeader() {
  const { setOpen } = useSidebar();

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 lg:px-6">
      <Button
        variant="outline"
        size="icon"
        className="lg:hidden"
        onClick={() => setOpen(true)}
      >
        <MenuIcon className="h-5 w-5" />
      </Button>
      <div className="flex flex-1 items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold">Espace Client</h1>
        </div>
      </div>
    </header>
  );
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { logo } = useSettingsStore();

  // Rediriger vers la page de connexion si l'utilisateur n'est pas authentifié
  React.useEffect(() => {
    if (!loading && !user) {
      console.log("Redirection vers login: utilisateur non authentifié");
      router.push('/login');
    } else if (!loading && user && user.role !== 'client') {
      // Rediriger vers le tableau de bord admin si l'utilisateur est un admin
      console.log(`Redirection vers admin: rôle incorrect (${user?.role} au lieu de client)`);
      router.push('/admin');
    } else if (!loading && user) {
      console.log("Utilisateur client authentifié correctement:", user);
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

  if (!user || user.role !== 'client') {
    return null; // Ne rien afficher pendant la redirection
  }

  return (
    <SidebarProvider>
      <Sidebar variant="inset">
        <SidebarHeader className="flex items-center justify-center py-4 px-6">
          {logo ? (
            <div className="relative w-[200px] h-[60px] -mt-4">
              <Image 
                src={logo} 
                alt="Logo" 
                fill 
                className="object-contain" 
                priority
              />
            </div>
          ) : (
            <>
              <HomeIcon className="h-6 w-6" />
              <span className="text-xl font-bold">Espace Client</span>
            </>
          )}
        </SidebarHeader>
        <SidebarContent className="flex flex-col gap-6">
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuButton
                key={item.title}
                onClick={() => router.push(item.url)}
                className="flex items-center justify-start gap-2"
              >
                <item.icon className="h-5 w-5" />
                <span>{item.title}</span>
              </SidebarMenuButton>
            ))}
          </SidebarMenu>
          <SidebarMenu className="mt-auto">
            {secondaryNavItems.map((item) => (
              <SidebarMenuButton
                key={item.title}
                onClick={() => router.push(item.url)}
                className="flex items-center justify-start gap-2"
              >
                <item.icon className="h-5 w-5" />
                <span>{item.title}</span>
              </SidebarMenuButton>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="border-t p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.photoURL || ''} alt={user.displayName || user.email || 'Client'} />
                <AvatarFallback>{user.displayName?.[0] || user.email?.[0] || 'C'}</AvatarFallback>
              </Avatar>
              <div className="space-y-0.5">
                <p className="text-sm font-medium">{user.displayName || user.email}</p>
                <p className="text-xs text-muted-foreground">Client</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={handleSignOut}>
              <LogOutIcon className="h-5 w-5" />
            </Button>
          </div>
        </SidebarFooter>
      </Sidebar>
      
      <SidebarInset>
        <ClientHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                {children}
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
