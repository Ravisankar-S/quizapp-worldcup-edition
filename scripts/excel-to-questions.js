import xlsx from 'xlsx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputPath = path.join(__dirname, '../data-source/WORLD CUP QUIZ_2026.xlsx');
const outputPath = path.join(__dirname, '../src/data/questions.ts');

try {
  console.log(`Reading Excel file from: ${inputPath}`);
  const workbook = xlsx.readFile(inputPath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rows = xlsx.utils.sheet_to_json(sheet);

  const questions = rows.map((row, index) => {
    // Helper to clean up any weird whitespace (like \t) from Excel cells
    const cleanStr = (val) => val != null ? String(val).trim() : '';
    
    // The Excel file has 'Correct_Option' as 1-based (e.g., 3 for Option3)
    // We convert it to a 0-based array index (0, 1, or 2)
    const correctOptionRaw = parseInt(row.Correct_Option, 10);
    const correctIndex = isNaN(correctOptionRaw) ? 0 : correctOptionRaw - 1;

    return {
      id: index + 1,
      text: cleanStr(row.question),
      options: [
        cleanStr(row.Option1),
        cleanStr(row.Option2),
        cleanStr(row.Option3)
      ],
      correctAnswerIndex: correctIndex
    };
  });

  const tsContent = `export interface Question {
  id: number;
  text: string;
  options: string[];
  correctAnswerIndex: number;
}

export const QUESTIONS: Question[] = ${JSON.stringify(questions, null, 2)};
`;

  // Ensure src/data exists
  const srcDataDir = path.dirname(outputPath);
  if (!fs.existsSync(srcDataDir)) {
    fs.mkdirSync(srcDataDir, { recursive: true });
  }

  fs.writeFileSync(outputPath, tsContent, 'utf-8');
  console.log(`Successfully generated ${questions.length} questions to ${outputPath}`);
} catch (err) {
  console.error("Error generating questions:", err.message);
  process.exit(1);
}
