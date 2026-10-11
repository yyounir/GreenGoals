import { getApp, getApps, initializeApp } from "firebase/app";

const useEmulators = import.meta.env.VITE_USE_EMULATORS === "true";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const firebaseReady = Object.values(firebaseConfig).every(Boolean);
export const firebaseApp = firebaseReady
  ? getApps().length
    ? getApp()
    : initializeApp(firebaseConfig)
  : null;

export const authServices = firebaseApp
  ? import("firebase/auth").then((authModule) => {
      const auth = authModule.getAuth(firebaseApp);
      if (useEmulators) {
        authModule.connectAuthEmulator(auth, "http://127.0.0.1:9099", {
          disableWarnings: true,
        });
      }
      return {
        auth,
        authModule,
        googleProvider: new authModule.GoogleAuthProvider(),
      };
    })
  : Promise.resolve(null);

let dataServices;
export function loadDataServices() {
  if (!firebaseApp) return Promise.resolve(null);
  if (!dataServices) {
    dataServices = Promise.all([
      authServices,
      import("firebase/firestore"),
      import("firebase/functions"),
    ]).then(([auth, firestoreModule, functionsModule]) => {
      const db = firestoreModule.getFirestore(firebaseApp);
      const functions = functionsModule.getFunctions(
        firebaseApp,
        import.meta.env.VITE_FIREBASE_FUNCTIONS_REGION || "us-central1",
      );
      if (useEmulators) {
        firestoreModule.connectFirestoreEmulator(db, "127.0.0.1", 8080);
        functionsModule.connectFunctionsEmulator(functions, "127.0.0.1", 5001);
      }
      return { ...auth, db, firestoreModule, functionsModule, functions };
    });
  }
  return dataServices;
}
