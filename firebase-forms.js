import { db } from './firebase-client.js';
import { addDoc, collection, serverTimestamp } from 'https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js';

const clean = value => String(value ?? '').trim();

window.enviarAFirebase = async function(data) {
  let collectionName;
  let record;

  if (data.formType === 'leads') {
    collectionName = 'leads';
    record = {
      nombre: clean(data.nombre), apellido: clean(data.apellido), email: clean(data.email),
      whatsapp: clean(data.telefono), seguro: clean(data.seguro), marca: clean(data.marca),
      modelo: clean(data.modelo), anio: clean(data.anio), comentarios: clean(data.mensaje),
      estado: 'Pendiente', notas: '', createdAt: serverTimestamp()
    };
  } else if (data.formType === 'siniestros') {
    collectionName = 'siniestros';
    record = {
      nombre: clean(data.sinNombre), whatsapp: clean(data.sinTelefono), dni: clean(data.sinDni),
      email: clean(data.sinEmail), tipoSeguro: clean(data.sinTipoSeguro),
      fechaSiniestro: clean(data.sinFecha), hora: clean(data.sinHora), lugar: clean(data.sinLugar),
      localidad: clean(data.sinLocalidad), descripcion: clean(data.sinDescripcion),
      danos: clean(data.sinDanos), comentarios: clean(data.sinObservaciones),
      estado: 'Pendiente', notas: '', createdAt: serverTimestamp()
    };
  } else if (data.formType === 'bajas') {
    collectionName = 'bajas';
    record = {
      nombre: clean(data.nombre), apellido: clean(data.apellido), whatsapp: clean(data.whatsapp),
      email: clean(data.email), dni: clean(data.dni), patente: clean(data.patente),
      compania: clean(data.compania), experiencia: clean(data.experiencia),
      puntuacion: Number(data.puntuacion), motivo: clean(data.motivo),
      comentarios: clean(data.comentarios), estado: 'Pendiente', notas: '',
      createdAt: serverTimestamp()
    };
  } else {
    throw new Error('Tipo de formulario inválido');
  }

  return addDoc(collection(db, collectionName), record);
};
