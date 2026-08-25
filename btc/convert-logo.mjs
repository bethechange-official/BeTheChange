import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createCanvas } from 'canvas';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { fileURLToPath as fu2, pathToFileURL } from 'url';
const workerPath = path.resolve(path.dirname(fu2(import.meta.url)), 'node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs');
GlobalWorkerOptions.workerSrc = pathToFileURL(workerPath).href;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pdfPath = path.resolve(__dirname, '../BeTheChange-logo.pdf');
const outPath = path.resolve(__dirname, 'public/logo.png');

const data = new Uint8Array(fs.readFileSync(pdfPath));
const pdf = await getDocument({ data, useWorkerFetch: false, isEvalSupported: false, useSystemFonts: true }).promise;
const page = await pdf.getPage(1);

const scale = 4;
const viewport = page.getViewport({ scale });

const canvas = createCanvas(viewport.width, viewport.height);
const ctx = canvas.getContext('2d');

await page.render({ canvasContext: ctx, viewport }).promise;

const buffer = canvas.toBuffer('image/png');
fs.writeFileSync(outPath, buffer);
console.log(`Logo saved: ${outPath} (${Math.round(viewport.width)}x${Math.round(viewport.height)})`);
