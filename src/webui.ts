import { green } from 'colors';
import express from 'express';
import path from 'path';
import * as history from './history';
import bodyParser from 'body-parser';
const getIp = require('get-ip');

export default function webui(port: number) {
    const app = express();
    app.set('view engine', 'ejs');
    app.set('views', path.join(__dirname, 'webUI', 'pages'))
    app.use(bodyParser.json());
    app.use(express.static(path.join(__dirname, 'webUI', 'public')));
    app.get('/', (req, res) => {
        res.render('index')
    });
    app.get('/about', (req, res) => {
        res.render('about')
    });
    app.get('/api/history', (req, res) => {
        const historyData = history.get();
        res.json(historyData);
    });
    app.delete('/api/history', (req, res) => {
        const deleted = history.clear();
        if (deleted) {
            res.status(204).end();
        } else {
            res.status(500).json({ error: 'Failed to clear history' });
        }
    });
    app.post('/api/createdl', express.json(), (req, res) => {
        
    });
    app.listen(port, () => {
    const iplist = getIp(); 
        console.log(`
${green(`======================================================`)}
  ${green(`Web UI running at port ${port}`)}
  local address: http://localhost:${port}
  network address: http://${iplist[0]}:${port}
${green(`======================================================`)}
    `);
});
}