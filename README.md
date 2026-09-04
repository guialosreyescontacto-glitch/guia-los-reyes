# Guía Los Reyes

Prototipo web de un **directorio comunal de negocios y servicios** para Los Reyes de
Salgado, Michoacán. Sitio estático, mobile-first, sin dependencias ni paso de compilación.

> ⚠️ **Datos de demostración.** Los negocios, calificaciones y teléfonos incluidos en
> `assets/js/data.js` son ficticios y sirven solo para probar la interfaz. No corresponden
> a comercios reales de la ciudad. Sustitúyelos antes de publicar el sitio de verdad.

## Qué incluye

- **Encabezado** con la marca y buscador central (busca por nombre, giro, colonia y etiquetas; ignora acentos).
- **Cuadrícula de 12 categorías**: 2 columnas en móvil, 3 en tablet y 4 en escritorio, con icono, nombre y conteo de negocios.
- **Vista de categoría** con barra de filtros por especialidad (`Todos`, `Cerrajeros`, `Fontaneros`, …) que filtra sin recargar la página.
- **Jerarquía de planes**: los negocios `destacado` aparecen siempre arriba, con badge dorado; los `basico` después. Dentro de cada grupo se ordenan por calificación.
- **Tarjetas de negocio** con banner, etiqueta de plan, estado abierto/cerrado, calificación, zona, horario, etiquetas y botón **Contactar por WhatsApp** (`https://wa.me/…` con mensaje prellenado).
- **Página de registro** con los dos planes y contacto directo por WhatsApp.
- Modo claro y oscuro automáticos, navegación por URL (`#/c/hogar/fontaneros`) y soporte de teclado.

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
  plan: 'destacado',          // 'destacado' (arriba, con badge) o 'basico'
  filtro: 'fontaneros',       // debe coincidir con un id de `filtros` de la categoría
  rating: 4.8,
  tags: ['Fugas', 'Boiler'],  // hasta 4 etiquetas visibles
  zona: 'Col. Centro',
  horario: 'Lun a Sáb · 9:00 – 19:00',
  abierto: true,
  tel: '523541234567',        // formato WhatsApp: 52 + 10 dígitos, sin espacios ni signos
  desc: 'Una línea describiendo el servicio.'
}
```

Para cambiar el número que recibe las altas de negocios, edita `WA_DIRECTORIO` en el
mismo archivo.

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
