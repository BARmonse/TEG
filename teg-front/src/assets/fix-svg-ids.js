const fs = require('fs');
const path = require('path');

// Your backend country list
const countries = [
  'ALASKA', 'CANADA', 'GROENLANDIA', 'OREGON', 'TERRANOVA', 'CALIFORNIA', 'MEXICO', 'NUEVA_YORK', 'QUEBEC',
  'VENEZUELA', 'COLOMBIA', 'ECUADOR', 'PERU', 'BRASIL', 'BOLIVIA', 'ARGENTINA', 'CHILE', 'URUGUAY',
  'ISLANDIA', 'GRAN_BRETANA', 'ESPANA', 'FRANCIA', 'ALEMANIA', 'ITALIA', 'POLONIA', 'UCRANIA', 'RUSIA',
  'MARRUECOS', 'EGIPTO', 'LIBIA', 'SUDAN', 'ETIOPIA', 'ZAIRE', 'NIGERIA', 'SUDAFRICA',
  'ARABIA', 'INDIA', 'CHINA', 'MONGOLIA', 'SIBERIA', 'TAILANDIA', 'JAPON', 'COREA',
  'INDONESIA', 'NUEVA_GUINEA', 'AUSTRALIA', 'NUEVA_ZELANDA', 'TURQUIA', 'IRAN', 'ARABIA_SAUDITA'
];

// Helper to normalize SVG IDs to backend format
function normalizeId(str) {
  return str
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/ /g, '_')
    .replace(/ñ/gi, 'N')
    .replace(/á/gi, 'A')
    .replace(/é/gi, 'E')
    .replace(/í/gi, 'I')
    .replace(/ó/gi, 'O')
    .replace(/ú/gi, 'U')
    .toUpperCase();
}

// Read SVG
const svgPath = path.resolve(__dirname, 'teg.map.svg');
let svg = fs.readFileSync(svgPath, 'utf8');

// Find all id="..." in the SVG
svg = svg.replace(/id="([^"]+)"/g, (match, p1) => {
  const norm = normalizeId(p1);
  if (countries.includes(norm)) {
    return `id="${norm}"`;
  }
  return match;
});

// Also update references to those IDs (e.g., xlink:href="#Argentina")
svg = svg.replace(/xlink:href="#([^"]+)"/g, (match, p1) => {
  const norm = normalizeId(p1);
  if (countries.includes(norm)) {
    return `xlink:href="#${norm}"`;
  }
  return match;
});

// Write back to SVG
fs.writeFileSync(svgPath, svg, 'utf8');
console.log('SVG country IDs updated!');