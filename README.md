# Manager Library — Sembrador de Datos (Tool)

> **Prueba técnica · Ficha ADSO 3413974**  
> Herramienta automatizada para la generación y siembra de datos de demostración sobre la API REST de *Manager Library*.

---

## 1. Principio de Operación

Cumpliendo con la **Constitución (Art. V)** y la tarea **T-21**, el sembrador **no inserta datos directamente en la base de datos** por SQL.
Todo el proceso se realiza consumiendo **exclusivamente el contrato HTTP público de la API** (`/api/v1`):
1. Inicia sesión como administrador (`POST /api/v1/auth/login`) para obtener el token JWT.
2. Crea bibliotecarios de prueba (`POST /api/v1/users`).
3. Consulta las categorías sembradas por la migración (`GET /api/v1/categories`).
4. Siembra el catálogo de libros (`POST /api/v1/books`).
5. Registra socios con documentos únicos (`POST /api/v1/members`).
6. Genera préstamos de 1 a 3 líneas (`POST /api/v1/loans`), préstamos devueltos y préstamos deliberadamente vencidos para demostrar el cálculo dinámico de moras.

---

## 2. Volumen de Datos Generados

El sembrador `seed.js` genera el volumen estipulado para la prueba:
* **≥ 40 libros** con títulos, autores, ISBN-13 válidos y existencias calculadas.
* **≥ 10 socios** con documentos y nombres normalizados.
* **≥ 15 préstamos** activos y cerrados.
* **≥ 3 préstamos vencidos** con fechas anteriores para verificar de inmediato la vista `/loans/overdue` y el cálculo de días de mora.

---

## 3. Instrucciones de Ejecución

### Prerrequisitos:
* Node.js instalado (v18 o superior).
* Contenedores de la API y base de datos en ejecución (`http://localhost:8000`).

### Ejecución:
Desde el directorio del repositorio:

```bash
npm install
npm run seed
```

El script imprimirá en consola el progreso de cada recurso creado y validará las respuestas HTTP esperadas.
