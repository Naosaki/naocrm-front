"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { signIn } from "@/lib/auth";
import { useAuth } from "@/lib/context/AuthContext";
import { Loader2 } from "lucide-react";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { user, loading } = useAuth();

  // Rediriger si l'utilisateur est déjà connecté
  useEffect(() => {
    if (!loading && user) {
      if (user.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/client');
      }
    }
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const userData = await signIn(email, password);
      // Redirection manuelle vers le bon dashboard en fonction du rôle
      if (userData && 'role' in userData) {
        if (userData.role === 'admin') {
          router.push('/admin');
        } else {
          router.push('/client');
        }
      }
      // Si pas de rôle, la redirection sera gérée par le useEffect ci-dessus
    } catch (err: unknown) {
      console.error('Erreur de connexion:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la connexion. Veuillez réessayer.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold">Bienvenue</h1>
                <p className="text-muted-foreground text-balance">
                  Connectez-vous à votre espace CRM
                </p>
              </div>
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="exemple@domaine.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password">Mot de passe</Label>
                  <a
                    href="/reset-password"
                    className="ml-auto text-sm underline-offset-2 hover:underline"
                  >
                    Mot de passe oublié?
                  </a>
                </div>
                <Input 
                  id="password" 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connexion en cours...
                  </>
                ) : (
                  'Se connecter'
                )}
              </Button>
              <div className="text-center text-sm">
                Cette plateforme est réservée aux clients et administrateurs.
              </div>
            </div>
          </form>
          <div className="bg-muted relative hidden md:block">
            <div className="absolute inset-0 h-full w-full">
              <Image
                src="/next.svg"
                alt="CRM Portal"
                fill
                className="object-contain p-8 dark:brightness-[0.8]"
                priority
              />
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        En vous connectant, vous acceptez nos <a href="#">Conditions d&apos;utilisation</a>{" "}
        et notre <a href="#">Politique de confidentialité</a>.
      </div>
    </div>
  );
}
