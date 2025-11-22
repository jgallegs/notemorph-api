import path from "path";
import fs from "fs/promises";
import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

const SOFFICE_PATH = "/usr/bin/soffice"; // LibreOffice en Linux

export async function pdfToDocx(inputPath: string): Promise<string> {
  const inputDir = path.dirname(inputPath);
  const inputBaseName = path.basename(inputPath, path.extname(inputPath));
  const outputDir = inputDir;

  const args = [
    "--headless",
    "--convert-to",
    "docx",
    "--outdir",
    outputDir,
    inputPath
  ];

  console.log("Lanzando LibreOffice:", SOFFICE_PATH, args);

  const { stdout, stderr } = await execFileAsync(SOFFICE_PATH, args);

  if (stderr && stderr.trim().length > 0) {
    console.warn("LibreOffice stderr:", stderr);
  }
  console.log("LibreOffice stdout:", stdout);

  const outputPath = path.join(outputDir, `${inputBaseName}.docx`);

  await fs.access(outputPath); // asegurar que existe

  return outputPath;
}
