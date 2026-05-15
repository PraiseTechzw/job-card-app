import ExcelJS from 'exceljs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const files = [
  'machines with location.xlsx',
  'location.xlsx',
  'Machine breakdown.xlsx',
  'Machine breakdown query.xlsx',
  'machineFault frequency.xlsx',
  'fault coding.xlsx',
  'production team.xlsx',
  'Artisan Names.xlsx',
];

async function inspectFile(fileName) {
  const workbook = new ExcelJS.Workbook();
  const filePath = path.join(__dirname, '..', 'data', 'seed-data', fileName);
  try {
    await workbook.xlsx.readFile(filePath);
  } catch (err) {
    console.log(`FILE: ${fileName}`);
    console.log(`  ERROR: ${err.message || err}`);
    return;
  }

  console.log(`FILE: ${fileName}`);
  console.log(`  SHEETS: ${workbook.worksheets.map((ws) => ws.name).join(' | ')}`);
  for (const sheet of workbook.worksheets.slice(0, 2)) {
    console.log(`  SHEET: ${sheet.name}`);
    const maxRows = Math.min(sheet.rowCount, 8);
    for (let r = 1; r <= maxRows; r++) {
      const row = sheet.getRow(r);
      console.log(`    R${r}: ${JSON.stringify(row.values)}`);
    }
  }
}

for (const fileName of files) {
  // eslint-disable-next-line no-await-in-loop
  await inspectFile(fileName);
}
