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

type FirestoreData = Record<string, unknown>;

// Convertir les timestamps Firestore en dates JavaScript
const convertTimestamps = (data: FirestoreData): Invoice => {
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
    const thirdPartiesCollection = collection(db, 'thirdparties');
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

// Récupérer le nombre de factures et le montant total pour un client spécifique
export const getClientInvoiceStats = async (clientCode: string): Promise<{ invoiceCount: number; totalAmount: number }> => {
  try {
    const allInvoices = await getAllInvoices();
    
    // Filtrer les factures du client
    const clientInvoices = allInvoices.filter(invoice => invoice.ref_client === clientCode);
    
    // Calculer le nombre de factures
    const invoiceCount = clientInvoices.length;
    
    // Calculer le montant total des transactions (utiliser le montant HT)
    const totalAmount = clientInvoices.reduce((total, invoice) => {
      // Utiliser le montant HT (subtotal) ou le montant multicurrency si disponible
      const amount = invoice.multicurrency_total_ht || invoice.subtotal || 0;
      // S'assurer que le montant est un nombre valide
      return total + (isNaN(Number(amount)) ? 0 : Number(amount));
    }, 0);
    
    return { invoiceCount, totalAmount };
  } catch (error) {
    console.error(`Erreur lors du calcul des statistiques pour le client ${clientCode}:`, error);
    // Retourner des valeurs par défaut en cas d'erreur
    return { invoiceCount: 0, totalAmount: 0 };
  }
};

// Récupérer le nombre de factures et le montant total pour tous les clients
export const getAllClientsInvoiceStats = async (): Promise<Record<string, { invoiceCount: number; totalAmount: number }>> => {
  try {
    const allInvoices = await getAllInvoices();
    
    // Créer un objet pour stocker les statistiques par code client
    const clientStats: Record<string, { invoiceCount: number; totalAmount: number }> = {};
    
    // Parcourir toutes les factures et agréger les statistiques par client
    allInvoices.forEach(invoice => {
      const clientCode = invoice.ref_client;
      
      // Ignorer les factures sans code client
      if (!clientCode) return;
      
      // Initialiser les statistiques du client si nécessaire
      if (!clientStats[clientCode]) {
        clientStats[clientCode] = { invoiceCount: 0, totalAmount: 0 };
      }
      
      // Incrémentation du nombre de factures
      clientStats[clientCode].invoiceCount += 1;
      
      // Ajouter le montant de la facture au total (utiliser le montant HT)
      const amount = invoice.multicurrency_total_ht || invoice.subtotal || 0;
      // S'assurer que le montant est un nombre valide
      clientStats[clientCode].totalAmount += isNaN(Number(amount)) ? 0 : Number(amount);
    });
    
    return clientStats;
  } catch (error) {
    console.error('Erreur lors du calcul des statistiques pour tous les clients:', error);
    return {};
  }
};

// Récupérer les factures d'un client connecté (via son thirdPartyId)
export const getInvoicesByConnectedClient = async (userId: string): Promise<Invoice[]> => {
  try {
    // Récupérer l'utilisateur pour obtenir son thirdPartyId
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) {
      throw new Error('Utilisateur non trouvé');
    }
    
    const userData = userDoc.data();
    
    // Vérifier le rôle de l'utilisateur
    if (userData.role === 'admin') {
      // Pour les administrateurs, retourner un tableau vide
      // ou éventuellement toutes les factures si nécessaire
      return [];
    }
    
    const thirdPartyId = userData.thirdPartyId;
    
    if (!thirdPartyId) {
      throw new Error('Aucun client associé à cet utilisateur');
    }
    
    // Récupérer le client pour obtenir son code_client
    const thirdPartyDoc = await getDoc(doc(db, 'thirdparties', thirdPartyId));
    if (!thirdPartyDoc.exists()) {
      throw new Error('Client non trouvé');
    }
    
    const thirdPartyData = thirdPartyDoc.data();
    const clientCode = thirdPartyData.code_client;
    
    if (!clientCode) {
      throw new Error('Code client non trouvé');
    }
    
    // Récupérer les factures correspondant au code client
    const q = query(
      collection(db, 'invoices'),
      where('ref_client', '==', clientCode)
    );
    
    const querySnapshot = await getDocs(q);
    const invoices: Invoice[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      invoices.push({
        id: doc.id,
        ...data,
        thirdPartyId: thirdPartyId,
        thirdPartyName: thirdPartyData.name || '',
      } as Invoice);
    });
    
    // Trier les factures par date (les plus récentes d'abord)
    invoices.sort((a, b) => {
      const dateA = a.date instanceof Date ? a.date.getTime() : new Date(a.date || 0).getTime();
      const dateB = b.date instanceof Date ? b.date.getTime() : new Date(b.date || 0).getTime();
      return dateB - dateA;
    });
    
    return invoices;
  } catch (error) {
    console.error('Erreur lors de la récupération des factures du client connecté:', error);
    throw error;
  }
};

// Récupérer les statistiques des factures d'un client connecté
export const getConnectedClientInvoiceStats = async (userId: string): Promise<{
  totalInvoices: number;
  paidInvoices: number;
  pendingInvoices: number;
  overdueInvoices: number;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
}> => {
  try {
    const invoices = await getInvoicesByConnectedClient(userId);
    
    // Initialiser les statistiques
    const stats = {
      totalInvoices: invoices.length,
      paidInvoices: 0,
      pendingInvoices: 0,
      overdueInvoices: 0,
      totalAmount: 0,
      paidAmount: 0,
      pendingAmount: 0,
    };
    
    // Calculer les statistiques
    invoices.forEach((invoice) => {
      // Ajouter au montant total
      const amount = Number(invoice.multicurrency_total_ht || invoice.subtotal || 0);
      if (!isNaN(amount)) {
        stats.totalAmount += amount;
      }
      
      // Compter par statut
      if (invoice.status === 'paid') {
        stats.paidInvoices++;
        if (!isNaN(amount)) {
          stats.paidAmount += amount;
        }
      } else if (invoice.status === 'overdue') {
        stats.overdueInvoices++;
        if (!isNaN(amount)) {
          stats.pendingAmount += amount;
        }
      } else if (invoice.status === 'sent' || invoice.status === 'draft') {
        stats.pendingInvoices++;
        if (!isNaN(amount)) {
          stats.pendingAmount += amount;
        }
      }
    });
    
    return stats;
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques du client connecté:', error);
    throw error;
  }
};
