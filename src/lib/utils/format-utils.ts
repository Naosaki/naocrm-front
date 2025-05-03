/**
 * Utilitaires pour le formatage des données
 */

/**
 * Formate un montant monétaire avec le symbole de l'euro
 * 
 * @param amount Le montant à formater
 * @param currency Le symbole de la devise (par défaut : €)
 * @returns Le montant formaté avec le symbole de la devise
 */
export const formatAmount = (amount: number | null | undefined, currency: string = '€'): string => {
  if (amount === null || amount === undefined || isNaN(amount)) return '0,00 €';
  
  // Formater le nombre avec 2 décimales et un espace comme séparateur de milliers
  const formattedAmount = new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
  
  // Ajouter le symbole de la devise
  return `${formattedAmount} ${currency}`;
};

/**
 * Formate une date au format français (JJ/MM/AAAA)
 * 
 * @param date La date à formater
 * @returns La date formatée au format français
 */
export const formatDate = (date: Date | string | number | null | undefined): string => {
  if (!date) return '-';
  
  // Convertir en objet Date si nécessaire
  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  
  // Vérifier si la date est valide
  if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) return '-';
  
  // Formater la date au format français (JJ/MM/AAAA)
  return dateObj.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};
