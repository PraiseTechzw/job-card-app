import ExcelJS from 'exceljs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const files = [
  { file: 'machines with location.xlsx', column: 2, startRow: 3 },
  { file: 'Machine breakdown.xlsx', column: 4, startRow: 3 },
  { file: 'Machine breakdown query.xlsx', column: 2, startRow: 5 },
  { file: 'machineFault frequency.xlsx', column: 2, startRow: 4 },
];

const values = new Set();

function clean(v) {
  return String(v || '').trim().replace(/\s+/g, ' ');
}

for (const item of files) {
  const workbook = new ExcelJS.Workbook();
  const filePath = path.join(__dirname, '..', 'data', 'seed-data', item.file);
  try {
    await workbook.xlsx.readFile(filePath);
  } catch (err) {
    console.log(`FILE: ${item.file} ERROR: ${err.message || err}`);
    continue;
  }
  const sheet = workbook.getWorksheet(1);
  sheet.eachRow((row, i) => {
    if (i >= item.startRow) {
      const raw = row.values[item.column];
      const name = clean(raw);
      if (name && name !== 'MachineNAME' && name !== 'Machine') values.add(name);
    }
  });
}

const machines = Array.from(values).sort((a, b) => a.localeCompare(b));
console.log(`COUNT=${machines.length}`);
console.log(JSON.stringify(machines.slice(0, 200), null, 2));
