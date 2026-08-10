import { auth, db } from './firebase-client.js';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js';
import { collection, doc, getDoc, getDocs, orderBy, query, updateDoc } from 'https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js';

const formatDate = value => {
  if (!value?.toDate) return '';
  return new Intl.DateTimeFormat('es-AR', { dateStyle: 'short', timeStyle: 'short' }).format(value.toDate());
};

async function assertAdmin(user) {
  if (!user) throw new Error('Sesión no iniciada');
  const admin = await getDoc(doc(db, 'admins', user.uid));
  if (!admin.exists()) {
    await signOut(auth);
    throw new Error('El usuario no tiene acceso al panel');
  }
}

async function readCollection(name) {
  const result = await getDocs(query(collection(db, name), orderBy('createdAt', 'desc')));
  return result.docs.map(item => ({ ...item.data(), key: item.id, fecha: formatDate(item.data().createdAt) }));
}

window.firebaseAdminApi = {
  async login(email, password) {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    await assertAdmin(credential.user);
    return credential.user;
  },
  logout() { return signOut(auth); },
  async loadAll() {
    await assertAdmin(auth.currentUser);
    const [bajas, siniestros, leads] = await Promise.all([
      readCollection('bajas'), readCollection('siniestros'), readCollection('leads')
    ]);
    return { bajas, siniestros, leads };
  },
  async save(type, id, estado, notas) {
    await assertAdmin(auth.currentUser);
    await updateDoc(doc(db, type, id), { estado, notas });
  },
  onSession(callback) {
    return onAuthStateChanged(auth, async user => {
      if (!user) return callback(null);
      try { await assertAdmin(user); callback(user); } catch { callback(null); }
    });
  }
};

window.dispatchEvent(new Event('firebase-admin-ready'));
