import ExcelJS from 'exceljs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function listMachines() {
  const workbook = new ExcelJS.Workbook();
  const filePath = path.join(__dirname, '..', 'data', 'seed-data', 'machines with location.xlsx');
  try {
    await workbook.xlsx.readFile(filePath);
  } catch (err) {
    console.error('Failed to read Excel file:', filePath, err.message || err);
    process.exit(1);
  }

  const sheet = workbook.getWorksheet(1);
  const machines = [];
  sheet.eachRow((row, i) => {
    if (i > 2) {
      const name = row.values[2];
      const loc = row.values[3];
      if (name) machines.push({ name: name.toString().trim(), location: loc ? loc.toString().trim() : 'Unknown' });
    }
  });

  console.log(JSON.stringify(machines, null, 2));
}

listMachines();
