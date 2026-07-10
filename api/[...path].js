const server = require('../dist/server.cjs');
const app = server.default || server;
module.exports = app;
