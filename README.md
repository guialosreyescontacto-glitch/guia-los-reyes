# Guía Los Reyes

Prototipo web de un **directorio comunal de negocios y servicios** para Los Reyes de
Salgado, Michoacán. Sitio estático, mobile-first, sin dependencias ni paso de compilación.

> ⚠️ **Datos de demostración.** Los negocios, calificaciones, teléfonos, correos, sitios web y
> redes sociales incluidos en `assets/js/data.js` son ficticios y sirven solo para probar
> la interfaz. No corresponden a comercios reales de la ciudad. Los usuarios de redes
> llevan el prefijo `demo.` y los dominios —los de la web y los de los correos— terminan
> en `.example` (un TLD reservado que no resuelve) a propósito, para que ningún enlace ni
> ningún correo caiga en la cuenta, el sitio o el buzón de una persona real. Sustitúyelos
> antes de publicar el sitio de verdad.

## Qué incluye

- **Encabezado** con la marca y buscador central (busca por nombre, giro, colonia y etiquetas; ignora acentos).
- **Cuadrícula de 12 categorías**: 2 columnas en móvil, 3 en tablet y 4 en escritorio. Cada tarjeta muestra icono, nombre y las especialidades que contiene (no conteos).
- **Vista de categoría** con barra de filtros por especialidad (`Todos`, `Cerrajeros`, `Fontaneros`, …) que filtra sin recargar la página.
- **Jerarquía de planes**: los `premium` van hasta arriba con badge de corona, después los `destacado` con badge ámbar, luego las fichas `completa` y al final las `basico`. Dentro de cada grupo van **primero los que están abiertos a esta hora** y entre ellos el orden se **sortea en cada carga**: el plan es lo único que compra posición, y entre los que pagan lo mismo no hay razón para que siempre sean los mismos los de arriba. A quien busca una tortillería a las siete de la mañana no le sirve la mejor tortillería del pueblo si abre a las diez; los que trabajan por cita van después de los abiertos y antes de los cerrados, porque de ellos no se puede decir que estén cerrados. El plan sigue mandando —esto sólo mueve el orden dentro de cada grupo—, así que un Premium cerrado sigue arriba de un destacado abierto y nadie pierde el lugar que pagó. El sorteo se reparte una vez por carga, así que el orden aguanta mientras el usuario filtra, entra a una ficha y regresa; vale igual para el listado de la categoría, para el filtro por especialidad y para las búsquedas, y en todos los planes, incluidas las gratuitas. La calificación ya no manda en el orden. El sello de plan sólo lo llevan los dos que compran posición; la ficha completa se distingue sola, por todo lo que la básica no trae.
- **La ficha `basico` es la gratuita**, la que se siembra sin que el negocio la haya pedido: se pinta como un **renglón** y no como tarjeta: sello con el icono de su categoría, nombre, aviso de abierto o cerrado, zona enlazada al mapa, el horario de hoy y el botón de llamar. En el sello va el icono y no las iniciales: dos letras sobre un cuadro de 44px no se leen y no dicen nada —`CM` no es nadie—, mientras que el icono dice de qué es el negocio de un vistazo y es el mismo dibujo con el que la persona acaba de entrar a la categoría. Ocupa el ancho completo de la retícula, abajo de las que pagan, y en un teléfono caben diez donde antes cabía una tarjeta —una tarjeta con la mitad del contenido seguía ocupando la pantalla de lado a lado y se leía como si valiera lo mismo que la de al lado. Sin foto, sin descripción, sin etiquetas, sin calificación y sin WhatsApp, correo ni redes; sus etiquetas tampoco cuentan en el buscador. Todo eso es justo lo que compra la ficha completa. Los datos siguen escritos en el catálogo aunque no se pinten, así que subir a un negocio de plan es cambiar una palabra.
- **Banner VIP en la portada**: los negocios con plan Premium rotan en un banner exclusivo, al lado derecho del texto del hero en escritorio y debajo de él en móvil. La tarjeta es apaisada —texto y foto lado a lado, con la barra de contacto cruzando abajo—, lleva el **marco del color de acento** que la identifica como Premium igual que sus fichas en los listados, y en escritorio van **dos, una encima de la otra**; en el teléfono, una. **La tarjeta entera lleva a la ficha del negocio dentro de su categoría**, igual que los banners del carrusel: abre la categoría desde arriba, la ficha queda al principio y late tres veces, ahí con el aro del color de su plan. Dentro de la tarjeta, la dirección abre el mapa y los botones de contacto siguen siendo suyos: el enlace de la tarjeta es un "manto" transparente tendido por debajo del contenido, porque un enlace dentro de otro no es válido. El paso de una página a la siguiente es horizontal, cada 4 segundos, y **la vuelta se da hacia adelante**: al final de la tira hay una copia del primer grupo, así que en vez de rebobinar toda la tira hacia atrás avanza un paso más hasta la copia y ahí se cambia en seco por el original, que es idéntico y no se nota. En el banner caben **hasta 8 Premium** (`VIP_MAX`): con un cambio cada 4 segundos y uno por pantalla en el teléfono, arriba de ocho la vuelta dura más que una visita entera y a los últimos no los ve nadie. Con ocho o menos salen todos siempre; pasando de ahí se sortean en cada carga, como el carrusel de destacados, para que la rotación sea pareja. El lugar que de verdad compra el Premium —el primero de su especialidad en los listados y en las búsquedas— no depende del cupo del banner. El nombre y la descripción ocupan dos renglones fijos para que las dos tarjetas de una misma columna midan exactamente lo mismo, y si el último grupo queda impar su única tarjeta se centra en vez de pegarse arriba. **También se pasa de página deslizando con el dedo o arrastrando con el ratón**, como el carrusel de destacados: mientras el dedo manda, la tarjeta va pegada a él sin transición, y al soltar cambia de página si el gesto salió rápido o recorrió una quinta parte del ancho —con menos, la tarjeta se regresa a su lugar—. Hacia atrás desde la primera página se salta antes en seco a la copia del final, que es idéntica, para tener algo que jalar; y el clic que va detrás de un jalón se traga, para no abrir la ficha sin querer. El gesto vertical se deja pasar (`touch-action: pan-y`), así que la página se sigue pudiendo bajar con el dedo sobre el banner. Los puntos de abajo también cambian de página a mano, y con el dedo su área de toque crece aunque el punto se vea igual. No rota sola si el sistema pide menos animación, ni mientras el cursor o el foco están encima.
- **Carrusel de destacados en la portada**: arriba de las categorías, un desfile horizontal continuo de banners que avanza a velocidad constante, sin frenadas ni saltos. Cada banner es sólo la imagen del negocio —recortada con `object-fit: cover`, esquinas redondeadas— con un sello discreto de `★ Destacado` en la esquina; ni nombre, ni categoría, ni botones. Lleva el **marco del plan en ámbar, del mismo grosor que el de acento de los Premium**: los dos son marcos de plan y tienen que pesar igual, no uno un marco y el otro un filo. **Al tocarlo abre su categoría desde arriba, sube su ficha completa al principio de la lista y la hace latir tres veces**, con un anillo dorado que se queda para reconocerla; ahí sí aparece todo: calificación, dirección enlazada a Maps, descripción, especialidades, horario e iconos de contacto. Abre desde arriba a propósito: lo primero que se ve es de qué categoría se trata, y el latido es lo que dice cuál de los negocios era. Arriba de esa ficha sólo quedan los **Premium de la misma categoría**: ese lugar está pagado y un destacado no lo desplaza, así que el orden al llegar es Premium → el destacado que se tocó → el resto. La página sólo baja si la ficha no cabe entera —en el teléfono, donde van en una columna y arriba puede haber un Premium—, y entonces baja lo justo, con `scroll-margin-top` para no quedar debajo del encabezado pegado; ahí la barra de categorías, que en pantallas angostas va pegada, sigue diciendo dónde está uno. Se ven 4 banners a la vez desde 900px, 3 desde 560px y 2.5 en el teléfono —el medio banner cortado avisa de que hay más de lado—. Empieza y termina en el margen de la página, y en los costados los banners se **desvanecen** en vez de cortarse en seco (una máscara de 24px), así entran y salen del desfile sin que se vea el filo de la ventana ni el marco ámbar apareciendo de golpe a media tarjeta; con animaciones reducidas el desvanecido se apaga, porque sobre un carrusel quieto parecería un defecto. Se dibujan dos tandas idénticas y la cinta recorre el ancho exacto de una, de modo que al reiniciar el ciclo la segunda queda justo donde arrancó la primera. En cada carga se sortean hasta 10 de los negocios con plan Destacado, así que la rotación es pareja entre todos los clientes del plan y nadie queda siempre fuera. El sorteo va por turnos: primero entran los que están **abiertos a esa hora**, y sólo si sobran lugares entran los cerrados, para que los banners de la portada lleven a negocios a los que se les puede marcar ahora mismo. Mientras haya más abiertos que lugares, un negocio cerrado no sale en el carrusel hasta que abra.
- **Control manual del carrusel**: en escritorio, dos flechas flotantes sobre los costados avanzan **un banner a la vez** y lo dejan alineado al filo —antes de moverse redondean al filo más cercano, así ninguno queda cortado a la mitad— y se encienden en el verde de la marca al pasar el cursor. En cualquier pantalla el carrusel también se lleva arrastrando con el ratón o deslizando con el dedo, con un impulso al soltar; en el teléfono las flechas se ocultan para no tapar los banners. Arrastrar no cuenta como tocar: el clic que va detrás de un jalón se traga, para no abrir la ficha sin querer. La captura del puntero se pide sólo cuando el arrastre arranca de verdad: pedirla desde el primer contacto le entregaba a la pista el clic entero y el enlace del banner nunca se enteraba, así que en escritorio no pasaba nada al hacer clic. El desfile automático se detiene mientras el cursor, el foco o el dedo están encima y lo retoma dos segundos y medio después de soltar. Si el sistema pide menos animación no hay desfile: las flechas y el dedo siguen sirviendo, pero sin suavizado.
- **Tarjetas de negocio** con banner, etiqueta de plan, aviso de abierto o cerrado, calificación, horario y etiquetas.
- **El botón de llamar se adapta al aparato.** En un teléfono es lo de siempre: `tel:` abre el marcador y con un toque ya está sonando. En una tablet o en una computadora `tel:` no marca nada —o saca un cuadro de "elige una aplicación" que nadie entiende— y el botón queda muerto, que para el negocio es peor que no tenerlo: el vecino lo aprieta, no pasa nada y se va. Ahí el botón **se abre y deja ver el número** en una pastilla —`+52 354 100 0601`— para leerlo, teclearlo en el teléfono de a de veras o **copiarlo de un toque**; al copiar avisa con un "Copiado" en verde. La pastilla ocupa el lugar del botón redondo, así que la fila de contacto no se descuadra, y sólo puede haber una abierta a la vez: dos en la misma lista se leerían como si un número fuera de la ficha de al lado. Se cierra con un clic afuera o con Escape. Vale para las cuatro fichas, de pago y gratis. La detección **no husmea el `userAgent`**, pregunta por lo que importa: un teléfono no tiene puntero fino ni estados de hover, y su lado corto mide menos de 500px; una tablet cumple lo primero pero no lo segundo. Si la cuenta sale mal en un teléfono tampoco se pierde la llamada, porque el número que aparece **sigue siendo un enlace `tel:`** y marca con un toque más. Y si el navegador niega el portapapeles —`navigator.clipboard` sólo existe en https—, en vez de que el toque no haga nada el número queda **seleccionado** para copiarlo a mano.
- **El aviso de abierto o cerrado se calcula del horario**, no es un dato que se escriba a mano: un campo fijo quedaría mintiendo a los diez minutos y nadie va a estar editando sesenta fichas dos veces al día. Se entiende `Lun a Sáb · 9:00 – 20:00` y sus variantes —`Todos los días`, un día suelto como `Sáb · 10:00 – 14:00`, los rangos que dan la vuelta a la semana y los que cierran pasada la medianoche (`19:00 – 2:00`)—, además de `Abierto 24 horas` y `Disponible 24 horas`. Si el horario no trae horas (`Con cita previa`, `Visitas con cita`) el aviso dice **Con cita**, porque de un negocio así no se puede decir ni que esté abierto ni que esté cerrado. La hora es siempre la de Los Reyes (`America/Mexico_City`) y no la del teléfono de quien mira: media comunidad tiene familia del otro lado, y con la hora del aparato verían cerrado todo el pueblo.
- **Jornada partida**, que en el pueblo es la regla y no la excepción: el que cierra a comer y el que el sábado trabaja distinto se escriben con un renglón por grupo de días —`horario: { 'Lun a Vie': '9:00 – 14:00, 16:30 – 20:00', 'Sáb': '9:00 – 15:00' }`—, con los tramos que hagan falta separados por coma. Los días que no se nombran quedan cerrados. La forma de un solo renglón sigue valiendo, así que las fichas sencillas no se tocan. A las 15:00 un negocio con jornada partida **sale cerrado de verdad** y baja en el orden de su plan, que es justo lo que hace útil el aviso.
- **El horario, en la ficha, muestra sólo lo de hoy** —`Hoy 8:00 – 14:00 y 16:00 – 19:00`— con un **`Ver horario`** que despliega la semana completa en una tabla, con el día de hoy marcado y los días seguidos juntos en un renglón (`Lun a Vie`), como en el letrero de cualquier negocio. Quien mira quiere saber si puede ir ahora, no memorizar la semana; pero el que necesita la semana no tiene dónde más consultarla, y cuatro renglones en cada tarjeta dejarían la lista ilegible. Es un `<details>`, así que abre sin una línea de JS y el lector de pantalla lo anuncia solo. Cuando el negocio abre siempre igual —`Lun a Dom · 8:00 – 21:00`, `Abierto 24 horas`— no hay nada que desplegar y el desplegable no aparece. **La ficha gratuita también lo lleva**, en versión compacta: como va al lado de la zona y no en su propio párrafo, el `Ver horario` se queda en el puro triangulito, y al abrirse se lleva su propio renglón para que la tabla salga a lo ancho. Cerrado no ocupa un pixel de alto, así que el renglón mide lo que medía antes; lo que compra la ficha completa sigue siendo la foto, la descripción y las etiquetas, no el derecho a que le lean el horario. Dentro de un tramo la línea nunca se parte: la raya larga es un punto de corte válido en Unicode, y sin blindarla el navegador dejaba `16:00 –` arriba y `19:00` abajo, que se lee como dos horas sueltas.
- **Dirección enlazada al mapa del aparato**: al tocarla abre la ruta de "cómo llegar" al negocio, en Google Maps o en Mapas de Apple según el aparato. Los iPhone y iPad no traen Google Maps de fábrica, así que ahí un enlace de Google abriría el navegador en vez de la aplicación; a esos se les da `maps.apple.com`, que siempre está. Va tanto en las fichas como en el banner Premium de la portada.
- **Botones circulares de contacto** al pie de cada tarjeta: WhatsApp, teléfono, correo, sitio web, Facebook, Instagram y TikTok. El correo va junto al teléfono y antes de las redes —es contacto directo, no un perfil que haya que ir a visitar— y abre el gestor de correo con el asunto y el recado ya escritos, los mismos que lleva el mensaje de WhatsApp. En escritorio parten en gris y toman el color de su marca al pasar el cursor; en pantallas táctiles ya salen en color al 50% de opacidad y suben al 100% al tocarlos. Solo se dibuja el icono de los enlaces que el negocio tenga registrados.
- **Página de registro** con la escalera de cobro —Ficha básica (gratis), Ficha completa ($150 MXN/mes o $1,500 al año), Destacado ($300 / $3,000) y Premium ($800 / $8,000, uno por giro)—. El precio anual equivale a dos meses gratis. Cada tarjeta lleva su propio botón que abre WhatsApp con el mensaje del plan elegido ya escrito.
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
  plan: 'destacado',          // 'premium', 'destacado', 'completa' o 'basico' (gratis)
  filtro: 'fontaneros',       // debe coincidir con un id de `filtros` de la categoría
  rating: 4.8,
  tags: ['Fugas', 'Boiler'],  // hasta 4 etiquetas visibles
  zona: 'Av. Morelos 210, Centro',        // texto que se muestra en la tarjeta
  mapa: 'Av. Morelos 210, Centro, Los Reyes de Salgado, Michoacán',
  horario: 'Lun a Sáb · 9:00 – 19:00',   // de aquí sale el aviso de abierto o cerrado
  tel: '523541234567',        // formato WhatsApp: 52 + 10 dígitos, sin espacios ni signos
  correo: 'contacto@tunegocio.com',   // opcional, dibuja el botón del sobre
  redes: { web: 'tunegocio.com', facebook: 'usuario', instagram: 'usuario', tiktok: 'usuario' },
  foto: 'assets/img/tunegocio.jpg',   // opcional, para el banner VIP y el carrusel
  desc: 'Una línea describiendo el servicio.'
}
```

**`mapa`** alimenta el enlace de "cómo llegar". Es opcional: si lo omites, el enlace usa
`zona` + la ciudad, lo que ubica la zona aproximada pero no la puerta del negocio. Para
que la ruta sea exacta pon la dirección completa o, mejor aún, las coordenadas que copies
de Google Maps (`'19.5871,-102.4745'`). El mismo dato sirve para las dos aplicaciones de
mapas: el sitio arma el enlace de Google Maps o el de Mapas de Apple según el aparato.

**`foto`** la usa la portada: el banner VIP de los `premium` (recuadro cuadrado) y el
carrusel de destacados de los `destacado`, donde la imagen es lo único que se ve —sin
nombre ni textos—, en proporción 3:2 en escritorio y 4:3 en el teléfono. Por eso a un
`destacado` conviene pedirle un banner promocional que ya traiga su nombre. En todos
los casos se recorta con `object-fit: cover`, así que el motivo va centrado. Si el
negocio no tiene foto se dibujan sus iniciales sobre el glifo de la categoría: sirve
de relleno, pero no dice de quién es el banner. Los `basico` no salen en la portada,
así que la ignoran.

**`correo`** es opcional y dibuja el botón del sobre, junto al del teléfono y antes de
las redes. Abre el gestor de correo del visitante con el asunto y el recado ya escritos.
Sin `correo`, ese botón no aparece.

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
