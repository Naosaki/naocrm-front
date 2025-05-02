import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import { ThirdParty } from '@/types';

const COLLECTION = 'thirdParties';

// Convertir les timestamps Firestore en dates JavaScript
const convertTimestamps = (data: any): ThirdParty => {
  const result = { ...data };
  if (result.createdAt && result.createdAt instanceof Timestamp) {
    result.createdAt = result.createdAt.toDate();
  }
  if (result.updatedAt && result.updatedAt instanceof Timestamp) {
    result.updatedAt = result.updatedAt.toDate();
  }
  return result as ThirdParty;
};

// Récupérer tous les clients
export const getAllThirdParties = async (): Promise<ThirdParty[]> => {
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
    console.error('Erreur lors de la récupération des clients:', error);
    throw error;
  }
};

// Récupérer un client par son ID
export const getThirdPartyById = async (id: string): Promise<ThirdParty | null> => {
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
    console.error(`Erreur lors de la récupération du client ${id}:`, error);
    throw error;
  }
};

// Créer un nouveau client
export const createThirdParty = async (thirdParty: Omit<ThirdParty, 'id' | 'createdAt' | 'updatedAt'>): Promise<ThirdParty> => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION), {
      ...thirdParty,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    const newThirdParty = await getThirdPartyById(docRef.id);
    if (!newThirdParty) {
      throw new Error('Le client créé n\'a pas pu être récupéré');
    }

    return newThirdParty;
  } catch (error) {
    console.error('Erreur lors de la création du client:', error);
    throw error;
  }
};

// Mettre à jour un client
export const updateThirdParty = async (id: string, thirdParty: Partial<Omit<ThirdParty, 'id' | 'createdAt' | 'updatedAt'>>): Promise<ThirdParty> => {
  try {
    const docRef = doc(db, COLLECTION, id);
    await updateDoc(docRef, {
      ...thirdParty,
      updatedAt: serverTimestamp(),
    });

    const updatedThirdParty = await getThirdPartyById(id);
    if (!updatedThirdParty) {
      throw new Error('Le client mis à jour n\'a pas pu être récupéré');
    }

    return updatedThirdParty;
  } catch (error) {
    console.error(`Erreur lors de la mise à jour du client ${id}:`, error);
    throw error;
  }
};

// Supprimer un client
export const deleteThirdParty = async (id: string): Promise<boolean> => {
  try {
    await deleteDoc(doc(db, COLLECTION, id));
    return true;
  } catch (error) {
    console.error(`Erreur lors de la suppression du client ${id}:`, error);
    throw error;
  }
};

// Rechercher des clients par nom
export const searchThirdPartiesByName = async (name: string): Promise<ThirdParty[]> => {
  try {
    // Firestore ne prend pas en charge les recherches insensibles à la casse ou les recherches partielles,
    // donc nous récupérons tous les clients et filtrons côté client
    const querySnapshot = await getDocs(collection(db, COLLECTION));
    const thirdParties = querySnapshot.docs.map((doc) => {
      return convertTimestamps({
        id: doc.id,
        ...doc.data(),
      });
    });

    // Filtrer les clients dont le nom contient la chaîne de recherche (insensible à la casse)
    return thirdParties.filter((thirdParty) =>
      thirdParty.name.toLowerCase().includes(name.toLowerCase())
    );
  } catch (error) {
    console.error('Erreur lors de la recherche de clients:', error);
    throw error;
  }
};
