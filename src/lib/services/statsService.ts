import { getAllInvoices, getInvoicesByThirdPartyId } from './invoiceService';
import { DashboardStats } from '@/types';

// Calculer les statistiques globales pour le tableau de bord administrateur
export const getAdminDashboardStats = async (): Promise<DashboardStats> => {
  try {
    // Récupérer toutes les factures
    const invoices = await getAllInvoices();
    
    // Calculer les statistiques
    const totalInvoices = invoices.length;
    const paidInvoices = invoices.filter(invoice => invoice.status === 'paid').length;
    const overdueInvoices = invoices.filter(invoice => invoice.status === 'overdue').length;
    
    // Calculer le revenu total
    const totalRevenue = invoices.reduce((sum, invoice) => {
      return invoice.status === 'paid' ? sum + invoice.total : sum;
    }, 0);
    
    // Calculer le revenu du mois en cours
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const revenueThisMonth = invoices.reduce((sum, invoice) => {
      const invoiceDate = new Date(invoice.date);
      return (invoice.status === 'paid' && 
              invoiceDate.getMonth() === currentMonth && 
              invoiceDate.getFullYear() === currentYear) 
              ? sum + invoice.total 
              : sum;
    }, 0);
    
    // Calculer le revenu du mois précédent
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    const revenueLastMonth = invoices.reduce((sum, invoice) => {
      const invoiceDate = new Date(invoice.date);
      return (invoice.status === 'paid' && 
              invoiceDate.getMonth() === lastMonth && 
              invoiceDate.getFullYear() === lastMonthYear) 
              ? sum + invoice.total 
              : sum;
    }, 0);
    
    return {
      totalInvoices,
      paidInvoices,
      overdueInvoices,
      totalRevenue,
      revenueThisMonth,
      revenueLastMonth,
    };
  } catch (error) {
    console.error('Erreur lors du calcul des statistiques du tableau de bord admin:', error);
    throw error;
  }
};

// Calculer les statistiques pour le tableau de bord d'un client spécifique
export const getClientDashboardStats = async (thirdPartyId: string): Promise<DashboardStats> => {
  try {
    // Récupérer les factures du client
    const invoices = await getInvoicesByThirdPartyId(thirdPartyId);
    
    // Calculer les statistiques
    const totalInvoices = invoices.length;
    const paidInvoices = invoices.filter(invoice => invoice.status === 'paid').length;
    const overdueInvoices = invoices.filter(invoice => invoice.status === 'overdue').length;
    
    // Calculer le montant total des factures payées
    const totalRevenue = invoices.reduce((sum, invoice) => {
      return invoice.status === 'paid' ? sum + invoice.total : sum;
    }, 0);
    
    // Calculer le montant des factures payées du mois en cours
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const revenueThisMonth = invoices.reduce((sum, invoice) => {
      const invoiceDate = new Date(invoice.date);
      return (invoice.status === 'paid' && 
              invoiceDate.getMonth() === currentMonth && 
              invoiceDate.getFullYear() === currentYear) 
              ? sum + invoice.total 
              : sum;
    }, 0);
    
    // Calculer le montant des factures payées du mois précédent
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    const revenueLastMonth = invoices.reduce((sum, invoice) => {
      const invoiceDate = new Date(invoice.date);
      return (invoice.status === 'paid' && 
              invoiceDate.getMonth() === lastMonth && 
              invoiceDate.getFullYear() === lastMonthYear) 
              ? sum + invoice.total 
              : sum;
    }, 0);
    
    return {
      totalInvoices,
      paidInvoices,
      overdueInvoices,
      totalRevenue,
      revenueThisMonth,
      revenueLastMonth,
    };
  } catch (error) {
    console.error(`Erreur lors du calcul des statistiques du tableau de bord client ${thirdPartyId}:`, error);
    throw error;
  }
};

// Obtenir les données pour le graphique d'évolution des revenus mensuels
export const getMonthlyRevenueData = async (year: number = new Date().getFullYear()): Promise<{ month: string; revenue: number }[]> => {
  try {
    const invoices = await getAllInvoices();
    
    // Filtrer les factures payées pour l'année spécifiée
    const paidInvoicesForYear = invoices.filter(invoice => {
      const invoiceDate = new Date(invoice.date);
      return invoice.status === 'paid' && invoiceDate.getFullYear() === year;
    });
    
    // Initialiser les données mensuelles
    const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
    const monthlyData = monthNames.map(month => ({ month, revenue: 0 }));
    
    // Calculer les revenus pour chaque mois
    paidInvoicesForYear.forEach(invoice => {
      const invoiceDate = new Date(invoice.date);
      const monthIndex = invoiceDate.getMonth();
      monthlyData[monthIndex].revenue += invoice.total;
    });
    
    return monthlyData;
  } catch (error) {
    console.error(`Erreur lors de la récupération des données de revenus mensuels pour l'année ${year}:`, error);
    throw error;
  }
};

// Obtenir les données pour le graphique de répartition des factures par statut
export const getInvoiceStatusDistribution = async (): Promise<{ status: string; count: number }[]> => {
  try {
    const invoices = await getAllInvoices();
    
    // Initialiser les compteurs pour chaque statut
    const statusCounts = {
      draft: 0,
      sent: 0,
      paid: 0,
      overdue: 0,
      cancelled: 0,
    };
    
    // Compter les factures pour chaque statut
    invoices.forEach(invoice => {
      statusCounts[invoice.status as keyof typeof statusCounts]++;
    });
    
    // Convertir en format pour le graphique
    return Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count,
    }));
  } catch (error) {
    console.error('Erreur lors de la récupération de la distribution des statuts de factures:', error);
    throw error;
  }
};

// Obtenir les données pour le top des clients (par montant total des factures payées)
export const getTopClients = async (limit: number = 5): Promise<{ thirdPartyId: string; thirdPartyName: string; totalAmount: number }[]> => {
  try {
    const invoices = await getAllInvoices();
    
    // Filtrer les factures payées
    const paidInvoices = invoices.filter(invoice => invoice.status === 'paid');
    
    // Calculer le montant total par client
    const clientTotals: Record<string, { thirdPartyId: string; thirdPartyName: string; totalAmount: number }> = {};
    
    paidInvoices.forEach(invoice => {
      const { thirdPartyId, thirdPartyName, total } = invoice;
      
      if (!clientTotals[thirdPartyId]) {
        clientTotals[thirdPartyId] = {
          thirdPartyId,
          thirdPartyName,
          totalAmount: 0,
        };
      }
      
      clientTotals[thirdPartyId].totalAmount += total;
    });
    
    // Convertir en tableau et trier par montant total décroissant
    const sortedClients = Object.values(clientTotals).sort((a, b) => b.totalAmount - a.totalAmount);
    
    // Limiter au nombre spécifié
    return sortedClients.slice(0, limit);
  } catch (error) {
    console.error(`Erreur lors de la récupération des ${limit} meilleurs clients:`, error);
    throw error;
  }
};
