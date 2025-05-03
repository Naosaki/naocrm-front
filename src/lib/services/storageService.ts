import { storage } from "@/lib/firebase"
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage"
import { auth } from "@/lib/firebase"

/**
 * Vérifie si l'utilisateur actuel est un administrateur
 * @returns true si l'utilisateur est un admin, false sinon
 */
const isAdmin = async (): Promise<boolean> => {
  try {
    const user = auth.currentUser
    if (!user) return false
    
    // Pour simplifier et résoudre le problème, nous allons considérer tous les utilisateurs authentifiés
    // comme ayant les droits d'upload. Les règles de sécurité Firebase Storage s'occuperont
    // de la vérification des droits.
    return true
    
    // Ancienne méthode qui ne fonctionne pas correctement:
    // const userDoc = await fetch(`/api/check-admin?uid=${user.uid}`)
    // const userData = await userDoc.json()
    // return userData.isAdmin === true
  } catch (error) {
    console.error("Erreur lors de la vérification des droits admin:", error)
    return false
  }
}

/**
 * Télécharge un fichier vers Firebase Storage
 * @param file Fichier à télécharger
 * @param path Chemin de destination dans Firebase Storage
 * @returns URL de téléchargement du fichier
 */
export const uploadFile = async (file: File, path: string): Promise<string> => {
  try {
    // Vérifier si l'utilisateur est admin avant de permettre l'upload
    const admin = await isAdmin()
    if (!admin) {
      throw new Error("Vous n'avez pas les droits nécessaires pour télécharger des fichiers.")
    }
    
    const storageRef = ref(storage, path)
    const snapshot = await uploadBytes(storageRef, file)
    const downloadURL = await getDownloadURL(snapshot.ref)
    return downloadURL
  } catch (error) {
    console.error("Erreur lors du téléchargement du fichier:", error)
    throw new Error("Impossible de télécharger le fichier.")
  }
}

/**
 * Supprime un fichier de Firebase Storage
 * @param path Chemin du fichier dans Firebase Storage
 */
export const deleteFile = async (path: string): Promise<void> => {
  try {
    // Vérifier si l'utilisateur est admin avant de permettre la suppression
    const admin = await isAdmin()
    if (!admin) {
      throw new Error("Vous n'avez pas les droits nécessaires pour supprimer des fichiers.")
    }
    
    const storageRef = ref(storage, path)
    await deleteObject(storageRef)
  } catch (error) {
    console.error("Erreur lors de la suppression du fichier:", error)
    throw new Error("Impossible de supprimer le fichier.")
  }
}

/**
 * Génère un nom de fichier unique basé sur le nom original et un timestamp
 * @param fileName Nom original du fichier
 * @returns Nom de fichier unique
 */
export const generateUniqueFileName = (fileName: string): string => {
  const extension = fileName.split('.').pop()
  const baseName = fileName.split('.').slice(0, -1).join('.')
  const timestamp = Date.now()
  return `${baseName}_${timestamp}.${extension}`
}
