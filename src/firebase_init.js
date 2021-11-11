import { initializeApp } from "firebase/app";
import firebase_config from "./firebase_config";

const firebaseApp = initializeApp(firebase_config);

export { firebaseApp };
