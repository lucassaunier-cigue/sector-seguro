# Sector Seguro

Sitio web de Sector Seguro, con formularios de contacto y denuncia de siniestros.

## Estructura

- `index.html`: sitio estático, estilos y lógica del frontend.
- `bajas.html`: formulario público de solicitud de baja.
- `admin-bajas.html`: panel interno autenticado con Firebase para gestionar bajas, denuncias de siniestros y consultas/cotizaciones.
- `firebase-client.js`: configuración pública del proyecto Firebase.
- `firebase-forms.js`: alta de formularios en Cloud Firestore.
- `firebase-admin-api.js`: sesión y operaciones protegidas del panel.
- `firestore.rules`: reglas de acceso y validación desplegadas en Firebase.
- `img/`: recursos gráficos del sitio.
- `Code.gs`: backend de Google Apps Script que registra formularios en Google Sheets.

## Ejecución local

Al ser un sitio estático, puede abrirse `index.html` directamente o servirse con cualquier servidor HTTP local.

## Despliegue

El frontend puede publicarse en un host de sitios estáticos como GitHub Pages, Cloudflare Pages, Netlify o Vercel. El backend se despliega por separado como aplicación web de Google Apps Script; su URL está configurada en `SCRIPT_URL` dentro de `index.html`.

Antes de hacer público el repositorio, conviene revisar si los identificadores de las hojas de cálculo en `Code.gs` deben permanecer privados.

## Firebase

El proyecto `sector-seguro-arg` usa el plan Spark gratuito y Cloud Firestore en `southamerica-east1` (São Paulo). Email/Password está habilitado en Firebase Authentication.

Los formularios escriben en las colecciones `bajas`, `siniestros` y `leads`. Las reglas permiten altas públicas validadas, pero únicamente los usuarios registrados en la colección protegida `admins` pueden leer o gestionar registros. Nunca se debe incluir una clave privada o de servicio en el frontend.

Para volver a desplegar reglas:

```bash
npx firebase-tools deploy --only firestore:rules,firestore:indexes --project sector-seguro-arg
```

Google Sheets continúa recibiendo una copia temporal mediante `Code.gs` durante la transición.

Después de registrar la solicitud, el navegador abre el WhatsApp del cliente con un mensaje completo dirigido al `+54 9 11 4045-2738`. Por las reglas de WhatsApp, el cliente debe confirmar el envío tocando el botón **Enviar**. La pantalla de confirmación también conserva un botón para volver a abrir la conversación si fuera necesario.
