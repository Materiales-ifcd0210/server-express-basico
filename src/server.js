import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import peliculasRoutes from './routes/peliculas.js';

// express() crea la aplicación. Todo lo que hagamos va colgado de `app`.
const app = express();

// CORS: permite que una página de otro origen llame a esta API.
// Con "*" se permite cualquier origen (solo para desarrollo).
// En producción hay que restringir: CORS_ORIGIN=http://localhost:5173
const origenesRaw = process.env.CORS_ORIGIN ?? '*';
const origenes = origenesRaw === '*' ? '*' : origenesRaw.split(',').map((o) => o.trim());
app.use(cors({ origin: origenes }));

// Convierte a objeto el cuerpo de las peticiones que llegan en JSON.
// Sin esta línea, en POST y PUT no recibiríamos nada.
app.use(express.json());

// Todo lo que empiece por /api/peliculas lo maneja el router.
app.use('/api/peliculas', peliculasRoutes);

app.get('/', (req, res) => {
  res.json({ mensaje: 'API de películas', endpoints: '/api/peliculas' });
});

// Se ejecuta cuando ninguna de las rutas anteriores respondió.
app.use((req, res) => {
  res.status(404).json({ error: `Ruta no encontrada: ${req.method} ${req.originalUrl}` });
});

/**
 * Manejador de errores. Se ejecuta cuando algo lanza un `next(error)`.
 * Express lo reconoce porque la función recibe 4 parámetros.
 *
 * Sin él, Express responde con una página HTML y un stack trace que
 * incluye la ruta de tu disco, que es justo lo que no queremos mostrar.
 * @param {Error} error El error que se lanzó.
 * @param {object} req Petición de Express.
 * @param {object} res Respuesta de Express.
 * @param {Function} next Siguiente middleware del error.
 */
app.use((error, req, res, next) => {
  // express.json() lanza un SyntaxError cuando el JSON está mal escrito.
  if (error instanceof SyntaxError && 'body' in error) {
    return res.status(400).json({ error: 'El JSON que enviaste está mal formado. Revisa comas y comillas.' });
  }

  console.error('Error:', error.message);

  res.status(500).json({ error: 'Error interno del servidor.' });
});

// El puerto llega por variable de entorno para poder cambiarlo sin
// tocar el código. Si no está definido usamos el 3000.
const puerto = process.env.PORT ?? 3000;

app.listen(puerto, () => {
  // Sin tildes a propósito: la consola de Windows no usa la misma
  // codificación que el archivo y las mostraría rotas (pelÃ­culas).
  // Esto solo afecta a lo que se imprime en pantalla. Los datos que
  // viajan por HTTP sí llevan tildes correctamente, porque Express las
  // envía en UTF-8.
  console.log(`API de peliculas escuchando en http://localhost:${puerto}`);
});