import fs from "fs";
import { FILESYSTEM_ENCODING } from "../constants";

export function dirExists(path: string) {
    return fs.existsSync(path) && isDir(path);
}

export function fileExists(path: string) {
    return fs.existsSync(path) && isFile(path);
}

export function isDir(path: string) {
    return fs.lstatSync(path).isDirectory();
}

export function isFile(path: string) {
    return fs.lstatSync(path).isFile();
}

export function createDirIfNotExists(dir: string) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }
}

export function readFile(path: string) {
    return fs.readFileSync(path, FILESYSTEM_ENCODING);
}

export function writeFile(path: string, content: string) {
    fs.writeFileSync(path, content);
}

export function listFiles(path: string): string[] {
    const files = fs.readdirSync(path, { withFileTypes: true });
    return files.filter((f) => f.isFile()).map((f) => f.name);
}

export function listDirs(path: string): string[] {
    const files = fs.readdirSync(path, { withFileTypes: true });
    return files.filter((d) => d.isDirectory()).map((d) => d.name);
}
