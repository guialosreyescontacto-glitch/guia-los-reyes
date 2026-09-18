# Cómo pasarme los negocios reales

La respuesta corta: **una hoja de cálculo y una carpeta de fotos.** Nada de PDF.

- Plantilla lista para llenar: [`negocios-plantilla.csv`](negocios-plantilla.csv)
- Las fotos van en `docs/fotos/`, una por negocio.

---

## Por qué hoja de cálculo y no PDF

| | |
|---|---|
| **Hoja de cálculo** (Excel, Google Sheets, CSV) | La llenas desde el celular parado afuera del negocio, la corriges cuando te equivocas, y yo la leo renglón por renglón sin inventar nada. **Esta.** |
| **Pegar el texto aquí en el chat** | Sirve para tres o cuatro negocios. Para sesenta se vuelve un desastre: se pierde en la conversación y no lo puedes corregir después. |
| **PDF** | El peor. No lo puedes editar, yo tengo que adivinar dónde termina un dato y empieza el otro, y un error de lectura se convierte en un teléfono mal publicado. |
| **Fotos de tarjetas o anuncios** | No para los datos, pero **sí como respaldo**. Si algo en la hoja se ve raro, la foto aclara. Mándalas y ya. |

Un dato mal copiado en un directorio no es un detalle: es un vecino marcándole a un número equivocado, o un negocio cuyo horario dice que está abierto cuando está cerrado.

---

## Las columnas, una por una

| Columna | Qué va | ¿Obligatoria? |
|---|---|---|
| `categoria` | El identificador de la categoría (lista abajo) | **Sí** |
| `filtro` | El identificador de la especialidad dentro de esa categoría | **Sí** |
| `nombre` | Como se llama el negocio, tal cual | **Sí** |
| `plan` | `basico`, `completa`, `destacado` o `premium` | **Sí** |
| `zona` | Corto, lo que se ve en la ficha: `Centro`, `Av. Morelos`, `Col. Emiliano Zapata` | **Sí** |
| `direccion` | Completa, la que abre el mapa. Va entre comillas porque lleva comas | **Sí** |
| `horario` | Ver abajo | **Sí** |
| `telefono` | 10 dígitos, sin lada de país. Yo le pongo el `52` | **Sí** |
| `correo` | | No |
| `web` | El dominio a secas: `dentalsonrisa.com` | No |
| `facebook` | **Sólo el usuario**, no la liga completa | No |
| `instagram` | Sólo el usuario | No |
| `tiktok` | Sólo el usuario, sin la arroba | No |
| `descripcion` | Uno o dos renglones. Entre comillas si lleva comas | Sólo de `completa` para arriba |
| `etiquetas` | Hasta 4, separadas con punto y coma | Sólo de `completa` para arriba |
| `foto` | El nombre del archivo que dejaste en `docs/fotos/` | No, pero pesa mucho en `destacado` y `premium` |
| `permiso` | La fecha en que te contestó que sí (`2026-09-18`) | **Sí** |

**La ficha `basico` es la gratuita**: con categoría, filtro, nombre, zona, dirección, horario, teléfono y permiso basta. Descripción, etiquetas, correo y redes no se pintan aunque los llenes — eso es justo lo que compra la Ficha completa. Si un día sube de plan, los datos ya están y sale solo.

---

## Cómo escribir el horario

**Igual todos los días:**
```
Lun a Dom: 8:00 - 21:00
```

**Cierra a comer (jornada partida)** — los tramos con coma:
```
Lun a Vie: 9:00 - 14:00, 16:00 - 20:00
```

**Distinto el sábado** — los grupos de días con una barra vertical `|`:
```
Lun a Vie: 9:00 - 14:00, 16:00 - 20:00 | Sáb: 9:00 - 13:00
```

**Siempre abierto:**
```
Abierto 24 horas
```

**Sólo con cita, o sin horario fijo:** déjalo vacío. La ficha va a decir
"Con cita" en vez de inventarle un horario.

Reglas: usa **24 horas** (`16:00`, no `4 pm`), y **los días que no nombres
quedan cerrados**. Si un negocio no abre los domingos, no lo escribas.

---

## Categorías y filtros que existen hoy

Copia el identificador de la izquierda, no el nombre bonito.

| `categoria` | | `filtro` |
|---|---|---|
| `salud` | Salud y Clínicas | `medicos` `dental` `lab` `optica` `especialistas` |
| `mecanicos` | Mecánicos y Talleres | `general` `hojalateria` `llantas` `electrico` `grua` |
| `gimnasios` | Gimnasios y Deportes | `gym` `crossfit` `artes` `canchas` `yoga` |
| `comida` | Comida y Restaurantes | `mexicana` `tacos` `mariscos` `pizza` `cafe` |
| `belleza` | Belleza y Cuidado Personal | `estetica` `barberia` `unas` `spa` `maquillaje` |
| `hogar` | Hogar y Reparaciones | `cerrajeros` `fontaneros` `electricistas` `carpinteros` `albaniles` `limpieza` |
| `profesionales` | Servicios Profesionales | `abogados` `contadores` `notaria` `tecnologia` `seguros` |
| `mascotas` | Mascotas y Veterinarias | `veterinarias` `estetica` `alimento` `guarderia` |
| `eventos` | Eventos y Fiestas | `salones` `banquetes` `musica` `foto` `renta` |
| `cursos` | Cursos y Clases | `idiomas` `regularizacion` `musica` `computacion` `oficios` |
| `inmuebles` | Bienes Raíces y Rentas | `venta` `renta` `terrenos` `locales` `agentes` |
| `tiendas` | Tiendas y Comercio | `abarrotes` `ropa` `ferreteria` `muebles` `papeleria` `agro` |

**¿No cabe en ninguna?** Escríbelo en la columna de todos modos y déjame una
nota. Agregar una categoría o un filtro nuevo es fácil; lo que no se vale es
meter una tortillería en "Tiendas" porque no había dónde.

---

## Las fotos

- Van en `docs/fotos/`, y en la columna `foto` pones el nombre del archivo.
- Nómbralas como el negocio, sin acentos ni espacios: `dental-sonrisa.jpg`.
- **Horizontal**, no vertical. Se recortan a lo ancho.
- Que el negocio se vea: la fachada, el local, el equipo, el producto. Evita
  fotos donde el motivo quede en una esquina, porque se recortan del centro.
- Del celular está bien. No hace falta cámara.

---

## Cómo trabajamos cuando me la mandes

1. Tú llenas la hoja con los que ya te dijeron que sí, y guardas las capturas
   del "sí acepto" (ver [`consentimiento.md`](consentimiento.md)).
2. La dejas en `docs/` y me dices que ya está.
3. Yo la convierto a `assets/js/data.js`, y **antes de tocar nada te aviso de
   todo lo que se vea raro**: teléfonos que no tienen 10 dígitos, horarios que
   no se entienden, direcciones que el mapa no va a encontrar, nombres
   repetidos.
4. **Vaciamos los negocios de ejemplo por categoría**, no todos de golpe:
   cuando Salud tenga los reales, se borran los 8 inventados de Salud. Así
   nunca hay una mezcla de verdaderos y falsos.
5. Cuando ya no quede ni un negocio de ejemplo, se quita el aviso de
   "prototipo de demostración" del pie.

**No hace falta que junte los 60 para empezar.** Mándame 5 y montamos la
primera categoría completa. Ver una categoría real funcionando te va a servir
para vender las siguientes.
