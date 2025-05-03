// Script pour ajouter des clients de test à Firestore

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ThirdParty } from '../types';
import * as dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

// Configuration Firebase en utilisant les variables d'environnement
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Vérifier que toutes les variables d'environnement nécessaires sont définies
const requiredEnvVars = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID'
];

const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingEnvVars.length > 0) {
  console.error(`Erreur: Variables d'environnement manquantes: ${missingEnvVars.join(', ')}`);
  console.error('Veuillez définir ces variables dans un fichier .env ou .env.local');
  process.exit(1);
}

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
      const docRef = await addDoc(collection(db, 'thirdparties'), {
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
