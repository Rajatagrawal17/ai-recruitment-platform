/**
 * PDF Parser Utility
 * Dynamically loads pdfjs-dist only when a CV/Resume upload is triggered,
 * keeping it completely out of the initial application bundle.
 */
export const parsePDF = async (file) => {
  console.log("📄 [PDF Parser] Initializing dynamic load of pdfjs-dist...");
  const startTime = performance.now();

  try {
    // Dynamically import pdfjs-dist
    const pdfjs = await import("pdfjs-dist/build/pdf");
    
    // Set worker source dynamically
    const pdfjsWorker = await import("pdfjs-dist/build/pdf.worker.entry");
    pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;

    console.log(`🚀 [PDF Parser] pdfjs-dist successfully loaded in ${(performance.now() - startTime).toFixed(1)}ms`);

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
    
    let text = "";
    const numPages = pdf.numPages;
    console.log(`📄 [PDF Parser] PDF contains ${numPages} pages. Extracting text...`);

    for (let i = 1; i <= numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const strings = content.items.map((item) => item.str);
      text += strings.join(" ") + "\n";
    }

    console.log(`✅ [PDF Parser] Text extraction complete. Extracted ${text.length} characters.`);
    return {
      success: true,
      text,
      pages: numPages,
    };
  } catch (error) {
    console.warn("⚠️ [PDF Parser] Error loading or executing pdfjs-dist. Falling back to local file upload...", error);
    
    // Fallback to basic details if library fails to load or parse (safe fallback)
    return {
      success: false,
      text: `Fallback: Resume file ${file.name} uploaded.`,
      pages: 1,
      error: error.message,
    };
  }
};
