import xlsx from 'xlsx';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.join(__dirname, '../data-source/WORLD CUP QUIZ_2026.xlsx');
try {
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });
  console.log("Headers (Row 1):", data[0]);
  console.log("First Data Row (Row 2):", data[1]);
} catch (err) {
  console.error("Error reading file:", err.message);
}
