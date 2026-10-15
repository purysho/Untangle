import { makePassages, type Passage } from "./retrieval";
export async function importKnowledge(file: File): Promise<Passage[]> {
  if (file.size > 20 * 1024 * 1024)
    throw new Error("Choose a file smaller than 20 MB.");
  if (/\.(txt|md)$/i.test(file.name))
    return makePassages(file.name, await file.text());
  if (!/\.pdf$/i.test(file.name))
    throw new Error("Choose a PDF, TXT or Markdown file.");
  const pdfjs = await import("pdfjs-dist");
  const worker = await import("pdfjs-dist/build/pdf.worker.min.mjs?url");
  pdfjs.GlobalWorkerOptions.workerSrc = worker.default;
  const loading = pdfjs.getDocument({
    data: new Uint8Array(await file.arrayBuffer()),
    useWorkerFetch: false,
  });
  const pdf = await loading.promise;
  const passages: Passage[] = [];
  let total = 0;
  try {
    if (pdf.numPages > 100)
      throw new Error("Use a PDF with at most 100 pages.");
    for (let n = 1; n <= pdf.numPages; n++) {
      const page = await pdf.getPage(n);
      const content = await page.getTextContent();
      const text = content.items
        .map((item) => ("str" in item ? item.str : ""))
        .join(" ");
      total += text.length;
      if (total > 200000)
        throw new Error(
          "PDF text exceeds 200,000 characters. Import a shorter section.",
        );
      passages.push(...makePassages(file.name, text, n));
      page.cleanup();
    }
  } finally {
    await loading.destroy();
  }
  if (!passages.length)
    throw new Error("No text found. Scanned PDFs need OCR before importing.");
  return passages;
}
