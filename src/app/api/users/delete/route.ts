import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { withAdminAuth } from '@/lib/middleware/authMiddleware';
import { initAdminApp } from '@/lib/firebase-admin';

// Initialiser Firebase Admin
initAdminApp();

// Fonction de suppression d'utilisateur protégée par le middleware d'authentification admin
export const DELETE = withAdminAuth(async (req: NextRequest) => {
  try {
    // Récupérer l'ID de l'utilisateur à supprimer depuis les paramètres de requête
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'ID utilisateur manquant' },
        { status: 400 }
      );
    }

    // Supprimer l'utilisateur dans Firebase Authentication
    const auth = getAuth();
    await auth.deleteUser(userId);

    // Supprimer également le document utilisateur dans Firestore
    const userDocRef = doc(db, 'users', userId);
    await deleteDoc(userDocRef);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'utilisateur:', error);
    
    // Gérer les erreurs spécifiques
    const firebaseError = error as { code?: string };
    if (firebaseError.code === 'auth/user-not-found') {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de l\'utilisateur' },
      { status: 500 }
    );
  }
});
