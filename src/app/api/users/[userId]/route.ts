import { NextRequest, NextResponse } from 'next/server';
import { getFirestore } from 'firebase-admin/firestore';
import { initAdminApp } from '@/lib/firebase-admin';

// Initialiser l'application Firebase Admin
initAdminApp();

// Obtenir l'instance Firestore
const db = getFirestore();

type UserIdParams = Promise<{ userId: string }>;

export async function GET(
  request: NextRequest,
  { params }: { params: UserIdParams }
) {
  try {
    const { userId } = await params;

    if (!userId) {
      return NextResponse.json(
        { error: 'ID utilisateur requis' },
        { status: 400 }
      );
    }

    // Ru00e9cupu00e9rer le document utilisateur de Firestore
    const userDoc = await db.collection('users').doc(userId).get();

    if (!userDoc.exists) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvu00e9' },
        { status: 404 }
      );
    }

    const userData = userDoc.data();
    
    // Convertir les timestamps Firestore en dates JavaScript
    const user = {
      ...userData,
      createdAt: userData?.createdAt ? userData.createdAt.toDate() : null,
      lastLogin: userData?.lastLogin ? userData.lastLogin.toDate() : null,
    };

    return NextResponse.json(user);
  } catch (error) {
    console.error('Erreur lors de la ru00e9cupu00e9ration de l\'utilisateur:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la ru00e9cupu00e9ration du compte utilisateur' },
      { status: 500 }
    );
  }
}
