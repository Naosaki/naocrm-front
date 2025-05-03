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
import { createClientUser } from "@/lib/services/userService";
import { checkClientCodeExists, checkClientHasUser } from "@/lib/services/userService";

interface CreateClientUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserCreated: () => void;
}

// Schéma de validation pour le formulaire de vérification du code client
const clientCodeSchema = z.object({
  clientCode: z.string().min(1, { message: "Le code client est requis" }),
});

// Schéma de validation pour le formulaire de création d'utilisateur
const createUserSchema = z.object({
  email: z.string().email({ message: "Adresse email invalide" }),
  password: z.string().min(6, { message: "Le mot de passe doit contenir au moins 6 caractères" }),
  displayName: z.string().min(1, { message: "Le nom d'affichage est requis" }),
});

export function CreateClientUserModal({ isOpen, onClose, onUserCreated }: CreateClientUserModalProps) {
  const [step, setStep] = useState<"check" | "create">("check");
  const [clientCode, setClientCode] = useState("");
  const [thirdPartyId, setThirdPartyId] = useState("");
  const [thirdPartyName, setThirdPartyName] = useState("");
  const [checkingCode, setCheckingCode] = useState(false);
  const [creatingUser, setCreatingUser] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Formulaire pour la vérification du code client
  const clientCodeForm = useForm<z.infer<typeof clientCodeSchema>>({
    resolver: zodResolver(clientCodeSchema),
    defaultValues: {
      clientCode: "",
    },
  });

  // Formulaire pour la création d'utilisateur
  const createUserForm = useForm<z.infer<typeof createUserSchema>>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      email: "",
      password: "",
      displayName: "",
    },
  });

  // Réinitialiser le formulaire et l'état lors de la fermeture de la modal
  const handleClose = () => {
    setStep("check");
    setClientCode("");
    setThirdPartyId("");
    setThirdPartyName("");
    setError(null);
    setSuccess(null);
    clientCodeForm.reset();
    createUserForm.reset();
    onClose();
  };

  // Vérifier si le code client existe
  const handleCheckClientCode = async (values: z.infer<typeof clientCodeSchema>) => {
    try {
      setCheckingCode(true);
      setError(null);
      
      // Vérifier si le code client existe
      const result = await checkClientCodeExists(values.clientCode);
      
      if (!result.exists) {
        setError(`Aucun client trouvé avec le code ${values.clientCode}`);
        return;
      }
      
      // Vérifier si le client a déjà un compte utilisateur
      const hasUser = await checkClientHasUser(values.clientCode);
      if (hasUser) {
        setError(`Le client avec le code ${values.clientCode} a déjà un compte utilisateur`);
        return;
      }
      
      // Si tout est bon, passer à l'étape de création d'utilisateur
      setClientCode(values.clientCode);
      setThirdPartyId(result.thirdPartyId || "");
      setThirdPartyName(result.thirdPartyName || "");
      setStep("create");
      
      // Préremplir le nom d'affichage avec le nom du client
      if (result.thirdPartyName) {
        createUserForm.setValue("displayName", result.thirdPartyName);
      }
    } catch (err) {
      console.error("Erreur lors de la vérification du code client:", err);
      setError("Une erreur est survenue lors de la vérification du code client");
    } finally {
      setCheckingCode(false);
    }
  };

  // Créer un compte utilisateur pour le client
  const handleCreateUser = async (values: z.infer<typeof createUserSchema>) => {
    try {
      setCreatingUser(true);
      setError(null);
      setSuccess(null);
      
      // Créer l'utilisateur
      await createClientUser(
        values.email,
        values.password,
        values.displayName,
        thirdPartyId
      );
      
      setSuccess(`Compte utilisateur créé avec succès pour ${thirdPartyName}`);
      onUserCreated();
      
      // Réinitialiser après 2 secondes et fermer la modal
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (err: unknown) {
      console.error("Erreur lors de la création de l'utilisateur:", err);
      
      // Gérer les erreurs spécifiques de Firebase Auth
      const firebaseError = err as { code?: string };
      if (firebaseError.code === "auth/email-already-in-use") {
        setError("Cette adresse email est déjà utilisée");
      } else if (firebaseError.code === "auth/invalid-email") {
        setError("Adresse email invalide");
      } else if (firebaseError.code === "auth/weak-password") {
        setError("Le mot de passe est trop faible");
      } else {
        setError("Une erreur est survenue lors de la création du compte utilisateur");
      }
    } finally {
      setCreatingUser(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {step === "check" ? "Vérifier le code client" : "Créer un compte utilisateur"}
          </DialogTitle>
          <DialogDescription>
            {step === "check" 
              ? "Entrez le code client pour vérifier s'il existe et créer un compte utilisateur."
              : `Création d'un compte pour le client ${thirdPartyName} (${clientCode})`
            }
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

        {step === "check" ? (
          <Form {...clientCodeForm}>
            <form onSubmit={clientCodeForm.handleSubmit(handleCheckClientCode)} className="space-y-4">
              <FormField
                control={clientCodeForm.control}
                name="clientCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Code client</FormLabel>
                    <FormControl>
                      <Input placeholder="Entrez le code client" {...field} />
                    </FormControl>
                    <FormDescription>
                      Le code client se trouve dans la fiche client (champ &quot;code_client&quot;).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleClose}>
                  Annuler
                </Button>
                <Button type="submit" disabled={checkingCode}>
                  {checkingCode && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Vérifier
                </Button>
              </DialogFooter>
            </form>
          </Form>
        ) : (
          <Form {...createUserForm}>
            <form onSubmit={createUserForm.handleSubmit(handleCreateUser)} className="space-y-4">
              <FormField
                control={createUserForm.control}
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
                control={createUserForm.control}
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
                control={createUserForm.control}
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
                <Button type="button" variant="outline" onClick={() => setStep("check")}>
                  Retour
                </Button>
                <Button type="submit" disabled={creatingUser}>
                  {creatingUser && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Créer le compte
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
