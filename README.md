# API de Películas con Express

Ejercicio práctico para aprender los fundamentos de un servidor **Express**: rutas,
parámetros, validación de datos y códigos de estado HTTP.

El catálogo está guardado en un array dentro del código, así que todo lo que
agregues o borres desaparece al apagar el servidor. El objetivo es que te
concentres en Express, no en la base de datos.

---

## Requisitos

Solo necesitas **Node.js 18 o superior**. Comprueba tu versión con:

```bash
node -v
```

Si no lo tienes, descárgalo desde [nodejs.org](https://nodejs.org).

---

## Cómo obtener el código

### Opción 1: Clonar el repositorio (recomendado)

```bash
git clone https://github.com/Materiales-ifcd0210/server-express-basico.git
cd server-express-basico
```

### Opción 2: Descargar el ZIP

1. Entra al repositorio en GitHub.
2. Pulsa el botón verde **Code**.
3. Elige **Download ZIP**.
4. Descomprime la carpeta y ábrela en tu terminal.

> Con el ZIP no tienes historial de Git ni puedes subir tus cambios. Con
> `git clone` sí. Si vas a entregar el ejercicio, usa `git clone`.

---

## Puesta en marcha

```bash
# 1. Instalar las dependencias (una sola vez)
npm install

# 2. Arrancar el servidor
npm start
```

Verás esto:

```
API de peliculas escuchando en http://localhost:3000
```

Abre <http://localhost:3000/api/peliculas> en el navegador y verás el catálogo
en formato JSON. Para apagar el servidor, `Ctrl + C`.

Mientras programas, `npm run dev` reinicia el servidor solo cada vez que guardas
un archivo. `npm start` no lo hace, así que si cambiaste algo y no lo ves
reflejado, es probable que estés usando `npm start`.

Si el puerto 3000 está ocupado:

```bash
PORT=3100 npm start        # Linux / macOS
$env:PORT=3100; npm start  # Windows PowerShell
```

> También puedes crear un archivo `.env` (copiando `.env.example`) y poner ahí
> `PORT=3100`. El servidor lo leerá automáticamente gracias a `dotenv`.

---

## Cómo probar la API sin escribir curl

Este proyecto incluye un archivo **`peticiones.http`** listo para usar con la
extensión **REST Client** de VS Code (la de Huachao Mao, icono morado).

1. Instala la extensión *REST Client* en VS Code.
2. Abre `peticiones.http`.
3. Verás enlaces **Send Request** sobre cada bloque que empieza por `###`.
4. Pulsa y la respuesta aparece en un panel a la derecha.

El archivo usa la variable `@host` al principio, así que si cambias de puerto
solo editas la primera línea:

```
@host = http://localhost:3100   # cambia aquí y todas las peticiones usan el nuevo puerto
```

> ¿Quieres una interfaz gráfica tipo Postman sin salir de VS Code? Prueba la
> extensión **Thunder Client** (también dentro de VS Code). Los dos formatos
> conviven; `peticiones.http` funciona en ambos.

---

## Referencia completa de la API

Todos los endpoints, reglas de validación, ejemplos de petición y respuesta
reales, y códigos de estado están en **`CONTRATO.md`** (en la raíz del repo).

Ahí encontrarás:

- El modelo de datos con la tabla de campos (tipo, obligatorio, reglas).
- Los 6 endpoints con sus parámetros, cuerpos y respuestas 200/201/400/404.
- La promesa de que **todos los errores tienen la misma forma**: `{ "error": "..." }`.
- La tabla resumen de códigos de estado.

---

## Estructura del proyecto

```
server-express-basico/
├── src/
│   ├── server.js               crea la app, monta las rutas y escucha
│   └── routes/
│       └── peliculas.js        los datos y las rutas de las películas
├── .gitignore
├── LICENSE
├── CONTRATO.md                 referencia completa de la API
├── peticiones.http             para REST Client / Thunder Client
├── .env.example                plantilla de variables de entorno
├── package.json
└── README.md
```

Solo dos archivos de código. Todo lo demás son rutas y los datos, en el mismo
sitio.

---

## Dos cosas que vas a tropezar

### 1. El orden de las rutas

En `routes/peliculas.js`, `/generos` está declarado **antes** que `/:id`:

```js
router.get('/generos', ...);   // antes
router.get('/:id', ...);       // después
```

Express compara las rutas en el orden en que están escritas y se queda con la
primera que coincide. Si invirtieras esas dos líneas, la petición a
`/api/peliculas/generos` entraría en la ruta `/:id` con el texto `"generos"` como
id, y respondería `404: No existe la película generos`. El 404 es correcto
técnicamente, pero no es lo que querías. Es el error clásico de Express.

### 2. Comprobar si un campo viene, no si tiene contenido

Al validar los campos opcionales verás esto:

```js
if (datos.anio !== undefined) { ... }   // así sí
```

y no esto:

```js
if (datos.anio) { ... }                 // así no
```

Con la segunda versión, el número `0` y el texto `""` se interpretarían como
"no enviado", y la comprobación de rango nunca se ejecutaría. `!== undefined`
pregunta lo correcto: **¿el cliente mandó este campo?**

Lo mismo aplica al `400` del `POST`: `req.body.titulo.trim()` solo es seguro
llamarlo después de confirmar que `titulo` es un texto, que es justo lo que hace
la función `validar`.

---

## Express 5: qué cambia respecto a la versión 4

Este proyecto usa **Express 5.2**. Casi toda la documentación que encontrarás
está escrita para la 4, así que conviene saber dónde se diferencian:

- **Las rutas con comodín cambiaron.** En la 4 se escribía `app.get('*', ...)`;
  en la 5 hay que darle nombre: `'/*splat'`. Aquí no hace falta, porque el 404 se
  registra sin ruta.
- **Los errores en funciones `async` se capturan solos.** En la 4 había que
  envolverlas con `try/catch`; en la 5, un `throw` dentro de un `async` llega
  al manejador de errores sin hacer nada más.
- **`req.query` es de solo lectura.** En la 4 podías reasignarlo; en la 5 lanza
  un error.

Lo que **no** ha cambiado: `express.json()`, los códigos de estado, los
middlewares, `next(error)`, `req.params` y el orden de las rutas.

---

## Ideas para hacerlo crecer

Cuando termines el ejercicio, esto es lo que podrías agregar, ordenado por
dificultad. Cada nivel habilita el siguiente.

### Nivel 1 · más práctica (sin tocar la arquitectura)

1. **Más validaciones.** `duracion` (entero positivo), `puntuacion` (número entre
   0 y 10), `visto` (booleano).
2. **Filtros en el GET.** `GET /api/peliculas?genero=Drama` y `&anio=2001`.
   Se leen de `req.query`.
3. **Búsqueda por texto.** `GET /api/peliculas?buscar=matrix`.
4. **Paginación.** `GET /api/peliculas?limite=2&pagina=2`. Piensa qué debe
   pasar si piden una página que no existe.
5. **Restringir el origen CORS.** Cambia `CORS_ORIGIN` en el `.env` de `*` a
   `http://localhost:5173` y entiende por qué importa.
6. **Rate limiting.** `npm install express-rate-limit` y protege la API contra
   abusos (3 líneas).

### Nivel 2 · toca la estructura

7. **Separar en varios archivos.** Cuando `peliculas.js` pase de unas 200 líneas,
   extrae los datos a `data/peliculas.js`, la validación a un middleware, los
   controladores a `controllers/`. Ese es el momento exacto en que un solo
   archivo empieza a hacer daño.
8. **Async/await y el manejador de errores.** Usa `async` en los controladores
   y deja que el manejador central (los 4 parámetros) capture los `throw`
   sin `try/catch`. Es la forma nativa de Express 5.
9. **Tests.** `npm install --save-dev supertest` y `node --test`. La clave:
   para poder testear sin levantar un servidor, la `app` debe estar en un archivo
   separado de `app.listen()`. Ese es el motivo por el que todo proyecto real
   separa `app.js` y `server.js`. Hazlo cuando necesites probarlo.

### Nivel 3 · toca el mundo real

10. **Una base de datos.** SQLite (archivo local) o MongoDB (Atlas gratis).
    El array en memoria desaparece al apagar; la BD no.
11. **Autenticación.** Registro y login con JWT.
    > **Cinco fallos que se cometen al hacerlo (no los cometas):**
    >
    > - **Nunca guardes contraseñas en texto plano**, ni en un ejercicio.
    >   Usa **`bcryptjs`** (JavaScript puro). `bcrypt` compila con `node-gyp` y
    >   en Windows de los alumnos falla a menudo.
    > - **La clave secreta del JWT va en el `.env`**, nunca en el código.
    > - **El middleware de autenticación se registra ANTES** de las rutas que
    >   protege (otra vez: el orden de los middlewares importa).
    > - **Ocultar un botón en el front no es un permiso**: la comprobación real
    >   va en el servidor, porque el cliente se puede modificar.
    > - **`401` no es `403`**. `401` = "no sé quién eres"; `403` = "sé quién
    >   eres pero no te dejo". Es el matiz que más se confunde y el que más
    >   se pregunta en entrevistas.
12. **Autorización con roles.** Distingue `admin` de `usuario` y protege
    rutas según el rol (p. ej., solo `admin` puede borrar).

---

## Problemas frecuentes

**`Error: listen EADDRINUSE: address already in use :::3000`**
Ya hay otro programa usando ese puerto. Ciérralo o arranca con
`PORT=3100 npm start`.

**`Cannot find module 'express'`**
Faltan las dependencias. Ejecuta `npm install` dentro de la carpeta del proyecto.

**El `POST` llega con `req.body` vacío**
Falta el `app.use(express.json())` en `server.js`, o falta la cabecera
`Content-Type: application/json` en la petición.

**`Cannot use import statement outside a module`**
Falta `"type": "module"` en `package.json`. Sin esa línea Node trata los
archivos `.js` como CommonJS y no entiende el `import`.

**Cambié un archivo y no se refleja**
Estás usando `npm start` en vez de `npm run dev`. El primero no recarga solo.

---

## Licencia

MIT. Eres libre de usar, copiar y modificar este código. El detalle está en el
archivo [LICENSE](LICENSE).