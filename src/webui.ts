import { green } from 'colors';
import express from 'express';
import path from 'path';

export default function webui(port: number) {
    const app = express();
    const ip = getuserIP();
    app.set('view engine', 'ejs');
    app.use(express.static(path.join(__dirname, 'webUI', 'public')));
    app.get('/', (req, res) => {
        res.render('webUI/pages/index')
    });
    app.listen(port, () => {
        console.log(`
${green(`======================================================`)}
  ${green(`Web UI running at port ${port}`)}
  local address: http://localhost:${port}
  network address: http://${ip[1]}:${port}
${green(`======================================================`)}
    `);
});
}

function getuserIP(){
    const { networkInterfaces } = require('os');
    const nets = networkInterfaces();
    const results = Object.create(null);

    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            if (net.family === 'IPv4' && !net.internal) {
                if (!results[name]) {
                    results[name] = [];
                }
                results[name].push(net.address);
            }
        }
    }
    return results;
}

