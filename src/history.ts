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
  const historyData:object[] = Object(db.get("history"));
  const elements:object[] = [];
  historyData.forEach((element: any) => {
    if (existsSync(element.output)) {
      elements.push(element);
    } else {
      element.output = element.output + " [Missing]";
      elements.push(element);
    }
  })
  return elements;
}

export function add(title:string, url: string, output: string, size: number) {
  db.push("history", {
      title: title,
      url: url, 
      output: output, 
      size: size, 
      date: new Date().toLocaleString()
    });
}

export function clear() {
  db.delete("history");
  db.set("history", []);
  return true;
}