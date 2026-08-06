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
    const formType = data.formType; // 'leads' o 'siniestros'
    const sheetName = formType === 'leads' ? 'Leads' : 'Siniestros';

    // Abrir ambas planillas y obtener la solapa correspondiente
    const sheets = SHEET_IDS.map(function(id) {
      return SpreadsheetApp.openById(id).getSheetByName(sheetName);
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
    } else {
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
  return ContentService
    .createTextOutput('Sector Seguro - Form Handler activo ✓')
    .setMimeType(ContentService.MimeType.TEXT);
}
