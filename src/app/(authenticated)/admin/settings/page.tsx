"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useSettingsStore } from "@/lib/store/settingsStore"
import { toast } from "sonner"
import { useAuth } from "@/lib/context/AuthContext"
import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { SiteHeader } from "@/components/dashboard/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { uploadFile, generateUniqueFileName } from "@/lib/services/storageService"
import { Loader2 } from "lucide-react"

export default function SettingsPage() {
  const { user, loading } = useAuth()
  const { logo, setLogo, loginImage, setLoginImage } = useSettingsStore()
  const [logoUrl, setLogoUrl] = useState<string>(logo || "")
  const [previewLogo, setPreviewLogo] = useState<string | null>(logo)
  const [loginImageUrl, setLoginImageUrl] = useState<string>(loginImage || "")
  const [previewLoginImage, setPreviewLoginImage] = useState<string | null>(loginImage)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const loginImageInputRef = useRef<HTMLInputElement>(null)

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLogoUrl(e.target.value)
    setPreviewLogo(e.target.value)
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setIsUploading(true)
      const uniqueFileName = generateUniqueFileName(file.name)
      const path = `logos/${uniqueFileName}`
      const downloadURL = await uploadFile(file, path)
      
      setLogoUrl(downloadURL)
      setPreviewLogo(downloadURL)
      toast.success("Logo téléchargé avec succès")
    } catch (error) {
      toast.error("Erreur lors du téléchargement du logo")
      console.error(error)
    } finally {
      setIsUploading(false)
    }
  }

  const handleSave = () => {
    setLogo(logoUrl || null)
    setLoginImage(loginImageUrl || null)
    toast.success("Paramètres enregistrés avec succès")
  }

  const handleReset = () => {
    setLogo(null)
    setLogoUrl("")
    setPreviewLogo(null)
    setLoginImage(null)
    setLoginImageUrl("")
    setPreviewLoginImage(null)
    toast.info("Logo et image de connexion réinitialisés")
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const triggerLoginImageInput = () => {
    loginImageInputRef.current?.click()
  }

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
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
                <h1 className="text-2xl font-semibold tracking-tight">Paramètres</h1>
              </div>
              
              <div className="flex justify-center px-4 lg:px-6">
                <div className="w-full max-w-2xl">
                  <Card>
                    <CardHeader className="text-center">
                      <CardTitle>Personnalisation</CardTitle>
                      <CardDescription>
                        Personnalisez l&#39;apparence de votre portail CRM
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Tabs defaultValue="upload">
                        <TabsList className="grid w-full grid-cols-2 mb-6">
                          <TabsTrigger value="upload">Télécharger un logo</TabsTrigger>
                          <TabsTrigger value="url">URL du logo</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="upload" className="space-y-4">
                          <div className="space-y-2">
                            <Label>Télécharger une image</Label>
                            <div className="flex flex-col items-center justify-center gap-4 p-6 border-2 border-dashed rounded-md">
                              <input 
                                type="file" 
                                ref={fileInputRef}
                                className="hidden" 
                                accept="image/*"
                                onChange={handleFileChange}
                              />
                              <Button 
                                type="button" 
                                variant="outline" 
                                onClick={triggerFileInput}
                                disabled={isUploading}
                                className="w-full max-w-xs"
                              >
                                {isUploading ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Téléchargement...
                                  </>
                                ) : (
                                  "Sélectionner une image"
                                )}
                              </Button>
                              <p className="text-sm text-muted-foreground text-center">
                                PNG, JPG ou GIF. Taille maximale 5MB.
                              </p>
                            </div>
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="url" className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="logo-url">URL du logo</Label>
                            <Input
                              id="logo-url"
                              placeholder="https://exemple.com/logo.png"
                              value={logoUrl}
                              onChange={handleLogoChange}
                            />
                            <p className="text-sm text-muted-foreground">
                              Entrez l&#39;URL d&#39;une image pour l&#39;utiliser comme logo
                            </p>
                          </div>
                        </TabsContent>
                        
                        {previewLogo && (
                          <div className="mt-6 space-y-2">
                            <Label>Aperçu</Label>
                            <div className="flex items-center justify-center gap-4 p-4 rounded-md border">
                              <div className="flex items-center justify-center">
                                <div className="relative w-[200px] h-[60px]">
                                  <Image
                                    src={previewLogo}
                                    alt="Logo preview"
                                    fill
                                    className="object-contain"
                                    onError={() => {
                                      toast.error("Impossible de charger l&#39;image")
                                      setPreviewLogo(null)
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </Tabs>
                      
                      <Tabs defaultValue="upload" className="mt-8">
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="upload">Télécharger une image de connexion</TabsTrigger>
                          <TabsTrigger value="url">URL de l&#39;image</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="upload" className="space-y-4">
                          <div className="space-y-2">
                            <Label>Télécharger une image de connexion</Label>
                            <div className="flex flex-col items-center justify-center gap-4 p-6 border-2 border-dashed rounded-md">
                              <input 
                                type="file" 
                                ref={loginImageInputRef}
                                className="hidden" 
                                accept="image/*"
                                onChange={async (e) => {
                                  const file = e.target.files?.[0]
                                  if (!file) return

                                  try {
                                    setIsUploading(true)
                                    const uniqueFileName = generateUniqueFileName(file.name)
                                    const path = `login-images/${uniqueFileName}`
                                    const downloadURL = await uploadFile(file, path)
                                    
                                    setLoginImageUrl(downloadURL)
                                    setPreviewLoginImage(downloadURL)
                                    toast.success("Image de connexion téléchargée avec succès")
                                  } catch (error) {
                                    toast.error("Erreur lors du téléchargement de l&#39;image de connexion")
                                    console.error(error)
                                  } finally {
                                    setIsUploading(false)
                                  }
                                }}
                              />
                              <Button 
                                type="button" 
                                variant="outline" 
                                onClick={triggerLoginImageInput}
                                disabled={isUploading}
                                className="w-full max-w-xs"
                              >
                                {isUploading ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Téléchargement...
                                  </>
                                ) : (
                                  "Sélectionner une image"
                                )}
                              </Button>
                              <p className="text-sm text-muted-foreground text-center">
                                PNG, JPG ou GIF. Taille maximale 5MB.
                              </p>
                            </div>
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="url" className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="login-image-url">URL de l&#39;image de connexion</Label>
                            <Input
                              id="login-image-url"
                              placeholder="https://exemple.com/login-image.png"
                              value={loginImageUrl}
                              onChange={(e) => {
                                setLoginImageUrl(e.target.value)
                                setPreviewLoginImage(e.target.value)
                              }}
                            />
                            <p className="text-sm text-muted-foreground">
                              Entrez l&#39;URL d&#39;une image pour l&#39;utiliser comme image de connexion
                            </p>
                          </div>
                        </TabsContent>
                        
                        {previewLoginImage && (
                          <div className="mt-6 space-y-2">
                            <Label>Aperçu de l&#39;image de connexion</Label>
                            <div className="flex items-center justify-center gap-4 p-4 rounded-md border">
                              <div className="flex items-center justify-center">
                                <div className="relative w-[200px] h-[150px]">
                                  <Image
                                    src={previewLoginImage}
                                    alt="Login image preview"
                                    fill
                                    className="object-contain"
                                    onError={() => {
                                      toast.error("Impossible de charger l&#39;image")
                                      setPreviewLoginImage(null)
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </Tabs>
                      
                      <div className="flex justify-center gap-4 pt-6">
                        <Button onClick={handleSave} className="w-32">Enregistrer</Button>
                        <Button variant="outline" onClick={handleReset} className="w-32">Réinitialiser</Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
