import { Router } from 'express';

const router = Router();

// ------------------------------------------------------------------
// Los datos de la API viven aquí, en un simple array.
// OJO: se guardan en memoria, así que se borran al apagar el servidor.
// ------------------------------------------------------------------
const peliculas = [
  { id: 1, titulo: 'El viaje de Chihiro', director: 'Hayao Miyazaki', anio: 2001, genero: 'Animación' },
  { id: 2, titulo: 'El laberinto del fauno', director: 'Guillermo del Toro', anio: 2006, genero: 'Terror' },
  { id: 3, titulo: 'La lista de Schindler', director: 'Steven Spielberg', anio: 1993, genero: 'Drama' },
  { id: 4, titulo: 'Matrix', director: 'Lana y Lilly Wachowski', anio: 1999, genero: 'Ciencia ficción' },
  { id: 5, titulo: 'Parasite', director: 'Bong Joon-ho', anio: 2019, genero: 'Drama' },
  { id: 6, titulo: 'Amélie', director: 'Jean-Pierre Jeunet', anio: 2001, genero: 'Comedia' },
];

/**
 * Devuelve el id que usará la próxima película.
 * Como no hay base de datos, tomamos el id más alto y le sumamos 1.
 */
function siguienteId() {
  // Math.max() de un array vacío devuelve -Infinity, y al convertirlo a
  // JSON se volvería "null". Comprobamos que quede alguna película antes.
  if (peliculas.length === 0) {
    return 1;
  }

  return Math.max(...peliculas.map((p) => p.id)) + 1;
}

/**
 * Revisa los datos que nos mandan por POST o PUT.
 * @returns {Array<string>} Los errores encontrados; vacío si todo está bien.
 */
function validar(datos) {
  const errores = [];

  // Si el cliente no manda un objeto JSON, `datos` llega como `undefined`
  // (por ejemplo, al enviar el body con un Content-Type equivocado).
  // Sin esta comprobación, leer `datos.titulo` más abajo reventaría el
  // servidor con un error 500 en vez de un 400 con un mensaje útil.
  if (datos === null || typeof datos !== 'object' || Array.isArray(datos)) {
    errores.push('El cuerpo de la petición debe ser un objeto JSON.');
    return errores;
  }

  // `titulo` es el único campo obligatorio.
  if (typeof datos.titulo !== 'string' || datos.titulo.trim() === '') {
    errores.push('El campo "titulo" es obligatorio y debe ser un texto.');
  }

  // `director` y `genero` son opcionales, pero si vienen deben ser texto.
  for (const campo of ['director', 'genero']) {
    if (datos[campo] !== undefined && typeof datos[campo] !== 'string') {
      errores.push(`El campo "${campo}" debe ser un texto.`);
    }
  }

  // `anio` también es opcional. El máximo se calcula al vuelo a propósito:
  // escribirlo como número fijo (por ejemplo 2026) haría fallar el ejercicio
  // el año siguiente. 1888 es el año de la primera película registrada.
  const anioMaximo = new Date().getFullYear() + 1;
  if (datos.anio !== undefined && (typeof datos.anio !== 'number' || datos.anio < 1888 || datos.anio > anioMaximo)) {
    errores.push(`El campo "anio" debe ser un número entre 1888 y ${anioMaximo}.`);
  }

  return errores;
}

/** Busca una película por id. Devuelve `undefined` si no existe. */
function buscar(id) {
  return peliculas.find((p) => p.id === id);
}

// ------------------------------------------------------------------
// Rutas
// ------------------------------------------------------------------

// GET /api/peliculas
router.get('/', (req, res) => {
  res.json({ total: peliculas.length, peliculas });
});

// GET /api/peliculas/generos
// Esta ruta va ANTES que "/:id" a propósito. Express usa la primera ruta
// que coincide: si "/:id" fuera primero, "/generos" entraría ahí con
// id="generos" y respondería 404.
router.get('/generos', (req, res) => {
  const generos = [...new Set(peliculas.map((p) => p.genero))].sort((a, b) => a.localeCompare(b, 'es'));
  res.json({ generos });
});

// GET /api/peliculas/:id
router.get('/:id', (req, res) => {
  const pelicula = buscar(Number(req.params.id));

  if (!pelicula) {
    return res.status(404).json({ error: `No existe la película ${req.params.id}.` });
  }

  res.json(pelicula);
});

// POST /api/peliculas
router.post('/', (req, res) => {
  const errores = validar(req.body);

  if (errores.length > 0) {
    return res.status(400).json({ error: errores.join(' ') });
  }

  const pelicula = {
    id: siguienteId(),
    titulo: req.body.titulo.trim(),
    director: req.body.director ?? null,
    anio: req.body.anio ?? null,
    genero: req.body.genero ?? null,
  };

  peliculas.push(pelicula);

  // 201 = creado. Location dice dónde encontrar lo que acabamos de crear.
  res.location(`/api/peliculas/${pelicula.id}`).status(201).json(pelicula);
});

// PUT /api/peliculas/:id
router.put('/:id', (req, res) => {
  const id = Number(req.params.id);
  const pelicula = buscar(id);

  if (!pelicula) {
    return res.status(404).json({ error: `No existe la película ${id}.` });
  }

  const errores = validar(req.body);

  if (errores.length > 0) {
    return res.status(400).json({ error: errores.join(' ') });
  }

  Object.assign(pelicula, {
    titulo: req.body.titulo.trim(),
    director: req.body.director ?? null,
    anio: req.body.anio ?? null,
    genero: req.body.genero ?? null,
  });

  res.json(pelicula);
});

// DELETE /api/peliculas/:id
router.delete('/:id', (req, res) => {
  const id = Number(req.params.id);
  const indice = peliculas.findIndex((p) => p.id === id);

  if (indice === -1) {
    return res.status(404).json({ error: `No existe la película ${id}.` });
  }

  // splice devuelve lo que se quitó, dentro de un array.
  res.json(peliculas.splice(indice, 1)[0]);
});

export default router;
