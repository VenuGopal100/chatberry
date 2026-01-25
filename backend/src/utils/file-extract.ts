import * as mammoth from "mammoth";

export async function extractTextFromFile(file: Express.Multer.File) {
  const name = file.originalname.toLowerCase();

  // Plain text-like files
  if (
    name.endsWith(".txt") ||
    name.endsWith(".md") ||
    name.endsWith(".csv") ||
    name.endsWith(".json")
  ) {
    return file.buffer.toString("utf-8");
  }

  // DOCX
  if (name.endsWith(".docx")) {
    const result = await mammoth.extractRawText({ buffer: file.buffer });
    return result.value || "";
  }

  throw new Error("Unsupported file type. Use .txt, .md, .csv, .json, .docx");
}
