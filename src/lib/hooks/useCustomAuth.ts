import { useEffect, useState } from 'react';
import { onAuthStateChanged, getIdTokenResult } from 'firebase/auth';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { User } from '@/types';
import { getUserById } from '../services/userService';

export function useCustomAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let unsubscribeAuth = () => {};
    let unsubscribeFirestore: (() => void) | undefined;

    const setupAuthListener = async () => {
      unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
        setLoading(true);
        
        try {
          if (firebaseUser) {
            // Récupérer les données complètes de l'utilisateur depuis Firestore
            const userData = await getUserById(firebaseUser.uid);
            
            if (userData) {
              console.log('Utilisateur authentifié:', userData); // Log pour débogage
              
              // Récupérer les claims du token
              const tokenResult = await getIdTokenResult(firebaseUser);
              
              // Mettre à jour l'utilisateur avec les données Firestore et les claims
              setUser({
                ...userData,
                claims: tokenResult.claims
              });
              
              // S'abonner aux changements du document utilisateur pour détecter les mises à jour de claims
              unsubscribeFirestore = onSnapshot(doc(db, 'users', firebaseUser.uid), async (docSnapshot) => {
                if (docSnapshot.exists()) {
                  const updatedData = docSnapshot.data();
                  console.log('Données utilisateur mises à jour:', updatedData); // Log pour débogage
                  
                  if (updatedData.claimsUpdated) {
                    // Si claimsUpdated a été mis à jour, actualiser le token
                    try {
                      // Forcer l'actualisation du token
                      await firebaseUser.getIdToken(true);
                      // Récupérer le token avec les claims
                      const tokenResult = await getIdTokenResult(firebaseUser);
                      
                      // Récupérer les données utilisateur mises à jour
                      const updatedUserData = await getUserById(firebaseUser.uid);
                      if (updatedUserData) {
                        setUser({
                          ...updatedUserData,
                          claims: tokenResult.claims
                        });
                      }
                    } catch (err) {
                      console.error('Erreur lors de l\'actualisation du token:', err);
                    }
                  }
                }
              });
            } else {
              // Si l'utilisateur existe dans Auth mais pas dans Firestore, créer l'entrée Firestore
              console.warn('Utilisateur Firebase authentifié mais aucune donnée Firestore trouvée:', firebaseUser.uid);
              
              try {
                // Créer un document utilisateur minimal dans Firestore
                const userRef = doc(db, 'users', firebaseUser.uid);
                await setDoc(userRef, {
                  id: firebaseUser.uid,
                  email: firebaseUser.email,
                  displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Utilisateur',
                  photoURL: firebaseUser.photoURL,
                  role: 'client', // Rôle par défaut
                  createdAt: new Date(),
                  lastLogin: new Date(),
                });
                
                // Récupérer les données de l'utilisateur nouvellement créé
                const newUserData = await getUserById(firebaseUser.uid);
                if (newUserData) {
                  const tokenResult = await getIdTokenResult(firebaseUser);
                  setUser({
                    ...newUserData,
                    claims: tokenResult.claims
                  });
                } else {
                  setUser(null);
                }
              } catch (error) {
                console.error('Erreur lors de la création du document utilisateur:', error);
                setUser(null);
              }
            }
          } else {
            console.log('Aucun utilisateur authentifié');
            setUser(null);
            if (unsubscribeFirestore) {
              unsubscribeFirestore();
              unsubscribeFirestore = undefined;
            }
          }
        } catch (err) {
          console.error('Erreur lors de la récupération des données utilisateur:', err);
          setError('Erreur lors de la récupération des données utilisateur');
          setUser(null);
        } finally {
          setLoading(false);
        }
      });
    };

    setupAuthListener();

    return () => {
      unsubscribeAuth();
      if (unsubscribeFirestore) {
        unsubscribeFirestore();
      }
    };
  }, []);

  return { user, loading, error };
}
