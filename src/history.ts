import EasyJsonDB from "easy-json-database";
import path from "path";
import getAppDataPath from "appdata-path";
const hpath = getAppDataPath("star08-web/nget");
import {existsSync, mkdirSync} from "fs";
if (!existsSync(hpath)) {
  mkdirSync(hpath, {recursive: true});
}
const database = EasyJsonDB;
const db = new database(path.join(hpath, "history.json"));
if (!db.has("history")) {
  db.set("history", []);
}

export function get(){
  const historyData = db.get("history");
  return historyData;
}

export function add(title:string, url: string, output: string, size: number) {
  db.push("history", {title: title, url: url, output: output, size: size, date: new Date().toLocaleString()});
}

export function clear() {
  db.delete("history");
  db.set("history", []);
  return true;
}