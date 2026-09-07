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
      <article class="card card--${variante}" style="animation-delay:${Math.min(idx, 8) * 35}ms">

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

  const pintarLista = (el, lista) => {
    el.innerHTML = ordenar(lista).map(tarjetaNegocio).join('');
  };

  /* ----------------------------------------------------- Banner VIP (home) */

  /* Rotación exclusiva de los negocios con plan Premium, arriba de la portada.
     Las diapositivas se apilan en la misma celda de la retícula: así la altura
     la fija la más alta y el cambio no mueve el resto de la página. */
  function diapositivaVip(neg, i) {
    const [c1, c2] = neg.cat.banner;
    /* La fila superior lleva el texto y el recuadro de la foto; la inferior,
       la barra de contacto con los botones que ya usan las tarjetas. Sin
       `foto` el recuadro dibuja las iniciales sobre el glifo de la
       categoría, igual que el banner de las tarjetas. Ojo: dentro de la
       plantilla no caben comillas invertidas, cierran el literal. */
    return `
      <article class="vip__slide ${i === 0 ? 'is-active' : ''}"
               style="--banner:linear-gradient(135deg, ${c1}, ${c2})">
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

  function renderVip() {
    const caja = $('#vipBanner');
    const vips = ordenar(TODOS.filter(esPremium));
    caja.hidden = vips.length === 0;
    if (caja.hidden) return;

    caja.innerHTML =
      `<div class="vip__slides">${vips.map(diapositivaVip).join('')}</div>` +
      `<div class="vip__dots">${vips.map((n, i) =>
        `<button class="vip__dot ${i === 0 ? 'is-active' : ''}" type="button" data-i="${i}"
                 aria-label="Ver ${esc(n.nombre)}"></button>`).join('')}</div>`;

    const slides = $$('.vip__slide', caja);
    const dots   = $$('.vip__dot', caja);
    let actual = 0;

    const mostrar = (i) => {
      actual = (i + slides.length) % slides.length;
      slides.forEach((s, k) => s.classList.toggle('is-active', k === actual));
      dots.forEach((d, k) => d.classList.toggle('is-active', k === actual));
    };

    dots.forEach((d) => d.addEventListener('click', () => {
      mostrar(Number(d.dataset.i));
      reiniciar();   /* el toque manual reinicia la cuenta */
    }));

    /* Con animaciones reducidas no se rota sola: el usuario cambia con los
       puntos. Tampoco corre mientras el puntero o el foco están dentro. */
    const quieto = window.matchMedia('(prefers-reduced-motion: reduce)');
    let reloj = null;
    const parar     = () => { clearInterval(reloj); reloj = null; };
    const reiniciar = () => {
      parar();
      if (!quieto.matches && slides.length > 1) reloj = setInterval(() => mostrar(actual + 1), 6000);
    };

    ['mouseenter', 'focusin'].forEach(e => caja.addEventListener(e, parar));
    ['mouseleave', 'focusout'].forEach(e => caja.addEventListener(e, reiniciar));
    reiniciar();
  }

  /* ------------------------------------------- Carrusel de destacados (home) */

  /* Cuántos negocios del plan Destacado entran al carrusel en cada carga. */
  const DEST_MAX = 10;

  /* Tarjeta mediana del carrusel: más chica que el banner Premium, pero con
     presencia propia. Sin `foto` se dibujan las iniciales sobre el glifo de la
     categoría, igual que en las tarjetas del listado. Ojo: dentro de la
     plantilla no caben comillas invertidas, cierran el literal. */
  function tarjetaDestacada(neg) {
    const [c1, c2] = neg.cat.banner;
    return `
      <article class="dest__card">
        <div class="dest__foto" style="--banner:linear-gradient(135deg, ${c1}, ${c2})">
          ${neg.foto
            ? `<img src="${esc(neg.foto)}" alt="" loading="lazy">`
            : `<span class="dest__ini">${esc(iniciales(neg.nombre))}</span>` +
              `<span class="dest__glifo">${icon(neg.cat.icono)}</span>`}
          <span class="badge badge--featured">${icon(ICONS.star)} Destacado</span>
        </div>
        <div class="dest__cuerpo">
          <h3 class="dest__nombre">${esc(neg.nombre)}</h3>
          <p class="dest__cat">${icon(neg.cat.icono)} ${esc(neg.cat.nombre)}</p>
          <div class="dest__acciones">${botonesContacto(neg)}</div>
        </div>
      </article>`;
  }

  function renderDestacados() {
    const caja  = $('#destBanner');
    const lista = alAzar(TODOS.filter(esDestacado), DEST_MAX);
    caja.hidden = lista.length === 0;
    if (caja.hidden) return;

    const pista = $('#destPista');
    pista.innerHTML = lista.map(tarjetaDestacada).join('');

    /* Un paso es el ancho de una tarjeta más la separación. Se mide en vivo
       porque el ancho de la tarjeta cambia con el de la ventana. */
    const paso = () => {
      const card = pista.firstElementChild;
      if (!card) return 0;
      return card.getBoundingClientRect().width +
             (parseFloat(getComputedStyle(pista).columnGap) || 0);
    };

    /* `scrollWidth - clientWidth` es el tope del recorrido; el margen de 4px
       absorbe los redondeos del navegador para que el final sí se detecte. */
    const desborda = () => pista.scrollWidth > pista.clientWidth + 4;
    const avanzar  = () => {
      if (!desborda()) return;
      if (pista.scrollLeft >= pista.scrollWidth - pista.clientWidth - 4) {
        pista.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        pista.scrollBy({ left: paso(), behavior: 'smooth' });
      }
    };

    /* Igual que el banner VIP: no se mueve solo con animaciones reducidas ni
       mientras el puntero o el foco están dentro. El arrastre y la rueda
       siguen funcionando siempre, se mueva solo o no. */
    const quieto = window.matchMedia('(prefers-reduced-motion: reduce)');
    let reloj = null;
    const parar     = () => { clearInterval(reloj); reloj = null; };
    const reiniciar = () => {
      parar();
      if (!quieto.matches) reloj = setInterval(avanzar, 3500);
    };

    ['mouseenter', 'focusin', 'pointerdown'].forEach(e => caja.addEventListener(e, parar));
    ['mouseleave', 'focusout'].forEach(e => caja.addEventListener(e, reiniciar));
    /* Tras soltar el arrastre se espera un poco: si no, el temporizador pelea
       con el desplazamiento por inercia del propio dedo. */
    caja.addEventListener('pointerup', () => setTimeout(reiniciar, 1500));
    reiniciar();
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

  function renderCategoria(catId, filtroId) {
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
    pintarLista($('#businessList'), conCat);

    $('#resultCount').textContent = filtro === 'todos'
      ? 'Todos los negocios de la categoría'
      : `Mostrando: ${chips.find(f => f.id === filtro).label}`;

    $('#emptyState').hidden = lista.length > 0;

    mostrarVista('category');
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
      renderCategoria(parts[1], parts[2]);
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
