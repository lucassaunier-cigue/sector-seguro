// ============================================================
// Sector Seguro - Google Apps Script Web App
// Conecta los formularios del sitio con dos Google Sheets.
// Distribuye los registros de forma equitativa: siempre escribe
// en la planilla que tenga menos filas en esa solapa.
//
// INSTRUCCIONES DE DEPLOY:
// 1. Ir a script.google.com → Nuevo proyecto
// 2. Pegar este código
// 3. Clic en "Implementar" → "Nueva implementación"
// 4. Tipo: Aplicación web
//    - Ejecutar como: Yo (tu cuenta Google)
//    - Quién tiene acceso: Cualquier persona
// 5. Copiar la URL generada y pegarla en index.html
//    donde dice: const SCRIPT_URL = 'PEGAR_URL_AQUI';
// ============================================================

const SHEET_IDS = [
  '1z6eN2CUs6bcfaBhhUONoKXp7ByO-stxBgmE_Nzg-Bzk',
  '1FqKtLSl4d5oEHxhhsVpK1xYfbLgEX6BhdxYKTbvlL6I'
];

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    if (data.action === 'updateBaja') {
      actualizarBaja_(data);
      return ContentService.createTextOutput(JSON.stringify({ success: true }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    if (data.action === 'updateCaso') {
      actualizarCaso_(data);
      return ContentService.createTextOutput(JSON.stringify({ success: true }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    const formType = data.formType; // 'leads', 'siniestros' o 'bajas'
    const sheetName = formType === 'leads' ? 'Leads' : (formType === 'bajas' ? 'Bajas' : 'Siniestros');

    // Abrir ambas planillas y obtener la solapa correspondiente
    const sheets = SHEET_IDS.map(function(id) {
      const book = SpreadsheetApp.openById(id);
      var sheet = book.getSheetByName(sheetName);
      if (!sheet && sheetName === 'Bajas') {
        sheet = book.insertSheet('Bajas');
        sheet.appendRow(['Fecha', 'ID', 'Nombre', 'Apellido', 'WhatsApp', 'Email', 'DNI', 'Patente', 'Compañía', 'Experiencia', 'Puntuación', 'Motivo', 'Comentarios', 'Estado', 'Notas internas']);
        sheet.setFrozenRows(1);
      }
      return sheet;
    });

    // Elegir la planilla con menos filas (distribución equitativa)
    const rowCounts = sheets.map(function(sheet) {
      return sheet.getLastRow();
    });
    const targetIndex = rowCounts[0] <= rowCounts[1] ? 0 : 1;
    const targetSheet = sheets[targetIndex];

    // Timestamp en zona horaria Argentina
    const timestamp = Utilities.formatDate(
      new Date(),
      'America/Argentina/Buenos_Aires',
      'dd/MM/yyyy HH:mm:ss'
    );

    // Armar la fila según el tipo de formulario
    var row;
    if (formType === 'leads') {
      row = [
        timestamp,
        data.nombre        || '',
        data.apellido      || '',
        data.email         || '',
        data.telefono      || '',
        data.seguro        || '',
        data.marca         || '',
        data.modelo        || '',
        data.anio          || '',
        data.mensaje       || ''
      ];
    } else if (formType === 'siniestros') {
      row = [
        timestamp,
        data.sinNombre       || '',
        data.sinTelefono     || '',
        data.sinDni          || '',
        data.sinEmail        || '',
        data.sinTipoSeguro   || '',
        data.sinFecha        || '',
        data.sinHora         || '',
        data.sinLugar        || '',
        data.sinLocalidad    || '',
        data.sinDescripcion  || '',
        data.sinDanos        || '',
        data.sinObservaciones|| ''
      ];
    } else {
      row = [
        timestamp,
        Utilities.getUuid(),
        data.nombre || '',
        data.apellido || '',
        data.whatsapp || '',
        data.email || '',
        data.dni || '',
        data.patente || '',
        data.compania || '',
        data.experiencia || '',
        data.puntuacion || '',
        data.motivo || '',
        data.comentarios || '',
        'Pendiente',
        ''
      ];
    }

    targetSheet.appendRow(row);

    return ContentService
      .createTextOutput(JSON.stringify({ success: true, planilla: targetIndex + 1 }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Verificación de que el script está activo
function doGet(e) {
  if (e && e.parameter && e.parameter.action === 'listBajas') {
    return listarBajas_(e.parameter.callback, e.parameter.key);
  }
  if (e && e.parameter && e.parameter.action === 'listPanel') {
    return listarPanel_(e.parameter.callback, e.parameter.key);
  }
  return ContentService.createTextOutput('Sector Seguro - Form Handler activo ✓')
    .setMimeType(ContentService.MimeType.TEXT);
}

function validarAdmin_(key) {
  const expected = PropertiesService.getScriptProperties().getProperty('ADMIN_KEY');
  if (!expected || key !== expected) throw new Error('Acceso no autorizado');
}

function listarBajas_(callback, key) {
  validarAdmin_(key);
  var rows = [];
  SHEET_IDS.forEach(function(id) {
    const sheet = SpreadsheetApp.openById(id).getSheetByName('Bajas');
    if (sheet && sheet.getLastRow() > 1) {
      rows = rows.concat(sheet.getRange(2, 1, sheet.getLastRow() - 1, 15).getDisplayValues());
    }
  });
  const items = rows.map(function(r) {
    return { fecha:r[0], id:r[1], nombre:r[2], apellido:r[3], whatsapp:r[4], email:r[5], dni:r[6], patente:r[7], compania:r[8], experiencia:r[9], puntuacion:Number(r[10] || 0), motivo:r[11], comentarios:r[12], estado:r[13] || 'Pendiente', notas:r[14] };
  }).reverse();
  const payload = JSON.stringify({success:true, items:items});
  if (callback && /^[a-zA-Z_$][\w$\.]*$/.test(callback)) {
    return ContentService.createTextOutput(callback + '(' + payload + ');').setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(payload).setMimeType(ContentService.MimeType.JSON);
}

function actualizarBaja_(data) {
  validarAdmin_(data.key);
  const allowed = ['Pendiente', 'Confirmada', 'Cotizando', 'Recuperado', 'Perdido', 'Anulada'];
  if (allowed.indexOf(data.estado) === -1) throw new Error('Estado inválido');
  for (var s = 0; s < SHEET_IDS.length; s++) {
    const sheet = SpreadsheetApp.openById(SHEET_IDS[s]).getSheetByName('Bajas');
    if (!sheet || sheet.getLastRow() < 2) continue;
    const ids = sheet.getRange(2, 2, sheet.getLastRow() - 1, 1).getDisplayValues();
    for (var i = 0; i < ids.length; i++) {
      if (ids[i][0] === data.id) {
        sheet.getRange(i + 2, 14, 1, 2).setValues([[data.estado, data.notas || '']]);
        return true;
      }
    }
  }
  throw new Error('Solicitud no encontrada');
}

function listarPanel_(callback, key) {
  validarAdmin_(key);
  const result = {success:true, bajas:[], siniestros:[], leads:[]};
  SHEET_IDS.forEach(function(bookId, bookIndex) {
    const book = SpreadsheetApp.openById(bookId);
    const bajas = book.getSheetByName('Bajas');
    if (bajas && bajas.getLastRow() > 1) {
      bajas.getRange(2, 1, bajas.getLastRow() - 1, 15).getDisplayValues().forEach(function(r, i) {
        result.bajas.push({key:bookIndex + ':' + (i + 2), fecha:r[0], id:r[1], nombre:r[2], apellido:r[3], whatsapp:r[4], email:r[5], dni:r[6], patente:r[7], compania:r[8], experiencia:r[9], puntuacion:Number(r[10] || 0), motivo:r[11], comentarios:r[12], estado:r[13] || 'Pendiente', notas:r[14]});
      });
    }
    const siniestros = book.getSheetByName('Siniestros');
    if (siniestros && siniestros.getLastRow() > 1) {
      siniestros.getRange(2, 1, siniestros.getLastRow() - 1, Math.max(15, siniestros.getLastColumn())).getDisplayValues().forEach(function(r, i) {
        result.siniestros.push({key:bookIndex + ':' + (i + 2), fecha:r[0], nombre:r[1], whatsapp:r[2], dni:r[3], email:r[4], tipoSeguro:r[5], fechaSiniestro:r[6], hora:r[7], lugar:r[8], localidad:r[9], descripcion:r[10], danos:r[11], comentarios:r[12], estado:r[13] || 'Pendiente', notas:r[14] || ''});
      });
    }
    const leads = book.getSheetByName('Leads');
    if (leads && leads.getLastRow() > 1) {
      leads.getRange(2, 1, leads.getLastRow() - 1, Math.max(12, leads.getLastColumn())).getDisplayValues().forEach(function(r, i) {
        result.leads.push({key:bookIndex + ':' + (i + 2), fecha:r[0], nombre:r[1], apellido:r[2], email:r[3], whatsapp:r[4], seguro:r[5], marca:r[6], modelo:r[7], anio:r[8], comentarios:r[9], estado:r[10] || 'Pendiente', notas:r[11] || ''});
      });
    }
  });
  ['bajas','siniestros','leads'].forEach(function(type) {
    result[type].sort(function(a,b) { return b.fecha.localeCompare(a.fecha); });
  });
  const payload = JSON.stringify(result);
  if (callback && /^[a-zA-Z_$][\w$\.]*$/.test(callback)) {
    return ContentService.createTextOutput(callback + '(' + payload + ');').setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(payload).setMimeType(ContentService.MimeType.JSON);
}

function actualizarCaso_(data) {
  validarAdmin_(data.keyAdmin);
  const allowedTypes = {bajas:'Bajas', siniestros:'Siniestros', leads:'Leads'};
  const allowedStates = ['Pendiente','En gestión','Contactado','Resuelto','Cerrado','Confirmada','Cotizando','Recuperado','Perdido','Anulada'];
  if (!allowedTypes[data.tipo] || allowedStates.indexOf(data.estado) === -1) throw new Error('Datos inválidos');
  const parts = String(data.recordKey).split(':');
  const bookIndex = Number(parts[0]), row = Number(parts[1]);
  if (bookIndex < 0 || bookIndex >= SHEET_IDS.length || row < 2) throw new Error('Registro inválido');
  const sheet = SpreadsheetApp.openById(SHEET_IDS[bookIndex]).getSheetByName(allowedTypes[data.tipo]);
  const statusCol = data.tipo === 'leads' ? 11 : 14;
  sheet.getRange(row, statusCol, 1, 2).setValues([[data.estado, data.notas || '']]);
}
