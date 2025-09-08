import http from 'http';
import { CONFIG } from './config/env.js';

const PORT = CONFIG.app.port;

const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('My first Node.js server is running!\n');
});

server.listen(PORT, () => {
    console.log(`Server is listening on: http://localhost:${PORT}`);
});