const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
require('dotenv').config();

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev: false });
const handle = app.getRequestHandler();

console.log('> Starting Next.js in PRODUCTION mode...');

app.prepare().then(() => {
    createServer((req, res) => {
        const parsedUrl = parse(req.url, true);
        handle(req, res, parsedUrl);
    }).listen(process.env.PORT || 3000, (err) => {
        if (err) throw err;
        console.log('> Ready on http://localhost:' + (process.env.PORT || 3000));
    });
});
