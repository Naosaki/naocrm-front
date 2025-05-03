/**
 * Utilitaires pour formater les numéros de téléphone
 */

/**
 * Formate un numéro de téléphone en format international standard
 * Détecter l'indicatif du pays et formate le numéro en conséquence
 * 
 * @param phone Le numéro de téléphone à formater
 * @returns Le numéro formaté ou le numéro original si non reconnu
 */
export const formatPhoneNumber = (phone: string | null | undefined): string => {
  if (!phone) return '-';
  
  // Supprimer tous les caractères non numériques sauf le '+'
  const cleanedPhone = phone.replace(/[^\d+]/g, '');
  
  // Correction spécifique pour les numéros commençant par 003 (qui devraient être +33)
  if (cleanedPhone.startsWith('003') && cleanedPhone.length >= 12) {
    const correctedNumber = '+33' + cleanedPhone.substring(3);
    return formatInternationalNumber(correctedNumber);
  }
  
  // Correction spécifique pour les numéros luxembourgeois commençant par 352
  if (cleanedPhone.startsWith('352') && cleanedPhone.length >= 9) {
    const correctedNumber = '+' + cleanedPhone;
    return formatInternationalNumber(correctedNumber);
  }
  
  // Si le numéro commence déjà par '+', on le considère comme déjà au format international
  if (cleanedPhone.startsWith('+')) {
    // Formater le numéro international avec des espaces pour une meilleure lisibilité
    return formatInternationalNumber(cleanedPhone);
  }
  
  // Détecter les numéros français
  if (cleanedPhone.startsWith('0') && cleanedPhone.length === 10) {
    // Convertir un numéro français commençant par 0 en format international +33
    const internationalNumber = '+33' + cleanedPhone.substring(1);
    return formatInternationalNumber(internationalNumber);
  }
  
  // Si le numéro commence par 33 et a 11 chiffres (indicatif France sans le +)
  if (cleanedPhone.startsWith('33') && cleanedPhone.length === 11) {
    const internationalNumber = '+' + cleanedPhone;
    return formatInternationalNumber(internationalNumber);
  }
  
  // Pour les numéros qui semblent être des numéros internationaux sans le '+'
  if (cleanedPhone.length > 10) {
    // Ajouter le '+' et formater
    return formatInternationalNumber('+' + cleanedPhone);
  }
  
  // Si aucun format n'est reconnu, retourner le numéro original
  return phone;
};

/**
 * Formate un numéro international avec des espaces pour une meilleure lisibilité
 * 
 * @param phone Le numéro de téléphone au format international (avec '+')
 * @returns Le numéro formaté avec des espaces
 */
const formatInternationalNumber = (phone: string): string => {
  // Supprimer tous les espaces existants
  const withoutSpaces = phone.replace(/\s/g, '');
  
  // Formater différemment selon l'indicatif du pays
  if (withoutSpaces.startsWith('+33')) { // France
    // Format: +33 6 12 34 56 78
    const digits = withoutSpaces.substring(3); // Enlever '+33'
    if (digits.length === 9) {
      return `+33 ${digits.substring(0, 1)} ${digits.substring(1, 3)} ${digits.substring(3, 5)} ${digits.substring(5, 7)} ${digits.substring(7, 9)}`;
    }
  } else if (withoutSpaces.startsWith('+1')) { // USA/Canada
    // Format: +1 234 567 8901
    const digits = withoutSpaces.substring(2); // Enlever '+1'
    if (digits.length === 10) {
      return `+1 ${digits.substring(0, 3)} ${digits.substring(3, 6)} ${digits.substring(6, 10)}`;
    }
  } else if (withoutSpaces.startsWith('+44')) { // UK
    // Format: +44 1234 567890
    const digits = withoutSpaces.substring(3); // Enlever '+44'
    if (digits.length >= 10) {
      return `+44 ${digits.substring(0, 4)} ${digits.substring(4)}`;
    }
  } else if (withoutSpaces.startsWith('+49')) { // Allemagne
    // Format: +49 123 4567890
    const digits = withoutSpaces.substring(3); // Enlever '+49'
    if (digits.length >= 10) {
      return `+49 ${digits.substring(0, 3)} ${digits.substring(3)}`;
    }
  } else if (withoutSpaces.startsWith('+34')) { // Espagne
    // Format: +34 123 456 789
    const digits = withoutSpaces.substring(3); // Enlever '+34'
    if (digits.length === 9) {
      return `+34 ${digits.substring(0, 3)} ${digits.substring(3, 6)} ${digits.substring(6, 9)}`;
    }
  } else if (withoutSpaces.startsWith('+39')) { // Italie
    // Format: +39 123 456 7890
    const digits = withoutSpaces.substring(3); // Enlever '+39'
    if (digits.length >= 10) {
      return `+39 ${digits.substring(0, 3)} ${digits.substring(3, 6)} ${digits.substring(6)}`;
    }
  } else if (withoutSpaces.startsWith('+32')) { // Belgique
    // Format: +32 12 345 678
    const digits = withoutSpaces.substring(3); // Enlever '+32'
    if (digits.length >= 8) {
      return `+32 ${digits.substring(0, 2)} ${digits.substring(2, 5)} ${digits.substring(5)}`;
    }
  } else if (withoutSpaces.startsWith('+41')) { // Suisse
    // Format: +41 12 345 67 89
    const digits = withoutSpaces.substring(3); // Enlever '+41'
    if (digits.length === 9) {
      return `+41 ${digits.substring(0, 2)} ${digits.substring(2, 5)} ${digits.substring(5, 7)} ${digits.substring(7, 9)}`;
    }
  } else if (withoutSpaces.startsWith('+352')) { // Luxembourg
    // Format: +352 123 456
    const digits = withoutSpaces.substring(4); // Enlever '+352'
    if (digits.length >= 6) {
      return `+352 ${digits.substring(0, 3)} ${digits.substring(3)}`;
    }
  } else if (withoutSpaces.startsWith('+31')) { // Pays-Bas
    // Format: +31 12 345 6789
    const digits = withoutSpaces.substring(3); // Enlever '+31'
    if (digits.length >= 9) {
      return `+31 ${digits.substring(0, 2)} ${digits.substring(2, 5)} ${digits.substring(5)}`;
    }
  } else if (withoutSpaces.startsWith('+351')) { // Portugal
    // Format: +351 123 456 789
    const digits = withoutSpaces.substring(4); // Enlever '+351'
    if (digits.length === 9) {
      return `+351 ${digits.substring(0, 3)} ${digits.substring(3, 6)} ${digits.substring(6, 9)}`;
    }
  } else if (withoutSpaces.startsWith('+353')) { // Irlande
    // Format: +353 12 345 6789
    const digits = withoutSpaces.substring(4); // Enlever '+353'
    if (digits.length >= 9) {
      return `+353 ${digits.substring(0, 2)} ${digits.substring(2, 5)} ${digits.substring(5)}`;
    }
  }
  
  // Pour les autres indicatifs ou formats non reconnus, ajouter simplement un espace après l'indicatif
  // Détecter l'indicatif (1 à 3 chiffres après le '+')
  const match = withoutSpaces.match(/^\+(\d{1,3})(.*)$/);
  if (match) {
    return `+${match[1]} ${match[2].replace(/(\d{3})(\d{3})(\d{3,4})/, '$1 $2 $3')}`;
  }
  
  // Si aucun format n'est reconnu, retourner le numéro tel quel
  return withoutSpaces;
};
