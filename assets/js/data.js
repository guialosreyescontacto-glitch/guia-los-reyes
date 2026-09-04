/* ==========================================================================
   Guía Los Reyes — Datos del directorio
   --------------------------------------------------------------------------
   DEMO: los negocios y teléfonos son datos de ejemplo, no son reales.
   Para conectar datos reales, sustituye CATEGORIAS por la respuesta de tu
   API/CMS respetando la misma forma de objeto.
   ========================================================================== */

/* --- Iconos (trazos estilo Lucide, 24x24) ------------------------------- */
const ICONS = {
  salud:      '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/><path d="M3.5 12.5h4L9 10l2.5 5.5L14 8l1.5 4.5h5"/>',
  mecanica:   '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
  gym:        '<path d="m6.5 6.5 11 11"/><path d="m21 21-1-1"/><path d="m3 3 1 1"/><path d="m18 22 4-4"/><path d="m2 6 4-4"/><path d="m3 10 7-7"/><path d="m14 21 7-7"/>',
  comida:     '<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>',
  belleza:    '<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M20 4 8.12 15.88"/><path d="M14.47 14.48 20 20"/><path d="M8.12 8.12 12 12"/>',
  hogar:      '<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .71-1.53l7-6a2 2 0 0 1 2.58 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  profesional:'<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>',
  mascotas:   '<circle cx="11" cy="4" r="2"/><circle cx="18" cy="8" r="2"/><circle cx="20" cy="16" r="2"/><path d="M9 10a5 5 0 0 1 5 5v3.5a3.5 3.5 0 0 1-6.84 1.05Q6.52 17.48 4.46 16.84A3.5 3.5 0 0 1 5.5 10Z"/>',
  eventos:    '<path d="M5.8 11.3 2 22l10.7-3.79"/><path d="M4 3h.01"/><path d="M22 8h.01"/><path d="M15 2h.01"/><path d="M22 20h.01"/><path d="m22 2-2.24.75a2.9 2.9 0 0 0-1.96 3.12c.1.86-.57 1.63-1.45 1.63h-.38c-.86 0-1.6.6-1.76 1.44L14 10"/><path d="m22 13-.82-.33c-.86-.34-1.82.2-1.98 1.11-.11.7-.72 1.22-1.43 1.22H15.5"/>',
  cursos:     '<path d="M21.42 10.92a1 1 0 0 0-.02-1.84L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.83l8.57 3.91a2 2 0 0 0 1.66 0z"/><path d="M22 10v6"/><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"/>',
  inmuebles:  '<path d="M3 21h18"/><path d="M5 21V7l8-4v18"/><path d="M19 21V11l-6-4"/><path d="M9 9h.01"/><path d="M9 13h.01"/><path d="M9 17h.01"/>',
  tiendas:    '<path d="m2 7 4.4-4.4A2 2 0 0 1 7.8 2h8.4a2 2 0 0 1 1.4.6L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/><path d="M22 7v3a2 2 0 0 1-4 0 2 2 0 0 1-4 0 2 2 0 0 1-4 0 2 2 0 0 1-4 0 2 2 0 0 1-4 0V7"/>',

  /* Utilitarios */
  star:       '<path d="m12 2 2.9 6.3 6.6.8-4.9 4.6 1.3 6.6L12 17l-5.9 3.3 1.3-6.6L2.5 9.1l6.6-.8z"/>',
  pin:        '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
  clock:      '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  phone:      '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.4-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/>',
  check:      '<path d="M20 6 9 17l-5-5"/>'
};

/* --- Mensaje de WhatsApp por defecto ------------------------------------ */
const WA_TEMPLATE = (negocio) =>
  `Hola ${negocio}, los encontré en Guía Los Reyes y quiero pedir informes.`;

/* Número de contacto del directorio (para altas de negocios) */
const WA_DIRECTORIO = '523541000000';

/* --- Catálogo ------------------------------------------------------------
   categoria: { id, nombre, color, soft, icono, banner, filtros[], negocios[] }
   negocio:   { nombre, plan: 'destacado'|'basico', filtro, tags[], desc,
                zona, horario, abierto, rating, tel }
   ------------------------------------------------------------------------ */
const CATEGORIAS = [
  {
    id: 'salud',
    nombre: 'Salud y Clínicas',
    color: '#dc2626', soft: '#fee6e6', icono: ICONS.salud,
    banner: ['#ef4444', '#b91c1c'],
    filtros: [
      { id: 'medicos', label: 'Médicos generales' },
      { id: 'dental', label: 'Dentistas' },
      { id: 'lab', label: 'Laboratorios' },
      { id: 'optica', label: 'Ópticas' },
      { id: 'especialistas', label: 'Especialistas' }
    ],
    negocios: [
      { nombre: 'Clínica Santa Cecilia', plan: 'destacado', filtro: 'especialistas', rating: 4.8,
        tags: ['Urgencias 24h', 'Ginecología', 'Pediatría'], zona: 'Centro',
        horario: 'Abierto 24 horas', abierto: true, tel: '523541000101',
        desc: 'Consulta general y especialidades con hospitalización y urgencias las 24 horas.' },
      { nombre: 'Dental Sonrisa Los Reyes', plan: 'destacado', filtro: 'dental', rating: 4.9,
        tags: ['Ortodoncia', 'Blanqueamiento', 'Pago en parcialidades'], zona: 'Av. Morelos',
        horario: 'Lun a Sáb · 9:00 – 20:00', abierto: true, tel: '523541000102',
        desc: 'Odontología general, ortodoncia y estética dental. Primera valoración sin costo.' },
      { nombre: 'Laboratorio Clínico del Valle', plan: 'basico', filtro: 'lab', rating: 4.6,
        tags: ['Análisis clínicos', 'Resultados en línea'], zona: 'Col. Ferrocarril',
        horario: 'Lun a Sáb · 7:00 – 14:00', abierto: false, tel: '523541000103',
        desc: 'Química sanguínea, biometría y perfiles completos. Entrega el mismo día.' },
      { nombre: 'Consultorio Dr. Ramírez', plan: 'basico', filtro: 'medicos', rating: 4.5,
        tags: ['Medicina general', 'A domicilio'], zona: 'Barrio de San Sebastián',
        horario: 'Lun a Vie · 10:00 – 19:00', abierto: true, tel: '523541000104',
        desc: 'Medicina general para toda la familia, con visitas a domicilio por la tarde.' },
      { nombre: 'Óptica Visión Clara', plan: 'basico', filtro: 'optica', rating: 4.7,
        tags: ['Examen de la vista gratis', 'Armazones'], zona: 'Portal Hidalgo',
        horario: 'Lun a Sáb · 10:00 – 20:00', abierto: true, tel: '523541000105',
        desc: 'Lentes graduados, de contacto y examen de la vista computarizado sin costo.' },
      { nombre: 'Fisioterapia Movimiento', plan: 'basico', filtro: 'especialistas', rating: 4.8,
        tags: ['Rehabilitación', 'Terapia deportiva'], zona: 'Col. Emiliano Zapata',
        horario: 'Lun a Vie · 8:00 – 20:00', abierto: true, tel: '523541000106',
        desc: 'Rehabilitación física, lesiones deportivas y terapia post operatoria.' }
    ]
  },

  {
    id: 'mecanicos',
    nombre: 'Mecánicos y Talleres',
    color: '#4f46e5', soft: '#e8e7fd', icono: ICONS.mecanica,
    banner: ['#6366f1', '#4338ca'],
    filtros: [
      { id: 'general', label: 'Mecánica general' },
      { id: 'hojalateria', label: 'Hojalatería y pintura' },
      { id: 'llantas', label: 'Llanteras' },
      { id: 'electrico', label: 'Eléctrico automotriz' },
      { id: 'grua', label: 'Grúas' }
    ],
    negocios: [
      { nombre: 'Taller Mecánico El Aguacate', plan: 'destacado', filtro: 'general', rating: 4.9,
        tags: ['Afinación', 'Suspensión', 'Diagnóstico por escáner'], zona: 'Salida a Tingüindín',
        horario: 'Lun a Sáb · 8:00 – 19:00', abierto: true, tel: '523541000201',
        desc: 'Servicio completo para auto y camioneta. Diagnóstico computarizado sin costo.' },
      { nombre: 'Grúas Los Reyes 24/7', plan: 'destacado', filtro: 'grua', rating: 4.7,
        tags: ['Servicio 24h', 'Carretera', 'Arrastre'], zona: 'Cobertura regional',
        horario: 'Disponible 24 horas', abierto: true, tel: '523541000202',
        desc: 'Auxilio vial y arrastre a cualquier hora, dentro y fuera de la ciudad.' },
      { nombre: 'Llantera El Rayo', plan: 'basico', filtro: 'llantas', rating: 4.6,
        tags: ['Montaje', 'Balanceo', 'Parches'], zona: 'Carretera a Jacona',
        horario: 'Lun a Dom · 8:00 – 21:00', abierto: true, tel: '523541000203',
        desc: 'Llantas nuevas y seminuevas, alineación y balanceo computarizado.' },
      { nombre: 'Hojalatería y Pintura Michoacán', plan: 'basico', filtro: 'hojalateria', rating: 4.4,
        tags: ['Pintura horno', 'Pulido'], zona: 'Col. Ferrocarril',
        horario: 'Lun a Vie · 9:00 – 18:00', abierto: false, tel: '523541000204',
        desc: 'Reparación de golpes, pintura de horno y trabajos con aseguradora.' },
      { nombre: 'Auto Eléctrico Chávez', plan: 'basico', filtro: 'electrico', rating: 4.5,
        tags: ['Alternadores', 'Marchas', 'Instalaciones'], zona: 'Col. Zaragoza',
        horario: 'Lun a Sáb · 9:00 – 19:00', abierto: true, tel: '523541000205',
        desc: 'Sistema eléctrico automotriz, alternadores, marchas e instalación de estéreos.' },
      { nombre: 'Servicio Diésel El Trailero', plan: 'basico', filtro: 'general', rating: 4.3,
        tags: ['Diésel', 'Camiones', 'Maquinaria'], zona: 'Libramiento Sur',
        horario: 'Lun a Sáb · 8:00 – 18:00', abierto: true, tel: '523541000206',
        desc: 'Especialistas en motores diésel, camionetas de carga y maquinaria agrícola.' }
    ]
  },

  {
    id: 'gimnasios',
    nombre: 'Gimnasios y Deportes',
    color: '#ea580c', soft: '#feeade', icono: ICONS.gym,
    banner: ['#f97316', '#c2410c'],
    filtros: [
      { id: 'gym', label: 'Gimnasios' },
      { id: 'crossfit', label: 'CrossFit y funcional' },
      { id: 'artes', label: 'Artes marciales' },
      { id: 'canchas', label: 'Canchas' },
      { id: 'yoga', label: 'Yoga y baile' }
    ],
    negocios: [
      { nombre: 'Iron Fit Gym', plan: 'destacado', filtro: 'gym', rating: 4.8,
        tags: ['Pesas', 'Cardio', 'Rutinas personalizadas'], zona: 'Av. Juárez',
        horario: 'Lun a Sáb · 5:30 – 22:00', abierto: true, tel: '523541000301',
        desc: 'Equipo nuevo, área de pesas y cardio con entrenadores certificados.' },
      { nombre: 'Box Fit Los Reyes', plan: 'destacado', filtro: 'artes', rating: 4.7,
        tags: ['Boxeo', 'Kickboxing', 'Clase de prueba gratis'], zona: 'Col. Morelos',
        horario: 'Lun a Vie · 6:00 – 21:00', abierto: true, tel: '523541000302',
        desc: 'Boxeo para principiantes y competencia, con horarios de mañana y tarde.' },
      { nombre: 'Cancha Los Aguacates', plan: 'basico', filtro: 'canchas', rating: 4.5,
        tags: ['Fútbol 7', 'Pasto sintético', 'Renta por hora'], zona: 'Salida a Peribán',
        horario: 'Lun a Dom · 16:00 – 23:00', abierto: true, tel: '523541000303',
        desc: 'Dos canchas de pasto sintético con iluminación. Reserva tu hora por WhatsApp.' },
      { nombre: 'Estudio Zen Yoga', plan: 'basico', filtro: 'yoga', rating: 4.9,
        tags: ['Hatha yoga', 'Grupos pequeños'], zona: 'Centro',
        horario: 'Lun a Sáb · 7:00 – 20:00', abierto: true, tel: '523541000304',
        desc: 'Clases de yoga y meditación en grupos reducidos para todos los niveles.' },
      { nombre: 'Funcional Box 360', plan: 'basico', filtro: 'crossfit', rating: 4.6,
        tags: ['Entrenamiento funcional', 'Retos mensuales'], zona: 'Fracc. Los Laureles',
        horario: 'Lun a Vie · 6:00 – 21:00', abierto: true, tel: '523541000305',
        desc: 'Entrenamiento funcional por grupos y planes de acondicionamiento.' }
    ]
  },

  {
    id: 'comida',
    nombre: 'Comida y Restaurantes',
    color: '#e11d48', soft: '#ffe4ea', icono: ICONS.comida,
    banner: ['#f43f5e', '#be123c'],
    filtros: [
      { id: 'mexicana', label: 'Comida mexicana' },
      { id: 'tacos', label: 'Tacos y antojitos' },
      { id: 'mariscos', label: 'Mariscos' },
      { id: 'pizza', label: 'Pizzas y hamburguesas' },
      { id: 'cafe', label: 'Cafés y postres' }
    ],
    negocios: [
      { nombre: 'Birriería Doña Chuy', plan: 'destacado', filtro: 'mexicana', rating: 4.9,
        tags: ['Birria de res', 'Desayunos', 'Para llevar'], zona: 'Mercado Municipal',
        horario: 'Mar a Dom · 7:00 – 14:00', abierto: true, tel: '523541000401',
        desc: 'Birria de res al estilo tradicional, consomé y tortillas hechas a mano.' },
      { nombre: 'Mariscos El Muelle', plan: 'destacado', filtro: 'mariscos', rating: 4.7,
        tags: ['Cocteles', 'Pescado zarandeado', 'Servicio a domicilio'], zona: 'Av. Madero',
        horario: 'Mar a Dom · 12:00 – 19:00', abierto: true, tel: '523541000402',
        desc: 'Mariscos frescos, aguachiles y cocteles. Pedidos a domicilio en toda la ciudad.' },
      { nombre: 'Tacos El Güero', plan: 'basico', filtro: 'tacos', rating: 4.8,
        tags: ['Al pastor', 'Servicio nocturno'], zona: 'Jardín Principal',
        horario: 'Todos los días · 19:00 – 2:00', abierto: false, tel: '523541000403',
        desc: 'Tacos al pastor, suadero y campechanos desde 1998, junto al jardín.' },
      { nombre: 'Pizzería La Leña', plan: 'basico', filtro: 'pizza', rating: 4.5,
        tags: ['Horno de leña', 'Entrega a domicilio'], zona: 'Col. Vista Hermosa',
        horario: 'Mié a Dom · 17:00 – 23:00', abierto: true, tel: '523541000404',
        desc: 'Pizzas artesanales en horno de leña, pastas y alitas. Entrega en 30 min.' },
      { nombre: 'Café de Altura Michoacán', plan: 'basico', filtro: 'cafe', rating: 4.9,
        tags: ['Café de la región', 'Repostería', 'Wi-Fi'], zona: 'Portal Morelos',
        horario: 'Lun a Sáb · 8:00 – 22:00', abierto: true, tel: '523541000405',
        desc: 'Café de productores de la sierra, postres caseros y espacio para trabajar.' },
      { nombre: 'Cenaduría La Esquina', plan: 'basico', filtro: 'mexicana', rating: 4.6,
        tags: ['Pozole', 'Enchiladas', 'Cenas'], zona: 'Col. Zaragoza',
        horario: 'Jue a Dom · 18:00 – 23:30', abierto: true, tel: '523541000406',
        desc: 'Pozole, enchiladas y tostadas para cenar en familia o llevar a casa.' }
    ]
  },

  {
    id: 'belleza',
    nombre: 'Belleza y Cuidado Personal',
    color: '#c026d3', soft: '#fbe6fd', icono: ICONS.belleza,
    banner: ['#d946ef', '#a21caf'],
    filtros: [
      { id: 'estetica', label: 'Estéticas' },
      { id: 'barberia', label: 'Barberías' },
      { id: 'unas', label: 'Uñas' },
      { id: 'spa', label: 'Spa y masajes' },
      { id: 'maquillaje', label: 'Maquillaje' }
    ],
    negocios: [
      { nombre: 'Estética Glamour', plan: 'destacado', filtro: 'estetica', rating: 4.8,
        tags: ['Corte y color', 'Keratina', 'Peinados de novia'], zona: 'Centro',
        horario: 'Mar a Dom · 10:00 – 20:00', abierto: true, tel: '523541000501',
        desc: 'Corte, color, tratamientos capilares y peinados para eventos con cita previa.' },
      { nombre: 'Barbería El Clásico', plan: 'destacado', filtro: 'barberia', rating: 4.9,
        tags: ['Corte clásico', 'Afeitado navaja', 'Sin cita'], zona: 'Av. Hidalgo',
        horario: 'Lun a Sáb · 10:00 – 21:00', abierto: true, tel: '523541000502',
        desc: 'Barbería tradicional: fades, arreglo de barba y afeitado con toalla caliente.' },
      { nombre: 'Nails Studio Ale', plan: 'basico', filtro: 'unas', rating: 4.7,
        tags: ['Acrílicas', 'Gelish', 'Diseños'], zona: 'Col. Emiliano Zapata',
        horario: 'Lun a Sáb · 11:00 – 20:00', abierto: true, tel: '523541000503',
        desc: 'Uñas acrílicas, gelish y diseños personalizados con productos de marca.' },
      { nombre: 'Spa Renacer', plan: 'basico', filtro: 'spa', rating: 4.8,
        tags: ['Masaje relajante', 'Faciales'], zona: 'Fracc. Los Laureles',
        horario: 'Lun a Sáb · 10:00 – 19:00', abierto: false, tel: '523541000504',
        desc: 'Masajes relajantes y descontracturantes, faciales y depilación.' },
      { nombre: 'Makeup by Karla', plan: 'basico', filtro: 'maquillaje', rating: 4.9,
        tags: ['Novias', 'XV años', 'A domicilio'], zona: 'Servicio a domicilio',
        horario: 'Con cita previa', abierto: true, tel: '523541000505',
        desc: 'Maquillaje profesional para novias, XV años y sesiones fotográficas.' }
    ]
  },

  {
    id: 'hogar',
    nombre: 'Hogar y Reparaciones',
    color: '#0284c7', soft: '#e0f0fb', icono: ICONS.hogar,
    banner: ['#0ea5e9', '#0369a1'],
    filtros: [
      { id: 'cerrajeros', label: 'Cerrajeros' },
      { id: 'fontaneros', label: 'Fontaneros' },
      { id: 'electricistas', label: 'Electricistas' },
      { id: 'carpinteros', label: 'Carpinteros' },
      { id: 'albaniles', label: 'Albañiles' },
      { id: 'limpieza', label: 'Limpieza' }
    ],
    negocios: [
      { nombre: 'Cerrajería Rápida Los Reyes', plan: 'destacado', filtro: 'cerrajeros', rating: 4.9,
        tags: ['Emergencias 24h', 'Apertura de autos', 'Copias de llaves'], zona: 'Toda la ciudad',
        horario: 'Disponible 24 horas', abierto: true, tel: '523541000601',
        desc: 'Apertura de casas y autos, cambio de chapas y duplicado de llaves al momento.' },
      { nombre: 'Plomería Hermanos Ruiz', plan: 'destacado', filtro: 'fontaneros', rating: 4.7,
        tags: ['Fugas', 'Destape de drenaje', 'Boiler'], zona: 'Centro y colonias',
        horario: 'Lun a Dom · 7:00 – 21:00', abierto: true, tel: '523541000602',
        desc: 'Detección de fugas, destape de drenajes e instalación de boilers y tinacos.' },
      { nombre: 'Electricista Juan Pablo', plan: 'basico', filtro: 'electricistas', rating: 4.8,
        tags: ['Instalaciones', 'Cortos', 'Presupuesto gratis'], zona: 'Col. Ferrocarril',
        horario: 'Lun a Sáb · 8:00 – 20:00', abierto: true, tel: '523541000603',
        desc: 'Instalaciones eléctricas residenciales, reparación de cortos y centros de carga.' },
      { nombre: 'Carpintería La Madera Fina', plan: 'basico', filtro: 'carpinteros', rating: 4.6,
        tags: ['Cocinas integrales', 'Closets', 'A medida'], zona: 'Col. Morelos',
        horario: 'Lun a Vie · 9:00 – 18:00', abierto: false, tel: '523541000604',
        desc: 'Muebles a medida, cocinas integrales y closets en madera de pino y encino.' },
      { nombre: 'Construcciones Tarasco', plan: 'basico', filtro: 'albaniles', rating: 4.5,
        tags: ['Obra nueva', 'Remodelación', 'Impermeabilización'], zona: 'Los Reyes y región',
        horario: 'Lun a Sáb · 7:00 – 18:00', abierto: true, tel: '523541000605',
        desc: 'Albañilería general, ampliaciones, pisos y remodelación de baños y cocinas.' },
      { nombre: 'Limpieza Brillo Total', plan: 'basico', filtro: 'limpieza', rating: 4.7,
        tags: ['Casas', 'Oficinas', 'Lavado de muebles'], zona: 'Servicio a domicilio',
        horario: 'Lun a Sáb · 8:00 – 18:00', abierto: true, tel: '523541000606',
        desc: 'Limpieza profunda de casas y oficinas, lavado de salas, colchones y alfombras.' }
    ]
  },

  {
    id: 'profesionales',
    nombre: 'Servicios Profesionales',
    color: '#0f766e', soft: '#e0f0ee', icono: ICONS.profesional,
    banner: ['#14b8a6', '#0f766e'],
    filtros: [
      { id: 'abogados', label: 'Abogados' },
      { id: 'contadores', label: 'Contadores' },
      { id: 'notaria', label: 'Trámites y gestoría' },
      { id: 'tecnologia', label: 'Cómputo y tecnología' },
      { id: 'seguros', label: 'Seguros' }
    ],
    negocios: [
      { nombre: 'Despacho Contable Aguilar', plan: 'destacado', filtro: 'contadores', rating: 4.8,
        tags: ['Declaraciones SAT', 'Nóminas', 'Facturación'], zona: 'Centro',
        horario: 'Lun a Vie · 9:00 – 18:00', abierto: true, tel: '523541000701',
        desc: 'Contabilidad para personas físicas y morales, declaraciones y trámites ante el SAT.' },
      { nombre: 'Bufete Jurídico Los Reyes', plan: 'destacado', filtro: 'abogados', rating: 4.6,
        tags: ['Familiar', 'Civil', 'Laboral'], zona: 'Av. Madero',
        horario: 'Lun a Vie · 9:00 – 19:00', abierto: true, tel: '523541000702',
        desc: 'Asesoría legal en derecho familiar, civil, laboral y trámites de sucesiones.' },
      { nombre: 'Gestoría Vehicular Express', plan: 'basico', filtro: 'notaria', rating: 4.5,
        tags: ['Placas', 'Refrendo', 'Licencias'], zona: 'Portal Hidalgo',
        horario: 'Lun a Vie · 9:00 – 17:00', abierto: false, tel: '523541000703',
        desc: 'Trámites vehiculares, licencias, refrendos y cambios de propietario.' },
      { nombre: 'TecnoSoporte PC', plan: 'basico', filtro: 'tecnologia', rating: 4.7,
        tags: ['Reparación de laptops', 'Redes', 'Cámaras'], zona: 'Col. Zaragoza',
        horario: 'Lun a Sáb · 10:00 – 20:00', abierto: true, tel: '523541000704',
        desc: 'Mantenimiento de equipos, recuperación de datos, redes y cámaras de seguridad.' },
      { nombre: 'Seguros y Fianzas del Bajío', plan: 'basico', filtro: 'seguros', rating: 4.4,
        tags: ['Auto', 'Gastos médicos', 'Vida'], zona: 'Centro',
        horario: 'Lun a Vie · 9:00 – 18:00', abierto: true, tel: '523541000705',
        desc: 'Comparativa de pólizas de auto, gastos médicos mayores y seguros de vida.' }
    ]
  },

  {
    id: 'mascotas',
    nombre: 'Mascotas y Veterinarias',
    color: '#65a30d', soft: '#eef7dd', icono: ICONS.mascotas,
    banner: ['#84cc16', '#4d7c0f'],
    filtros: [
      { id: 'veterinarias', label: 'Veterinarias' },
      { id: 'estetica', label: 'Estética canina' },
      { id: 'alimento', label: 'Alimento y accesorios' },
      { id: 'guarderia', label: 'Guardería y paseo' }
    ],
    negocios: [
      { nombre: 'Veterinaria Huellitas', plan: 'destacado', filtro: 'veterinarias', rating: 4.9,
        tags: ['Consulta', 'Cirugía', 'Vacunas', 'Urgencias'], zona: 'Av. Juárez',
        horario: 'Lun a Sáb · 9:00 – 20:00', abierto: true, tel: '523541000801',
        desc: 'Consulta veterinaria, cirugía, vacunación y esterilización a bajo costo.' },
      { nombre: 'Pet Spa Los Reyes', plan: 'destacado', filtro: 'estetica', rating: 4.8,
        tags: ['Baño y corte', 'Razas grandes', 'Servicio a domicilio'], zona: 'Col. Vista Hermosa',
        horario: 'Mar a Dom · 10:00 – 19:00', abierto: true, tel: '523541000802',
        desc: 'Baño, corte de raza y desparasitación externa. Recolección a domicilio.' },
      { nombre: 'Agro Veterinaria El Campo', plan: 'basico', filtro: 'alimento', rating: 4.6,
        tags: ['Alimento a granel', 'Ganado', 'Medicamentos'], zona: 'Carretera a Peribán',
        horario: 'Lun a Sáb · 8:00 – 19:00', abierto: true, tel: '523541000803',
        desc: 'Alimento para mascotas y ganado, medicamentos veterinarios e insumos agrícolas.' },
      { nombre: 'Guardería Canina Patitas', plan: 'basico', filtro: 'guarderia', rating: 4.7,
        tags: ['Hospedaje', 'Paseos', 'Adiestramiento'], zona: 'Salida a Tocumbo',
        horario: 'Lun a Dom · 7:00 – 20:00', abierto: true, tel: '523541000804',
        desc: 'Hospedaje por día o vacaciones, paseos diarios y adiestramiento básico.' }
    ]
  },

  {
    id: 'eventos',
    nombre: 'Eventos y Fiestas',
    color: '#9333ea', soft: '#f1e7fd', icono: ICONS.eventos,
    banner: ['#a855f7', '#7e22ce'],
    filtros: [
      { id: 'salones', label: 'Salones y jardines' },
      { id: 'banquetes', label: 'Banquetes' },
      { id: 'musica', label: 'Música y DJ' },
      { id: 'foto', label: 'Foto y video' },
      { id: 'renta', label: 'Renta de mobiliario' }
    ],
    negocios: [
      { nombre: 'Jardín de Eventos Los Sauces', plan: 'destacado', filtro: 'salones', rating: 4.8,
        tags: ['Hasta 400 personas', 'Estacionamiento', 'Alberca'], zona: 'Salida a Tingüindín',
        horario: 'Citas: Lun a Sáb · 10:00 – 19:00', abierto: true, tel: '523541000901',
        desc: 'Jardín para bodas y XV años con capacidad para 400 personas y área infantil.' },
      { nombre: 'Banquetes Doña Male', plan: 'destacado', filtro: 'banquetes', rating: 4.9,
        tags: ['Menú a elegir', 'Meseros', 'Degustación'], zona: 'Los Reyes y región',
        horario: 'Lun a Sáb · 9:00 – 19:00', abierto: true, tel: '523541000902',
        desc: 'Banquetes para todo tipo de evento, con servicio de meseros y degustación previa.' },
      { nombre: 'DJ Sonido Estelar', plan: 'basico', filtro: 'musica', rating: 4.7,
        tags: ['Audio e iluminación', 'Pantallas', 'Hora loca'], zona: 'Servicio a domicilio',
        horario: 'Reservas todo el día', abierto: true, tel: '523541000903',
        desc: 'Audio profesional, luces robóticas, pantallas y animación para tu fiesta.' },
      { nombre: 'Foto y Video Momentos', plan: 'basico', filtro: 'foto', rating: 4.8,
        tags: ['Bodas', 'XV años', 'Dron'], zona: 'Centro',
        horario: 'Con cita previa', abierto: false, tel: '523541000904',
        desc: 'Cobertura de eventos con foto, video y tomas aéreas con dron.' },
      { nombre: 'Renta de Mobiliario El Detalle', plan: 'basico', filtro: 'renta', rating: 4.5,
        tags: ['Sillas', 'Mesas', 'Carpas', 'Manteles'], zona: 'Col. Ferrocarril',
        horario: 'Lun a Sáb · 9:00 – 19:00', abierto: true, tel: '523541000905',
        desc: 'Renta de sillas, mesas, carpas, loza y manteles con entrega e instalación.' }
    ]
  },

  {
    id: 'cursos',
    nombre: 'Cursos y Clases',
    color: '#2563eb', soft: '#e4edfd', icono: ICONS.cursos,
    banner: ['#3b82f6', '#1d4ed8'],
    filtros: [
      { id: 'idiomas', label: 'Idiomas' },
      { id: 'regularizacion', label: 'Regularización' },
      { id: 'musica', label: 'Música' },
      { id: 'computacion', label: 'Computación' },
      { id: 'oficios', label: 'Oficios' }
    ],
    negocios: [
      { nombre: 'Instituto de Inglés Bridge', plan: 'destacado', filtro: 'idiomas', rating: 4.8,
        tags: ['Niños y adultos', 'Certificación', 'Grupos reducidos'], zona: 'Av. Morelos',
        horario: 'Lun a Vie · 15:00 – 21:00', abierto: true, tel: '523541001001',
        desc: 'Cursos de inglés por niveles con certificación y grupos de máximo 10 alumnos.' },
      { nombre: 'Academia de Música Do Re Mi', plan: 'destacado', filtro: 'musica', rating: 4.9,
        tags: ['Guitarra', 'Piano', 'Canto'], zona: 'Centro',
        horario: 'Lun a Sáb · 16:00 – 20:00', abierto: true, tel: '523541001002',
        desc: 'Clases individuales y grupales de guitarra, piano, batería y canto.' },
      { nombre: 'Regularización Escolar Einstein', plan: 'basico', filtro: 'regularizacion', rating: 4.7,
        tags: ['Primaria', 'Secundaria', 'Matemáticas'], zona: 'Col. Emiliano Zapata',
        horario: 'Lun a Vie · 16:00 – 20:00', abierto: true, tel: '523541001003',
        desc: 'Asesoría escolar y preparación para exámenes de admisión a preparatoria.' },
      { nombre: 'Centro de Cómputo Digital', plan: 'basico', filtro: 'computacion', rating: 4.5,
        tags: ['Office', 'Diseño', 'Cursos sabatinos'], zona: 'Portal Hidalgo',
        horario: 'Lun a Sáb · 9:00 – 20:00', abierto: false, tel: '523541001004',
        desc: 'Cursos de computación básica, Office, diseño gráfico y redes sociales.' },
      { nombre: 'Taller de Repostería Dulce Arte', plan: 'basico', filtro: 'oficios', rating: 4.8,
        tags: ['Pasteles', 'Fondant', 'Cupos limitados'], zona: 'Col. Morelos',
        horario: 'Sáb · 10:00 – 14:00', abierto: true, tel: '523541001005',
        desc: 'Talleres presenciales de repostería, decoración con fondant y emprendimiento.' }
    ]
  },

  {
    id: 'inmuebles',
    nombre: 'Bienes Raíces y Rentas',
    color: '#0891b2', soft: '#dff2f7', icono: ICONS.inmuebles,
    banner: ['#06b6d4', '#0e7490'],
    filtros: [
      { id: 'venta', label: 'Casas en venta' },
      { id: 'renta', label: 'Casas en renta' },
      { id: 'terrenos', label: 'Terrenos y huertas' },
      { id: 'locales', label: 'Locales comerciales' },
      { id: 'agentes', label: 'Asesores' }
    ],
    negocios: [
      { nombre: 'Inmobiliaria Raíces de Michoacán', plan: 'destacado', filtro: 'agentes', rating: 4.7,
        tags: ['Compra-venta', 'Crédito Infonavit', 'Avalúos'], zona: 'Av. Madero',
        horario: 'Lun a Sáb · 9:00 – 19:00', abierto: true, tel: '523541001101',
        desc: 'Asesoría completa en compra-venta de inmuebles, créditos y escrituración.' },
      { nombre: 'Rentas Los Reyes', plan: 'destacado', filtro: 'renta', rating: 4.6,
        tags: ['Casas amuebladas', 'Departamentos', 'Corta estancia'], zona: 'Varias colonias',
        horario: 'Lun a Dom · 9:00 – 20:00', abierto: true, tel: '523541001102',
        desc: 'Catálogo de casas y departamentos en renta por mes o estancia corta.' },
      { nombre: 'Huertas y Terrenos del Valle', plan: 'basico', filtro: 'terrenos', rating: 4.5,
        tags: ['Huertas de aguacate', 'Terrenos', 'Riego'], zona: 'Región de Los Reyes',
        horario: 'Lun a Sáb · 8:00 – 18:00', abierto: true, tel: '523541001103',
        desc: 'Venta de huertas de aguacate en producción y terrenos con acceso a riego.' },
      { nombre: 'Locales Centro Comercial Plaza', plan: 'basico', filtro: 'locales', rating: 4.3,
        tags: ['Locales', 'Bodegas', 'Estacionamiento'], zona: 'Centro',
        horario: 'Lun a Vie · 10:00 – 18:00', abierto: false, tel: '523541001104',
        desc: 'Renta de locales comerciales y bodegas sobre avenida con alto flujo.' },
      { nombre: 'Casa en Venta Fracc. Los Laureles', plan: 'basico', filtro: 'venta', rating: 4.4,
        tags: ['3 recámaras', '2 baños', 'Cochera'], zona: 'Fracc. Los Laureles',
        horario: 'Visitas con cita', abierto: true, tel: '523541001105',
        desc: 'Casa de dos plantas, 3 recámaras, 2 baños y cochera techada. Escrituras en regla.' }
    ]
  },

  {
    id: 'tiendas',
    nombre: 'Tiendas y Comercio',
    color: '#7c3aed', soft: '#ece5fd', icono: ICONS.tiendas,
    banner: ['#8b5cf6', '#6d28d9'],
    filtros: [
      { id: 'abarrotes', label: 'Abarrotes' },
      { id: 'ropa', label: 'Ropa y calzado' },
      { id: 'ferreteria', label: 'Ferreterías' },
      { id: 'muebles', label: 'Muebles y electro' },
      { id: 'papeleria', label: 'Papelerías' },
      { id: 'agro', label: 'Agroinsumos' }
    ],
    negocios: [
      { nombre: 'Ferretería El Tornillo Feliz', plan: 'destacado', filtro: 'ferreteria', rating: 4.8,
        tags: ['Herramienta', 'Material eléctrico', 'Entrega a obra'], zona: 'Av. Juárez',
        horario: 'Lun a Sáb · 8:00 – 20:00', abierto: true, tel: '523541001201',
        desc: 'Herramienta, plomería, material eléctrico y pinturas. Entregamos en obra.' },
      { nombre: 'Boutique Aura', plan: 'destacado', filtro: 'ropa', rating: 4.7,
        tags: ['Ropa de dama', 'Novedades', 'Apartados'], zona: 'Portal Morelos',
        horario: 'Lun a Sáb · 10:00 – 20:00', abierto: true, tel: '523541001202',
        desc: 'Ropa de dama y accesorios de temporada. Aparta con el 30% y paga a plazos.' },
      { nombre: 'Abarrotes La Central', plan: 'basico', filtro: 'abarrotes', rating: 4.5,
        tags: ['Mayoreo', 'Recargas', 'Reparto'], zona: 'Mercado Municipal',
        horario: 'Lun a Dom · 7:00 – 21:00', abierto: true, tel: '523541001203',
        desc: 'Abarrotes al mayoreo y menudeo, cremería, recargas y servicio de reparto.' },
      { nombre: 'Muebles y Línea Blanca Hogar', plan: 'basico', filtro: 'muebles', rating: 4.4,
        tags: ['Crédito', 'Sin buró', 'Entrega gratis'], zona: 'Av. Madero',
        horario: 'Lun a Sáb · 9:00 – 20:00', abierto: true, tel: '523541001204',
        desc: 'Salas, comedores, refrigeradores y lavadoras con crédito propio y entrega gratis.' },
      { nombre: 'Papelería El Estudiante', plan: 'basico', filtro: 'papeleria', rating: 4.6,
        tags: ['Copias', 'Impresiones', 'Útiles escolares'], zona: 'Col. Zaragoza',
        horario: 'Lun a Sáb · 8:00 – 20:00', abierto: false, tel: '523541001205',
        desc: 'Papelería, copias, impresiones a color, engargolados y artículos de oficina.' },
      { nombre: 'Agroinsumos del Aguacate', plan: 'basico', filtro: 'agro', rating: 4.7,
        tags: ['Fertilizantes', 'Asesoría técnica', 'Mayoreo'], zona: 'Carretera a Peribán',
        horario: 'Lun a Sáb · 8:00 – 19:00', abierto: true, tel: '523541001206',
        desc: 'Fertilizantes, agroquímicos y asesoría técnica para huertas de aguacate.' }
    ]
  }
];
