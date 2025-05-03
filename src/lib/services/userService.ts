import { db } from "@/lib/firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  updateDoc,
  Timestamp,
} from "firebase/firestore";
import { User } from "@/types";
import { signUp } from "@/lib/auth";

const COLLECTION = 'users';

type FirestoreData = Record<string, unknown>;

// Convertir les timestamps Firestore en dates JavaScript
const convertTimestamps = (data: FirestoreData): User => {
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
      const userData = docSnap.data();
      console.log(`Données brutes de l'utilisateur ${id}:`, userData);
      console.log(`Rôle de l'utilisateur: ${userData.role}`);
      
      const convertedUser = convertTimestamps({
        id: docSnap.id,
        ...userData,
      });
      
      console.log(`Utilisateur converti:`, convertedUser);
      return convertedUser;
    }
    console.warn(`Aucun utilisateur trouvé avec l'ID ${id}`);
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

// Récupérer un utilisateur par son thirdPartyId
export const getUserByThirdPartyId = async (thirdPartyId: string): Promise<User | null> => {
  try {
    const q = query(collection(db, COLLECTION), where('thirdPartyId', '==', thirdPartyId));
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
    console.error(`Erreur lors de la récupération de l'utilisateur avec le thirdPartyId ${thirdPartyId}:`, error);
    throw error;
  }
};

// Récupérer un utilisateur par le code client (code_client)
export const getUserByClientCode = async (clientCode: string): Promise<User | null> => {
  try {
    // D'abord, trouver le thirdParty avec ce code client
    const thirdPartiesCollection = collection(db, 'thirdparties');
    const q = query(thirdPartiesCollection, where('code_client', '==', clientCode));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null; // Aucun client trouvé avec ce code
    }

    const thirdParty = querySnapshot.docs[0];
    const thirdPartyId = thirdParty.id;

    // Ensuite, trouver l'utilisateur associé à ce thirdPartyId
    return await getUserByThirdPartyId(thirdPartyId);
  } catch (error) {
    console.error(`Erreur lors de la récupération de l'utilisateur avec le code client ${clientCode}:`, error);
    throw error;
  }
};

// Vérifier si un code client existe
export const checkClientCodeExists = async (clientCode: string): Promise<{exists: boolean, thirdPartyId?: string, thirdPartyName?: string}> => {
  try {
    const thirdPartiesCollection = collection(db, 'thirdparties');
    const q = query(thirdPartiesCollection, where('code_client', '==', clientCode));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return { exists: false };
    }

    const thirdParty = querySnapshot.docs[0];
    return { 
      exists: true, 
      thirdPartyId: thirdParty.id, 
      thirdPartyName: thirdParty.data().name 
    };
  } catch (error) {
    console.error(`Erreur lors de la vérification du code client ${clientCode}:`, error);
    throw error;
  }
};

// Vérifier si un client a déjà un compte utilisateur
export const checkClientHasUser = async (clientCode: string): Promise<boolean> => {
  try {
    const user = await getUserByClientCode(clientCode);
    return user !== null;
  } catch (error) {
    console.error(`Erreur lors de la vérification si le client ${clientCode} a un utilisateur:`, error);
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

// Supprimer un utilisateur (Firestore + Firebase Auth)
export const deleteUser = async (userId: string): Promise<void> => {
  try {
    // Appeler l'API route pour supprimer l'utilisateur dans Firebase Auth et Firestore
    const response = await fetch(`/api/users/delete?userId=${userId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erreur lors de la suppression de l\'utilisateur');
    }
  } catch (error) {
    console.error(`Erreur lors de la suppression de l'utilisateur ${userId}:`, error);
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
