// PART 1 - the API client module: the ONLY place that knows the API's address and how its errors look.
// No component writes a URL by hand; they all call these functions.
// Run it with:  npm test -- api
import axios from "axios";

// TODO 1: the base address of the API in one place. `import.meta.env.VITE_API_URL` (a .env.local file) wins when it
//         exists; otherwise use "http://localhost:8000/api" (no trailing slash).
export const API_URL = import.meta.env?.VITE_API_URL ?? "http://localhost:8000/api";

// TODO 2: create the Axios instance with `axios.create`: the base URL, a timeout of 8000 ms and the header
//         Accept: application/json. Tests and `npm run dev` replace its adapter, so it must be a real Axios instance.
export const api = axios.create({
  baseURL: API_URL,
  timeout: 8000,
  headers: { Accept: "application/json" },
});

/** TODO 3: GET /exams/ -> the array of exams (response.data, not the whole response). Pass the `signal` to Axios. */
export function listExams({ signal } = {}) {
  return api.get("/exams/", { signal }).then((response) => response.data);
}

/** TODO 4: POST /exams/ with { title } -> the exam the server created (response.data). */
export function createExam(title) {
  return api.post("/exams/", { title }).then((response) => response.data);
}

/** TODO 5: DELETE /exams/<id>/ -> resolves with undefined. The API's paths end with a slash. */
export function deleteExam(id) {
  return api.delete(`/exams/${id}/`).then(() => undefined);
}

/**
 * TODO 6: turns anything the client can throw into ONE sentence in Spanish for the person.
 *  - no response and error.code "ERR_NETWORK": cannot connect; mention the server and CORS.
 *  - error.code "ECONNABORTED" or "ETIMEDOUT": it took too long.
 *  - status 400: show the API's message for each field ({ title: ["Este campo ..."] }).
 *  - status 404: the resource no longer exists.
 *  - status 500 or more: the API failed; include the status number.
 *  - anything else: a generic sentence (never an empty string).
 */
export function describeError(error) {
  if (error?.code === "ECONNABORTED" || error?.code === "ETIMEDOUT") {
    return "La API tardó demasiado en responder. Intenta de nuevo.";
  }
  if (!error?.response) {
    if (error?.code === "ERR_NETWORK") {
      return "No se pudo conectar con la API. Revisa que el servidor esté encendido y que el origen esté autorizado en CORS.";
    }
    return "Error inesperado al llamar a la API.";
  }
  const { status, data } = error.response;
  if (status === 400 && data && typeof data === "object") {
    const lines = Object.entries(data).map(([field, messages]) => `${field}: ${[].concat(messages).join(" ")}`);
    return `Datos no válidos. ${lines.join(" ")}`;
  }
  if (status === 404) return "El recurso ya no existe en el servidor.";
  if (status >= 500) return `La API falló (error ${status}). Intenta de nuevo en unos minutos.`;
  return `La API respondió con el estado ${status}.`;
}
