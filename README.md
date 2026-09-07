# Guía Los Reyes

Prototipo web de un **directorio comunal de negocios y servicios** para Los Reyes de
Salgado, Michoacán. Sitio estático, mobile-first, sin dependencias ni paso de compilación.

> ⚠️ **Datos de demostración.** Los negocios, calificaciones, teléfonos, sitios web y
> redes sociales incluidos en `assets/js/data.js` son ficticios y sirven solo para probar
> la interfaz. No corresponden a comercios reales de la ciudad. Los usuarios de redes
> llevan el prefijo `demo.` y los dominios terminan en `.example` (un TLD reservado que
> no resuelve) a propósito, para que ningún enlace caiga en la cuenta o el sitio de una
> persona real. Sustitúyelos antes de publicar el sitio de verdad.

## Qué incluye

- **Encabezado** con la marca y buscador central (busca por nombre, giro, colonia y etiquetas; ignora acentos).
- **Cuadrícula de 12 categorías**: 2 columnas en móvil, 3 en tablet y 4 en escritorio. Cada tarjeta muestra icono, nombre y las especialidades que contiene (no conteos).
- **Vista de categoría** con barra de filtros por especialidad (`Todos`, `Cerrajeros`, `Fontaneros`, …) que filtra sin recargar la página.
- **Jerarquía de planes**: los `premium` van hasta arriba con badge de corona, después los `destacado` con badge dorado y al final los `basico`. Dentro de cada grupo se ordenan por calificación.
- **Banner VIP en la portada**: los negocios con plan Premium rotan cada 6 segundos en un banner exclusivo, al lado derecho del texto del hero en escritorio y debajo de él en móvil. Trae la misma fila de iconos circulares de contacto que las tarjetas. Se puede cambiar a mano con los puntos; no rota solo si el sistema pide menos animación, ni mientras el cursor o el foco están encima.
- **Tarjetas de negocio** con banner, etiqueta de plan, estado abierto/cerrado, calificación, horario y etiquetas.
- **Dirección enlazada a Google Maps**: al tocarla abre la ruta de "cómo llegar" al negocio.
- **Botones circulares de contacto** al pie de cada tarjeta: WhatsApp, teléfono, sitio web, Facebook, Instagram y TikTok. En escritorio parten en gris y toman el color de su marca al pasar el cursor; en pantallas táctiles ya salen en color al 50% de opacidad y suben al 100% al tocarlos. Solo se dibuja el icono de los enlaces que el negocio tenga registrados.
- **Página de registro** con los tres planes comerciales —Básico ($300 MXN/mes), Destacado ($500) y Premium ($1,000)—. Cada tarjeta lleva su propio botón que abre WhatsApp con el mensaje del plan elegido ya escrito.
- **Modo claro y oscuro**: sigue la preferencia del sistema y el botón sol/luna del encabezado permite forzar uno u otro. La elección se guarda en `localStorage` y se aplica en un script del `<head>` para que no haya destello al cargar.
- Navegación por URL (`#/c/hogar/fontaneros`) y soporte de teclado.

## Estructura

```
.
├── index.html              Estructura HTML5 semántica y las 4 vistas
├── assets/
│   ├── favicon.svg
│   ├── css/styles.css      Estilos (variables CSS, mobile-first)
│   └── js/
│       ├── data.js         Categorías, filtros y negocios  ← edita aquí el contenido
│       └── app.js          Enrutado, render y filtrado
├── vercel.json             Cabeceras y caché para el despliegue
└── README.md
```

## Probarlo en local

No necesita servidor: abre `index.html` con doble clic en cualquier navegador.

Si prefieres servirlo por HTTP (recomendado para probar el enrutado como en producción)
y tienes Node instalado:

```bash
npx serve .
```

## Cómo editar el contenido

Todo el directorio vive en [`assets/js/data.js`](assets/js/data.js).

Para agregar un negocio, añade un objeto al arreglo `negocios` de su categoría:

```js
{
  nombre: 'Nombre del comercio',
  plan: 'destacado',          // 'premium' (banner VIP), 'destacado' o 'basico'
  filtro: 'fontaneros',       // debe coincidir con un id de `filtros` de la categoría
  rating: 4.8,
  tags: ['Fugas', 'Boiler'],  // hasta 4 etiquetas visibles
  zona: 'Av. Morelos 210, Centro',        // texto que se muestra en la tarjeta
  mapa: 'Av. Morelos 210, Centro, Los Reyes de Salgado, Michoacán',
  horario: 'Lun a Sáb · 9:00 – 19:00',
  abierto: true,
  tel: '523541234567',        // formato WhatsApp: 52 + 10 dígitos, sin espacios ni signos
  redes: { web: 'tunegocio.com', facebook: 'usuario', instagram: 'usuario', tiktok: 'usuario' },
  desc: 'Una línea describiendo el servicio.'
}
```

**`mapa`** alimenta el enlace de "cómo llegar". Es opcional: si lo omites, el enlace usa
`zona` + la ciudad, lo que ubica la zona aproximada pero no la puerta del negocio. Para
que la ruta sea exacta pon la dirección completa o, mejor aún, las coordenadas que copies
de Google Maps (`'19.5871,-102.4745'`).

**`redes`** también es opcional. Las redes llevan el **usuario**, no la URL completa;
`web` lleva el dominio (`'tunegocio.com'`) o la URL entera. Cada entrada que falte
simplemente no dibuja su icono, así que un negocio sin Instagram no muestra hueco.

Para cambiar el número que recibe las altas de negocios, edita `WA_DIRECTORIO` en el
mismo archivo.

El nombre y el precio que van en ese mensaje salen de los atributos `data-plan` y
`data-precio` del botón de cada tarjeta, en `index.html`, junto al precio que se
muestra: al cambiar una tarifa se editan los dos ahí mismo.

### Al editar CSS o JS, sube el `?v=`

`index.html` enlaza los assets con un número de versión:

```html
<link rel="stylesheet" href="assets/css/styles.css?v=9">
<script src="assets/js/data.js?v=9"></script>
<script src="assets/js/app.js?v=9"></script>
```

Si cambias `styles.css`, `data.js` o `app.js`, **sube ese número en los tres enlaces**
antes de publicar. Sin eso, los navegadores que ya visitaron el sitio siguen usando la
copia vieja del archivo y el cambio no se ve, aunque el deploy de Vercel esté correcto.
Cambiar `index.html` solo (textos, estructura) no necesita subir la versión.

## Publicar en GitHub y Vercel

El repositorio vive en la cuenta `guialosreyes.contacto@gmail.com`, cuyo usuario de
GitHub es **`guialosreyescontacto-glitch`**:

```bash
git push -u origin main
```

El remoto ya apunta a `https://guialosreyescontacto-glitch@github.com/guialosreyescontacto-glitch/guia-los-reyes.git`.
El usuario va incluido en la URL para que Git no reutilice las credenciales de la cuenta
personal guardadas en Windows; la primera vez abrirá el navegador para iniciar sesión.

En Vercel: **Add New → Project → Import Git Repository**, elige el repo y despliega.
Al ser un sitio estático no hay que configurar nada: deja *Framework Preset* en `Other`,
sin *Build Command* y con *Output Directory* vacío (la raíz).

## Siguientes pasos sugeridos

- Reemplazar los datos de ejemplo por negocios reales, con permiso de cada comercio.
- Sustituir los banners de color por fotos reales (`<img>` dentro de `.card__banner`).
- Mover `data.js` a una API o CMS cuando el catálogo crezca.
- Calcular el estado *Abierto / Cerrado* a partir de horarios reales en vez del campo fijo `abierto`.
