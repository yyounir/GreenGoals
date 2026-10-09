import { getApp, getApps, initializeApp } from 'firebase/app'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

export const firebaseReady = Object.values(firebaseConfig).every(Boolean)
export const firebaseApp = firebaseReady
  ? getApps().length ? getApp() : initializeApp(firebaseConfig)
  : null
export const authServices = firebaseApp
  ? import('firebase/auth').then(authModule => ({
    auth: authModule.getAuth(firebaseApp),
    authModule,
    googleProvider: new authModule.GoogleAuthProvider(),
  }))
  : Promise.resolve(null)

let dataServices
export function loadDataServices() {
  if (!firebaseApp) return Promise.resolve(null)
  if (!dataServices) {
    dataServices = Promise.all([
      authServices,
      import('firebase/firestore'),
      import('firebase/functions'),
    ]).then(([auth, firestoreModule, functionsModule]) => ({
      ...auth,
      db: firestoreModule.getFirestore(firebaseApp),
      firestoreModule,
      functionsModule,
      functions: functionsModule.getFunctions(firebaseApp, import.meta.env.VITE_FIREBASE_FUNCTIONS_REGION || 'us-central1'),
    }))
  }
  return dataServices
}
