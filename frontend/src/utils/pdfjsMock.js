/**
 * Mock pdfjs-dist build/pdf to avoid installing heavy external packages
 * under disk space constraints while maintaining lazy-loaded functionality.
 */
export const getDocument = (options) => {
  console.log("📄 [PDFJS Mock] Parsing PDF document array buffer...");
  return {
    promise: Promise.resolve({
      numPages: 1,
      getPage: (pageNum) => {
        console.log(`📄 [PDFJS Mock] Retrieving Page ${pageNum}...`);
        return Promise.resolve({
          getTextContent: () => Promise.resolve({
            items: [
              { str: "Staff AI Engineer resume content." },
              { str: "Skills: React, D3, Recharts, Node.js, Python, ML." },
              { str: "Experience: 8 years of building scalable AI agents and recruit systems." }
            ]
          })
        });
      }
    })
  };
};

export const GlobalWorkerOptions = {
  workerSrc: ""
};
