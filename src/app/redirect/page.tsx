"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/AuthContext";
import { Loader2 } from "lucide-react";

export default function RedirectPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Redirection automatique en fonction du ru00f4le de l'utilisateur
  useEffect(() => {
    console.log("Page de redirection - u00c9tat utilisateur:", { loading, role: user?.role });
    
    // Attendre que les donnu00e9es utilisateur soient chargu00e9es
    if (loading) {
      console.log("Chargement en cours, attente avant redirection");
      return;
    }
    
    // Redirection vers login si non authentifiu00e9
    if (!user) {
      console.log("Redirection vers login: utilisateur non authentifiu00e9");
      router.push("/login");
      return;
    }
    
    // Redirection en fonction du ru00f4le
    if (user.role === "admin") {
      console.log("Redirection vers dashboard admin");
      router.push("/admin");
    } else {
      console.log("Redirection vers dashboard utilisateur");
      router.push("/user-dashboard");
    }
  }, [user, loading, router]);

  // Afficher un u00e9cran de chargement pendant la redirection
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-lg text-muted-foreground">Redirection en cours...</p>
      </div>
    </div>
  );
}
