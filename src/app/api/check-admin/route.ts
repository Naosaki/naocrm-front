import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export async function GET(request: NextRequest) {
  try {
    // Récupérer l'UID de l'utilisateur depuis les paramètres de requête
    const searchParams = request.nextUrl.searchParams;
    const uid = searchParams.get('uid');

    if (!uid) {
      return NextResponse.json({ error: 'UID manquant' }, { status: 400 });
    }

    // Récupérer les données de l'utilisateur depuis Firestore
    const userDoc = await getDoc(doc(db, 'users', uid));
    
    if (!userDoc.exists()) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    const userData = userDoc.data();
    
    // Vérifier si l'utilisateur a le rôle admin
    const isAdmin = userData.role === 'admin';

    return NextResponse.json({ isAdmin });
  } catch (error) {
    console.error('Erreur lors de la vérification des droits admin:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
