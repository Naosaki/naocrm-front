"use client"

import { useAuth } from "@/lib/context/AuthContext";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";

export default function AadminLayout({children}: {children: React.ReactNode}){
    const { user, loading } = useAuth();
    const router = useRouter()
    const pathname = usePathname()  

    console.error({user})

    if(!user && !loading){
        router.push("/login")
    }

    //Gestion des redirection des roles
    if(user && !loading && user.role === "admin" && !pathname.includes("admin")){
        router.push("/admin")
    }

    if(user && !loading && user.role === "client" && !pathname.includes("user-dashboard")){
        router.push("/user-dashboard")
    }

    if (loading || !user) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      );
    }
    
    return children
}