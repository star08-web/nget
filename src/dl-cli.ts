import axios from 'axios';
import { createWriteStream } from 'fs';
import ora from 'ora-classic';
import path from 'path';

export default async function dl(url: string, output: string | undefined){
    console.log(`Downloading ${path.basename(url)}...`);
    const spinner = ora('0%').start();
    try {
        const response = await axios.get(url, { responseType: 'stream' });
        const writer = createWriteStream(output || path.basename(url));
        
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
                resolve;
            });
            writer.on('error', (err: any) => {
                spinner.fail('Failed to download file :(');
                reject(err);
            });
        });
    } catch (err) {
        spinner.fail('Failed to download file :(');
        throw err;
    }
}
