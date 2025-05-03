import { NextRequest, NextResponse } from 'next/server';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { initAdminApp } from '@/lib/firebase-admin';

// Initialiser l'application Firebase Admin
initAdminApp();

// Obtenir les instances Firestore et Auth
const db = getFirestore();
const auth = getAuth();

export async function POST(request: NextRequest) {
  try {
    const { email, password, displayName, role, thirdPartyId } = await request.json();

    // Vérifier que les champs requis sont présents
    if (!email || !password || !displayName || !role) {
      return NextResponse.json(
        { error: 'Champs requis manquants' },
        { status: 400 }
      );
    }

    // Créer l'utilisateur dans Firebase Auth
    const userRecord = await auth.createUser({
      email,
      password,
      displayName,
    });

    // Créer un document utilisateur dans Firestore
    await db.collection('users').doc(userRecord.uid).set({
      id: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName,
      photoURL: userRecord.photoURL || null,
      role: role,
      thirdPartyId: thirdPartyId || null,
      createdAt: new Date(),
      lastLogin: null,
    });

    return NextResponse.json({ success: true, userId: userRecord.uid });
  } catch (error: any) {
    console.error('Erreur lors de la création de l\'utilisateur:', error);
    
    // Gérer les erreurs spécifiques de Firebase Auth
    let errorMessage = 'Une erreur est survenue lors de la création du compte utilisateur';
    let errorCode = error.code || 'unknown';
    
    if (errorCode === 'auth/email-already-exists') {
      errorMessage = 'Cette adresse email est déjà utilisée';
    } else if (errorCode === 'auth/invalid-email') {
      errorMessage = 'Adresse email invalide';
    } else if (errorCode === 'auth/weak-password') {
      errorMessage = 'Le mot de passe est trop faible';
    }
    
    return NextResponse.json(
      { error: errorMessage, code: errorCode },
      { status: 400 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'ID utilisateur requis' },
        { status: 400 }
      );
    }

    // Supprimer l'utilisateur de Firebase Auth
    await auth.deleteUser(userId);
    
    // Supprimer le document utilisateur de Firestore
    await db.collection('users').doc(userId).delete();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Erreur lors de la suppression de l\'utilisateur:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la suppression du compte utilisateur' },
      { status: 400 }
    );
  }
}
