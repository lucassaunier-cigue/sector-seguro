# Sector Seguro

Sitio web de Sector Seguro, con formularios de contacto y denuncia de siniestros.

## Estructura

- `index.html`: sitio estático, estilos y lógica del frontend.
- `bajas.html`: formulario público de solicitud de baja.
- `admin-bajas.html`: panel interno para consultar y gestionar bajas, denuncias de siniestros y consultas/cotizaciones.
- `img/`: recursos gráficos del sitio.
- `Code.gs`: backend de Google Apps Script que registra formularios en Google Sheets.

## Ejecución local

Al ser un sitio estático, puede abrirse `index.html` directamente o servirse con cualquier servidor HTTP local.

## Despliegue

El frontend puede publicarse en un host de sitios estáticos como GitHub Pages, Cloudflare Pages, Netlify o Vercel. El backend se despliega por separado como aplicación web de Google Apps Script; su URL está configurada en `SCRIPT_URL` dentro de `index.html`.

Antes de hacer público el repositorio, conviene revisar si los identificadores de las hojas de cálculo en `Code.gs` deben permanecer privados.

## Activación del módulo de bajas

1. Volver a implementar `Code.gs` como una nueva versión de la aplicación web.
2. En **Configuración del proyecto → Propiedades de la secuencia de comandos**, crear `ADMIN_KEY` con una clave segura. Esa clave se solicita al abrir `admin-bajas.html` y no queda guardada en el código público.
3. La primera solicitud crea automáticamente la solapa `Bajas` y sus encabezados en ambas planillas.

El panel reúne automáticamente los registros existentes de las solapas `Bajas`, `Siniestros` y `Leads` de las dos planillas configuradas. Cada registro permite guardar un estado y notas internas.

Después de registrar la solicitud, el navegador abre el WhatsApp del cliente con un mensaje completo dirigido al `+54 9 11 4045-2738`. Por las reglas de WhatsApp, el cliente debe confirmar el envío tocando el botón **Enviar**. La pantalla de confirmación también conserva un botón para volver a abrir la conversación si fuera necesario.
