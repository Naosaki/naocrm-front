/**
 * Utilitaires pour les factures
 */

/**
 * Convertit un statut numérique de facture en texte
 * 0 = Non validée
 * 1 = Impayée
 * 2 = Payée
 * 
 * @param status Le statut numérique ou textuel de la facture
 * @returns Le libellé du statut
 */
export const getInvoiceStatusLabel = (status: string | number | undefined): string => {
  if (status === undefined || status === null) return 'Non validée';
  
  // Convertir en nombre si c'est une chaîne numérique
  const numericStatus = typeof status === 'string' && !isNaN(Number(status)) 
    ? Number(status) 
    : typeof status === 'number' 
      ? status 
      : -1;
  
  switch (numericStatus) {
    case 0:
      return 'Non validée';
    case 1:
      return 'Impayée';
    case 2:
      return 'Payée';
    default:
      // Si ce n'est pas un statut numérique, vérifier les valeurs textuelles
      if (typeof status === 'string') {
        switch (status.toLowerCase()) {
          case 'draft':
            return 'Non validée';
          case 'sent':
          case 'overdue':
            return 'Impayée';
          case 'paid':
            return 'Payée';
          case 'cancelled':
            return 'Annulée';
          default:
            return status;
        }
      }
      return String(status);
  }
};

/**
 * Obtient la classe CSS pour la couleur du badge de statut
 * 
 * @param status Le statut numérique ou textuel de la facture
 * @returns La classe CSS pour le badge
 */
export const getInvoiceStatusColor = (status: string | number | undefined): string => {
  if (status === undefined || status === null) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100';
  
  // Convertir en nombre si c'est une chaîne numérique
  const numericStatus = typeof status === 'string' && !isNaN(Number(status)) 
    ? Number(status) 
    : typeof status === 'number' 
      ? status 
      : -1;
  
  switch (numericStatus) {
    case 0: // Non validée - jaune
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100';
    case 1: // Impayée - rouge
      return 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100';
    case 2: // Payée - vert
      return 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100';
    default:
      // Si ce n'est pas un statut numérique, vérifier les valeurs textuelles
      if (typeof status === 'string') {
        switch (status.toLowerCase()) {
          case 'draft':
            return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100';
          case 'sent':
            return 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100';
          case 'overdue':
            return 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100';
          case 'paid':
            return 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100';
          case 'cancelled':
            return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100';
          default:
            return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100';
        }
      }
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100';
  }
};
