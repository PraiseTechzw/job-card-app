import ExcelJS from 'exceljs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function count() {
  const workbook = new ExcelJS.Workbook();
  const filePath = path.join(__dirname, '..', 'data', 'seed-data', 'machines with location.xlsx');
  await workbook.xlsx.readFile(filePath);
  const sheet = workbook.getWorksheet(1);
  let c = 0;
  sheet.eachRow((row, i) => {
    if (i > 2) {
      const name = row.values[2];
      if (name) c++;
    }
  });
  console.log(c);
}
count();
