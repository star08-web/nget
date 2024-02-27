import { Command } from 'commander';
import dl from './dl-cli';
import webUI from './webui';
import path from 'path';

const program = new Command();
program
  .name('nget')
  .description('A simple tool to download files from the internet \\ (•◡•) /')
  .version('Nget Version 1.0.0 (STABLE)');

program.command('get')
    .description('Download a file from the internet')
    .argument('<url>', 'URL of the file to download')
    .option('-o, --output <output>', 'Output file')
    .option('--allow-unsafe', 'Allow unsafe downloads (e.g. http://, self signed certificates, etc.)')
    .action(async function(url, options) {
      dl(url, options.output || path.join(process.cwd(), path.basename(url)), options.allowUnsafe || false);
})

program.command('webUI')
    .description('Open the web UI to use Nget remotely')
    .option('-p, --port <port>', 'Port to run the server on')
    .action(async function(options) {
      process.chdir(__dirname);
      const port = options.port || 8080;
      webUI(port);
})

program.parse();