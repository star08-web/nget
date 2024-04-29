import { green } from 'colors';
import express from 'express';
import path from 'path';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { createWriteStream } from 'fs';
import * as history from './history';
import bodyParser from 'body-parser';
import axios from 'axios';
import https from 'https';
const getIp = require('get-ip');

const rootFolder:string = path.join(__dirname, '..');

export default function webui(port: number, folder: string, isbeta: boolean = false, version: string = '0.0.0') {
    process.chdir(folder);
    const app = express();
    const server = createServer(app);
    const io = new Server(server);
    app.set('view engine', 'ejs');
    app.set('views', path.join(__dirname, 'webUI', 'pages'))
    app.use(bodyParser.json());
    app.use(express.static(path.join(__dirname, 'webUI', 'public')));
    app.use(express.static(path.join(rootFolder, 'node_modules', 'socket.io', 'client-dist')));
    app.use(express.static(path.join(rootFolder, 'node_modules', 'uikit', 'dist')));

    app.get('/', (req, res) => {
        res.render('index');
    });
    
    app.post('/api/newdl', async (req, res) => {
        res.json({ status: 'ok' });
        io.emit('newdl-gotit')
        const { url, output, allowUnsafe } = req.body;
        if (!url.startsWith('https://') && !allowUnsafe) {
            io.emit('err','Unsafe downloads aren\'t allowed. tick the checkbox to enable unsafe downloads.');
            return
        }
        let axiosagent = null;
        if (allowUnsafe){
            axiosagent = new https.Agent({ rejectUnauthorized: false })
        } else {
            axiosagent = new https.Agent({ rejectUnauthorized: true });
        }
        let output_2:string;
        if (!output){
            output_2 = path.join(process.cwd(), path.basename(url));
        } else {
            output_2 = output;
        }
        try {
            const response = await axios.get(url, { responseType: 'stream', httpsAgent : axiosagent});
            const writer = createWriteStream(output_2);
            
            response.data.pipe(writer);
        
            let downloadedBytes = 0;
            const totalBytes = Number(response.headers['content-length']);
        
            response.data.on('data', (chunk: Buffer) => {
            downloadedBytes += chunk.length;
            const dlPercentage = Math.round((downloadedBytes / totalBytes) * 100);
            io.emit('dlinprg')
            io.emit('status', 'Downloading...')
            io.emit('filename', path.basename(url));
            io.emit('size', totalBytes);
            io.emit('progress', dlPercentage);
            });
            await new Promise((resolve, reject) => {
                writer.on('finish', () => {
                    io.emit('status', 'Downloaded file successfully :)');
                    history.add(path.basename(url), url, output_2, totalBytes);
                    io.emit('RDRSCSS')
                    io.emit('dldone')
                    resolve(NaN);
                });
                writer.on('error', (err: any) => {
                    io.emit('err', `writerError: ${err.message}`);
                    io.emit('dldone')
                    reject(err);
                });
            });
            
        } catch (err:any) {
            if (err.code === 'DEPTH_ZERO_SELF_SIGNED_CERT') {
                io.emit('err', 'Error: Self signed certificates are not allowed by default. tick the checkbox to enable unsafe downloads.');
            } else {
               io.emit('err', `Error: ${err.message}`);
            }
        }
    })

    app.get('/about', (req, res) => {
        const stat:string = isbeta ? 'Non-Production' : 'Stable';
        res.render('about', { "status":stat, "version":version });
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

    app.get('/api/currentstatus', (req, res) => {
        res.render('status');
    });

    server.listen(port, () => {
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
