import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from "firebase/auth"
import { getFirestore } from 'firebase/firestore'
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

export const useFirebase = () => {
    const config = useRuntimeConfig()

    //console.log(config)

    const firebaseConfig = {
        apiKey: config.public.API_KEY_FIREBASE,
        authDomain: config.public.AUTH_DOMAIN_FIREBASE,
        projectId: config.public.PROJECT_ID_FIREBASE,
        storageBucket: config.public.STORAGE_BUCKET_FIREBASE,
        messagingSenderId: config.public.MESSAGING_SENDER_ID_FIREBASE,
        appId: config.public.APP_ID_FIREBASE,
        measurementId: config.public.MEASUREMENT_ID_FIREBASE
    };

    const app = initializeApp(firebaseConfig)

    const auth = getAuth(app)
    const firestore = getFirestore(app)
    const database = getDatabase(app);
    const storage = getStorage(app);

    return {
        auth,
        firestore,
        database,
        storage
    }
}
