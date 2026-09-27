# Contrato de la API de Películas

**Versión:** 1.0.0
**Base URL:** `http://localhost:3000/api/peliculas`

---

## Convenciones

- Todas las peticiones y respuestas usan **JSON**.
- La cabecera `Content-Type: application/json` es **obligatoria** en `POST` y `PUT`. Sin ella, la API no leerá el cuerpo y responderá `400`.
- Los `id` son **números enteros** asignados por el servidor. Si el cliente envía un `id` en el cuerpo, se **ignora**.
- Los campos opcionales que no se envían se guardan como `null`.
- Los errores siempre tienen la misma forma:

```json
{ "error": "mensaje explicativo" }
```

- El servidor envía cabeceras CORS según la variable `CORS_ORIGIN`. Por defecto permite cualquier origen (`*`).

---

## Modelo de datos

| Campo      | Tipo      | Obligatorio | Reglas                                                                   | Ejemplo              |
|------------|-----------|-------------|--------------------------------------------------------------------------|----------------------|
| `id`       | `integer` | no (auto)   | Solo lo asigna el servidor. Se ignora si llega en la petición.           | `1`                  |
| `titulo`   | `string`  | **sí**      | Texto no vacío.                                                          | `"El viaje de Chihiro"` |
| `director` | `string`  | no          | Si se envía, debe ser texto no vacío.                                    | `"Hayao Miyazaki"`   |
| `anio`     | `integer` | no          | Si se envía, entre `1888` y el año actual + 1.                           | `2001`               |
| `genero`   | `string`  | no          | Si se envía, debe ser texto no vacío.                                    | `"Animación"`        |

> **Nota sobre `anio`:** el límite de 1888 corresponde a *Roundhay Garden Scene*, la primera película registrada. El límite superior se calcula en tiempo de ejecución (`new Date().getFullYear() + 1`) para que el ejercicio no caduque el año que viene.

---

## Endpoints

### 1. Listar todas las películas

**GET** `/api/peliculas`

**Respuesta 200 OK**

```json
{
  "total": 6,
  "peliculas": [
    {
      "id": 1,
      "titulo": "El viaje de Chihiro",
      "director": "Hayao Miyazaki",
      "anio": 2001,
      "genero": "Animación"
    },
    {
      "id": 2,
      "titulo": "El laberinto del fauno",
      "director": "Guillermo del Toro",
      "anio": 2006,
      "genero": "Terror"
    },
    {
      "id": 3,
      "titulo": "La lista de Schindler",
      "director": "Steven Spielberg",
      "anio": 1993,
      "genero": "Drama"
    },
    {
      "id": 4,
      "titulo": "Matrix",
      "director": "Lana y Lilly Wachowski",
      "anio": 1999,
      "genero": "Ciencia ficción"
    },
    {
      "id": 5,
      "titulo": "Parasite",
      "director": "Bong Joon-ho",
      "anio": 2019,
      "genero": "Drama"
    },
    {
      "id": 6,
      "titulo": "Amélie",
      "director": "Jean-Pierre Jeunet",
      "anio": 2001,
      "genero": "Comedia"
    }
  ]
}
```

---

### 2. Obtener géneros distintos

**GET** `/api/peliculas/generos`

> **Importante:** Esta ruta debe declararse **antes** que `/:id` en el router. Express usa la primera ruta que coincide; si `/:id` va primero, `/generos` entraría ahí con `id="generos"` y respondería `404`.

**Respuesta 200 OK**

```json
{
  "generos": [
    "Animación",
    "Ciencia ficción",
    "Comedia",
    "Drama",
    "Terror"
  ]
}
```

---

### 3. Obtener una película por id

**GET** `/api/peliculas/:id`

| Parámetro | Tipo      | Descripción            |
|-----------|-----------|------------------------|
| `id`      | `integer` | Id de la película      |

**Respuesta 200 OK** (película 1)

```json
{
  "id": 1,
  "titulo": "El viaje de Chihiro",
  "director": "Hayao Miyazaki",
  "anio": 2001,
  "genero": "Animación"
}
```

**Respuesta 404 Not Found** (id inexistente)

```json
{ "error": "No existe la película 999." }
```

**Respuesta 404 Not Found** (id no numérico, p.ej. `abc`)

```json
{ "error": "No existe la película abc." }
```

> **Nota:** Un id no numérico como `abc` también devuelve `404` (no `400`), porque el servidor intenta buscar la película y no la encuentra. Es un comportamiento simplificado a propósito.

---

### 4. Crear una película

**POST** `/api/peliculas`

**Cabeceras requeridas**

```
Content-Type: application/json
```

**Cuerpo de la petición**

```json
{
  "titulo": "Roma",
  "director": "Alfonso Cuarón",
  "anio": 2018,
  "genero": "Drama"
}
```

> Solo `titulo` es obligatorio. Los demás campos son opcionales; si no se envían quedan en `null`. Si el cliente envía `id`, se ignora.

**Respuesta 201 Created**

Cabecera: `Location: /api/peliculas/7`

```json
{
  "id": 7,
  "titulo": "Roma",
  "director": "Alfonso Cuarón",
  "anio": 2018,
  "genero": "Drama"
}
```

**Respuesta 400 Bad Request** (falta `titulo`)

```json
{ "error": "El campo \"titulo\" es obligatorio y debe ser un texto." }
```

**Respuesta 400 Bad Request** (titulo es un número)

```json
{ "error": "El campo \"titulo\" es obligatorio y debe ser un texto." }
```

**Respuesta 400 Bad Request** (anio fuera de rango)

```json
{ "error": "El campo \"anio\" debe ser un número entre 1888 y 2027." }
```

**Respuesta 400 Bad Request** (JSON mal formado)

```json
{ "error": "El JSON que enviaste está mal formado. Revisa comas y comillas." }
```

**Respuesta 400 Bad Request** (Content-Type equivocado, p.ej. `text/plain`)

```json
{ "error": "El cuerpo de la petición debe ser un objeto JSON." }
```

---

### 5. Actualizar una película

**PUT** `/api/peliculas/:id`

| Parámetro | Tipo      | Descripción            |
|-----------|-----------|------------------------|
| `id`      | `integer` | Id de la película      |

**Cabeceras requeridas**

```
Content-Type: application/json
```

**Cuerpo de la petición** (todos los campos son opcionales en la petición, pero si se envían se validan)

```json
{
  "titulo": "Roma",
  "director": "Alfonso Cuarón",
  "anio": 2018,
  "genero": "Drama"
}
```

> Los campos que **no** se envían se guardan como `null`. `PUT` reemplaza la película completa (para actualización parcial se usaría `PATCH`, que no está implementado en este ejercicio).

**Respuesta 200 OK** (película 7 actualizada)

```json
{
  "id": 7,
  "titulo": "Roma",
  "director": "Alfonso Cuarón",
  "anio": 2018,
  "genero": "Drama"
}
```

**Respuesta 404 Not Found** (película no existe)

```json
{ "error": "No existe la película 999." }
```

**Respuesta 400 Bad Request** (validación fallida)

```json
{ "error": "El campo \"titulo\" es obligatorio y debe ser un texto." }
```

---

### 6. Eliminar una película

**DELETE** `/api/peliculas/:id`

| Parámetro | Tipo      | Descripción            |
|-----------|-----------|------------------------|
| `id`      | `integer` | Id de la película      |

**Respuesta 200 OK** (película 7 eliminada)

```json
{
  "id": 7,
  "titulo": "Roma",
  "director": "Alfonso Cuarón",
  "anio": 2018,
  "genero": "Drama"
}
```

> Se devuelve la película que se ha borrado, para que el cliente pueda confirmar qué eliminó sin hacer otra petición.

**Respuesta 404 Not Found** (película no existe)

```json
{ "error": "No existe la película 999." }
```

---

## Resumen de códigos de estado

| Código | Significado                    | Cuándo ocurre                                                  |
|--------|--------------------------------|----------------------------------------------------------------|
| `200`  | OK                             | GET, PUT, DELETE correctos.                                    |
| `201`  | Created                        | POST correcto. Va con cabecera `Location`.                     |
| `400`  | Bad Request                    | JSON mal formado, Content-Type equivocado, validación fallida. |
| `404`  | Not Found                      | Ruta o película no existen (incluye id no numérico).           |
| `500`  | Internal Server Error          | Error inesperado en el servidor (nunca debería verse aquí).    |

---

## Errores: forma única

Todas las respuestas de error (400, 404, 500) usan exactamente la misma estructura:

```json
{ "error": "mensaje legible por humanos" }
```

Así el cliente (o el alumno) sabe siempre dónde mirar el mensaje.