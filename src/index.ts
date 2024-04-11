#! /usr/bin/env node
import { Command } from 'commander';
import dl from './dl-cli';
import webUI from './webui';
import path from 'path';
import getAppDataPath from "appdata-path"
import { existsSync, mkdirSync } from 'fs';
const program = new Command()



program
  .name('nget')
  .description('A simple tool to download files from the internet \\ (•◡•) /')
  .version('Nget Version 1.0.1 (STABLE)');

program.command('get')
    .description('Download a file from the internet')
    .argument('<url>', 'URL of the file to download')
    .option('-o, --output <output>', 'Output file')
    .option('--allow-unsafe', 'Allow unsafe downloads (e.g. http://, self signed certificates, etc.)')
    .action(async function(url, options) {
      dl(url, options.output || path.join(process.cwd(), path.basename(url)), options.allowUnsafe || false);
})
const webui_folder_template = getAppDataPath('star08-web/nget/downloads');
if (!existsSync(webui_folder_template)) {
  mkdirSync(webui_folder_template, { recursive: true });
} 

program.command('webUI')
    .description('Open the web UI to use Nget remotely')
    .option('-p, --port <port>', 'Port to run the server on')
    .option('--folder <folder>', `Folder to store the downloaded files (defaults to: ${webui_folder_template})`)
    .action(async function(options) {
      process.chdir(__dirname);
      const port = options.port || 8080;
      const folder = options.folder || webui_folder_template;
      webUI(port, folder);
})

program.command('history')
    .description('View and manage the download history')
    .option('-c, --clear', 'Clear the download history')
    .action(async function(options) {
      const history = require('./history');
      if (options.clear) {
        history.clear();
        console.log('History cleared');
        return;
      }
      console.log('History:');
      console.log('========');
      console.log();
      const downloads = history.get(); 
      if (downloads.length === 0) {
        console.log('Oh, wow... such an empty history! maybe you should download something ¯\\_(ツ)_/¯');
        return;
      }
      downloads.forEach((item: any) => {
        console.log(`File: ${item.title}`);
        console.log(`URL: ${item.url}`);
        console.log(`Output: ${item.output}`);
        console.log(`Size: ${item.size} bytes`);
        console.log();
      });
})

program.parse();