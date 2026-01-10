/* Semplice wrapper di logging; in produzione usare una libreria come pino o winston */

export const logger = {
  info: (meta: any, message?: string) => {
    if (message) {
      console.log('[INFO]', message, JSON.stringify(meta));
    } else {
      console.log('[INFO]', JSON.stringify(meta));
    }
  },
  error: (meta: any, message?: string) => {
    if (message) {
      console.error('[ERROR]', message, JSON.stringify(meta));
    } else {
      console.error('[ERROR]', JSON.stringify(meta));
    }
  },
};
