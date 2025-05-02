import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  User as FirebaseUser,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';
import { User } from '@/types';

// Fonction pour s'inscrire avec email et mot de passe
export const signUp = async (email: string, password: string, displayName: string, role: 'admin' | 'client' = 'client', thirdPartyId?: string) => {
  try {
    // Créer l'utilisateur dans Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Mettre à jour le profil avec le nom d'affichage
    await updateProfile(user, { displayName });
    
    // Créer un document utilisateur dans Firestore
    await setDoc(doc(db, 'users', user.uid), {
      id: user.uid,
      email: user.email,
      displayName: displayName,
      photoURL: user.photoURL,
      role: role,
      thirdPartyId: thirdPartyId || null,
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
    });
    
    return user;
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    throw error;
  }
};

// Fonction pour se connecter avec email et mot de passe
export const signIn = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Mettre à jour la date de dernière connexion
    await setDoc(doc(db, 'users', user.uid), {
      lastLogin: serverTimestamp(),
    }, { merge: true });
    
    // Récupérer les données complètes de l'utilisateur, y compris son rôle
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (!userDoc.exists()) {
      console.error('Utilisateur non trouvé dans Firestore');
      throw new Error('Utilisateur non trouvé dans la base de données');
    }
    
    return userDoc.data() as User;
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    throw error;
  }
};

// Fonction pour se déconnecter
export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
    return true;
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error);
    throw error;
  }
};

// Fonction pour récupérer les données complètes de l'utilisateur (y compris le rôle)
export const getUserData = async (userId: string): Promise<User | null> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      return userDoc.data() as User;
    }
    return null;
  } catch (error) {
    console.error('Erreur lors de la récupération des données utilisateur:', error);
    throw error;
  }
};

// Fonction pour envoyer un email de réinitialisation de mot de passe
export const resetPassword = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return true;
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email de réinitialisation:', error);
    throw error;
  }
};

// Hook personnalisé pour observer l'état d'authentification
export const onAuthChange = (callback: (user: FirebaseUser | null) => void) => {
  return onAuthStateChanged(auth, callback);
};
