import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { formFields } from "../data/formFields";

/** Humanize key for PDF label when not in formFields - e.g. "fullName" -> "Full Name" */
function labelFor(key: string): string {
  const known = formFields.find((f) => f.id === key);
  if (known) return known.label;
  return key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase()).trim();
}

/** Build ordered list of keys: formFields first, then remaining from answers */
function orderedKeys(answers: Record<string, any>): string[] {
  const knownIds = new Set(formFields.map((f) => f.id));
  const rest = Object.keys(answers || {}).filter((k) => !knownIds.has(k));
  return [...formFields.map((f) => f.id), ...rest];
}

/**
 * Generate a professional PDF from filled form data (form-like layout) using pdf-lib.
 * Creates a downloadable PDF that looks like an official form summary.
 */
export async function generateAndDownloadPDF(
  answers: Record<string, any>,
  autoFilledFields: string[] = [],
  filename = "Universal-Form-Helper-Submission.pdf"
): Promise<void> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
  const pageWidth = 595;
  const pageHeight = 842;
  const margin = 50;
  const lineHeight = 18;
  let y = pageHeight - margin;
  let page = doc.addPage([pageWidth, pageHeight]);

  const drawText = (text: string, x: number, yVal: number, size: number, bold = false): number => {
    const f = bold ? fontBold : font;
    const lines = text.length > 70 ? text.match(/.{1,70}(\s|$)/g) || [text] : [text];
    for (const line of lines) {
      if (yVal < margin + lineHeight) {
        page = doc.addPage([pageWidth, pageHeight]);
        yVal = pageHeight - margin;
      }
      const pdfY = pageHeight - yVal;
      page.drawText(line.trim(), { x, y: pdfY - size, size, font: f, color: rgb(0.2, 0.2, 0.2) });
      yVal -= lineHeight;
    }
    return yVal;
  };

  y = drawText("Universal Form Helper – Form Submission", margin, y, 18, true);
  y -= lineHeight;
  y = drawText(`Generated: ${new Date().toLocaleString("en-IN")}`, margin, y, 10);
  y -= lineHeight * 1.5;

  for (const key of orderedKeys(answers)) {
    const label = labelFor(key);
    const value = answers[key] != null ? String(answers[key]) : "";
    const isAuto = autoFilledFields.includes(key);
    if (y < margin + lineHeight * 3) {
      page = doc.addPage([pageWidth, pageHeight]);
      y = pageHeight - margin;
    }
    y = drawText(`${label}:`, margin, y, 11, true);
    y = drawText(value || "—", margin + 10, y, 11);
    if (isAuto) {
      page.drawText(" (auto-filled)", { x: margin + 10, y: pageHeight - y - 9, size: 9, font, color: rgb(0, 0.5, 0) });
    }
    y -= lineHeight * 0.8;
  }

  const pdfBytes = await doc.save();
  const blob = new Blob([pdfBytes], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * PDF HTML generate - 100+ fields support via dynamic answers object
 * Pehle known fields (formFields order), phir baki keys answers se
 */
export function generatePDFPreview(
  answers: Record<string, any>,
  autoFilledFields: string[] = []
): string {
  // Generate HTML for preview/download
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Form Submission - Universal Form Helper</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: #f5f5f5;
          padding: 40px 20px;
          line-height: 1.6;
        }
        
        .container {
          max-width: 900px;
          margin: 0 auto;
          background: white;
          box-shadow: 0 4px 20px rgba(0,0,0,0.1);
          border-radius: 12px;
          overflow: hidden;
        }
        
        .header {
          background: linear-gradient(135deg, #9B5CFF 0%, #7B3FD8 100%);
          color: white;
          padding: 40px;
          text-align: center;
        }
        
        .header h1 {
          font-size: 32px;
          margin-bottom: 10px;
          font-weight: 700;
        }
        
        .header p {
          font-size: 14px;
          opacity: 0.9;
        }
        
        .meta-info {
          background: #f8f9fa;
          padding: 20px 40px;
          border-bottom: 2px solid #e9ecef;
          display: flex;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 20px;
        }
        
        .meta-item {
          display: flex;
          flex-direction: column;
        }
        
        .meta-label {
          font-size: 11px;
          text-transform: uppercase;
          color: #6c757d;
          font-weight: 600;
          letter-spacing: 0.5px;
          margin-bottom: 4px;
        }
        
        .meta-value {
          font-size: 14px;
          color: #212529;
          font-weight: 600;
        }
        
        .content {
          padding: 40px;
        }
        
        .section-title {
          font-size: 20px;
          font-weight: 700;
          color: #212529;
          margin-bottom: 25px;
          padding-bottom: 12px;
          border-bottom: 3px solid #9B5CFF;
        }
        
        .field-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 20px;
        }
        
        .field {
          background: #f8f9fa;
          border-left: 4px solid #9B5CFF;
          padding: 20px;
          border-radius: 8px;
          transition: all 0.2s;
        }
        
        .field.auto-filled {
          background: #d4f4dd;
          border-left-color: #28a745;
        }
        
        .field.manual-filled {
          background: #e3f2fd;
          border-left-color: #2196f3;
        }
        
        .field.empty {
          background: #fff3cd;
          border-left-color: #ffc107;
        }
        
        .field-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 12px;
          flex-wrap: wrap;
          gap: 8px;
        }
        
        .field-label {
          font-size: 12px;
          font-weight: 700;
          color: #495057;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .field-badges {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }
        
        .badge {
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }
        
        .badge-mandatory {
          background: #ff4444;
          color: white;
        }
        
        .badge-optional {
          background: #2196f3;
          color: white;
        }
        
        .badge-auto {
          background: #28a745;
          color: white;
        }
        
        .badge-manual {
          background: #2196f3;
          color: white;
        }
        
        .field-value {
          font-size: 16px;
          color: #212529;
          font-weight: 500;
          word-wrap: break-word;
        }
        
        .field-value.empty {
          color: #6c757d;
          font-style: italic;
          font-weight: 400;
        }
        
        .footer {
          background: #f8f9fa;
          padding: 30px 40px;
          border-top: 2px solid #e9ecef;
          text-align: center;
        }
        
        .footer-title {
          font-size: 14px;
          font-weight: 700;
          color: #212529;
          margin-bottom: 8px;
        }
        
        .footer-text {
          font-size: 12px;
          color: #6c757d;
          margin-bottom: 4px;
        }
        
        .footer-logo {
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid #dee2e6;
        }
        
        .footer-logo-text {
          font-size: 18px;
          font-weight: 700;
          background: linear-gradient(135deg, #9B5CFF 0%, #7B3FD8 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        @media print {
          body {
            background: white;
            padding: 0;
          }
          
          .container {
            box-shadow: none;
            border-radius: 0;
          }
          
          @page {
            margin: 1cm;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🌟 Universal Form Helper</h1>
          <p>Official Form Submission Document</p>
        </div>
        
        <div class="meta-info">
          <div class="meta-item">
            <span class="meta-label">Document ID</span>
            <span class="meta-value">#${Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Submission Date</span>
            <span class="meta-value">${new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  })}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Submission Time</span>
            <span class="meta-value">${new Date().toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  })}</span>
          </div>
        </div>
        
        <div class="content">
          <h2 class="section-title">Form Details</h2>
          <div class="field-grid">
            ${(() => {
      const keys = new Set([
        ...formFields.map((f) => f.id),
        ...Object.keys(answers || {}),
      ]);
      return Array.from(keys)
        .map((key) => {
          const value = answers[key] != null ? String(answers[key]) : "";
          const isEmpty = !value;
          const isAutoFilled = autoFilledFields.includes(key);
          const isManualFilled = !isEmpty && !isAutoFilled;
          const label = labelFor(key);
          const mandatory = formFields.find((f) => f.id === key)?.mandatory ?? false;
          return `
                <div class="field ${isEmpty ? "empty" : isAutoFilled ? "auto-filled" : "manual-filled"}">
                  <div class="field-header">
                    <span class="field-label">${label}</span>
                    <div class="field-badges">
                      ${mandatory ? '<span class="badge badge-mandatory">Mandatory</span>' : '<span class="badge badge-optional">Optional</span>'}
                      ${!isEmpty && isAutoFilled ? '<span class="badge badge-auto">🤖 Auto-filled (OCR)</span>' : ""}
                      ${!isEmpty && isManualFilled ? '<span class="badge badge-manual">👤 Manual</span>' : ""}
                    </div>
                  </div>
                  <div class="field-value ${isEmpty ? "empty" : ""}">
                    ${isEmpty ? "Not provided" : value}
                  </div>
                </div>
              `;
        })
        .join("");
    })()}
          </div>
        </div>
        
        <div class="footer">
          <div class="footer-title">Document Verification</div>
          <p class="footer-text">This is an official document generated by Universal Form Helper</p>
          <p class="footer-text">All information provided has been verified and confirmed by the user</p>
          <p class="footer-text">Generated on: ${new Date().toLocaleString('en-IN')}</p>
          <div class="footer-logo">
            <div class="footer-logo-text">Universal Form Helper</div>
            <p class="footer-text" style="margin-top: 8px;">Making form filling easy for everyone</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  return htmlContent;
}

export function downloadPDF(answers: Record<string, any>, autoFilledFields: string[] = []): void {
  const htmlContent = generatePDFPreview(answers, autoFilledFields);

  // Create a blob
  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);

  // Open in new window for printing
  const printWindow = window.open(url, '_blank');
  if (printWindow) {
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
      }, 250);
    };
  }
}

export function previewPDF(answers: Record<string, any>, autoFilledFields: string[] = []): void {
  const htmlContent = generatePDFPreview(answers, autoFilledFields);

  // Create a blob
  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);

  // Open in new window for preview
  const previewWindow = window.open(url, '_blank', 'width=900,height=800');
  if (!previewWindow) {
    alert('Please allow pop-ups to preview the form');
  }
}
