import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { initAdminApp } from '@/lib/firebase-admin';

// Initialiser l'application Firebase Admin
initAdminApp();

// Obtenir les instances Auth et Firestore
const auth = getAuth();
const db = getFirestore();

/**
 * Middleware pour vérifier si l'utilisateur est authentifié
 */
export async function isAuthenticated(req: NextRequest) {
  try {
    // Récupérer le token d'authentification depuis les en-têtes
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { authenticated: false, error: 'Token d\'authentification manquant ou invalide' };
    }

    const token = authHeader.split('Bearer ')[1];
    if (!token) {
      return { authenticated: false, error: 'Token d\'authentification manquant' };
    }

    // Vérifier le token JWT
    try {
      const decodedToken = await auth.verifyIdToken(token);
      return { authenticated: true, uid: decodedToken.uid };
    } catch (error) {
      console.error('Erreur lors de la vérification du token:', error);
      return { authenticated: false, error: 'Token d\'authentification invalide' };
    }
  } catch (error) {
    console.error('Erreur dans le middleware d\'authentification:', error);
    return { authenticated: false, error: 'Erreur serveur' };
  }
}

/**
 * Middleware pour vérifier si l'utilisateur est administrateur
 */
export async function isAdmin(req: NextRequest) {
  try {
    // Vérifier d'abord si l'utilisateur est authentifié
    const authResult = await isAuthenticated(req);
    if (!authResult.authenticated) {
      return { isAdmin: false, error: authResult.error };
    }

    // Récupérer les données de l'utilisateur depuis Firestore
    const userDoc = await db.collection('users').doc(authResult.uid).get();
    if (!userDoc.exists) {
      return { isAdmin: false, error: 'Utilisateur non trouvé' };
    }

    const userData = userDoc.data();
    if (!userData || userData.role !== 'admin') {
      return { isAdmin: false, error: 'Accès non autorisé' };
    }

    return { isAdmin: true, uid: authResult.uid };
  } catch (error) {
    console.error('Erreur dans le middleware de vérification admin:', error);
    return { isAdmin: false, error: 'Erreur serveur' };
  }
}

/**
 * Wrapper pour les routes API qui nécessitent une authentification
 */
export function withAuth(handler: (req: NextRequest, uid: string) => Promise<NextResponse>) {
  return async (req: NextRequest) => {
    const authResult = await isAuthenticated(req);
    if (!authResult.authenticated) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    return handler(req, authResult.uid as string);
  };
}

/**
 * Wrapper pour les routes API qui nécessitent des droits d'administration
 */
export function withAdminAuth(handler: (req: NextRequest, uid: string) => Promise<NextResponse>) {
  return async (req: NextRequest) => {
    const adminResult = await isAdmin(req);
    if (!adminResult.isAdmin) {
      return NextResponse.json({ error: adminResult.error }, { status: 403 });
    }

    return handler(req, adminResult.uid as string);
  };
}
