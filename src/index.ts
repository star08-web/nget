import { Command } from 'commander';
import dl from './dl-cli';
import webUI from './webui';

const program = new Command();
program
  .name('nget')
  .description('A simple tool to download files from the internet \\ (•◡•) /')
  .version('NGet Version 1.0.0 (STABLE)');

program.command('get')
    .description('Download a file from the internet')
    .argument('<url>', 'URL of the file to download')
    .option('-o, --output <output>', 'Output file')
    .action(async function(url, options) {
      process.chdir(__dirname);
      dl(url, options.output);
})

program.command('webUI')
    .description('Open the web UI to use NGet remotely')
    .option('-p, --port <port>', 'Port to run the server on')
    .action(async function(options) {
      process.chdir(__dirname);
      const port = options.port || 8080;
      webUI(port);
})

program.parse();