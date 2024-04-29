import axios from "axios";
const endpoint:string = 'https://api.github.com/repos/star08-web/nget/releases/latest'


export default async function cfu(fromver:string) {
    const { data } = await axios.get(endpoint);
    const prerelease:boolean = data.prerelease;
    const latest:string = data.tag_name.replace(/-/g, '');
    const fromVersion:string = fromver.replace(/-/g, '');
    if (latest.includes(fromVersion) && !prerelease) {
        console.log(`New version available: ${latest}`);
        console.log('Please update by running `npm i -g nget`');
        console.log();
    }
}

export async function getLatest() {
    const { data } = await axios.get(endpoint);
    const prerelease:boolean = data.prerelease;
    const latest:string = data.tag_name;
    const author:string = data.author.login;
    const info:string = data.html_url;
    const date:string = data.published_at;
    let status:string;
    if (prerelease) {
        status = 'Prerelease';
    } else {
        status = 'Stable version';
    }
    console.log(`====================`);
    console.log(`Latest version: ${latest} (${status})`);
    console.log(`Published by: ${author}`);
    console.log(`Release info: ${info}`);
    console.log(`Published at: ${new Date(date).toUTCString()}`)
    console.log(`====================`);
}