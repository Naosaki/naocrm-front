import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import { User } from '@/types';
import { signUp } from '../auth';

const COLLECTION = 'users';

// Convertir les timestamps Firestore en dates JavaScript
const convertTimestamps = (data: any): User => {
  const result = { ...data };
  if (result.createdAt && result.createdAt instanceof Timestamp) {
    result.createdAt = result.createdAt.toDate();
  }
  if (result.lastLogin && result.lastLogin instanceof Timestamp) {
    result.lastLogin = result.lastLogin.toDate();
  }
  return result as User;
};

// Récupérer tous les utilisateurs
export const getAllUsers = async (): Promise<User[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTION));
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return convertTimestamps({
        id: doc.id,
        ...data,
      });
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    throw error;
  }
};

// Récupérer un utilisateur par son ID
export const getUserById = async (id: string): Promise<User | null> => {
  try {
    const docRef = doc(db, COLLECTION, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return convertTimestamps({
        id: docSnap.id,
        ...docSnap.data(),
      });
    }
    return null;
  } catch (error) {
    console.error(`Erreur lors de la récupération de l'utilisateur ${id}:`, error);
    throw error;
  }
};

// Récupérer un utilisateur par son email
export const getUserByEmail = async (email: string): Promise<User | null> => {
  try {
    const q = query(collection(db, COLLECTION), where('email', '==', email));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return convertTimestamps({
        id: doc.id,
        ...doc.data(),
      });
    }
    return null;
  } catch (error) {
    console.error(`Erreur lors de la récupération de l'utilisateur avec l'email ${email}:`, error);
    throw error;
  }
};

// Créer un nouvel utilisateur (client)
export const createClientUser = async (
  email: string,
  password: string,
  displayName: string,
  thirdPartyId: string
): Promise<User> => {
  try {
    // Créer l'utilisateur dans Firebase Auth et Firestore
    const userCredential = await signUp(email, password, displayName, 'client', thirdPartyId);
    const user = await getUserById(userCredential.uid);
    
    if (!user) {
      throw new Error('L\'utilisateur créé n\'a pas pu être récupéré');
    }
    
    return user;
  } catch (error) {
    console.error('Erreur lors de la création de l\'utilisateur client:', error);
    throw error;
  }
};

// Créer un nouvel utilisateur (admin)
export const createAdminUser = async (
  email: string,
  password: string,
  displayName: string
): Promise<User> => {
  try {
    // Créer l'utilisateur dans Firebase Auth et Firestore
    const userCredential = await signUp(email, password, displayName, 'admin');
    const user = await getUserById(userCredential.uid);
    
    if (!user) {
      throw new Error('L\'utilisateur créé n\'a pas pu être récupéré');
    }
    
    return user;
  } catch (error) {
    console.error('Erreur lors de la création de l\'utilisateur admin:', error);
    throw error;
  }
};

// Mettre à jour un utilisateur
export const updateUser = async (id: string, userData: Partial<Omit<User, 'id' | 'email' | 'createdAt'>>): Promise<User> => {
  try {
    const docRef = doc(db, COLLECTION, id);
    await updateDoc(docRef, {
      ...userData,
    });

    const updatedUser = await getUserById(id);
    if (!updatedUser) {
      throw new Error('L\'utilisateur mis à jour n\'a pas pu être récupéré');
    }

    return updatedUser;
  } catch (error) {
    console.error(`Erreur lors de la mise à jour de l'utilisateur ${id}:`, error);
    throw error;
  }
};

// Supprimer un utilisateur
export const deleteUser = async (id: string): Promise<boolean> => {
  try {
    await deleteDoc(doc(db, COLLECTION, id));
    // Note: Cette fonction ne supprime pas l'utilisateur dans Firebase Auth
    // Pour une suppression complète, il faudrait utiliser les fonctions d'administration Firebase
    return true;
  } catch (error) {
    console.error(`Erreur lors de la suppression de l'utilisateur ${id}:`, error);
    throw error;
  }
};

// Récupérer tous les utilisateurs clients
export const getAllClientUsers = async (): Promise<User[]> => {
  try {
    const q = query(collection(db, COLLECTION), where('role', '==', 'client'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return convertTimestamps({
        id: doc.id,
        ...data,
      });
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs clients:', error);
    throw error;
  }
};

// Récupérer tous les utilisateurs admin
export const getAllAdminUsers = async (): Promise<User[]> => {
  try {
    const q = query(collection(db, COLLECTION), where('role', '==', 'admin'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return convertTimestamps({
        id: doc.id,
        ...data,
      });
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs admin:', error);
    throw error;
  }
};

// Récupérer l'utilisateur client associé à un client spécifique
export const getClientUserByThirdPartyId = async (thirdPartyId: string): Promise<User | null> => {
  try {
    const q = query(
      collection(db, COLLECTION),
      where('thirdPartyId', '==', thirdPartyId),
      where('role', '==', 'client')
    );
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return convertTimestamps({
        id: doc.id,
        ...doc.data(),
      });
    }
    return null;
  } catch (error) {
    console.error(`Erreur lors de la récupération de l'utilisateur client pour le client ${thirdPartyId}:`, error);
    throw error;
  }
};
