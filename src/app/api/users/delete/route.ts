import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Initialiser Firebase Admin si ce n'est pas déjà fait
if (!getApps().length) {
  // Utiliser les variables d'environnement existantes
  const serviceAccount = {
    type: 'service_account',
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY,
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: process.env.FIREBASE_AUTH_URI,
    token_uri: process.env.FIREBASE_TOKEN_URI,
    auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL
  };

  initializeApp({
    credential: cert(serviceAccount as any),
  });
}

export async function DELETE(request: NextRequest) {
  try {
    // Récupérer l'ID de l'utilisateur à supprimer depuis les paramètres de requête
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'ID utilisateur manquant' },
        { status: 400 }
      );
    }

    // Vérifier si l'utilisateur est authentifié et a les droits d'admin
    // Note: Dans une application réelle, vous devriez vérifier le token d'authentification
    // et les droits d'administration ici

    // Supprimer l'utilisateur dans Firebase Authentication
    const auth = getAuth();
    await auth.deleteUser(userId);

    // Supprimer également le document utilisateur dans Firestore
    const userDocRef = doc(db, 'users', userId);
    await deleteDoc(userDocRef);

    return NextResponse.json(
      { success: true, message: 'Utilisateur supprimé avec succès' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Erreur lors de la suppression de l\'utilisateur:', error);

    // Gérer les erreurs spécifiques
    if (error.code === 'auth/user-not-found') {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Erreur lors de la suppression de l\'utilisateur', details: error.message },
      { status: 500 }
    );
  }
}
