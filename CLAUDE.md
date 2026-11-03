# aceitealtooleico.com — guía para el comité SEO

Sitio estático en HTML de **YESH MARKET** que vende aceite de girasol alto oleico en bidón de 20 L al mayoreo en México. Se despliega solo en Cloudflare Pages desde `main`. Los datos del negocio, palabras clave objetivo e IDs de medición están en `seo/site.json`; léelo antes de cualquier análisis.

## Objetivo

Que el sitio esté lo mejor posicionado posible en Google México y en los asistentes de IA (ChatGPT, Gemini, Perplexity, Claude) para las búsquedas de `primary_keywords`, y que ese tráfico se convierta en contactos por WhatsApp. Cada cambio se justifica con datos. No se cambia por cambiar.

## Cómo trabaja el comité

Cada lunes corre un **comité** de agentes definidos en `.claude/agents/`:

| Agente | Qué hace | De dónde saca los datos |
|---|---|---|
| `orquestador` | Convoca a los especialistas, resuelve choques entre ellos, prioriza y escribe el informe | Informes de los otros |
| `palabras-clave` | Consultas que suben/bajan, oportunidades (posiciones 4–15, alto volumen de impresiones y bajo CTR), consultas nuevas sin página, visibilidad en LLMs | Rama `seo-data`, SERP, OpenRush |
| `diseno-ux` | Propone cambios visuales y de estructura con base en comportamiento real: scroll, clics, rebote, mapas de calor | Analytics (GA4), Clarity |
| `analitica` | Tendencias de 90 días, caídas, conversiones (clics a WhatsApp), diferencia entre tráfico y contactos | GA4, Search Console |
| `tecnico` | Velocidad, caché, Core Web Vitals, indexación, schema, enlaces rotos, sitemap/robots/llms.txt | Auditoría del repo y del sitio en vivo |
| `constructor` | Ejecuta SOLO los cambios aprobados por el dueño, en rama y con pull request | Lista de cambios aprobados |
| `verificador` | Revisa el PR del constructor: HTML válido, schema JSON válido, enlaces, sitemap, nada roto | El diff del PR |

Reglas del comité:

1. **Una sola ronda.** Cada especialista entrega hallazgos y propuestas una vez; el orquestador decide. Sin debates largos.
2. **El informe termina en 3 a 5 decisiones** máximo, cada una con: qué, por qué, dato que lo sostiene, riesgo (bajo/alto) y cómo se verá (el agente de diseño adjunta mockup antes/después cuando aplica). Si no hay nada que valga la pena, el informe lo dice y no se propone nada.
3. **Nada se construye sin el ok del dueño.** El dueño responde con qué decisiones aprueba; solo esas pasan al constructor.
4. **Ruido ≠ señal.** Search Console en sitios pequeños varía mucho semana a semana. Tendencias se miran a 90 días; la ventana de 28 días es solo para alarmas (páginas que desaparecen, errores de indexación, caídas abruptas).
5. **La semana siguiente se mide el efecto** de lo que se cambió antes de proponer más cambios sobre lo mismo.

## Estructura del repositorio

- `index.html` — página principal; concentra el contenido y el schema (Organization, Product, FAQPage).
- `aviso-de-privacidad/` — legal; solo se toca por errores.
- `sitemap.xml`, `robots.txt`, `llms.txt` — deben reflejar exactamente las páginas publicadas.
- `google-merchant-feed.xml` — feed de Google Merchant; cualquier cambio de precio o nombre de producto se replica aquí.
- `_headers` — caché y cabeceras de seguridad en Cloudflare.
- `assets/` — CSS, JS, fuentes, imágenes.
- `seo/site.json` — datos del sitio, palabras clave, IDs de GTM/GA4/Clarity/Search Console.
- `seo/gsc_fetch.py` — descarga Search Console (lo usa el workflow).
- `seo/reports/YYYY-MM-DD.md` — informe semanal del comité.
- `.github/workflows/seo-data.yml` — cada lunes guarda Search Console (28 y 90 días) en la rama `seo-data`.
- Rama `seo-data` — datos de Search Console. Solo lectura; no editar a mano.

## Reglas para cambios en el sitio

1. **Nunca commit directo a `main`.** Rama `seo/<fecha>-<tema>` y pull request con explicación y datos.
2. **Bajo riesgo** (pueden ir juntos en un PR): title, meta description, alt de imágenes, enlaces internos, schema, `llms.txt`, sitemap, correcciones técnicas, FAQ basadas en consultas reales.
3. **Alto riesgo** (PR aparte, explicación extensa, mockup si es visual): reescribir secciones, cambiar H1, mover/eliminar páginas, tocar `_headers` o redirecciones, cambiar el feed de Merchant, cambios de diseño.
4. **No tocar sin instrucción explícita del dueño:** número de WhatsApp, teléfono, dirección, precios, datos fiscales, IDs de medición (GTM/GA4/Clarity). Si los datos sugieren que el precio es un problema, se reporta, no se cambia.
5. **No sobreoptimizar:** sin relleno de palabras clave, sin texto genérico, sin páginas nuevas solo por tener más URLs. Google y los LLMs premian lo concreto: precios, especificaciones, tiempos de entrega, casos de uso.
6. **Sin dependencias ni build.** HTML puro.
7. **Idioma:** español de México en contenido, informes y PRs.

## Formato del informe semanal (`seo/reports/YYYY-MM-DD.md`)

```
# Informe semanal · aceitealtooleico.com · YYYY-MM-DD

## Resumen en 3 líneas
## Qué pasó esta semana (clics, impresiones, posición media, contactos; vs. semana anterior y vs. 90 días)
## Efecto de los cambios de la semana pasada
## Hallazgos por especialista (palabras clave · diseño/UX · analítica · técnico)
## Decisiones propuestas (máximo 5)
   1. [riesgo bajo|alto] Qué — Por qué — Dato — Cómo se vería (mockup si aplica)
## Qué NO se propone y por qué
```
