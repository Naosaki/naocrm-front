import { useEffect, useState } from 'react';
import { onAuthStateChanged, getIdTokenResult } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
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
              // Récupérer les claims du token
              const tokenResult = await getIdTokenResult(firebaseUser);
              
              // Mettre à jour l'utilisateur avec les données Firestore et les claims
              setUser({
                ...userData,
                claims: tokenResult.claims
              });
              
              // S'abonner aux changements du document utilisateur pour détecter les mises à jour de claims
              unsubscribeFirestore = onSnapshot(doc(db, 'users', firebaseUser.uid), async (docSnapshot) => {
                if (docSnapshot.exists() && docSnapshot.data().claimsUpdated) {
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
              });
            } else {
              setUser(null);
            }
          } else {
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
