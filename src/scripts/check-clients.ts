// Script pour vérifier les clients existants dans Firestore

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

// Utiliser les variables d'environnement pour la configuration Firebase
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Fonction pour vérifier les clients existants
async function checkClients(): Promise<void> {
  console.log('Vérification des clients existants dans Firestore...');
  
  try {
    const querySnapshot = await getDocs(collection(db, 'thirdParties'));
    
    if (querySnapshot.empty) {
      console.log('Aucun client trouvé dans la collection "thirdParties".');
    } else {
      console.log(`${querySnapshot.size} clients trouvés dans la collection "thirdParties":`);
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        console.log(`ID: ${doc.id}, Nom: ${data.name}, Email: ${data.email}`);
      });
    }
  } catch (error) {
    console.error('Erreur lors de la vérification des clients:', error);
  }
}

// Exécuter la fonction
checkClients();
