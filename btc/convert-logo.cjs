const fs = require('fs');
const path = require('path');

async function convertPdfToPng() {
  const { createRequire } = require('module');
  // pdfjs-dist v4+ is ESM only — use dynamic import
  const { getDocument } = await import('pdfjs-dist');
  const { createCanvas } = require('canvas');

  const pdfPath = path.resolve(__dirname, '../BeTheChange-logo.pdf');
  const outPath = path.resolve(__dirname, 'public/logo.png');

  const data = new Uint8Array(fs.readFileSync(pdfPath));
  const pdf = await getDocument({ data }).promise;
  const page = await pdf.getPage(1);

  const scale = 4; // high resolution
  const viewport = page.getViewport({ scale });

  const canvas = createCanvas(viewport.width, viewport.height);
  const ctx = canvas.getContext('2d');

  await page.render({ canvasContext: ctx, viewport }).promise;

  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(outPath, buffer);
  console.log(`Logo saved to ${outPath} (${viewport.width}x${viewport.height})`);
}

convertPdfToPng().catch(console.error);
