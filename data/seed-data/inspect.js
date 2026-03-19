import ExcelJS from 'exceljs';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const files = fs.readdirSync(__dirname).filter(f => f.endsWith('.xlsx'));

async function inspect() {
  for (const f of files) {
    console.log(`\n--- Inspecting ${f} ---`);
    const workbook = new ExcelJS.Workbook();
    try {
      await workbook.xlsx.readFile(path.join(__dirname, f));
      workbook.eachSheet((sheet, id) => {
        console.log(`Sheet: ${sheet.name}`);
        const rows = [];
        sheet.eachRow((row, rowNumber) => {
          if (rowNumber <= 5) {
            rows.push(row.values);
          }
        });
        console.log(`First 5 rows:`);
        console.log(rows);
      });
    } catch (err) {
      console.error(`Failed to read ${f}:`, err.message);
    }
  }
}

inspect();
