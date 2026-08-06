# Sector Seguro

Sitio web de Sector Seguro, con formularios de contacto y denuncia de siniestros.

## Estructura

- `index.html`: sitio estático, estilos y lógica del frontend.
- `img/`: recursos gráficos del sitio.
- `Code.gs`: backend de Google Apps Script que registra formularios en Google Sheets.

## Ejecución local

Al ser un sitio estático, puede abrirse `index.html` directamente o servirse con cualquier servidor HTTP local.

## Despliegue

El frontend puede publicarse en un host de sitios estáticos como GitHub Pages, Cloudflare Pages, Netlify o Vercel. El backend se despliega por separado como aplicación web de Google Apps Script; su URL está configurada en `SCRIPT_URL` dentro de `index.html`.

Antes de hacer público el repositorio, conviene revisar si los identificadores de las hojas de cálculo en `Code.gs` deben permanecer privados.
