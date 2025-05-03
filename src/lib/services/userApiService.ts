import { User } from '@/types';

// Créer un nouvel utilisateur (client) via l'API
export const createClientUserApi = async (
  email: string,
  password: string,
  displayName: string,
  thirdPartyId: string
): Promise<User> => {
  try {
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        displayName,
        role: 'client',
        thirdPartyId,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erreur lors de la création de l\'utilisateur');
    }

    const data = await response.json();
    
    // Récupérer les données complètes de l'utilisateur créé
    const userResponse = await fetch(`/api/users/${data.userId}`);
    if (!userResponse.ok) {
      throw new Error('Impossible de récupérer les données de l\'utilisateur créé');
    }
    
    return await userResponse.json();
  } catch (error) {
    console.error('Erreur lors de la création de l\'utilisateur client:', error);
    throw error;
  }
};

// Créer un nouvel utilisateur (admin) via l'API
export const createAdminUserApi = async (
  email: string,
  password: string,
  displayName: string
): Promise<User> => {
  try {
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        displayName,
        role: 'admin',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erreur lors de la création de l\'utilisateur');
    }

    const data = await response.json();
    
    // Récupérer les données complètes de l'utilisateur créé
    const userResponse = await fetch(`/api/users/${data.userId}`);
    if (!userResponse.ok) {
      throw new Error('Impossible de récupérer les données de l\'utilisateur créé');
    }
    
    return await userResponse.json();
  } catch (error) {
    console.error('Erreur lors de la création de l\'utilisateur admin:', error);
    throw error;
  }
};

// Supprimer un utilisateur via l'API
export const deleteUserApi = async (userId: string): Promise<void> => {
  try {
    const response = await fetch('/api/users', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erreur lors de la suppression de l\'utilisateur');
    }
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'utilisateur:', error);
    throw error;
  }
};
