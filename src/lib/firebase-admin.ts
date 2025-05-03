import { initializeApp, getApps, cert } from 'firebase-admin/app';

// Fonction pour initialiser l'application Firebase Admin
export function initAdminApp() {
  // Éviter de réinitialiser l'application si elle est déjà initialisée
  if (getApps().length > 0) {
    return;
  }

  // Récupérer les variables d'environnement pour Firebase Admin
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  // Vérifier que les variables d'environnement sont définies
  if (!projectId || !clientEmail || !privateKey) {
    throw new Error('Variables d\'environnement Firebase Admin manquantes');
  }

  // Initialiser l'application Firebase Admin avec les identifiants
  initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });
}
