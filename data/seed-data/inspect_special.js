import ExcelJS from 'exceljs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function inspectSpecial() {
  const files = ['machines with location.xlsx', 'fault coding.xlsx'];
  for (const f of files) {
    console.log(`\n--- Inspecting ${f} ---`);
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(path.join(__dirname, f));
    workbook.eachSheet((sheet) => {
      console.log(`Sheet: ${sheet.name}`);
      const rows = [];
      sheet.eachRow((row, i) => { if (i <= 5) rows.push(row.values); });
      console.log(rows);
    });
  }
}

inspectSpecial();
