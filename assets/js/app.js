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

  /* Enlace de "cómo llegar" en Google Maps. Usa `mapa` (dirección exacta o
     coordenadas) y, si el negocio no la tiene, la zona más la ciudad. */
  const mapaLink = (neg) =>
    'https://www.google.com/maps/dir/?api=1&destination=' +
    encodeURIComponent(neg.mapa || `${neg.zona}, ${CIUDAD}`);

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

  /** Fila de botones circulares: WhatsApp, teléfono y los enlaces que existan. */
  function botonesContacto(neg) {
    const botones = [
      `<a class="act act--wa" href="${waLink(neg.tel, neg.nombre)}" target="_blank" rel="noopener"
          title="WhatsApp" aria-label="Escribir por WhatsApp a ${esc(neg.nombre)}">${icon(ICONS.whatsapp)}</a>`,
      `<a class="act act--tel" href="tel:+${esc(neg.tel)}"
          title="Llamar" aria-label="Llamar a ${esc(neg.nombre)}">${logo(LOGOS.telefono)}</a>`
    ];

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

  /* Índice plano de negocios, con su categoría asociada */
  const TODOS = CATEGORIAS.flatMap(cat =>
    cat.negocios.map(n => Object.assign({}, n, { cat: cat }))
  );

  /* Jerarquía de planes. El número es la posición en el listado: cuanto más
     chico, más arriba. Un plan desconocido cae al fondo, con los básicos. */
  const RANGO = { premium: 0, destacado: 1, basico: 2 };
  const rango = (n) => (n.plan in RANGO) ? RANGO[n.plan] : RANGO.basico;

  const esPremium   = (n) => n.plan === 'premium';
  const esDestacado = (n) => n.plan === 'destacado';

  /** Por plan y, dentro de cada plan, por calificación. */
  const ordenar = (lista) => lista.slice().sort((a, b) => {
    if (rango(a) !== rango(b)) return rango(a) - rango(b);
    return (b.rating || 0) - (a.rating || 0);
  });


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

  function tarjetaNegocio(neg, idx) {
    const cat  = neg.cat;
    const vip  = esPremium(neg);
    const dest = esDestacado(neg);
    /* El anillo de la tarjeta y el badge del plan comparten variante. */
    const variante = vip ? 'vip' : (dest ? 'featured' : 'basic');
    const [c1, c2] = cat.banner;
    const tags = (neg.tags || []).slice(0, 4)
      .map(t => `<li class="tag">${esc(t)}</li>`).join('');

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
              : `<span class="badge badge--basic">Básico</span>`}
            <span class="badge ${neg.abierto ? 'badge--open' : 'badge--closed'}">
              ${neg.abierto ? 'Abierto ahora' : 'Cerrado'}
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

          <p class="card__line">${icon(ICONS.clock)} ${esc(neg.horario)}</p>

          <div class="card__actions">${botonesContacto(neg)}</div>
        </div>
      </article>`;
  }

  /* `primero` es la seña de un negocio que debe encabezar la lista pase lo que
     pase: es el que el usuario acaba de tocar en el carrusel de destacados, y
     lo trae aquí para verlo, no para buscarlo. El resto conserva su orden. */
  const pintarLista = (el, lista, primero) => {
    let orden = ordenar(lista);
    if (primero) {
      const i = orden.findIndex(n => seña(n) === primero);
      if (i > 0) orden = [orden[i]].concat(orden.slice(0, i), orden.slice(i + 1));
    }
    el.innerHTML = orden.map(tarjetaNegocio).join('');
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
       plantilla no caben comillas invertidas, cierran el literal. */
    return `
      <article class="vip__slide" style="--banner:linear-gradient(135deg, ${c1}, ${c2})">
        <div class="vip__cuerpo">
          <div class="vip__texto">
            <span class="badge badge--vip">${icon(ICONS.corona)} Premium</span>
            <h3 class="vip__nombre">${esc(neg.nombre)}</h3>
            <p class="vip__desc">${esc(neg.desc)}</p>
            <p class="vip__meta">${icon(ICONS.pin)} ${esc(neg.zona)}
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

  /* Cuántos Premium van en cada página. Dos en escritorio, uno encima del
     otro: apiladas, las tarjetas se ven anchas —a lo largo, no a lo alto— y el
     plan enseña el doble de negocios sin encoger ninguno. En el teléfono, uno.
     El recorrido entre páginas sigue siendo horizontal. */
  const vipPorPagina = () => (window.innerWidth >= 768 ? 2 : 1);

  function renderVip() {
    const caja = $('#vipBanner');
    const vips = ordenar(TODOS.filter(esPremium));
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

    let porPagina = 0, paso = 0, paginas = 0, pagina = 0;

    /* Cada página es una columna del ancho de la ventana con sus negocios
       apilados. La pista lleva las columnas en fila, así que el recorrido
       sigue siendo horizontal aunque las tarjetas se acomoden a lo alto. */
    const construir = () => {
      const grupos = [];
      for (let i = 0; i < vips.length; i += porPagina) grupos.push(vips.slice(i, i + porPagina));
      paginas = grupos.length;

      pista.innerHTML = grupos.map((g) =>
        `<div class="vip__grupo">${g.map(diapositivaVip).join('')}</div>`).join('');

      cajaDots.innerHTML = Array.from({ length: paginas }, (_, i) =>
        `<button class="vip__dot" type="button" data-i="${i}"
                 aria-label="Ver el grupo ${i + 1} de ${paginas}"></button>`).join('');
      $$('.vip__dot', cajaDots).forEach((d) => d.addEventListener('click', () => {
        ir(Number(d.dataset.i));
        reiniciar();   /* el toque manual reinicia la cuenta */
      }));
    };

    const ir = (p, seco) => {
      pagina = (p + paginas) % paginas;

      if (seco) pista.style.transition = 'none';
      pista.style.transform = `translate3d(${-pagina * paso}px, 0, 0)`;
      if (seco) { void pista.offsetWidth; pista.style.transition = ''; }

      /* Las páginas que quedaron fuera de la ventana salen del tabulador y del
         lector de pantalla: están recortadas, no ocultas, y sin esto se podría
         llegar con el tabulador a un negocio que no se ve. */
      $$('.vip__grupo', pista).forEach((g, i) => {
        const dentro = i === pagina;
        g.setAttribute('aria-hidden', dentro ? 'false' : 'true');
        $$('a', g).forEach((a) => { a.tabIndex = dentro ? 0 : -1; });
      });
      $$('.vip__dot', cajaDots).forEach((d, i) => d.classList.toggle('is-active', i === pagina));
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
      if (!quieto.matches && paginas > 1) reloj = setInterval(() => ir(pagina + 1), VIP_MS);
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
    const lista = alAzar(TODOS.filter(esDestacado), DEST_MAX);
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

    /* Arrastre con el dedo o con el ratón. `setPointerCapture` sigue recibiendo
       los eventos aunque el puntero se salga de la pista a media jalada. */
    pista.addEventListener('pointerdown', (e) => {
      if (e.button > 0) return;
      parar();
      tiron  = null;
      jalado = false;
      agarre = { x: e.clientX, pos, ux: e.clientX, t: e.timeStamp, vel: 0, movido: false };
      pista.classList.add('is-agarrada');
      andar();
      /* Al final y protegida: si el navegador ya dio por terminado ese puntero
         la captura truena, y no vale la pena perder el arrastre por eso. */
      try { pista.setPointerCapture(e.pointerId); } catch (_) { /* sin captura */ }
    });

    pista.addEventListener('pointermove', (e) => {
      if (!agarre) return;
      const dx = e.clientX - agarre.x;
      /* Menos de seis píxeles todavía puede ser el pulso de un clic y no un
         arrastre; sin ese margen, tocar un botón movería el carrusel. */
      if (!agarre.movido && Math.abs(dx) < 6) return;
      agarre.movido = true;

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
      const { movido, vel } = agarre;
      agarre = null;
      pista.classList.remove('is-agarrada');
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
    ['pointerup', 'pointercancel'].forEach((e) => pista.addEventListener(e, soltar));

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

    /* Lista de negocios */
    const lista = filtro === 'todos'
      ? cat.negocios
      : cat.negocios.filter(n => n.filtro === filtro);

    const conCat = lista.map(n => Object.assign({}, n, { cat: cat }));
    pintarLista($('#businessList'), conCat, negocio);

    $('#resultCount').textContent = filtro === 'todos'
      ? 'Todos los negocios de la categoría'
      : `Mostrando: ${chips.find(f => f.id === filtro).label}`;

    $('#emptyState').hidden = lista.length > 0;

    mostrarVista('category');

    /* Si se llegó tocando un banner del carrusel, se baja hasta su ficha y se
       le deja un anillo para que el usuario reconozca cuál venía a ver. La
       cuenta descuenta el encabezado y la barra de la categoría, que van
       pegados arriba y taparían la tarjeta. */
    if (negocio) resaltar(negocio);
  }

  function resaltar(negocio) {
    const tarjeta = $(`.card[data-neg="${negocio}"]`, $('#businessList'));
    if (!tarjeta) return;
    tarjeta.classList.add('is-resaltada');

    /* Al cuadro siguiente: la vista acaba de dejar de estar oculta y hasta que
       el navegador no rehace la maqueta, la posición de la tarjeta es la de
       antes. */
    requestAnimationFrame(() => {
      const pegado = $('.header').offsetHeight + $('.catbar').offsetHeight;
      window.scrollTo({
        top: Math.max(0, tarjeta.getBoundingClientRect().top + window.scrollY - pegado - 12),
        behavior: 'instant'
      });
    });
  }

  /* ------------------------------------------------------ Vista: búsqueda */

  function renderBusqueda(q) {
    const term = norm(q.trim());
    $('#searchTerm').textContent = q;

    const res = term.length < 2 ? [] : TODOS.filter(n => {
      const heno = norm([
        n.nombre, n.desc, n.zona, (n.tags || []).join(' '),
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

    /* Al cambiar de vista, subir al inicio (salvo al filtrar dentro de una categoría) */
    if (!(parts[0] === 'c' && parts[2])) window.scrollTo({ top: 0, behavior: 'instant' });
  }

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

  /* Alto real del header para posicionar la barra de filtros pegajosa */
  const syncHeaderHeight = () => {
    document.documentElement.style.setProperty(
      '--header-h', $('#header').offsetHeight + 'px'
    );
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
