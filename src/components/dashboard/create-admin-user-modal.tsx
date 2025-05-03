"use client";

import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { createAdminUser } from "@/lib/services/userService";

interface CreateAdminUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserCreated: () => void;
}

// Schéma de validation pour le formulaire de création d'administrateur
const createAdminSchema = z.object({
  email: z.string().email({ message: "Adresse email invalide" }),
  password: z.string().min(6, { message: "Le mot de passe doit contenir au moins 6 caractères" }),
  displayName: z.string().min(1, { message: "Le nom d'affichage est requis" }),
});

export function CreateAdminUserModal({ isOpen, onClose, onUserCreated }: CreateAdminUserModalProps) {
  const [creatingUser, setCreatingUser] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Formulaire pour la création d'administrateur
  const createAdminForm = useForm<z.infer<typeof createAdminSchema>>({
    resolver: zodResolver(createAdminSchema),
    defaultValues: {
      email: "",
      password: "",
      displayName: "",
    },
  });

  // Réinitialiser le formulaire et l'état lors de la fermeture de la modal
  const handleClose = () => {
    setError(null);
    setSuccess(null);
    createAdminForm.reset();
    onClose();
  };

  // Créer un compte administrateur
  const handleCreateAdmin = async (values: z.infer<typeof createAdminSchema>) => {
    try {
      setCreatingUser(true);
      setError(null);
      setSuccess(null);
      
      // Créer l'utilisateur administrateur
      await createAdminUser(
        values.email,
        values.password,
        values.displayName
      );
      
      setSuccess(`Compte administrateur créé avec succès pour ${values.displayName}`);
      onUserCreated();
      
      // Réinitialiser après 2 secondes et fermer la modal
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (err: unknown) {
      console.error("Erreur lors de la création de l'administrateur:", err);
      
      // Gérer les erreurs spécifiques de Firebase Auth
      const firebaseError = err as { code?: string };
      if (firebaseError.code === "auth/email-already-in-use") {
        setError("Cette adresse email est déjà utilisée");
      } else if (firebaseError.code === "auth/invalid-email") {
        setError("Adresse email invalide");
      } else if (firebaseError.code === "auth/weak-password") {
        setError("Le mot de passe est trop faible");
      } else {
        setError("Une erreur est survenue lors de la création du compte administrateur");
      }
    } finally {
      setCreatingUser(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Créer un compte administrateur</DialogTitle>
          <DialogDescription>
            Créez un nouveau compte administrateur qui aura accès à toutes les fonctionnalités du portail.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erreur</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert variant="default" className="bg-green-50 text-green-800 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle>Succès</AlertTitle>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <Form {...createAdminForm}>
          <form onSubmit={createAdminForm.handleSubmit(handleCreateAdmin)} className="space-y-4">
            <FormField
              control={createAdminForm.control}
              name="displayName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom d&apos;affichage</FormLabel>
                  <FormControl>
                    <Input placeholder="Nom d&apos;affichage" {...field} />
                  </FormControl>
                  <FormDescription>
                    Nom qui sera affiché dans l&apos;interface.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={createAdminForm.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Adresse email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="email@exemple.com" {...field} />
                  </FormControl>
                  <FormDescription>
                    L&apos;adresse email sera utilisée pour se connecter.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={createAdminForm.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mot de passe</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="******" {...field} />
                  </FormControl>
                  <FormDescription>
                    Minimum 6 caractères.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Annuler
              </Button>
              <Button type="submit" disabled={creatingUser}>
                {creatingUser && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Créer le compte
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
