import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js';

const firebaseConfig = {
  apiKey: 'AIzaSyD5uih7rqJNDlTRyJxFjUMGsUrE3POShCI',
  authDomain: 'sector-seguro-arg.firebaseapp.com',
  projectId: 'sector-seguro-arg',
  storageBucket: 'sector-seguro-arg.firebasestorage.app',
  messagingSenderId: '632781274833',
  appId: '1:632781274833:web:c5cd252a9a96073b758ff0'
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
