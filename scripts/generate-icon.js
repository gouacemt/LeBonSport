/**
 * Génère assets/images/icon.png — icône d'app 1024x1024, opaque (pas de canal alpha),
 * sans coins arrondis (Apple applique son propre masque).
 * Fond dégradé vert LeBonSport + monogramme « LBS » blanc.
 *
 * Usage : node scripts/generate-icon.js
 */
const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

const W = 1024;
const H = 1024;

const GRAD_A = [46, 204, 143]; // #2ECC8F (haut-gauche)
const GRAD_B = [11, 125, 74]; // #0B7D4A (bas-droite)
const WHITE = [255, 255, 255];

const png = new PNG({ width: W, height: H, colorType: 2, inputColorType: 6, bitDepth: 8 });
const data = png.data;

// --- Fond : dégradé diagonal + léger vignettage ---
const cx = W / 2;
const cy = H / 2;
const maxD = Math.hypot(cx, cy);
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const t = (x / (W - 1) + y / (H - 1)) / 2;
    const vig = 1 - 0.12 * (Math.hypot(x - cx, y - cy) / maxD);
    const i = (y * W + x) * 4;
    data[i] = Math.round((GRAD_A[0] + (GRAD_B[0] - GRAD_A[0]) * t) * vig);
    data[i + 1] = Math.round((GRAD_A[1] + (GRAD_B[1] - GRAD_A[1]) * t) * vig);
    data[i + 2] = Math.round((GRAD_A[2] + (GRAD_B[2] - GRAD_A[2]) * t) * vig);
    data[i + 3] = 255;
  }
}

// --- Pinceau rond anti-aliasé ---
function plot(px, py, r, col, alpha = 1) {
  const x0 = Math.max(0, Math.floor(px - r - 1));
  const x1 = Math.min(W - 1, Math.ceil(px + r + 1));
  const y0 = Math.max(0, Math.floor(py - r - 1));
  const y1 = Math.min(H - 1, Math.ceil(py + r + 1));
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      const d = Math.hypot(x - px, y - py);
      const cov = Math.min(1, Math.max(0, r + 0.5 - d)) * alpha;
      if (cov <= 0) continue;
      const i = (y * W + x) * 4;
      data[i] = Math.round(data[i] * (1 - cov) + col[0] * cov);
      data[i + 1] = Math.round(data[i + 1] * (1 - cov) + col[1] * cov);
      data[i + 2] = Math.round(data[i + 2] * (1 - cov) + col[2] * cov);
      data[i + 3] = 255;
    }
  }
}

function seg(a, b, r, col, alpha) {
  const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
  const n = Math.max(1, Math.ceil(len / 1.2));
  for (let k = 0; k <= n; k++) {
    const tt = k / n;
    plot(a[0] + (b[0] - a[0]) * tt, a[1] + (b[1] - a[1]) * tt, r, col, alpha);
  }
}

function drawPath(pts, r, col, alpha) {
  for (let k = 0; k < pts.length - 1; k++) seg(pts[k], pts[k + 1], r, col, alpha);
}

function offset(pts, ox, oy) {
  return pts.map(([x, y]) => [x + ox, y + oy]);
}

// --- Monogramme « LBS » ---
const LH = 384; // hauteur des lettres
const R = 34; // rayon du trait (~68px d'épaisseur)
const Lw = 190;
const Bw = 250;
const Sw = 225;
const GAP = 76;
const total = Lw + GAP + Bw + GAP + Sw;
const startX = Math.round((W - total) / 2);
const topY = Math.round((H - LH) / 2);

// Ombre portée douce (décalée), puis lettres blanches
function letters(dx, dy, col, alpha) {
  let ox = startX + dx;
  // L
  drawPath(offset([[0, 0], [0, LH], [Lw, LH]], ox, topY + dy), R, col, alpha);
  ox += Lw + GAP;
  // B
  const bx = ox;
  drawPath(offset([[0, 0], [0, LH]], bx, topY + dy), R, col, alpha);
  drawPath(
    offset([[0, 0], [Bw - 55, 0], [Bw, 70], [Bw, LH / 2 - 70], [Bw - 55, LH / 2], [0, LH / 2]], bx, topY + dy),
    R,
    col,
    alpha,
  );
  drawPath(
    offset([[0, LH / 2], [Bw - 45, LH / 2], [Bw, LH / 2 + 70], [Bw, LH - 70], [Bw - 55, LH], [0, LH]], bx, topY + dy),
    R,
    col,
    alpha,
  );
  ox += Bw + GAP;
  // S
  const sx = ox;
  drawPath(
    offset(
      [
        [Sw, 60],
        [Sw - 60, 8],
        [45, 20],
        [6, LH * 0.3],
        [55, LH / 2 - 6],
        [Sw - 55, LH / 2 + 6],
        [Sw - 6, LH * 0.7],
        [Sw - 45, LH - 20],
        [60, LH - 8],
        [0, LH - 70],
      ],
      sx,
      topY + dy,
    ),
    R,
    col,
    alpha,
  );
}

letters(0, 16, [6, 60, 38], 0.28); // ombre
letters(0, 0, WHITE, 1); // monogramme

const outPath = path.join(__dirname, '..', 'assets', 'images', 'icon.png');
png.pack().pipe(fs.createWriteStream(outPath)).on('finish', () => {
  const buf = fs.readFileSync(outPath);
  console.log('Écrit :', outPath);
  console.log('Taille :', buf.length, 'octets');
  console.log('IHDR color type :', buf[25], buf[25] === 2 ? '(RGB, pas d\'alpha ✔)' : '(⚠ alpha présent)');
});
