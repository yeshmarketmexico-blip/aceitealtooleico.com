# aceitealtooleico.com — guía para el agente

Sitio estático en HTML de **YESH MARKET** que vende aceite de girasol alto oleico en bidón de 20 L al mayoreo en México. Se despliega automáticamente en Cloudflare Pages desde `main`. Los datos del negocio y las palabras clave objetivo están en `seo/site.json`; léelo antes de proponer cambios.

## Objetivo

Mantener el sitio lo mejor posicionado posible en Google México y en los asistentes de IA (ChatGPT, Gemini, Perplexity, Claude) para las búsquedas de `primary_keywords`, y convertir ese tráfico en contactos por WhatsApp. Cada cambio debe estar justificado con datos: Search Console, analítica, SERP o auditoría técnica. No se cambia por cambiar.

## Estructura

- `index.html` — página principal; concentra casi todo el contenido y el schema (Organization, Product, WebPage).
- `aviso-de-privacidad/` — legal, no tocar salvo errores.
- `sitemap.xml`, `robots.txt`, `llms.txt` — mantener sincronizados con las páginas reales.
- `google-merchant-feed.xml` — feed de Google Merchant; cualquier cambio de precio o nombre del producto debe reflejarse aquí también.
- `_headers` — caché y cabeceras de seguridad en Cloudflare.
- `assets/` — CSS, JS, fuentes e imágenes.
- `seo/` — herramientas del agente: `gsc_fetch.py`, `site.json`, informes en `seo/reports/`.
- Rama `seo-data` — exportaciones de Search Console generadas por el workflow semanal (`.github/workflows/seo-data.yml`). Leer de ahí; no editar a mano.

## Reglas de trabajo

1. **Nunca hagas commit directo a `main`.** Trabaja en una rama `seo/<fecha>-<tema>` y abre un pull request. El PR debe explicar qué cambió, por qué, y con qué datos se justifica (consulta, impresiones, posición, CTR, etc.).
2. **Cambios de bajo riesgo** (pueden ir juntos en un PR): title y meta description, alt de imágenes, enlaces internos, schema, `llms.txt`, sitemap, correcciones técnicas, FAQ nuevas basadas en consultas reales de Search Console.
3. **Cambios de alto riesgo** (PR separado, siempre con explicación extensa): reescribir secciones completas, cambiar H1, cambiar precios, mover o eliminar páginas, tocar `_headers` o redirecciones, cambiar el feed de Merchant.
4. **No tocar**: número de WhatsApp, teléfono, dirección, precios ni datos fiscales salvo instrucción explícita del dueño. Si Search Console sugiere que el precio es un problema, repórtalo en el PR, no lo cambies.
5. **No sobreoptimizar**: nada de relleno de palabras clave, textos generados sin valor, ni crear páginas solo por tener más URLs. Google y los LLMs premian contenido útil y concreto (precios, especificaciones, tiempos de entrega, casos de uso).
6. **Sin dependencias ni build**: el sitio es HTML puro. No añadas frameworks ni pasos de compilación.
7. **Cada PR debe mantener el sitio funcionando**: revisa que el HTML sea válido, que los enlaces internos resuelvan, que el schema siga siendo JSON válido y que `sitemap.xml` incluya exactamente las páginas publicadas.
8. **Idioma**: todo el contenido en español de México. Los informes y PRs también en español.

## Ciclo semanal

1. El workflow descarga Search Console (28 y 90 días) a la rama `seo-data`.
2. El agente compara con el periodo anterior: consultas que ganan/pierden, páginas que caen, consultas con muchas impresiones y poco CTR (oportunidad de mejorar title/description), consultas nuevas sin página que las atienda (oportunidad de FAQ o sección), posiciones 4–15 (a un empujón de la primera página).
3. Revisa visibilidad en LLMs y SERP de las palabras clave principales.
4. Escribe un informe corto en `seo/reports/YYYY-MM-DD.md` (qué pasó, qué se propone, qué se hizo).
5. Abre PR(s) con los cambios y el enlace al informe.

## Qué NO es señal suficiente

Una sola semana de variación no justifica cambios de contenido: Search Console es ruidoso en sitios pequeños. Usa la ventana de 90 días para tendencias y la de 28 para detectar problemas puntuales (páginas que desaparecen, errores de indexación).
