import { createApp } from './app.js';

const port = process.env.PORT || 4000;

const app = createApp();

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Elite Portal API in ascolto sulla porta ${port}`);
});
