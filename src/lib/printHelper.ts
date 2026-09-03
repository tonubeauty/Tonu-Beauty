/**
 * Dedicated utility for printing exclusively the target element
 * using an isolated 'about:blank' window/page.
 * Ensures ONLY that specific page is printed with full styling,
 * without any background app elements, headers, or multi-page overflow.
 */

export function printElementViaAboutBlank(
  elementId: string,
  options?: {
    title?: string;
    pageFormat?: 'A4' | 'receipt';
    onComplete?: () => void;
  }
): boolean {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`[PrintHelper] Element with id "${elementId}" not found.`);
    window.print();
    return false;
  }

  const title = options?.title || 'তনু বিউটি পার্লার - ইনভয়েস';
  const isReceipt = options?.pageFormat === 'receipt';

  // Clone element content
  const contentHtml = element.outerHTML;

  // Extract all existing style sheets and style tags from current document
  let stylesHtml = '';
  document.querySelectorAll('style, link[rel="stylesheet"]').forEach((node) => {
    stylesHtml += node.outerHTML + '\n';
  });

  // Open clean about:blank window
  const printWindow = window.open('about:blank', '_blank', 'width=950,height=1050,menubar=no,toolbar=no,location=no,status=no');

  // If popup window is blocked by iframe or browser popup blocker, use about:blank hidden iframe
  if (!printWindow) {
    console.warn('[PrintHelper] Popup blocked, falling back to about:blank iframe.');
    return printViaAboutBlankIframe(contentHtml, stylesHtml, title, isReceipt);
  }

  const pageMargin = isReceipt ? '4mm' : '8mm 10mm';
  const pageSize = isReceipt ? '80mm auto' : 'A4 portrait';

  const fullHtml = `<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Anek+Bangla:wght@300;400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  ${stylesHtml}
  <style>
    @page {
      size: ${pageSize};
      margin: ${pageMargin};
    }
    *, *::before, *::after {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }
    html, body {
      margin: 0 !important;
      padding: 0 !important;
      background-color: #ffffff !important;
      color: #0f172a !important;
      font-family: 'Anek Bangla', 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif !important;
      width: 100% !important;
      min-height: auto !important;
      height: auto !important;
      overflow: visible !important;
    }
    .print-only-container {
      width: 100% !important;
      max-width: ${isReceipt ? '80mm' : '210mm'} !important;
      margin: 0 auto !important;
      padding: 0 !important;
      background: #ffffff !important;
    }
    /* Neutralize screen styles on the cloned card */
    #${elementId} {
      border: none !important;
      box-shadow: none !important;
      min-height: auto !important;
      max-height: none !important;
      padding: 4mm 2mm !important;
      margin: 0 auto !important;
      width: 100% !important;
    }
    .no-print {
      display: flex;
    }
    @media print {
      .no-print {
        display: none !important;
      }
      body {
        margin: 0 !important;
        padding: 0 !important;
      }
      .print-only-container {
        max-width: 100% !important;
        width: 100% !important;
      }
    }
  </style>
</head>
<body class="bg-white text-slate-900">
  <!-- Top bar (only visible on screen, hidden on actual print) -->
  <div class="no-print" style="position: sticky; top: 0; left: 0; right: 0; background: #0f172a; color: #ffffff; padding: 12px 20px; display: flex; align-items: center; justify-content: space-between; gap: 12px; z-index: 9999; border-bottom: 1px solid #334155; font-size: 13px; font-family: 'Anek Bangla', sans-serif;">
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="font-weight: 700; color: #fb7185;">তনু বিউটি পার্লার</span>
      <span style="color: #94a3b8;">|</span>
      <span>${title}</span>
    </div>
    <div style="display: flex; align-items: center; gap: 10px;">
      <button onclick="window.print()" style="background: #e11d48; color: #ffffff; border: none; border-radius: 8px; padding: 6px 16px; font-size: 12px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 6px;">
        🖨️ এখনই প্রিন্ট করুন
      </button>
      <button onclick="window.close()" style="background: #334155; color: #e2e8f0; border: none; border-radius: 8px; padding: 6px 12px; font-size: 12px; font-weight: 600; cursor: pointer;">
        ✕ বন্ধ করুন
      </button>
    </div>
  </div>

  <div class="print-only-container">
    ${contentHtml}
  </div>

  <script>
    function triggerPrint() {
      window.focus();
      try {
        window.print();
      } catch (e) {
        console.error('Print trigger failed:', e);
      }
    }

    if (document.readyState === 'complete') {
      setTimeout(triggerPrint, 350);
    } else {
      window.addEventListener('load', function() {
        setTimeout(triggerPrint, 350);
      });
      // Safety fallback
      setTimeout(triggerPrint, 700);
    }
  </script>
</body>
</html>`;

  printWindow.document.open();
  printWindow.document.write(fullHtml);
  printWindow.document.close();

  return true;
}

/**
 * Fallback when window.open is blocked by strict iframe sandboxes:
 * Creates an invisible about:blank iframe and prints through it.
 */
function printViaAboutBlankIframe(
  contentHtml: string,
  stylesHtml: string,
  title: string,
  isReceipt: boolean
): boolean {
  const existingIframe = document.getElementById('print-about-blank-iframe');
  if (existingIframe) {
    existingIframe.remove();
  }

  const iframe = document.createElement('iframe');
  iframe.id = 'print-about-blank-iframe';
  iframe.src = 'about:blank';
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  iframe.style.zIndex = '-9999';

  document.body.appendChild(iframe);

  const iframeDoc = iframe.contentWindow?.document;
  if (!iframeDoc || !iframe.contentWindow) {
    window.print();
    return false;
  }

  const pageMargin = isReceipt ? '4mm' : '8mm 10mm';
  const pageSize = isReceipt ? '80mm auto' : 'A4 portrait';

  iframeDoc.open();
  iframeDoc.write(`<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Anek+Bangla:wght@300;400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  ${stylesHtml}
  <style>
    @page {
      size: ${pageSize};
      margin: ${pageMargin};
    }
    *, *::before, *::after {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }
    html, body {
      margin: 0 !important;
      padding: 0 !important;
      background: #ffffff !important;
      color: #0f172a !important;
      font-family: 'Anek Bangla', 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif !important;
      width: 100% !important;
      min-height: auto !important;
      height: auto !important;
    }
    .print-only-container {
      width: 100% !important;
      max-width: ${isReceipt ? '80mm' : '210mm'} !important;
      margin: 0 auto !important;
      padding: 0 !important;
      background: #ffffff !important;
    }
  </style>
</head>
<body class="bg-white">
  <div class="print-only-container">
    ${contentHtml}
  </div>
</body>
</html>`);
  iframeDoc.close();

  setTimeout(() => {
    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();
    setTimeout(() => {
      iframe.remove();
    }, 1500);
  }, 400);

  return true;
}
