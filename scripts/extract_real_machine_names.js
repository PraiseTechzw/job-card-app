import ExcelJS from 'exceljs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sources = [
  { file: 'machines with location.xlsx', sheet: 1, startRow: 3, col: 2 },
  { file: 'Machine breakdown.xlsx', sheet: 1, startRow: 3, col: 4 },
  { file: 'Machine breakdown query.xlsx', sheet: 1, startRow: 5, col: 2 },
  { file: 'machineFault frequency.xlsx', sheet: 1, startRow: 4, col: 2 },
];

const set = new Map();

function clean(value) {
  return String(value || '').trim().replace(/\s+/g, ' ');
}

for (const source of sources) {
  const workbook = new ExcelJS.Workbook();
  const filePath = path.join(__dirname, '..', 'data', 'seed-data', source.file);
  await workbook.xlsx.readFile(filePath);
  const sheet = workbook.getWorksheet(source.sheet);
  sheet.eachRow((row, i) => {
    if (i >= source.startRow) {
      const value = clean(row.getCell(source.col).value);
      if (value) {
        set.set(value.toLowerCase(), value);
      }
    }
  });
}

const names = Array.from(set.values()).sort((a, b) => a.localeCompare(b));
console.log(`COUNT=${names.length}`);
for (const name of names.slice(0, 300)) {
  console.log(name);
}
