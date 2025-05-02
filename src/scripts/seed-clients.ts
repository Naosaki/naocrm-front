// Script pour ajouter des clients de test à Firestore

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ThirdParty } from '../types';

// Configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBBDMZYDxKO5XnILVz0mNGl-_Jg3WRoR0c",
  authDomain: "crm-portal-e3b8f.firebaseapp.com",
  projectId: "crm-portal-e3b8f",
  storageBucket: "crm-portal-e3b8f.appspot.com",
  messagingSenderId: "1045331964589",
  appId: "1:1045331964589:web:f7f9b7e0e9c0f3c6e0f0f3"
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Données des clients de test
const testClients: Omit<ThirdParty, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: "Entreprise ABC",
    email: "contact@abc.com",
    phone: "+33 1 23 45 67 89",
    address: "123 Avenue des Champs-Élysées",
    city: "Paris",
    postalCode: "75008",
    country: "France",
    contactPerson: "Jean Dupont",
    notes: "Client premium depuis 2023"
  },
  {
    name: "Société XYZ",
    email: "info@xyz.com",
    phone: "+33 6 12 34 56 78",
    address: "45 Rue du Commerce",
    city: "Lyon",
    postalCode: "69002",
    country: "France",
    contactPerson: "Marie Martin",
    notes: "Nouveau client avec potentiel de croissance"
  },
  {
    name: "Compagnie 123",
    email: "contact@123.com",
    phone: "+33 4 56 78 90 12",
    address: "78 Boulevard de la Liberté",
    city: "Marseille",
    postalCode: "13001",
    country: "France",
    contactPerson: "Pierre Durand",
    notes: "Client fidèle depuis 5 ans"
  },
  {
    name: "Entreprise DEF",
    email: "info@def.com",
    phone: "+33 5 67 89 01 23",
    address: "12 Rue de la Paix",
    city: "Bordeaux",
    postalCode: "33000",
    country: "France",
    contactPerson: "Sophie Lefebvre",
    notes: "Client international avec multiples filiales"
  },
  {
    name: "Société GHI",
    email: "contact@ghi.com",
    phone: "+33 7 89 01 23 45",
    address: "34 Avenue Jean Jaurès",
    city: "Toulouse",
    postalCode: "31000",
    country: "France",
    contactPerson: "Thomas Bernard",
    notes: "PME en forte croissance"
  }
];

// Fonction pour ajouter les clients à Firestore
async function seedClients(): Promise<void> {
  console.log('Début de l\'ajout des clients de test...');
  
  try {
    for (const client of testClients) {
      const docRef = await addDoc(collection(db, 'thirdParties'), {
        ...client,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      console.log(`Client ajouté avec l'ID: ${docRef.id}`);
    }
    console.log('Tous les clients de test ont été ajoutés avec succès!');
  } catch (error) {
    console.error('Erreur lors de l\'ajout des clients:', error);
  }
}

// Exécuter la fonction
seedClients();
