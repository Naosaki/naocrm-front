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
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import { Product } from '@/types';

const COLLECTION = 'products';

type FirestoreData = Record<string, unknown>;

// Convertir les timestamps Firestore en dates JavaScript
const convertTimestamps = (data: FirestoreData): Product => {
  const result = { ...data } as Record<string, unknown>;
  
  // Convertir les timestamps Firestore
  if (result.createdAt && result.createdAt instanceof Timestamp) {
    result.createdAt = (result.createdAt as Timestamp).toDate();
  }
  if (result.updatedAt && result.updatedAt instanceof Timestamp) {
    result.updatedAt = (result.updatedAt as Timestamp).toDate();
  }
  
  // Gérer le champ date_creation qui peut être un timestamp Firestore ou un timestamp UNIX
  if (result.date_creation) {
    if (result.date_creation instanceof Timestamp) {
      // Si c'est un timestamp Firestore, le convertir en Date
      result.date_creation = (result.date_creation as Timestamp).toDate();
    } else if (typeof result.date_creation === 'number') {
      // Si c'est un nombre (timestamp UNIX en secondes), le convertir en Date
      // Vérifier si c'est un timestamp en secondes (< 20000000000) ou en millisecondes
      const timestamp = result.date_creation < 20000000000 ? result.date_creation * 1000 : result.date_creation;
      result.date_creation = new Date(timestamp);
    }
  }
  
  return result as unknown as Product;
};

// Récupérer tous les produits
export const getAllProducts = async (): Promise<Product[]> => {
  try {
    console.log('Tentative de récupération des produits depuis la collection:', COLLECTION);
    const querySnapshot = await getDocs(collection(db, COLLECTION));
    console.log('Nombre de produits récupérés:', querySnapshot.docs.length);
    
    // Afficher les données brutes pour débogage
    querySnapshot.docs.forEach((doc, index) => {
      console.log(`Produit ${index + 1} - ID: ${doc.id}`, doc.data());
    });
    
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return convertTimestamps({
        id: doc.id,
        ...data,
      });
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des produits:', error);
    throw error;
  }
};

// Récupérer un produit par son ID
export const getProductById = async (id: string): Promise<Product | null> => {
  try {
    const docRef = doc(db, COLLECTION, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return convertTimestamps({
        id: docSnap.id,
        ...data,
      });
    }

    return null;
  } catch (error) {
    console.error('Erreur lors de la récupération du produit:', error);
    throw error;
  }
};

// Créer un nouveau produit
export const createProduct = async (productData: Omit<Product, 'id'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION), {
      ...productData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return docRef.id;
  } catch (error) {
    console.error('Erreur lors de la création du produit:', error);
    throw error;
  }
};

// Mettre à jour un produit existant
export const updateProduct = async (id: string, productData: Partial<Product>): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTION, id);
    await updateDoc(docRef, {
      ...productData,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du produit:', error);
    throw error;
  }
};

// Supprimer un produit
export const deleteProduct = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTION, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Erreur lors de la suppression du produit:', error);
    throw error;
  }
};

// Récupérer les produits par catégorie
export const getProductsByCategory = async (category: string): Promise<Product[]> => {
  try {
    const q = query(
      collection(db, COLLECTION),
      where('category', '==', category),
      orderBy('name')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return convertTimestamps({
        id: doc.id,
        ...data,
      });
    });
  } catch (error) {
    console.error(`Erreur lors de la récupération des produits de la catégorie ${category}:`, error);
    throw error;
  }
};

// Rechercher des produits par nom
export const searchProductsByName = async (name: string): Promise<Product[]> => {
  try {
    // Firestore ne prend pas en charge les recherches insensibles à la casse ou les recherches partielles,
    // donc nous récupérons tous les produits et filtrons côté client
    const querySnapshot = await getDocs(collection(db, COLLECTION));
    const products = querySnapshot.docs.map((doc) => {
      return convertTimestamps({
        id: doc.id,
        ...doc.data(),
      });
    });

    // Filtrer les produits dont le nom contient la chaîne de recherche (insensible à la casse)
    return products.filter((product) =>
      product.name.toLowerCase().includes(name.toLowerCase())
    );
  } catch (error) {
    console.error('Erreur lors de la recherche de produits:', error);
    throw error;
  }
};

// Récupérer les produits avec stock faible
export const getLowStockProducts = async (threshold = 5): Promise<Product[]> => {
  try {
    const q = query(
      collection(db, COLLECTION),
      where('stock_reel', '<=', threshold),
      orderBy('stock_reel')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return convertTimestamps({
        id: doc.id,
        ...data,
      });
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des produits avec stock faible:', error);
    throw error;
  }
};

// Récupérer les statistiques des produits
export const getProductsStats = async (): Promise<{
  totalProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;
}> => {
  try {
    const products = await getAllProducts();
    
    const totalProducts = products.length;
    const lowStockProducts = products.filter(p => (p.stock_reel || 0) <= 5 && (p.stock_reel || 0) > 0).length;
    const outOfStockProducts = products.filter(p => (p.stock_reel || 0) === 0).length;
    
    return {
      totalProducts,
      lowStockProducts,
      outOfStockProducts,
    };
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques des produits:', error);
    throw error;
  }
};
