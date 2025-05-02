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
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { db, storage } from '../firebase';
import { Invoice, ThirdParty } from '@/types';

const COLLECTION = 'invoices';

// Convertir les timestamps Firestore en dates JavaScript
const convertTimestamps = (data: Record<string, any>): Invoice => {
  const result = { ...data };
  if (result.createdAt && result.createdAt instanceof Timestamp) {
    result.createdAt = result.createdAt.toDate();
  }
  if (result.updatedAt && result.updatedAt instanceof Timestamp) {
    result.updatedAt = result.updatedAt.toDate();
  }
  if (result.date && result.date instanceof Timestamp) {
    result.date = result.date.toDate();
  }
  if (result.dueDate && result.dueDate instanceof Timestamp) {
    result.dueDate = result.dueDate.toDate();
  }
  
  // Gérer le champ date_validation qui peut être un timestamp Firestore ou un timestamp UNIX
  if (result.date_validation) {
    if (result.date_validation instanceof Timestamp) {
      // Si c'est un timestamp Firestore, le convertir en Date
      result.date_validation = result.date_validation.toDate();
    } else if (typeof result.date_validation === 'number') {
      // Si c'est un nombre (timestamp UNIX en secondes), le convertir en Date
      // Vérifier si c'est un timestamp en secondes (< 20000000000) ou en millisecondes
      const timestamp = result.date_validation < 20000000000 ? result.date_validation * 1000 : result.date_validation;
      result.date_validation = new Date(timestamp);
    }
  }
  
  return result as Invoice;
};

// Récupérer toutes les factures
export const getAllInvoices = async (): Promise<Invoice[]> => {
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
    console.error('Erreur lors de la récupération des factures:', error);
    throw error;
  }
};

// Récupérer les factures d'un client spécifique
export const getInvoicesByThirdPartyId = async (thirdPartyId: string): Promise<Invoice[]> => {
  try {
    const q = query(
      collection(db, COLLECTION),
      where('thirdPartyId', '==', thirdPartyId),
      orderBy('date', 'desc')
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
    console.error(`Erreur lors de la récupération des factures du client ${thirdPartyId}:`, error);
    throw error;
  }
};

// Récupérer une facture par son ID
export const getInvoiceById = async (id: string): Promise<Invoice | null> => {
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
    console.error(`Erreur lors de la récupération de la facture ${id}:`, error);
    throw error;
  }
};

// Créer une nouvelle facture
export const createInvoice = async (
  invoice: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>,
  pdfFile?: File
): Promise<Invoice> => {
  try {
    let fileUrl = invoice.fileUrl;

    // Si un fichier PDF est fourni, le télécharger dans Firebase Storage
    if (pdfFile) {
      const storageRef = ref(storage, `invoices/${Date.now()}_${pdfFile.name}`);
      const uploadResult = await uploadBytes(storageRef, pdfFile);
      fileUrl = await getDownloadURL(uploadResult.ref);
    }

    const docRef = await addDoc(collection(db, COLLECTION), {
      ...invoice,
      fileUrl,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    const newInvoice = await getInvoiceById(docRef.id);
    if (!newInvoice) {
      throw new Error('La facture créée n\'a pas pu être récupérée');
    }

    return newInvoice;
  } catch (error) {
    console.error('Erreur lors de la création de la facture:', error);
    throw error;
  }
};

// Mettre à jour une facture
export const updateInvoice = async (
  id: string,
  invoice: Partial<Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>>,
  pdfFile?: File
): Promise<Invoice> => {
  try {
    let fileUrl = invoice.fileUrl;

    // Si un fichier PDF est fourni, le télécharger dans Firebase Storage
    if (pdfFile) {
      const storageRef = ref(storage, `invoices/${Date.now()}_${pdfFile.name}`);
      const uploadResult = await uploadBytes(storageRef, pdfFile);
      fileUrl = await getDownloadURL(uploadResult.ref);
      invoice.fileUrl = fileUrl;
    }

    const docRef = doc(db, COLLECTION, id);
    await updateDoc(docRef, {
      ...invoice,
      updatedAt: serverTimestamp(),
    });

    const updatedInvoice = await getInvoiceById(id);
    if (!updatedInvoice) {
      throw new Error('La facture mise à jour n\'a pas pu être récupérée');
    }

    return updatedInvoice;
  } catch (error) {
    console.error(`Erreur lors de la mise à jour de la facture ${id}:`, error);
    throw error;
  }
};

// Supprimer une facture
export const deleteInvoice = async (id: string): Promise<boolean> => {
  try {
    await deleteDoc(doc(db, COLLECTION, id));
    return true;
  } catch (error) {
    console.error(`Erreur lors de la suppression de la facture ${id}:`, error);
    throw error;
  }
};

// Récupérer les factures par statut
export const getInvoicesByStatus = async (status: string): Promise<Invoice[]> => {
  try {
    const q = query(
      collection(db, COLLECTION),
      where('status', '==', status),
      orderBy('date', 'desc')
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
    console.error(`Erreur lors de la récupération des factures avec le statut ${status}:`, error);
    throw error;
  }
};

// Récupérer les factures par période
export const getInvoicesByDateRange = async (startDate: Date, endDate: Date): Promise<Invoice[]> => {
  try {
    // Convertir les dates en timestamps Firestore
    const startTimestamp = Timestamp.fromDate(startDate);
    const endTimestamp = Timestamp.fromDate(endDate);

    const q = query(
      collection(db, COLLECTION),
      where('date', '>=', startTimestamp),
      where('date', '<=', endTimestamp),
      orderBy('date', 'desc')
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
    console.error('Erreur lors de la récupération des factures par période:', error);
    throw error;
  }
};

// Récupérer toutes les factures avec les informations client correctes basées sur ref_client et code_client
export const getAllInvoicesWithClientInfo = async (): Promise<Invoice[]> => {
  try {
    // Récupérer toutes les factures
    const invoices = await getAllInvoices();
    
    // Récupérer tous les clients pour faire la correspondance
    const thirdPartiesCollection = collection(db, 'thirdParties');
    const thirdPartiesSnapshot = await getDocs(thirdPartiesCollection);
    const thirdParties = thirdPartiesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as ThirdParty[];
    
    // Afficher les données pour débogage
    console.log('=== CLIENTS (thirdParties) ===');
    thirdParties.forEach(client => {
      console.log('ID:', client.id, '| Nom:', client.name, '| Code client:', client.code_client || 'NON DEFINI');
    });
    
    console.log('=== FACTURES (invoices) ===');
    invoices.forEach(invoice => {
      console.log('ID:', invoice.id, '| Numero:', invoice.number, '| Ref client:', invoice.ref_client || 'NON DEFINI');
    });
    
    // Correspondance simple entre ref_client et code_client
    return invoices.map(invoice => {
      // Si la facture a une référence client
      if (invoice.ref_client) {
        // Chercher le client correspondant par code_client
        const matchingClient = thirdParties.find(
          client => client.code_client === invoice.ref_client
        );
        
        if (matchingClient) {
          console.log('CORRESPONDANCE TROUVEE pour facture', invoice.id, ':', matchingClient.name);
          return {
            ...invoice,
            thirdPartyId: matchingClient.id,
            thirdPartyName: matchingClient.name
          };
        } else {
          console.log('AUCUNE CORRESPONDANCE pour facture', invoice.id, 'avec ref_client =', invoice.ref_client);
        }
      } else {
        console.log('PAS DE REF_CLIENT pour facture', invoice.id);
      }
      
      // Si aucune correspondance n'est trouvée, conserver les données existantes
      return invoice;
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des factures avec infos client:', error);
    throw error;
  }
};

// Récupérer le total des revenus (somme des montants HT des factures)
export const getTotalRevenue = async (): Promise<number> => {
  try {
    const invoices = await getAllInvoices();
    
    // Calculer la somme des montants HT (multicurrency_total_ht)
    const totalRevenue = invoices.reduce((sum, invoice) => {
      // Utiliser multicurrency_total_ht s'il existe, sinon 0
      const amount = invoice.multicurrency_total_ht ? parseFloat(invoice.multicurrency_total_ht.toString()) : 0;
      return sum + amount;
    }, 0);
    
    return totalRevenue;
  } catch (error) {
    console.error('Erreur lors du calcul du total des revenus:', error);
    return 0;
  }
};

// Récupérer les données pour le graphique de revenus par mois
export const getRevenueChartData = async (): Promise<{ date: string; revenus: number; factures: number }[]> => {
  try {
    const invoices = await getAllInvoices();
    
    // Créer un objet pour stocker les données par mois
    const monthlyData: Record<string, { revenus: number; factures: number }> = {};
    
    // Parcourir toutes les factures
    invoices.forEach(invoice => {
      // Utiliser la date de validation si elle existe, sinon la date normale
      let invoiceDate: Date | null = null;
      
      if (invoice.date_validation) {
        if (invoice.date_validation instanceof Date) {
          invoiceDate = invoice.date_validation;
        } else if (typeof invoice.date_validation === 'number') {
          // Si c'est un timestamp UNIX en secondes ou millisecondes
          const timestamp = invoice.date_validation < 20000000000 
            ? invoice.date_validation * 1000 
            : invoice.date_validation;
          invoiceDate = new Date(timestamp);
        } else {
          // Si c'est une chaîne de caractères
          invoiceDate = new Date(invoice.date_validation);
        }
      } else if (invoice.date) {
        // Utiliser la date normale si la date de validation n'existe pas
        if (invoice.date instanceof Date) {
          invoiceDate = invoice.date;
        } else {
          invoiceDate = new Date(invoice.date);
        }
      }
      
      // Vérifier si la date est valide
      if (!invoiceDate || isNaN(invoiceDate.getTime())) {
        return;
      }
      
      // Formatter la date au format YYYY-MM (2025-01 pour janvier 2025)
      const monthKey = `${invoiceDate.getFullYear()}-${String(invoiceDate.getMonth() + 1).padStart(2, '0')}`;
      
      // Initialiser les données pour ce mois si elles n'existent pas encore
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { revenus: 0, factures: 0 };
      }
      
      // Ajouter le montant HT de la facture aux revenus du mois
      const amount = invoice.multicurrency_total_ht 
        ? parseFloat(invoice.multicurrency_total_ht.toString()) 
        : (invoice.subtotal || 0);
      
      monthlyData[monthKey].revenus += amount;
      monthlyData[monthKey].factures += 1;
    });
    
    // Convertir l'objet en tableau pour le graphique
    const chartData = Object.entries(monthlyData)
      .map(([date, data]) => ({
        date: `${date}-01`, // Ajouter le jour pour avoir une date complète (YYYY-MM-DD)
        revenus: Math.round(data.revenus * 100) / 100, // Arrondir à 2 décimales
        factures: data.factures
      }))
      .sort((a, b) => a.date.localeCompare(b.date)); // Trier par date croissante
    
    return chartData;
  } catch (error) {
    console.error('Erreur lors de la récupération des données pour le graphique:', error);
    return [];
  }
};
