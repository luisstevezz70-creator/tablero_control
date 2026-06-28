// ------------------------------------------------------------------
// Shim de window.storage (sólo para correr este proyecto fuera de Claude).
// Reproduce la misma firma get/set que usa el componente del tablero,
// respaldado en localStorage del navegador.
// ------------------------------------------------------------------
if (!window.storage) {
  window.storage = {
    async get(key) {
      const raw = localStorage.getItem(key);
      if (raw === null) throw new Error(`Key not found: ${key}`);
      return { key, value: raw };
    },
    async set(key, value) {
      localStorage.setItem(key, value);
      return { key, value };
    },
    async delete(key) {
      localStorage.removeItem(key);
      return { key, deleted: true };
    },
    async list(prefix = "") {
      const keys = Object.keys(localStorage).filter((k) => k.startsWith(prefix));
      return { keys };
    },
  };
}
