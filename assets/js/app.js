/* ==========================================================================
   Guía Los Reyes — Lógica de la aplicación
   Vanilla JS. Enrutado por hash, filtrado sin recarga de página.
   ========================================================================== */
(function () {
  'use strict';

  /* ---------------------------------------------------------------- Utils */

  const $  = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));

  const esc = (str) => String(str).replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));

  /** Marcas diacríticas combinantes (acentos, diéresis, tilde de la ñ). */
  const DIACRITICOS = new RegExp('[\\u0300-\\u036f]', 'g');

  /** Normaliza texto para buscar sin acentos ni mayúsculas. */
  const norm = (str) => String(str)
    .toLowerCase()
    .normalize('NFD')
    .replace(DIACRITICOS, '');

  const icon = (paths, cls) =>
    `<svg class="${cls || ''}" viewBox="0 0 24 24" fill="none" stroke="currentColor" ` +
    `stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;

  /* Los logotipos de las redes son siluetas rellenas, no trazos. */
  const logo = (paths) =>
    `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">${paths}</svg>`;

  const iniciales = (nombre) => nombre
    .replace(/^(El|La|Los|Las|De|Del)\s+/i, '')
    .split(/\s+/).filter(w => w.length > 2).slice(0, 2)
    .map(w => w[0].toUpperCase()).join('');

  /* Identificador de un negocio para la dirección: su nombre sin acentos ni
     signos. Se calcula, no se guarda, así que no hay que agregarle un campo a
     cada negocio del catálogo; a cambio, si a un negocio le cambian el nombre,
     el enlace viejo deja de apuntarle. */
  const seña = (neg) => norm(neg.nombre)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  const waLink = (tel, nombre) =>
    `https://wa.me/${tel}?text=${encodeURIComponent(WA_TEMPLATE(nombre))}`;

  /* Correo con asunto y recado ya escritos, igual que el de WhatsApp. Sin
     `target="_blank"`: `mailto:` abre el gestor de correo, y la pestaña en
     blanco que dejaría atrás no sirve de nada. */
  const correoLink = (correo, nombre) =>
    `mailto:${correo}?subject=${encodeURIComponent(CORREO_ASUNTO)}` +
    `&body=${encodeURIComponent(WA_TEMPLATE(nombre))}`;

  /* ¿El aparato es de Apple? Los iPhone y iPad no traen Google Maps de fábrica,
     así que un enlace de Google Maps les abre el navegador en vez del mapa. Con
     `maps.apple.com` se abre Mapas, que sí está siempre. El iPad moderno se
     hace pasar por Mac en el `userAgent`, y por eso se le pregunta además si la
     pantalla es táctil. No es infalible —husmear el `userAgent` nunca lo es—,
     pero el peor caso es abrir el mapa en el navegador, que funciona igual. */
  const ESAPPLE = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (/Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints > 1) ||
    /Mac/.test(navigator.platform || '');

  /* Enlace de "cómo llegar" en la aplicación de mapas del aparato. Usa `mapa`
     (dirección exacta o coordenadas) y, si el negocio no la tiene, la zona más
     la ciudad. */
  const mapaLink = (neg) => {
    const destino = encodeURIComponent(neg.mapa || `${neg.zona}, ${CIUDAD}`);
    return ESAPPLE
      ? `https://maps.apple.com/?daddr=${destino}&dirflg=d`
      : `https://www.google.com/maps/dir/?api=1&destination=${destino}`;
  };

  /* Enlaces opcionales de la ficha. `web` guarda un dominio o una URL; las
     redes guardan el usuario, no la dirección completa. El sitio web usa un
     glifo de trazo (`icono`); las redes, su logotipo relleno (`logo`). */
  const REDES = {
    web:       { icono: ICONS.globo,    url: (u) => /^https?:\/\//i.test(u) ? u : `https://${u}`,
                 nombre: 'Sitio web' },
    facebook:  { logo: LOGOS.facebook,  url: (u) => `https://www.facebook.com/${u}`,  nombre: 'Facebook' },
    instagram: { logo: LOGOS.instagram, url: (u) => `https://www.instagram.com/${u}`, nombre: 'Instagram' },
    tiktok:    { logo: LOGOS.tiktok,    url: (u) => `https://www.tiktok.com/@${u}`,   nombre: 'TikTok' }
  };

  /* ¿Sirve este aparato para llamar? En un teléfono, `tel:` abre el marcador y
     con un toque ya está sonando. En una computadora no hace nada —o saca un
     cuadro de "elige una aplicación" que nadie entiende— y el botón queda
     muerto, que para el negocio es peor que no tenerlo: el vecino lo aprieta,
     no pasa nada y se va. Ahí el botón enseña el número, para marcarlo en el
     teléfono de a de veras o copiarlo de un toque.

     No se husmea el `userAgent`, se pregunta por lo que importa: un teléfono no
     tiene puntero fino ni estados de hover, y su lado corto mide menos de
     500px. Una tablet cumple lo primero pero no lo segundo, y una computadora
     no cumple ninguno. Si la cuenta sale mal en un teléfono tampoco se pierde
     la llamada: el número que aparece es a su vez un enlace `tel:` y marca con
     un toque más. */
  const ESMOVIL = window.matchMedia('(hover: none) and (pointer: coarse)').matches &&
    Math.min(screen.width, screen.height) < 500;

  /** El número como lo escribiría un vecino: +52 354 100 0101. */
  function formatoTel(tel) {
    const digitos = String(tel).replace(/[^0-9]/g, '');
    const local = digitos.slice(-10);
    const pais  = digitos.slice(0, -10);
    const grupos = local.length === 10
      ? `${local.slice(0, 3)} ${local.slice(3, 6)} ${local.slice(6)}`
      : local;
    return (pais ? `+${pais} ` : '') + grupos;
  }

  /** El botón de llamar. En el teléfono es el de siempre, un enlace directo al
      marcador. En lo demás es un botón que se abre y deja ver el número. */
  function botonTelefono(neg) {
    const marcar = `tel:+${esc(neg.tel)}`;
    if (ESMOVIL) return (
      `<a class="act act--tel" href="${marcar}"
          title="Llamar" aria-label="Llamar a ${esc(neg.nombre)}">${logo(LOGOS.telefono)}</a>`
    );

    const numero = formatoTel(neg.tel);
    return `
      <span class="tel">
        <button class="act act--tel tel__ver" type="button" aria-expanded="false"
                title="Ver el número" aria-label="Ver el teléfono de ${esc(neg.nombre)}"
        >${logo(LOGOS.telefono)}</button>
        <a class="tel__num" href="${marcar}" hidden data-numero="${esc(numero)}"
           title="Copiar el número"
           aria-label="Teléfono de ${esc(neg.nombre)}: ${esc(numero)}. Tócalo para copiarlo."
        >${logo(LOGOS.telefono)}<span class="tel__cifras">${esc(numero)}</span></a>
      </span>`;
  }

  /** Fila de botones circulares: WhatsApp, teléfono y los enlaces que existan. */
  function botonesContacto(neg) {
    /* La ficha gratuita se queda con el botón de llamar y nada más: el vecino
       tiene cómo contactarlo, que es lo que hace útil al directorio, pero el
       WhatsApp con el recado ya escrito, el correo y las redes son de la ficha
       completa en adelante. */
    if (esBasica(neg)) return botonTelefono(neg);

    const botones = [
      `<a class="act act--wa" href="${waLink(neg.tel, neg.nombre)}" target="_blank" rel="noopener"
          title="WhatsApp" aria-label="Escribir por WhatsApp a ${esc(neg.nombre)}">${icon(ICONS.whatsapp)}</a>`,
      botonTelefono(neg)
    ];

    /* El correo va junto al teléfono y antes de las redes: es contacto directo
       con el negocio, no un perfil que haya que ir a visitar. Sale sólo si el
       negocio dio uno. */
    if (neg.correo) botones.push(
      `<a class="act act--correo" href="${esc(correoLink(neg.correo, neg.nombre))}"
          title="Correo" aria-label="Enviar un correo a ${esc(neg.nombre)}">${icon(ICONS.sobre)}</a>`
    );

    Object.keys(REDES).forEach((red) => {
      const usuario = (neg.redes || {})[red];
      if (!usuario) return;
      const r = REDES[red];
      const glifo = r.logo ? logo(r.logo) : icon(r.icono);
      botones.push(
        `<a class="act act--${red}" href="${esc(r.url(usuario))}" target="_blank" rel="noopener"
            title="${r.nombre}" aria-label="${r.nombre} de ${esc(neg.nombre)}">${glifo}</a>`
      );
    });

    return botones.join('');
  }

  /* Índice plano de negocios, con su categoría asociada y su número de la
     suerte: el sorteo que decide su lugar dentro de su plan. Se reparte una
     sola vez por carga, no en cada pintada, para que el orden aguante mientras
     el usuario filtra, entra a una ficha y regresa; con la página recargada se
     vuelve a sortear y les toca a otros ir primero. */
  const TODOS = CATEGORIAS.flatMap(cat =>
    cat.negocios.map(n => Object.assign({}, n, { cat: cat, suerte: Math.random() }))
  );

  /* ------------------------------------------- ¿Está abierto en este momento?

     El estado no se escribe en `data.js`: se saca del horario cada vez que se
     pinta. Un dato escrito a mano quedaría mintiendo a los diez minutos, y
     nadie va a estar editando sesenta fichas dos veces al día. */

  /* El reloj de Los Reyes, no el del visitante: media comunidad tiene familia
     del otro lado, y quien abra la guía desde allá trae el teléfono en otra
     hora. Sin fijar la zona vería cerrada una tienda que está abierta. */
  const ZONA = 'America/Mexico_City';
  const SEMANA  = ['dom', 'lun', 'mar', 'mie', 'jue', 'vie', 'sab'];
  const SEMANA_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  /* El mismo orden que SEMANA, para los horarios de un día solo. El límite de
     palabra evita que "sab" se cuele dentro de otra palabra. */
  const SEMANA_RE = [/\bdom/, /\blun/, /\bmar/, /\bmie/, /\bjue/, /\bvie/, /\bsab/];

  /* Construir el formateador es la parte costosa, así que se hace una vez y se
     reusa; leer la hora con él es barato. */
  let formatoHora = null;

  /** Día de la semana (0 = domingo) y minutos transcurridos del día, en la hora
      de Los Reyes. Si el navegador no conoce la zona, usa la del aparato. */
  function reloj() {
    try {
      if (!formatoHora) formatoHora = new Intl.DateTimeFormat('en-US', {
        timeZone: ZONA, hour12: false,
        weekday: 'short', hour: '2-digit', minute: '2-digit'
      });
      const partes = formatoHora.formatToParts(new Date());
      const dato = (tipo) => (partes.find(p => p.type === tipo) || {}).value || '';
      const dia = SEMANA_EN.indexOf(dato('weekday'));
      if (dia < 0) throw new Error('sin día');
      /* A la medianoche algunos navegadores dicen 24 en vez de 0. */
      return { dia: dia, minuto: (Number(dato('hour')) % 24) * 60 + Number(dato('minute')) };
    } catch (_) {
      const d = new Date();
      return { dia: d.getDay(), minuto: d.getHours() * 60 + d.getMinutes() };
    }
  }

  /** Los días que abre, leídos de un texto ya normalizado. Entiende "todos los
      días", los rangos ("Lun a Sáb", incluso los que dan la vuelta como "Sáb a
      Mar") y los días sueltos ("Sáb · 10:00 – 14:00"). */
  function diasDe(texto) {
    if (texto.includes('todos los dias')) return [0, 1, 2, 3, 4, 5, 6];

    const tramo = texto.match(/(dom|lun|mar|mie|jue|vie|sab)\w*\s+a\s+(dom|lun|mar|mie|jue|vie|sab)/);
    if (tramo) {
      const fin = SEMANA.indexOf(tramo[2]);
      const dias = [];
      let d = SEMANA.indexOf(tramo[1]);
      for (let vuelta = 0; vuelta < 7; vuelta++) {
        dias.push(d);
        if (d === fin) break;
        d = (d + 1) % 7;
      }
      return dias;
    }

    return SEMANA_RE.reduce((dias, patron, i) => {
      if (patron.test(texto)) dias.push(i);
      return dias;
    }, []);
  }

  const HORAS = /(\d{1,2}):(\d{2})\s*[–—-]\s*(\d{1,2}):(\d{2})/g;

  /** Los tramos de reloj de un texto, en minutos desde la medianoche:
      "9:00 – 14:00, 16:30 – 20:00" da [[540, 840], [990, 1200]]. */
  function tramosDe(texto) {
    const tramos = [];
    let hallazgo;
    HORAS.lastIndex = 0;
    while ((hallazgo = HORAS.exec(texto))) {
      tramos.push([
        Number(hallazgo[1]) * 60 + Number(hallazgo[2]),
        Number(hallazgo[3]) * 60 + Number(hallazgo[4])
      ]);
    }
    return tramos;
  }

  const TODA_LA_SEMANA = [0, 1, 2, 3, 4, 5, 6];
  const DIA_ENTERO = [[0, 1440]];

  /** El horario del negocio, venga como venga, convertido a una sola forma:
      [{ dias: [1,2,3,4,5], tramos: [[540,840],[990,1200]] }, …]

      `horario` se puede escribir de dos maneras. La sencilla, un renglón, para
      el negocio que abre y cierra una vez al día:

          horario: 'Lun a Sáb · 9:00 – 20:00'

      y la de jornada partida, un renglón por grupo de días, para el que cierra
      a comer o el que el sábado trabaja distinto:

          horario: { 'Lun a Vie': '9:00 – 14:00, 16:30 – 20:00',
                     'Sáb':       '9:00 – 15:00' }

      Las dos acaban aquí en la misma lista, así que las fichas viejas siguen
      valiendo tal como están. Lista vacía quiere decir que no hay horas de
      abrir: ese trabaja por cita. */
  function jornadas(neg) {
    const crudo = neg.horario;
    const renglones = (crudo && typeof crudo === 'object')
      ? Object.keys(crudo).map(dias => dias + ' ' + crudo[dias])
      : [String(crudo || '')];

    return renglones.reduce((lista, renglon) => {
      const texto = norm(renglon);
      const abiertoSiempre = texto.includes('24 horas') || texto.includes('todo el dia');
      const dias = diasDe(texto);
      /* "Abierto 24 horas" no nombra ningún día porque son todos. */
      const cuando = dias.length ? dias : (abiertoSiempre ? TODA_LA_SEMANA : []);
      const tramos = abiertoSiempre ? DIA_ENTERO : tramosDe(texto);
      /* Un día sin horas —"Dom: Cerrado"— simplemente no entra. */
      if (cuando.length && tramos.length) lista.push({ dias: cuando, tramos: tramos });
      return lista;
    }, []);
  }

  /** 'abierto', 'cerrado' o 'cita' para los que trabajan por cita y no tienen
      una hora de abrir: de esos no se puede decir ni una cosa ni la otra. */
  function estado(neg) {
    const lista = jornadas(neg);
    if (!lista.length) return 'cita';    // "Con cita previa", "Visitas con cita"

    const hoy  = reloj();
    const ayer = (hoy.dia + 6) % 7;

    const dentro = lista.some(j => j.tramos.some((tramo) => {
      const abre = tramo[0], cierra = tramo[1];
      /* Tramo que cruza la medianoche, como el 19:00 – 2:00 de un bar: a la
         una de la mañana el negocio sigue en la jornada del día anterior. */
      if (cierra <= abre) {
        return (j.dias.includes(hoy.dia) && hoy.minuto >= abre) ||
               (j.dias.includes(ayer) && hoy.minuto < cierra);
      }
      return j.dias.includes(hoy.dia) && hoy.minuto >= abre && hoy.minuto < cierra;
    }));
    return dentro ? 'abierto' : 'cerrado';
  }

  const hhmm = (min) => Math.floor(min / 60) + ':' + String(min % 60).padStart(2, '0');

  /* La raya de un tramo, blindada contra el salto de línea. No basta con
     espacios duros: la raya larga es, ella misma, un punto de corte válido en
     Unicode, así que el navegador parte "16:00 – 19:00" justo después de la
     raya y en el renglón de un teléfono angosto queda "16:00 –" arriba y
     "19:00" abajo, que se lee como dos horas sueltas. El unidor de palabras
     tapa ese corte. Entre un tramo y otro sí se puede partir, y ahí parte. */
  const RAYA = '\u00a0\u2013\u2060\u00a0';   // duro + raya + unidor + duro
  const tramoTexto = (t) => (t[0] === 0 && t[1] === 1440)
    ? '24\u00a0horas'
    : hhmm(t[0]) + RAYA + hhmm(t[1]);

  /** Los tramos de un día, juntos y en orden. */
  const tramosDelDia = (lista, dia) => lista
    .filter(j => j.dias.includes(dia))
    .reduce((t, j) => t.concat(j.tramos), [])
    .sort((a, b) => a[0] - b[0]);

  /** El renglón que se ve sin abrir nada: lo de hoy y nada más, que es lo
      único que quiere saber quien está decidiendo si sale de su casa. */
  function horarioHoy(neg) {
    const lista = jornadas(neg);
    /* Sin horas, el texto original ya lo dice mejor: "Con cita previa". */
    if (!lista.length) {
      return typeof neg.horario === 'string' ? neg.horario : 'Consultar horario';
    }

    const tramos = tramosDelDia(lista, reloj().dia);
    if (!tramos.length) return 'Hoy cerrado';
    if (tramos.length === 1 && tramos[0][0] === 0 && tramos[0][1] === 1440) {
      return 'Abierto 24 horas';
    }
    /* "A, B y C", no "A y B y C": es un renglón que se lee, no una lista. */
    const partes = tramos.map(tramoTexto);
    const ultimo = partes.pop();
    return 'Hoy ' + (partes.length ? partes.join(', ') + ' y ' + ultimo : ultimo);
  }

  const DIA_NOMBRE = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  /* La semana empieza en lunes, como en el letrero de cualquier negocio. */
  const SEMANA_LUNES = [1, 2, 3, 4, 5, 6, 0];

  /** La semana completa, un renglón por horario. Los días seguidos que abren
      igual se juntan —"Lun a Vie"— porque así es como lo escribiría cualquiera
      a mano, y porque siete renglones para decir tres cosas se leen peor. */
  function horarioSemana(neg) {
    const lista = jornadas(neg);
    if (!lista.length) return [];

    const dia = reloj().dia;
    const filas = [];
    SEMANA_LUNES.forEach((d) => {
      const tramos = tramosDelDia(lista, d);
      const texto = tramos.length ? tramos.map(tramoTexto).join(', ') : 'Cerrado';
      const ultima = filas[filas.length - 1];
      if (ultima && ultima.texto === texto) {
        ultima.hasta = d;
        ultima.hoy = ultima.hoy || d === dia;
      } else {
        filas.push({ desde: d, hasta: d, texto: texto, hoy: d === dia });
      }
    });

    return filas.map(f => ({
      dias: f.desde === f.hasta
        ? DIA_NOMBRE[f.desde]
        : DIA_NOMBRE[f.desde] + ' a ' + DIA_NOMBRE[f.hasta],
      texto: f.texto,
      hoy: f.hoy
    }));
  }

  /** El horario en la ficha: lo de hoy a la vista y la semana detrás de un
      "Ver horario". Casi nadie necesita la semana entera —quiere saber si
      puede ir ahora—, pero el que la necesita no tiene dónde más consultarla,
      y desplegada de raíz le robaría media tarjeta a la descripción. Cuando el
      negocio abre siempre igual no hay nada que desplegar.

      `compacto` es la versión del renglón gratuito, donde el horario va al
      lado de la zona y no en su propio párrafo: ahí el "Ver horario" se queda
      en el puro triangulito, porque el renglón no da para más. Cerrado no
      ocupa ni un pixel de alto, así que el renglón se ve igual de chico; lo
      que compra la ficha completa sigue siendo la foto, la descripción y las
      etiquetas, no el derecho a que le lean el horario. */
  function bloqueHorario(neg, compacto) {
    const hoy = `${icon(ICONS.clock)} ${esc(horarioHoy(neg))}`;
    const semana = horarioSemana(neg);

    if (semana.length < 2) {
      return compacto
        ? `<span class="fila__horario">${hoy}</span>`
        : `<p class="card__line">${hoy}</p>`;
    }

    const filas = semana.map(f =>
      `<tr${f.hoy ? ' class="es-hoy"' : ''}>` +
      `<th scope="row">${esc(f.dias)}</th><td>${esc(f.texto)}</td></tr>`).join('');

    return `
      <details class="horario${compacto ? ' horario--fila' : ''}">
        <summary class="horario__hoy" title="Ver el horario de la semana">
          ${hoy}
          <span class="horario__ver">${compacto ? '' : 'Ver horario'}</span>
        </summary>
        <table class="horario__semana">${filas}</table>
      </details>`;
  }

  /* Cómo se ve cada estado. El sello corto es para el renglón de las fichas
     gratuitas, donde no cabe más. */
  const ESTADOS = {
    abierto: { corto: 'Abierto',  largo: 'Abierto ahora' },
    cita:    { corto: 'Con cita', largo: 'Con cita' },
    cerrado: { corto: 'Cerrado',  largo: 'Cerrado' }
  };

  /* Turno: el desempate que va después del plan. Primero los que están
     abiertos, porque es a los que el vecino les puede marcar ahora mismo;
     luego los de cita, que nunca están cerrados del todo; al final los
     cerrados. Nadie cambia de plan por esto: un Premium cerrado sigue arriba
     de un destacado abierto, lo que se mueve es el orden entre iguales. */
  const TURNO = { abierto: 0, cita: 1, cerrado: 2 };
  const turno = (n) => TURNO[estado(n)];

  /* Jerarquía de planes. El número es la posición en el listado: cuanto más
     chico, más arriba. Un plan desconocido cae al fondo, con los básicos. */
  const RANGO = { premium: 0, destacado: 1, completa: 2, basico: 3 };
  const rango = (n) => (n.plan in RANGO) ? RANGO[n.plan] : RANGO.basico;

  const esPremium   = (n) => n.plan === 'premium';
  const esDestacado = (n) => n.plan === 'destacado';
  /* La ficha gratuita: sale con lo indispensable para encontrar y llamar al
     negocio. Todo lo demás —foto, descripción, etiquetas, correo y redes— es
     lo que se compra al pasar a la ficha completa. */
  const esBasica    = (n) => rango(n) === RANGO.basico;

  /** Por plan; dentro del plan, los abiertos primero; entre iguales, al azar.

      El plan es lo único que compra posición; entre los que pagan lo mismo no
      hay razón para que siempre sean los mismos los de arriba. Antes mandaba la
      calificación, que además de estar inventada dejaba el orden clavado para
      siempre. Con el sorteo, a lo largo de los días todos los de un plan pasan
      por los primeros lugares de su categoría, de su especialidad y de las
      búsquedas. Vale para todos los planes, incluidas las fichas gratuitas.

      Entre los del mismo plan se cuela un desempate antes del sorteo: los que
      están abiertos a esta hora van primero. A quien busca una tortillería a
      las siete de la mañana no le sirve la mejor tortillería del pueblo si
      abre a las diez. El plan sigue mandando —esto sólo mueve el orden dentro
      de cada grupo—, así que nadie pierde el lugar que pagó.

      El turno se calcula una sola vez por negocio, no dentro del comparador,
      que se llama cientos de veces por lista. */
  const ordenar = (lista) => lista
    .map(n => ({ neg: n, plan: rango(n), turno: turno(n) }))
    .sort((a, b) => (a.plan - b.plan) || (a.turno - b.turno) ||
                    (a.neg.suerte - b.neg.suerte))
    .map(x => x.neg);


  /** Copia barajada (Fisher-Yates); la lista original no se toca. */
  function barajar(lista) {
    const a = lista.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  /* Selección al azar de hasta `n` elementos. Barajar entero y después cortar
     reparte parejo: en cada carga todos los negocios del plan tienen la misma
     probabilidad de salir, y ninguno queda siempre fuera por su orden. */
  const alAzar = (lista, n) => barajar(lista).slice(0, n);

  /* Lo mismo, pero abriéndoles paso a los que están abiertos: se baraja cada
     turno por separado y se pegan en orden, así que los primeros banners del
     carrusel son negocios a los que se les puede marcar ahora mismo. Los
     cerrados no desaparecen, quedan detrás; sólo si hay más negocios que
     lugares en el carrusel se queda alguno fuera, y a esa hora el que se va es
     el que de todos modos tiene la cortina abajo. */
  const alAzarAbiertos = (lista, n) => {
    const turnos = [[], [], []];
    lista.forEach(neg => turnos[turno(neg)].push(neg));
    return turnos.reduce((todos, grupo) => todos.concat(barajar(grupo)), []).slice(0, n);
  };

  /* ---------------------------------------------------- Plantillas (HTML) */

  function tarjetaCategoria(cat) {
    /* En vez de un conteo, adelantamos qué se encuentra dentro. */
    const muestra = cat.filtros.slice(0, 3).map(f => f.label).join(' · ');
    return `
      <li>
        <button class="cat" type="button" data-cat="${cat.id}"
                style="--cat-color:${cat.color};--cat-soft:${cat.soft}">
          <span class="cat__icon">${icon(cat.icono)}</span>
          <h3 class="cat__name">${esc(cat.nombre)}</h3>
          <span class="cat__meta">
            <span class="cat__dot"></span>
            ${esc(muestra)}${cat.filtros.length > 3 ? ' y más' : ''}
          </span>
        </button>
      </li>`;
  }

  /* La ficha gratuita no es una tarjeta chica: es un renglón. Con foto,
     descripción y etiquetas de por medio, una tarjeta con la mitad del
     contenido sigue ocupando el ancho entero de un teléfono y se lee como si
     valiera lo mismo que la de al lado. Como renglón dice lo que es —un
     nombre, dónde está, a qué hora abre y su teléfono—, cabe diez veces en la
     misma pantalla y deja la diferencia a la vista sin decir nada. */
  function filaNegocio(neg, idx) {
    const [c1, c2] = neg.cat.banner;
    const ahora = estado(neg);
    return `
      <article class="card card--fila" data-neg="${seña(neg)}"
               style="animation-delay:${Math.min(idx, 8) * 35}ms">

        <span class="fila__sello" style="--banner:linear-gradient(135deg, ${c1}, ${c2})" aria-hidden="true">
          ${icon(neg.cat.icono, 'fila__glifo')}
        </span>

        <div class="fila__texto">
          <h3 class="fila__nombre">
            <span class="fila__rotulo" title="${esc(neg.nombre)}">${esc(neg.nombre)}</span>
            <span class="fila__estado fila__estado--${ahora}">
              ${ESTADOS[ahora].corto}
            </span>
          </h3>
          <div class="fila__meta">
            <a class="card__mapa" href="${mapaLink(neg)}" target="_blank" rel="noopener"
               title="Cómo llegar a ${esc(neg.nombre)}">${icon(ICONS.pin)} ${esc(neg.zona)}</a>
            ${bloqueHorario(neg, true)}
          </div>
        </div>

        <div class="card__actions fila__accion">${botonesContacto(neg)}</div>
      </article>`;
  }

  function tarjetaNegocio(neg, idx) {
    if (esBasica(neg)) return filaNegocio(neg, idx);

    const cat  = neg.cat;
    const vip  = esPremium(neg);
    const dest = esDestacado(neg);
    /* El anillo de la tarjeta y el badge del plan comparten variante. */
    const variante = vip ? 'vip' : (dest ? 'featured' : 'basic');
    const [c1, c2] = cat.banner;
    const ahora = estado(neg);
    const tags = (neg.tags || []).slice(0, 4)
      .map(t => `<li class="tag">${esc(t)}</li>`).join('');

    /* El sello del plan sólo lo llevan los dos que compran posición; la ficha
       completa se distingue sola, por todo lo que la gratuita no trae. */
    return `
      <article class="card card--${variante}" data-neg="${seña(neg)}"
               style="animation-delay:${Math.min(idx, 8) * 35}ms">

        <div class="card__banner" style="--banner:linear-gradient(135deg, ${c1}, ${c2})">
          <span class="card__initials">${esc(iniciales(neg.nombre))}</span>
          <span class="card__glyph">${icon(cat.icono)}</span>
          <div class="card__badges">
            ${vip
              ? `<span class="badge badge--vip">${icon(ICONS.corona)} Premium</span>`
              : dest
              ? `<span class="badge badge--featured">${icon(ICONS.star)} Destacado</span>`
              : ''}
            <span class="badge badge--${ahora}">
              ${ESTADOS[ahora].largo}
            </span>
          </div>
        </div>

        <div class="card__body">
          <h3 class="card__title">${esc(neg.nombre)}</h3>

          <p class="card__line">
            <span class="card__rating">${icon(ICONS.star)}${neg.rating.toFixed(1)}</span>
            <span class="card__sep">·</span>
            <a class="card__mapa" href="${mapaLink(neg)}" target="_blank" rel="noopener"
               title="Cómo llegar en Google Maps">${icon(ICONS.pin)} ${esc(neg.zona)}</a>
          </p>

          <p class="card__desc">${esc(neg.desc)}</p>

          <ul class="tags">${tags}</ul>

          ${bloqueHorario(neg)}

          <div class="card__actions">${botonesContacto(neg)}</div>
        </div>
      </article>`;
  }

  /* `primero` es la seña del negocio que el usuario acaba de tocar en el
     carrusel de destacados: lo trae aquí para verlo, no para buscarlo, así que
     sube al principio de la lista. Pero no por encima de los Premium de esa
     misma categoría —ese lugar está pagado y no lo cede un destacado—, sino
     justo debajo de ellos. El resto conserva su orden. */
  /* Cuántas fichas gratuitas se apilan en el lugar de una tarjeta. Tres es lo
     que cabe en el alto de una tarjeta aun con un horario desplegado, que es
     el trato: la pila nunca crece más que la tarjeta de al lado. */
  const POR_PILA = 3;

  const pintarLista = (el, lista, primero) => {
    const orden = ordenar(lista);
    if (primero) {
      const i = orden.findIndex(n => seña(n) === primero);
      const tope = orden.filter(esPremium).length;   // dónde terminan los Premium
      if (i > tope) orden.splice(tope, 0, orden.splice(i, 1)[0]);
    }
    /* Las fichas gratuitas salen de la retícula de tarjetas y se van a su
       propio bloque. Metidas en la retícula tenían que ocupar el ancho entero
       —un renglón no cabe en una columna de tarjeta— y en una pantalla grande
       quedaban como tiras larguísimas con el nombre a la izquierda y el botón
       perdido allá en la otra orilla.

       Dentro del bloque van de tres en tres, apiladas una encima de la otra:
       cada pila ocupa el lugar de una tarjeta. Así el hueco que dejan las
       tarjetas se llena por columna y no por renglón, y en vez de dos fichas
       sueltas cruzando el ancho se ve otra columna del directorio, que es lo
       que dice que la lista sigue. Tres es lo que cabe en el alto de una
       tarjeta con su horario desplegado. */
    const tarjetas = orden.filter(n => !esBasica(n));
    const renglones = orden.filter(esBasica);

    const pilas = [];
    for (let i = 0; i < renglones.length; i += POR_PILA) {
      pilas.push(renglones.slice(i, i + POR_PILA));
    }

    el.innerHTML =
      tarjetas.map(tarjetaNegocio).join('') +
      (pilas.length
        ? `<div class="filas">` + pilas.map((grupo, g) =>
            `<div class="pila">` +
            grupo.map((n, i) =>
              tarjetaNegocio(n, tarjetas.length + g * POR_PILA + i)).join('') +
            `</div>`).join('') + `</div>`
        : '');
  };

  /* ----------------------------------------------------- Banner VIP (home) */

  /* Rotación exclusiva de los negocios con plan Premium, arriba de la portada.
     Las diapositivas van en fila dentro de una ventana que las recorta, y la
     fila se corre de página en página: en escritorio se ven dos a la vez, en
     el teléfono una. */
  function diapositivaVip(neg) {
    const [c1, c2] = neg.cat.banner;
    /* La fila superior lleva el texto y el recuadro de la foto; la inferior,
       la barra de contacto con los botones que ya usan las tarjetas. Sin
       `foto` el recuadro dibuja las iniciales sobre el glifo de la
       categoría, igual que el banner de las tarjetas. Ojo: dentro de la
       plantilla no caben comillas invertidas, cierran el literal.

       El `manto` es un enlace transparente del tamaño de la tarjeta: la lleva
       entera a la ficha del negocio dentro de su categoría, igual que los
       banners del carrusel. No puede envolver a la tarjeta porque dentro hay
       otros enlaces —la dirección y los botones— y un enlace dentro de otro no
       es válido; así, tendido por encima, cada quien conserva el suyo. */
    return `
      <article class="vip__slide" style="--banner:linear-gradient(135deg, ${c1}, ${c2})">
        <a class="vip__manto" href="#/c/${neg.cat.id}/todos/${seña(neg)}"
           title="${esc(neg.nombre)}"
           aria-label="${esc(neg.nombre)}, ver su ficha en ${esc(neg.cat.nombre)}"></a>
        <div class="vip__cuerpo">
          <div class="vip__texto">
            <span class="badge badge--vip">${icon(ICONS.corona)} Premium</span>
            <h3 class="vip__nombre">${esc(neg.nombre)}</h3>
            <p class="vip__desc">${esc(neg.desc)}</p>
            <p class="vip__meta">
              <a class="vip__mapa" href="${mapaLink(neg)}" target="_blank" rel="noopener"
                 title="Cómo llegar a ${esc(neg.nombre)}">${icon(ICONS.pin)} ${esc(neg.zona)}</a>
              <span class="vip__sep">·</span> ${esc(neg.cat.nombre)}</p>
          </div>

          <div class="vip__foto">
            ${neg.foto
              ? `<img src="${esc(neg.foto)}" alt="" loading="lazy">`
              : `<span class="vip__foto-ini">${esc(iniciales(neg.nombre))}</span>` +
                `<span class="vip__foto-glifo">${icon(neg.cat.icono)}</span>`}
          </div>
        </div>
        <div class="vip__acciones">${botonesContacto(neg)}</div>
      </article>`;
  }

  /* Cada cuánto pasa a la siguiente página de Premium. Con dos negocios por
     vista la vuelta completa se da en la mitad de los cambios, así que el
     banner alcanza a enseñarlos todos sin que la espera se haga larga. */
  const VIP_MS = 4000;

  /* Lo que tarda el deslizamiento de una página a la siguiente. Tiene que ir
     de la mano con la transición de `.vip__pista` en la hoja de estilos: es el
     tiempo que se espera antes de cambiar la copia del final por el original. */
  const VIP_DESLIZ = 450;

  /* Cuántos Premium van en cada página. Dos en escritorio, uno encima del
     otro: apiladas, las tarjetas se ven anchas —a lo largo, no a lo alto— y el
     plan enseña el doble de negocios sin encoger ninguno. En el teléfono, uno.
     El recorrido entre páginas sigue siendo horizontal. */
  const vipPorPagina = () => (window.innerWidth >= 768 ? 2 : 1);

  /* Cuántos Premium caben en el banner de la portada. La portada es finita: con
     un cambio cada 4 segundos y uno por pantalla en el teléfono, arriba de ocho
     la vuelta completa dura más que una visita entera y a los últimos no los ve
     nadie —cobrarle a alguien por un lugar que no se ve es como se pierde un
     cliente—. Mientras haya ocho o menos salen todos siempre; pasando de ahí se
     sortean en cada carga, igual que el carrusel de destacados, para que la
     rotación sea pareja y nadie quede siempre fuera. El lugar que de verdad
     compra el Premium —el primero de su especialidad— no depende de esto. */
  const VIP_MAX = 8;

  function renderVip() {
    const caja = $('#vipBanner');
    const vips = alAzarAbiertos(TODOS.filter(esPremium), VIP_MAX);
    caja.hidden = vips.length === 0;
    if (caja.hidden) return;

    caja.innerHTML =
      `<div class="vip__slides"><div class="vip__pista"></div></div>` +
      `<div class="vip__dots"></div>`;

    const ventana  = $('.vip__slides', caja);
    const pista    = $('.vip__pista', caja);
    const cajaDots = $('.vip__dots', caja);

    const quieto = window.matchMedia('(prefers-reduced-motion: reduce)');
    caja.classList.toggle('vip--quieto', quieto.matches);

    /* `ranura` es la columna que se está enseñando y `pagina`, cuál de los
       grupos reales es. Casi siempre valen lo mismo; se separan al final de la
       vuelta, cuando lo que se ve es la copia del primer grupo. */
    let porPagina = 0, paso = 0, paginas = 0, pagina = 0, ranura = 0, vuelta = 0;

    /* Cada página es una columna del ancho de la ventana con sus negocios
       apilados. La pista lleva las columnas en fila, así que el recorrido
       sigue siendo horizontal aunque las tarjetas se acomoden a lo alto.

       Al final se cuelga una copia del primer grupo. Sirve para que la vuelta
       se dé hacia adelante: en vez de devolverse de la última página a la
       primera —un barrido hacia atrás de toda la tira, que se ve como un
       rebobinado—, avanza un paso más hasta la copia y ahí, ya sin nada que
       animar, se salta en seco al principio de verdad. El salto no se ve
       porque la copia y el original son idénticos. */
    const construir = () => {
      const grupos = [];
      for (let i = 0; i < vips.length; i += porPagina) grupos.push(vips.slice(i, i + porPagina));
      paginas = grupos.length;
      if (paginas > 1) grupos.push(grupos[0]);

      pista.innerHTML = grupos.map((g) =>
        `<div class="vip__grupo">${g.map(diapositivaVip).join('')}</div>`).join('');

      cajaDots.innerHTML = Array.from({ length: paginas }, (_, i) =>
        `<button class="vip__dot" type="button" data-i="${i}"
                 aria-label="Ver el grupo ${i + 1} de ${paginas}"></button>`).join('');
      $$('.vip__dot', cajaDots).forEach((d) => d.addEventListener('click', () => {
        /* Nunca se parte desde la copia del final: desde ahí, ir a cualquier
           página sería un barrido hacia atrás de toda la tira. */
        if (ranura === paginas) ir(0, true);
        ir(Number(d.dataset.i));
        reiniciar();   /* el toque manual reinicia la cuenta */
      }));
    };

    const ir = (r, seco) => {
      clearTimeout(vuelta);
      /* Las columnas son las páginas más la copia del final; con una sola
         página no hay copia y no hay nada que recorrer. */
      const columnas = paginas > 1 ? paginas + 1 : 1;
      ranura = (r + columnas) % columnas;
      pagina = ranura % paginas;

      if (seco) pista.style.transition = 'none';
      pista.style.transform = `translate3d(${-ranura * paso}px, 0, 0)`;
      if (seco) { void pista.offsetWidth; pista.style.transition = ''; }

      /* Las páginas que quedaron fuera de la ventana salen del tabulador y del
         lector de pantalla: están recortadas, no ocultas, y sin esto se podría
         llegar con el tabulador a un negocio que no se ve. */
      $$('.vip__grupo', pista).forEach((g, i) => {
        const dentro = i === ranura;
        g.setAttribute('aria-hidden', dentro ? 'false' : 'true');
        $$('a', g).forEach((a) => { a.tabIndex = dentro ? 0 : -1; });
      });
      $$('.vip__dot', cajaDots).forEach((d, i) => d.classList.toggle('is-active', i === pagina));
    };

    /* Deja el carrusel en la ranura pedida. Si cae en la copia del final, en
       cuanto termina de deslizarse se cambia en seco por el original. El margen
       sobre la duración de la transición es para que el cambio no se coma el
       final del movimiento. */
    const acomodar = (r) => {
      ir(r);
      if (ranura === paginas) vuelta = setTimeout(() => ir(0, true), VIP_DESLIZ + 90);
    };

    /* Un paso adelante y un paso atrás. Hacia atrás desde la primera página no
       hay nada a la izquierda que enseñar, así que primero se salta en seco a
       la copia del final —idéntica, no se nota— y desde ahí sí se puede
       retroceder a la última. Hacia adelante, al revés: parado en la copia se
       vuelve al original antes de seguir, o el paso siguiente sería un barrido
       hacia atrás de toda la tira. */
    const avanzar = () => {
      if (ranura === paginas) ir(0, true);
      acomodar(ranura + 1);
    };
    const retroceder = () => {
      if (ranura === 0) ir(paginas, true);
      acomodar(ranura - 1);
    };

    const medir = () => {
      /* Sólo se rearma el marcado si cambió cuántos caben: pasar de una a dos
         por página reagrupa las tarjetas, y eso no debe ocurrir en cada
         `resize`. */
      const n = Math.min(vipPorPagina(), vips.length);
      if (n !== porPagina) {
        porPagina = n;
        construir();
      }

      const gap   = parseFloat(getComputedStyle(pista).columnGap) || 0;
      const ancho = ventana.clientWidth;
      if (ancho <= 0) return;

      pista.style.setProperty('--vip-w', ancho + 'px');
      paso = ancho + gap;
      ir(Math.min(pagina, paginas - 1), true);
    };

    /* Con animaciones reducidas no rota sola: el usuario cambia con los
       puntos. Tampoco corre mientras el puntero o el foco están dentro. */
    let reloj = null;
    const parar     = () => { clearInterval(reloj); reloj = null; };
    const reiniciar = () => {
      parar();
      if (!quieto.matches && paginas > 1) reloj = setInterval(avanzar, VIP_MS);
    };

    ['mouseenter', 'focusin'].forEach(e => caja.addEventListener(e, parar));
    ['mouseleave', 'focusout'].forEach(e => caja.addEventListener(e, reiniciar));

    /* Sólo se remide si cambió el ancho: en el teléfono el `resize` también
       salta al esconderse la barra de direcciones, que sólo cambia el alto. */
    let anchoPrev = window.innerWidth;
    window.addEventListener('resize', () => {
      if (window.innerWidth === anchoPrev) return;
      anchoPrev = window.innerWidth;
      medir();
    });

    /* Arrastre lateral con el dedo o con el ratón, como en el carrusel de
       destacados. En el teléfono los puntos quedan chicos para andar
       apuntándoles, y el gesto natural sobre una tarjeta ancha es empujarla.

       Mientras el dedo manda, la pista sigue su recorrido sin transición: la
       tarjeta va pegada al dedo. Al soltar se decide de una vez si cambió de
       página o si vuelve a su sitio, y ahí sí con el deslizamiento de siempre. */
    let toque = null, jalado = false;

    ventana.addEventListener('pointerdown', (e) => {
      if (e.button > 0 || paginas < 2) return;
      toque = { id: e.pointerId, x: e.clientX, y: e.clientY, dx: 0,
                ux: e.clientX, t: e.timeStamp, vel: 0, movido: false };
    });

    ventana.addEventListener('pointermove', (e) => {
      if (!toque) return;
      const dx = e.clientX - toque.x;

      if (!toque.movido) {
        /* Menos de ocho píxeles todavía puede ser el pulso de un clic; sin ese
           margen, tocar un botón movería el banner. Y si el dedo va más a lo
           alto que a lo ancho el gesto es de la página, no del carrusel: se
           suelta para no dejar al usuario atorado sin poder bajar. */
        if (Math.abs(dx) < 8) return;
        if (Math.abs(dx) <= Math.abs(e.clientY - toque.y)) { toque = null; return; }
        toque.movido = true;
        parar();
        clearTimeout(vuelta);
        /* Para poder jalar hacia atrás desde la primera página hace falta algo
           a la izquierda: la copia del final, que se ve igual. */
        if (dx > 0 && ranura === 0) ir(paginas, true);
        ventana.classList.add('is-agarrada');
        /* Protegida: si el navegador ya dio por terminado ese puntero la
           captura truena, y no vale la pena perder el arrastre por eso. */
        try { ventana.setPointerCapture(toque.id); } catch (_) { /* sin captura */ }
      }

      const dt = e.timeStamp - toque.t;
      if (dt > 0) {
        toque.vel = (e.clientX - toque.ux) / dt;   // píxeles por milisegundo
        toque.ux  = e.clientX;
        toque.t   = e.timeStamp;
      }
      toque.dx = dx;
      pista.style.transition = 'none';
      pista.style.transform  = `translate3d(${-ranura * paso + dx}px, 0, 0)`;
    });

    const soltarVip = () => {
      if (!toque) return;
      const { id, movido, dx, vel } = toque;
      toque = null;
      ventana.classList.remove('is-agarrada');
      try { ventana.releasePointerCapture(id); } catch (_) { /* ya no la tenía */ }
      if (!movido) return;   /* fue un clic limpio: que lo atienda el enlace */

      /* El clic que viene detrás de un arrastre no es una visita al negocio,
         es el final del jalón: se traga más abajo. */
      jalado = true;
      pista.style.transition = '';

      /* Cambia de página si el dedo salió rápido o si recorrió una quinta
         parte del ancho. Con menos, la página se regresa a su lugar. */
      const signo = Math.abs(vel) > 0.35 ? (vel < 0 ? 1 : -1)
                  : Math.abs(dx) > paso * 0.2 ? (dx < 0 ? 1 : -1) : 0;
      if (signo > 0) avanzar();
      else if (signo < 0) retroceder();
      else acomodar(ranura);
      reiniciar();
    };
    /* También en la ventana del navegador: mientras el arrastre no arranca no
       hay captura, y si el dedo se sale del banner y se suelta afuera, el
       `pointerup` no pasaría por aquí y el carrusel se quedaría agarrado. La
       función se protege sola, así que oírla dos veces no hace nada. */
    ['pointerup', 'pointercancel'].forEach((e) => {
      ventana.addEventListener(e, soltarVip);
      window.addEventListener(e, soltarVip);
    });

    ventana.addEventListener('click', (e) => {
      if (!jalado) return;
      jalado = false;
      e.preventDefault();
      e.stopPropagation();
    }, true);

    medir();
    reiniciar();
  }

  /* ------------------------------------------- Carrusel de destacados (home) */

  /* Cuántos negocios del plan Destacado entran al carrusel en cada carga. */
  const DEST_MAX = 10;

  /* Banner del carrusel: sólo la imagen del negocio y el sello de Destacado.
     Nada de nombre, categoría ni botones —para eso está la ficha completa, a
     la que lleva el propio banner—. Sin `foto` quedan las iniciales sobre el
     glifo de la categoría, para que no sea un rectángulo de color a secas.
     La tarjeta entera es el enlace: el nombre del negocio viaja en el
     `aria-label`, que es lo único que anuncia un lector de pantalla cuando la
     imagen es todo el contenido. Ojo: dentro de la plantilla no caben comillas
     invertidas, cierran el literal. */
  function tarjetaDestacada(neg) {
    const [c1, c2] = neg.cat.banner;
    return `
      <a class="dest__card" href="#/c/${neg.cat.id}/todos/${seña(neg)}"
         title="${esc(neg.nombre)}"
         aria-label="${esc(neg.nombre)}, ver su ficha en ${esc(neg.cat.nombre)}"
         style="--banner:linear-gradient(135deg, ${c1}, ${c2})">
        ${neg.foto
          ? `<img src="${esc(neg.foto)}" alt="" loading="lazy">`
          : `<span class="dest__ini">${esc(iniciales(neg.nombre))}</span>` +
            `<span class="dest__glifo">${icon(neg.cat.icono)}</span>`}
        <span class="badge badge--featured">${icon(ICONS.star)} Destacado</span>
      </a>`;
  }

  /* Velocidad del desfile, en píxeles por segundo. Se avanza cuadro a cuadro
     desde el JS, no con una animación de CSS: las flechas y el arrastre tienen
     que poder tomar el carrusel donde va y devolverlo sin saltos, y para eso
     hace falta una sola posición que todos muevan. */
  const DEST_VEL = 42;
  /* Cuánto espera antes de retomar el desfile después de que el usuario suelta. */
  const DEST_ESPERA = 2500;
  /* Cuánto dura el empujón de una flecha. */
  const DEST_TIRON = 420;

  function renderDestacados() {
    const caja  = $('#destBanner');
    const lista = alAzarAbiertos(TODOS.filter(esDestacado), DEST_MAX);
    caja.hidden = lista.length === 0;
    if (caja.hidden) return;

    const pista = $('#destPista');
    const izq   = $('#destPrev');
    const der   = $('#destNext');
    const tanda = lista.map(tarjetaDestacada).join('');

    /* Con animaciones reducidas el carrusel no arranca solo. Las flechas y el
       dedo siguen sirviendo —ese movimiento lo pide el usuario— pero sin
       suavizado: van derecho al destino. */
    const solo = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    pista.classList.toggle('is-manual', solo);

    pista.innerHTML = `<div class="dest__cinta"><div class="dest__grupo">${tanda}</div></div>`;
    const cinta = $('.dest__cinta', pista);
    const grupo = $('.dest__grupo', pista);
    izq.hidden = false;
    der.hidden = false;

    let dist   = 0;   // ancho de una tanda más su separación: el ciclo completo
    let avance = 0;   // lo que ocupa una tarjeta con su separación

    /* Cuántos banners se ven a la vez. En el teléfono se deja uno a medias a
       propósito: el borde cortado avisa de que hay más de lado y que el
       carrusel se puede arrastrar. */
    const porVista = () =>
      window.innerWidth >= 900 ? 4 : window.innerWidth >= 560 ? 3 : 2.5;

    const medir = () => {
      const gap = parseFloat(getComputedStyle(cinta).columnGap) || 0;
      const n   = porVista();

      /* El ancho sale de la cuenta, no de un número fijo, para que entren justo
         `n` banners entre los dos bordes de la página. Los huecos que se ven
         son uno menos que los banners empezados: con 2.5 a la vista hay tres
         banners tocando la pista y dos separaciones entre ellos. */
      const carta = (pista.clientWidth - (Math.ceil(n) - 1) * gap) / n;
      if (carta <= 0) return;
      pista.style.setProperty('--dest-w', carta + 'px');
      avance = carta + gap;

      const ancho = grupo.getBoundingClientRect().width;
      if (!ancho) return;

      /* Al recorrer justo esto, la tanda siguiente cae exactamente donde
         arrancó la anterior, así que el reinicio del ciclo no se ve. Y como es
         un múltiplo exacto de `avance`, el filo de las tarjetas sigue cayendo
         en el mismo lugar vuelta tras vuelta. */
      dist = ancho + gap;

      /* Copias de la tanda: pasado el ciclo la cinta tiene que seguir cubriendo
         la ventana, o la cola aparecería en blanco. Con pocos negocios en
         pantalla ancha hacen falta varias. La copia se esconde del lector de
         pantalla y sus enlaces salen del tabulador, para no anunciar ni
         recorrer dos veces los mismos negocios. */
      let c = cinta.children.length;
      while (c * dist - gap - dist < pista.clientWidth && c < 12) {
        const copia = grupo.cloneNode(true);
        copia.setAttribute('aria-hidden', 'true');
        $$('a', copia).forEach((a) => { a.tabIndex = -1; });
        cinta.appendChild(copia);
        c++;
      }
    };

    let pos    = 0;      // píxeles recorridos hacia la izquierda
    let corre  = !solo;  // ¿avanza por su cuenta?
    let tiron  = null;   // empujón en curso: { desde, hasta, t0 }
    let agarre = null;   // arrastre en curso
    let jalado = false;  // el clic que sigue a un arrastre no cuenta
    let espera = 0;      // temporizador para retomar el desfile
    let previo = 0;      // marca de tiempo del cuadro anterior
    let raf    = 0;

    /* Lo que se pinta se queda siempre dentro de una tanda: el recorrido crece
       sin parar, pero al pintarlo vuelve al principio en cada vuelta. */
    const pintar = () => {
      const p = dist ? ((pos % dist) + dist) % dist : 0;
      cinta.style.transform = `translate3d(${-p}px, 0, 0)`;
    };

    const cuadro = (t) => {
      raf = 0;
      const dt = previo ? Math.min(64, t - previo) / 1000 : 0;
      previo = t;

      if (tiron) {
        const k = Math.min(1, (t - tiron.t0) / DEST_TIRON);
        /* Frena al llegar en vez de cortar en seco. */
        pos = tiron.desde + (tiron.hasta - tiron.desde) * (1 - Math.pow(1 - k, 3));
        if (k === 1) tiron = null;
      } else if (!agarre && corre) {
        /* Por tiempo, no por cuadro: en una pantalla de 120 Hz corre igual de
           rápido que en una de 60. */
        pos += DEST_VEL * dt;
      }

      pintar();
      if (tiron || agarre || corre) raf = requestAnimationFrame(cuadro);
      else previo = 0;
    };
    /* Quieto no pide cuadros: no gasta batería mientras nadie lo mueve. */
    const andar = () => { if (!raf) raf = requestAnimationFrame(cuadro); };

    const parar = () => { corre = false; clearTimeout(espera); };
    const seguir = (ms) => {
      clearTimeout(espera);
      if (solo) return;
      espera = setTimeout(() => {
        /* Sólo retoma si ya no hay nadie encima: con el puntero sobre una
           tarjeta o el foco en un botón, moverse le quitaría el blanco. */
        if (agarre || caja.matches(':hover') || caja.contains(document.activeElement)) return;
        corre = true;
        andar();
      }, ms);
    };

    ['mouseenter', 'focusin'].forEach((e) => caja.addEventListener(e, parar));
    ['mouseleave', 'focusout'].forEach((e) => caja.addEventListener(e, () => seguir(0)));

    /* Empujón de flecha: detiene el desfile, avanza un solo negocio y lo retoma
       cuando el usuario se retira. Antes de moverse redondea al filo de tarjeta
       más cercano, así el borde izquierdo de la pista siempre cae en el
       principio de una tarjeta y ninguna se queda cortada a la mitad. */
    const empujar = (signo) => {
      parar();
      const meta = (Math.round(pos / avance) + signo) * avance;
      if (solo) { pos = meta; pintar(); return; }
      tiron = { desde: pos, hasta: meta, t0: performance.now() };
      andar();
      seguir(DEST_ESPERA);
    };
    izq.addEventListener('click', () => empujar(-1));
    der.addEventListener('click', () => empujar(1));

    /* Arrastre con el dedo o con el ratón.

       La captura del puntero NO se pide aquí, aunque sea lo natural: mientras
       la pista tiene capturado un puntero de ratón, el navegador le manda a
       ella el `mousedown` y el `mouseup`, y el `click` que arma con los dos
       termina en la pista en vez de en el banner. El enlace nunca se enteraba
       del clic y en escritorio no pasaba nada. Se pide cuando el arrastre
       empieza de verdad (más abajo, al pasar el umbral), que es cuando sirve:
       seguir recibiendo eventos aunque el puntero se salga de la pista. */
    pista.addEventListener('pointerdown', (e) => {
      if (e.button > 0) return;
      parar();
      tiron  = null;
      jalado = false;
      agarre = { id: e.pointerId, x: e.clientX, pos, ux: e.clientX,
                 t: e.timeStamp, vel: 0, movido: false };
      andar();
    });

    pista.addEventListener('pointermove', (e) => {
      if (!agarre) return;
      const dx = e.clientX - agarre.x;
      /* Menos de seis píxeles todavía puede ser el pulso de un clic y no un
         arrastre; sin ese margen, tocar un botón movería el carrusel. */
      if (!agarre.movido && Math.abs(dx) < 6) return;
      if (!agarre.movido) {
        agarre.movido = true;
        pista.classList.add('is-agarrada');
        /* Protegida: si el navegador ya dio por terminado ese puntero la
           captura truena, y no vale la pena perder el arrastre por eso. */
        try { pista.setPointerCapture(agarre.id); } catch (_) { /* sin captura */ }
      }

      const dt = e.timeStamp - agarre.t;
      if (dt > 0) {
        agarre.vel = (e.clientX - agarre.ux) / dt;   // píxeles por milisegundo
        agarre.ux  = e.clientX;
        agarre.t   = e.timeStamp;
      }
      pos = agarre.pos - dx;
    });

    const soltar = () => {
      if (!agarre) return;
      const { id, movido, vel } = agarre;
      agarre = null;
      pista.classList.remove('is-agarrada');
      try { pista.releasePointerCapture(id); } catch (_) { /* ya no la tenía */ }
      /* El clic que viene detrás de un arrastre no es una visita al negocio,
         es el final del jalón: se traga más abajo. */
      jalado = movido;

      /* Un impulso al soltar, como el desplazamiento de toda la vida: si venía
         rápido, sigue un poco de largo antes de quedarse. */
      if (movido && !solo && Math.abs(vel) > 0.35) {
        tiron = { desde: pos, hasta: pos - vel * 220, t0: performance.now() };
      }
      seguir(DEST_ESPERA);
      andar();
    };
    /* También en la ventana: mientras el arrastre no arranca no hay captura, y
       si el puntero se sale de la pista de un tirón y se suelta afuera, el
       `pointerup` no pasaría por aquí y el carrusel se quedaría agarrado. La
       función se protege sola, así que oírlo dos veces no hace nada. */
    ['pointerup', 'pointercancel'].forEach((e) => {
      pista.addEventListener(e, soltar);
      window.addEventListener(e, soltar);
    });

    pista.addEventListener('click', (e) => {
      if (!jalado) return;
      jalado = false;
      e.preventDefault();
      e.stopPropagation();
    }, true);

    /* La rueda o el trackpad de lado también lo mueven. El movimiento vertical
       se deja pasar: secuestrarlo dejaría al usuario atorado sin poder bajar. */
    pista.addEventListener('wheel', (e) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      e.preventDefault();
      parar();
      tiron = null;
      pos += e.deltaX;
      pintar();
      seguir(DEST_ESPERA);
    }, { passive: false });

    /* Al enfocar con el tabulador una tarjeta que quedó fuera de la ventana, el
       navegador intenta correr la caja aunque esté recortada; como el recorrido
       real lo lleva el `transform`, se devuelve a cero para que no se descuadre. */
    pista.addEventListener('scroll', () => { pista.scrollLeft = 0; });

    /* Sólo se vuelve a medir si cambió el ancho: en el teléfono el `resize`
       también salta al esconderse la barra de direcciones, que sólo cambia el
       alto, y remedir ahí le daría un tirón al carrusel sin motivo. */
    let anchoPrev = window.innerWidth;
    window.addEventListener('resize', () => {
      if (window.innerWidth === anchoPrev) return;
      anchoPrev = window.innerWidth;
      medir();
      pintar();
    });

    medir();
    pintar();
    if (corre) andar();
  }

  /* -------------------------------------------------------- Vista: inicio */

  function renderHome() {
    $('#categoryGrid').innerHTML = CATEGORIAS.map(tarjetaCategoria).join('');

    $('#heroStats').innerHTML = [
      'Negocios de la ciudad',
      'Contacto directo e inmediato',
      'Cómo llegar en un toque'
    ].map(txt =>
      `<span class="stat">${icon(ICONS.check, 'stat__ico')}${txt}</span>`
    ).join('');

    renderVip();
    /* El carrusel es el beneficio que compra el plan Destacado; los premium
       tienen su propio banner arriba, así que no se repiten aquí. */
    renderDestacados();
  }

  /* ----------------------------------------------------- Vista: categoría */

  let categoriaActual = null;

  function renderCategoria(catId, filtroId, negocio) {
    const cat = CATEGORIAS.find(c => c.id === catId);
    if (!cat) { irA('#/'); return; }

    categoriaActual = cat;
    const filtro = filtroId || 'todos';

    /* Cabecera */
    const head = $('.catbar');
    head.style.setProperty('--cat-color', cat.color);
    head.style.setProperty('--cat-soft', cat.soft);
    $('#catIcon').innerHTML = icon(cat.icono);
    $('#catTitle').textContent = cat.nombre;

    $('#catSub').textContent = 'Los recomendados aparecen primero';

    /* Barra de filtros / tags */
    const chips = [{ id: 'todos', label: 'Todos' }].concat(cat.filtros);
    $('#filterList').innerHTML = chips.map(f => `
      <button class="chip" type="button" role="tab" data-filtro="${f.id}"
              aria-selected="${f.id === filtro}">${esc(f.label)}</button>`).join('');

    /* Lista de negocios. Sale del índice y no de `cat.negocios` para que sean
       los mismos objetos que usa el resto del sitio: los del catálogo vienen
       pelones, sin la categoría y sin el número de la suerte que decide el
       orden dentro de cada plan. */
    const lista = TODOS.filter(n =>
      n.cat === cat && (filtro === 'todos' || n.filtro === filtro));
    pintarLista($('#businessList'), lista, negocio);

    $('#resultCount').textContent = filtro === 'todos'
      ? 'Todos los negocios de la categoría'
      : `Mostrando: ${chips.find(f => f.id === filtro).label}`;

    $('#emptyState').hidden = lista.length > 0;

    mostrarVista('category');

    /* Si se llegó tocando un banner del carrusel, su ficha —que ya quedó
       arriba, debajo de los Premium— se marca para que lata al aparecer. */
    if (negocio) resaltar(negocio);
  }

  /* La ficha del negocio que se tocó en el carrusel. Late tres veces al
     aparecer, que es lo que dice cuál de todas era: el banner no traía nombre.

     La página abre desde arriba, como cualquier categoría, para que se vea de
     cuál se trata. Con `nearest` sólo se mueve si la ficha no cabe entera: en
     escritorio va en la primera fila y no hace falta bajar nada; en el teléfono,
     donde las fichas van en una sola columna y arriba puede haber un Premium,
     baja lo justo, y la barra de categorías —que ahí va pegada— sigue diciendo
     en qué categoría está. */
  function resaltar(negocio) {
    const tarjeta = $(`.card[data-neg="${negocio}"]`, $('#businessList'));
    if (!tarjeta) return;
    tarjeta.classList.add('is-resaltada');
    requestAnimationFrame(() => {
      /* Se remiden las barras primero: la de categorías estaba oculta hasta
         hace un instante, y oculta mide cero. */
      syncHeaderHeight();
      tarjeta.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    });
  }

  /* ------------------------------------------------------ Vista: búsqueda */

  function renderBusqueda(q) {
    const term = norm(q.trim());
    $('#searchTerm').textContent = q;

    /* La ficha gratuita se busca por lo que enseña: su nombre, su zona y su
       giro. La descripción y las etiquetas de servicio —salir cuando alguien
       teclea "frenos" o "urgencias"— son de la ficha completa en adelante. */
    const res = term.length < 2 ? [] : TODOS.filter(n => {
      const propio = esBasica(n) ? [] : [n.desc, (n.tags || []).join(' ')];
      const heno = norm([
        n.nombre, n.zona, ...propio,
        n.cat.nombre, (n.cat.filtros.find(f => f.id === n.filtro) || {}).label || ''
      ].join(' '));
      return term.split(/\s+/).every(w => heno.includes(w));
    });

    pintarLista($('#searchList'), res);
    $('#searchCount').textContent = res.length
      ? 'Esto encontramos en el directorio'
      : '';
    $('#searchEmpty').hidden = res.length > 0;

    mostrarVista('search');
  }

  /* --------------------------------------------------------------- Router */

  const VISTAS = ['home', 'category', 'search', 'registro'];

  function mostrarVista(nombre) {
    VISTAS.forEach(v => { $('#view-' + v).hidden = (v !== nombre); });
  }

  const irA = (hash) => { window.location.hash = hash; };

  /* Actualiza la URL sin volver a renderizar (el filtrado ya pintó la lista).
     No usamos history.replaceState porque falla al abrir el archivo con file:// */
  let ignorarSiguienteRuta = false;
  function actualizarUrl(hash) {
    if (window.location.hash === hash) return;
    ignorarSiguienteRuta = true;
    window.location.hash = hash;
  }

  function router() {
    if (ignorarSiguienteRuta) { ignorarSiguienteRuta = false; return; }

    const raw   = window.location.hash.replace(/^#\/?/, '');
    const parts = raw.split('/').filter(Boolean).map(decodeURIComponent);

    if (parts[0] === 'c' && parts[1]) {
      renderCategoria(parts[1], parts[2], parts[3]);
    } else if (parts[0] === 'buscar' && parts[1]) {
      $('#searchInput').value = parts[1];
      $('#searchClear').hidden = false;
      renderBusqueda(parts[1]);
    } else if (parts[0] === 'registro') {
      mostrarVista('registro');
    } else {
      mostrarVista('home');
    }

    /* Al cambiar de vista, subir al inicio. La excepción es cambiar de filtro
       dentro de una categoría, donde quedarse en su lugar es lo cómodo. Llegar
       desde un banner del carrusel sí sube: trae un cuarto tramo con el
       negocio, y la idea es abrir la categoría completa desde arriba. */
    const filtrando = parts[0] === 'c' && parts[2] && !parts[3];
    if (!filtrando) window.scrollTo({ top: 0, behavior: 'instant' });
  }

  /* ------------------------------------------ El número que se deja ver */

  /** Vuelve a esconder los números abiertos, menos el que se pida dejar. Sólo
      uno a la vez: dos pastillas abiertas en la misma lista se leen como si
      uno de los dos números fuera el de la ficha de al lado. */
  function cerrarTelefonos(salvo) {
    $$('.tel__num:not([hidden])').forEach((num) => {
      if (num.parentNode === salvo) return;
      num.hidden = true;
      const ver = $('.tel__ver', num.parentNode);
      if (!ver) return;
      ver.hidden = false;
      ver.setAttribute('aria-expanded', 'false');
    });
  }

  /** Copia al portapapeles. `navigator.clipboard` sólo existe en https, y el
      sitio se prueba muchas veces abriendo el archivo directo, así que queda
      la vieja escuela de respaldo. Devuelve promesa: si falla, no se le dice
      al usuario que copió algo que no copió. */
  function copiar(texto) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(texto);
    }
    return new Promise((listo, falla) => {
      const caja = document.createElement('textarea');
      caja.value = texto;
      caja.setAttribute('readonly', '');
      caja.style.cssText = 'position:fixed;top:-9999px;opacity:0';
      document.body.appendChild(caja);
      caja.select();
      let bien = false;
      try { bien = document.execCommand('copy'); } catch (_) { bien = false; }
      document.body.removeChild(caja);
      bien ? listo() : falla(new Error('sin portapapeles'));
    });
  }

  /** Deja el número seleccionado. Es el plan B de cuando el navegador no
      presta el portapapeles: en vez de que el toque no haga nada —que es
      justamente lo que veníamos a arreglar—, queda marcado y se copia a mano
      con Ctrl+C, o se arrastra al buscador del teléfono. */
  function seleccionar(num) {
    const cifras = $('.tel__cifras', num);
    if (!cifras || !window.getSelection) return;
    const rango = document.createRange();
    rango.selectNodeContents(cifras);
    const seleccion = window.getSelection();
    seleccion.removeAllRanges();
    seleccion.addRange(rango);
  }

  let volverCifras = null;

  /** Cambia el número por un "Copiado" un momento y lo regresa. El número
      original vive en `data-numero`, no en la pantalla, para que dos clics
      seguidos no dejen la pastilla diciendo "Copiado" para siempre. */
  function avisarCopiado(num) {
    const cifras = $('.tel__cifras', num);
    if (!cifras) return;
    clearTimeout(volverCifras);
    cifras.textContent = 'Copiado';
    num.classList.add('is-copiado');
    volverCifras = setTimeout(() => {
      cifras.textContent = num.dataset.numero;
      num.classList.remove('is-copiado');
    }, 1600);
  }

  document.addEventListener('click', (e) => {
    const ver = e.target.closest('.tel__ver');
    if (ver) {
      const caja = ver.parentNode;
      const num  = $('.tel__num', caja);
      cerrarTelefonos(caja);
      clearTimeout(volverCifras);
      $('.tel__cifras', num).textContent = num.dataset.numero;
      num.classList.remove('is-copiado');
      num.hidden = false;
      ver.hidden = true;
      ver.setAttribute('aria-expanded', 'true');
      num.focus();
      return;
    }

    /* Sin `preventDefault`: si el aparato resulta que sí sabe marcar —un
       teléfono mal contado, o una computadora con Teams instalado— que marque.
       Y de cualquier modo el número queda copiado. */
    const num = e.target.closest('.tel__num');
    if (num) {
      copiar(num.dataset.numero).then(
        () => avisarCopiado(num),
        () => seleccionar(num)
      );
      return;
    }

    cerrarTelefonos(null);
  });

  /* Escape cierra el número, como cualquier cosa que se abre. */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') cerrarTelefonos(null);
  });

  /* En las fichas gratuitas sólo un horario abierto a la vez: al abrir uno se
     cierra el anterior. Van apiladas de tres en el lugar de una tarjeta, y con
     dos o tres horarios desplegados la pila crecería más que la tarjeta de al
     lado y la estiraría. Con uno solo, lo desplegado cabe en el espacio que la
     pila ya tenía apartado y nada se mueve de su sitio.

     El evento `toggle` no burbujea, por eso se escucha en captura. */
  document.addEventListener('toggle', (e) => {
    const abierto = e.target;
    if (!abierto.matches || !abierto.matches('.horario--fila[open]')) return;
    $$('.horario--fila[open]').forEach((otro) => {
      if (otro !== abierto) otro.open = false;
    });
  }, true);

  /* ------------------------------------------------------------- Eventos */

  /* Click en tarjeta de categoría */
  document.addEventListener('click', (e) => {
    const cat = e.target.closest('[data-cat]');
    if (cat) { irA('#/c/' + cat.dataset.cat); return; }

    /* Chip de filtro: se aplica sin recargar y sin perder el scroll */
    const chip = e.target.closest('[data-filtro]');
    if (chip && categoriaActual) {
      e.preventDefault();
      const f = chip.dataset.filtro;
      actualizarUrl('#/c/' + categoriaActual.id + (f === 'todos' ? '' : '/' + f));
      renderCategoria(categoriaActual.id, f);
      chip.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
      return;
    }

    const nav = e.target.closest('[data-nav]');
    if (nav && nav.tagName === 'BUTTON') {
      irA(nav.dataset.nav === 'home' ? '#/' : '#/' + nav.dataset.nav);
    }
  });

  /* Buscador */
  const input = $('#searchInput');
  let debounce;

  $('#searchForm').addEventListener('submit', (e) => {
    e.preventDefault();
    input.blur();
    const q = input.value.trim();
    if (q) irA('#/buscar/' + encodeURIComponent(q));
  });

  input.addEventListener('input', () => {
    const q = input.value.trim();
    $('#searchClear').hidden = q.length === 0;
    clearTimeout(debounce);
    debounce = setTimeout(() => {
      if (q.length >= 2) {
        actualizarUrl('#/buscar/' + encodeURIComponent(q));
        renderBusqueda(q);
      } else if (q.length === 0 && !$('#view-search').hidden) {
        irA('#/');
      }
    }, 220);
  });

  $('#searchClear').addEventListener('click', () => {
    input.value = '';
    $('#searchClear').hidden = true;
    input.focus();
    irA('#/');
  });

  /* Altos reales de las dos barras de arriba: el header posiciona la barra de
     filtros pegajosa, y las dos juntas dicen cuánto tapan de la ventana, que es
     lo que descuenta el `scroll-margin-top` de las fichas. Se miden en vez de
     darlas por sentadas porque cambian con el ancho y con el largo del nombre
     de la categoría. */
  const syncHeaderHeight = () => {
    const raiz = document.documentElement;
    raiz.style.setProperty('--header-h', $('#header').offsetHeight + 'px');
    const barra = $('.catbar');
    if (barra) raiz.style.setProperty('--catbar-h', barra.offsetHeight + 'px');
  };
  window.addEventListener('resize', syncHeaderHeight);

  /* ----------------------------------------------------------- Tema claro/oscuro */

  /* El tema guardado ya se aplicó en el <head> para evitar el destello; aquí
     solo se atiende el botón. Sin preferencia guardada mandan los medios del
     sistema, así que el tema actual se lee de los dos lados. */
  const raiz = document.documentElement;
  const prefiereOscuro = window.matchMedia('(prefers-color-scheme: dark)');

  const temaActual = () =>
    raiz.getAttribute('data-theme') || (prefiereOscuro.matches ? 'dark' : 'light');

  $('#themeToggle').addEventListener('click', () => {
    const nuevo = temaActual() === 'dark' ? 'light' : 'dark';
    raiz.setAttribute('data-theme', nuevo);
    try { localStorage.setItem('tema', nuevo); } catch (e) { /* sin persistencia */ }
  });

  /* -------------------------------------------------------------- Arranque */

  window.addEventListener('hashchange', router);
  /* Cada tarjeta de plan abre WhatsApp con su propio mensaje. El nombre y el
     precio vienen del HTML, junto al precio que se muestra, para que al
     cambiar una tarifa no haya que tocar dos archivos. */
  $$('.plan__cta').forEach((btn) => {
    const texto = `Hola, me interesa registrar mi negocio en Guía Los Reyes ` +
                  `con el Plan ${btn.dataset.plan} (${btn.dataset.precio}).`;
    btn.href = `https://wa.me/${WA_DIRECTORIO}?text=${encodeURIComponent(texto)}`;
  });

  renderHome();
  syncHeaderHeight();
  router();
})();
