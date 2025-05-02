import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const COLLECTION = 'products';

interface ProductData {
  ref: string;
  label: string;
  description: string;
  stock_reel: number;
  date_creation: Date;
}

const sampleProducts: ProductData[] = [
  {
    ref: "LAPTOP-001",
    label: "Ordinateur portable Pro",
    description: "Ordinateur portable haute performance pour professionnels",
    stock_reel: 15,
    date_creation: new Date()
  },
  {
    ref: "PHONE-X12",
    label: "Smartphone X12",
    description: "Dernier modèle de smartphone avec appareil photo 48MP",
    stock_reel: 23,
    date_creation: new Date()
  },
  {
    ref: "SCREEN-4K27",
    label: "Écran 27 pouces 4K",
    description: "Écran haute résolution pour une expérience visuelle optimale",
    stock_reel: 8,
    date_creation: new Date()
  },
  {
    ref: "MOUSE-ERG1",
    label: "Souris sans fil ergonomique",
    description: "Souris confortable pour une utilisation prolongée",
    stock_reel: 42,
    date_creation: new Date()
  },
  {
    ref: "KB-MECH-RGB",
    label: "Clavier mécanique RGB",
    description: "Clavier gaming avec rétroéclairage personnalisable",
    stock_reel: 17,
    date_creation: new Date()
  },
  {
    ref: "HEADSET-BT1",
    label: "Casque audio sans fil",
    description: "Casque bluetooth avec réduction de bruit active",
    stock_reel: 3,
    date_creation: new Date()
  },
  {
    ref: "TABLET-G1",
    label: "Tablette graphique",
    description: "Pour les designers et artistes numériques",
    stock_reel: 11,
    date_creation: new Date()
  },
  {
    ref: "SSD-1TB",
    label: "Disque SSD 1TB",
    description: "Stockage rapide pour améliorer les performances",
    stock_reel: 28,
    date_creation: new Date()
  },
  {
    ref: "CAM-HD1",
    label: "Webcam HD",
    description: "Idéale pour les visioconférences et le streaming",
    stock_reel: 5,
    date_creation: new Date()
  },
  {
    ref: "ROUTER-WIFI6",
    label: "Routeur Wi-Fi 6",
    description: "Connexion ultra-rapide pour toute la maison",
    stock_reel: 14,
    date_creation: new Date()
  }
];

async function seedProducts() {
  console.log('Début de l\'ajout des produits de test...');
  
  try {
    const productsCollection = collection(db, COLLECTION);
    
    for (const product of sampleProducts) {
      // Créer une date de création aléatoire dans les 30 derniers jours
      const randomDaysAgo = Math.floor(Math.random() * 30);
      const randomDate = new Date();
      randomDate.setDate(randomDate.getDate() - randomDaysAgo);
      
      await addDoc(productsCollection, {
        ...product,
        date_creation: randomDate,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      console.log(`Produit ajouté: ${product.label} (${product.ref})`);
    }
    
    console.log('Tous les produits ont été ajoutés avec succès!');
  } catch (error) {
    console.error('Erreur lors de l\'ajout des produits:', error);
  }
}

// Exécuter la fonction
seedProducts();
