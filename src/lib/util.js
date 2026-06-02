import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname } from 'node:path';

const ESC = String.fromCharCode(27); // ANSI escape
const noColor = Boolean(process.env.NO_COLOR) || !process.stdout.isTTY;
const wrap = (code) => (s) => (noColor ? String(s) : `${ESC}[${code}m${s}${ESC}[0m`);

export const c = {
  red: wrap('31'),
  green: wrap('32'),
  yellow: wrap('33'),
  blue: wrap('34'),
  cyan: wrap('36'),
  gray: wrap('90'),
  bold: wrap('1'),
};

export function ensureDir(filePath) {
  mkdirSync(dirname(filePath), { recursive: true });
}

export function writeText(filePath, text) {
  ensureDir(filePath);
  writeFileSync(filePath, text);
}

export function writeJSON(filePath, obj) {
  writeText(filePath, JSON.stringify(obj, null, 2) + '\n');
}

export function readJSON(filePath) {
  return JSON.parse(readFileSync(filePath, 'utf8'));
}

export const exists = (p) => existsSync(p);
