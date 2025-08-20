// useDocRef.js
import { PDFDocument } from "pdf-lib";
import Swal from "sweetalert2";

export default function useDocRef() {
  const fetchDocRef = async (data) => {
    try {

      const { pdf_url, page_reference } = data;

      // 2️ Download PDF
      const pdfResponse = await fetch(pdf_url);
      const pdfArrayBuffer = await pdfResponse.arrayBuffer();

      const pdfDoc = await PDFDocument.load(pdfArrayBuffer);
      const newPdfDoc = await PDFDocument.create();

      // 3 Copy specific pages
      for (let pageIndex of page_reference) {
        if (pageIndex > 0 && pageIndex <= pdfDoc.getPageCount()) {
          const [copiedPage] = await newPdfDoc.copyPages(pdfDoc, [
            pageIndex - 1,
          ]);
          newPdfDoc.addPage(copiedPage);
        }
      }

      // 4️⃣ Save new PDF
      const newPdfBytes = await newPdfDoc.save();
      const newPdfBlob = new Blob([newPdfBytes], { type: "application/pdf" });

      // 5️⃣ Ask user to open
      const result = await Swal.fire({
        title: "Confirm PDF View",
        text: `Answer is coming from pages: ${page_reference.join(", ")}.`,
        icon: "info",
        showCancelButton: true,
        confirmButtonText: "Open PDF",
      });

      if (result.isConfirmed) {
        const newPdfBlobUrl = URL.createObjectURL(newPdfBlob);
        window.open(newPdfBlobUrl, "_blank");
      }
    } catch (err) {
      console.error("Doc Ref Error:", err);
      Swal.fire("Error", err.message, "error");
    }
  };

  return { fetchDocRef };
}
