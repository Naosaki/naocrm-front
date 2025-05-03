"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import {
  FileTextIcon,
  HomeIcon,
  LayoutDashboardIcon,
  PackageIcon,
  UsersIcon,
  LogOutIcon,
  SettingsIcon,
  HelpCircleIcon,
  UserPlusIcon,
  UserCogIcon,
} from "lucide-react"
import { useAuth } from "@/lib/context/AuthContext"
import { useSettingsStore } from "@/lib/store/settingsStore"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { signOut } from "@/lib/auth"

const navItems = [
  {
    title: "Tableau de bord",
    url: "/admin",
    icon: LayoutDashboardIcon,
  },
  {
    title: "Clients",
    url: "/admin/clients",
    icon: UsersIcon,
  },
  {
    title: "Prospects",
    url: "/admin/prospects",
    icon: UserPlusIcon,
  },
  {
    title: "Factures",
    url: "/admin/invoices",
    icon: FileTextIcon,
  },
  {
    title: "Produits",
    url: "/admin/products",
    icon: PackageIcon,
  },
  {
    title: "Utilisateurs",
    url: "/admin/users",
    icon: UserCogIcon,
  },
]

const secondaryNavItems = [
  {
    title: "Paramètres",
    url: "/admin/settings",
    icon: SettingsIcon,
  },
  {
    title: "Aide",
    url: "/admin/help",
    icon: HelpCircleIcon,
  },
]

export function AppSidebar({ className, ...props }: React.ComponentProps<typeof Sidebar>) {
  const router = useRouter()
  const { user, loading } = useAuth()
  const { logo } = useSettingsStore()
  
  const handleSignOut = async () => {
    try {
      await signOut()
      router.push("/login")
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error)
    }
  }

  if (loading || !user) {
    return null
  }

  return (
    <Sidebar className={className} {...props}>
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
          <HomeIcon className="h-10 w-10" />
        )}
        {/* Suppression du texte "CRM Portal" */}
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
              <AvatarImage src="/placeholder-user.jpg" alt={user?.displayName || user?.email || 'Utilisateur'} />
              <AvatarFallback>{user?.displayName?.[0] || user?.email?.[0] || 'U'}</AvatarFallback>
            </Avatar>
            <div className="space-y-0.5">
              <p className="text-sm font-medium">{user?.displayName || user?.email}</p>
              <p className="text-xs text-muted-foreground">{user?.role === 'admin' ? 'Administrateur' : 'Client'}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={handleSignOut}>
            <LogOutIcon className="h-5 w-5" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
