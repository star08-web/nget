import axios from 'axios';
import { createWriteStream } from 'fs';
import ora from 'ora-classic';
import path from 'path';
import https from 'https';
import * as history from './history';

export default async function dl(url: string, output: string, allowUnsafe: boolean) {
    if (!url.startsWith('https://') && !allowUnsafe) {
        console.log('Unsafe downloads are not allowed. Use --allow-unsafe to allow them.');
        process.exit(1);
    }
    let axiosagent = null;
    if (allowUnsafe){
        axiosagent = new https.Agent({ rejectUnauthorized: false })
    } else {
        axiosagent = new https.Agent({ rejectUnauthorized: true });
    }
    console.log(`Downloading ${path.basename(url)}...`);
    const spinner = ora('0%').start();
    try {
        const response = await axios.get(url, { responseType: 'stream', httpsAgent : axiosagent});
        const writer = createWriteStream(output);
        
        response.data.pipe(writer);

        let downloadedBytes = 0;
        const totalBytes = Number(response.headers['content-length']);

        response.data.on('data', (chunk: Buffer) => {
            downloadedBytes += chunk.length;
            const dlPercentage = Math.round((downloadedBytes / totalBytes) * 100);
            spinner.text = `${dlPercentage}%`;
        });

        await new Promise((resolve, reject) => {
            writer.on('finish', () => {
                spinner.succeed('Downloaded file successfully :)');
                history.add(path.basename(url), url, output, totalBytes);
                resolve(NaN);
            });
            writer.on('error', (err: any) => {
                spinner.fail('Failed to download file :(');
                reject(err);
            });
        });
    } catch (err:any) {
        spinner.fail('Failed to download file :(');
        if (err.code === 'DEPTH_ZERO_SELF_SIGNED_CERT') {
            console.log('Error: Self signed certificates are not allowed by default');
            console.log('Try using --allow-unsafe to allow unsafe downloads');
        } else {
            console.log(`Error: ${err.message}`);
        }
    }
}