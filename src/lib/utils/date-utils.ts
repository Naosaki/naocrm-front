/**
 * Utilitaires pour le formatage et la manipulation des dates
 */

/**
 * Convertit une date (timestamp UNIX, string ou Date) en objet Date
 * @param dateInput - La date u00e0 convertir (timestamp UNIX en secondes, string ou Date)
 * @returns Un objet Date ou null si la conversion u00e9choue
 */
export const parseDate = (dateInput: number | string | Date | null | undefined): Date | null => {
  if (dateInput === null || dateInput === undefined) return null;
  
  try {
    // Si c'est du00e9ju00e0 un objet Date
    if (dateInput instanceof Date) return dateInput;
    
    // Si c'est un nombre (timestamp UNIX en secondes)
    if (typeof dateInput === 'number') {
      // Vu00e9rifier si c'est un timestamp en secondes (< 20000000000) ou en millisecondes
      const timestamp = dateInput < 20000000000 ? dateInput * 1000 : dateInput;
      const date = new Date(timestamp);
      return isNaN(date.getTime()) ? null : date;
    }
    
    // Si c'est une chau00eene de caractu00e8res
    const date = new Date(dateInput);
    return isNaN(date.getTime()) ? null : date;
  } catch (error) {
    console.error("Erreur lors de la conversion de la date:", error);
    return null;
  }
};

/**
 * Formate une date au format franu00e7ais (JJ/MM/AAAA)
 * @param dateInput - La date u00e0 formater (timestamp UNIX en secondes, string ou Date)
 * @param format - Le format de date u00e0 utiliser (short, medium, long)
 * @returns La date formatu00e9e ou "-" si la conversion u00e9choue
 */
export const formatDate = (dateInput: number | string | Date | null | undefined, format: 'short' | 'medium' | 'long' = 'short'): string => {
  const date = parseDate(dateInput);
  if (!date) return "-";
  
  try {
    const options: Intl.DateTimeFormatOptions = {
      timeZone: 'Europe/Paris',
    };
    
    if (format === 'short') {
      options.day = '2-digit';
      options.month = '2-digit';
      options.year = 'numeric';
    } else if (format === 'medium') {
      options.day = '2-digit';
      options.month = 'long';
      options.year = 'numeric';
    } else if (format === 'long') {
      options.day = '2-digit';
      options.month = 'long';
      options.year = 'numeric';
      options.hour = '2-digit';
      options.minute = '2-digit';
    }
    
    return new Intl.DateTimeFormat('fr-FR', options).format(date);
  } catch (error) {
    console.error("Erreur lors du formatage de la date:", error);
    return "-";
  }
};

/**
 * Formate une date et heure au format franu00e7ais (JJ/MM/AAAA HH:MM)
 * @param dateInput - La date u00e0 formater (timestamp UNIX en secondes, string ou Date)
 * @returns La date et heure formatu00e9es ou "-" si la conversion u00e9choue
 */
export const formatDateTime = (dateInput: number | string | Date | null | undefined): string => {
  return formatDate(dateInput, 'long');
};
