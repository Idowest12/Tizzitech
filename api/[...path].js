import server from '../dist/server.cjs';
const app = server.default || server;

export const config = {
  api: {
    bodyParser: false,
  },
};

export default app;
