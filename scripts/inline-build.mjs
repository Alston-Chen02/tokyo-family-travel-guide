import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const htmlPath = resolve(root, 'dist/index.html');
let html = await readFile(htmlPath, 'utf8');

const scriptTag = html.match(/<script type="module"[^>]*src="([^"]+)"[^>]*><\/script>/);
const styleTag = html.match(/<link rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/);
if (!scriptTag || !styleTag) throw new Error('Expected Vite JavaScript and CSS assets were not found.');

const assetPath = url => resolve(root, 'dist', url.replace(/^\/tokyo-family-travel-guide\//, ''));
const script = await readFile(assetPath(scriptTag[1]));
const style = (await readFile(assetPath(styleTag[1]), 'utf8')).replace(/<\/style/gi, '<\\/style');

html = html.replace(scriptTag[0], () => `<script type="module" src="data:text/javascript;base64,${script.toString('base64')}"></script>`);
html = html.replace(styleTag[0], () => `<style>${style}</style>`);
await writeFile(htmlPath, html);
