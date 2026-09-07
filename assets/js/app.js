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

  const esDestacado = (n) => n.plan === 'destacado';

  /** Destacados primero; dentro de cada grupo, por calificación. */
  const ordenar = (lista) => lista.slice().sort((a, b) => {
    if (esDestacado(a) !== esDestacado(b)) return esDestacado(a) ? -1 : 1;
    return (b.rating || 0) - (a.rating || 0);
  });

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
    const dest = esDestacado(neg);
    const [c1, c2] = cat.banner;
    const tags = (neg.tags || []).slice(0, 4)
      .map(t => `<li class="tag">${esc(t)}</li>`).join('');

    return `
      <article class="card ${dest ? 'card--featured' : ''}" style="animation-delay:${Math.min(idx, 8) * 35}ms">

        <div class="card__banner" style="--banner:linear-gradient(135deg, ${c1}, ${c2})">
          <span class="card__initials">${esc(iniciales(neg.nombre))}</span>
          <span class="card__glyph">${icon(cat.icono)}</span>
          <div class="card__badges">
            ${dest
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

    pintarLista($('#featuredList'), TODOS.filter(esDestacado).slice(0, 6));
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
