'use client';

/**
 * Client-side direct PDF exporter using html-to-image and jsPDF.
 * Uses native browser SVG rasterization which fully supports modern CSS:
 * oklab, oklch, color-mix, flexbox, grid, gradients, and custom web fonts.
 */
export async function exportElementToPdf(
    element: HTMLElement,
    filename: string = 'Eixora-Audit-Report.pdf'
): Promise<boolean> {
    try {
        const { toJpeg } = await import('html-to-image');
        const { jsPDF } = await import('jspdf');

        // Capture crisp high-resolution image using browser's native renderer
        const imgData = await toJpeg(element, {
            quality: 0.95,
            pixelRatio: 2,
            backgroundColor: '#0a0c0b',
            style: {
                margin: '0',
            },
        });

        // Create image element to get exact natural dimensions
        const img = new Image();
        img.src = imgData;
        await new Promise((resolve) => {
            img.onload = resolve;
        });

        // A4 page proportions in mm: 210 x 297
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();

        const imgWidth = pageWidth;
        const imgHeight = (img.height * imgWidth) / img.width;

        let heightLeft = imgHeight;
        let position = 0;

        // First page
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
        heightLeft -= pageHeight;

        // Additional pages if content spans beyond 1 A4 page
        while (heightLeft > 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
            heightLeft -= pageHeight;
        }

        // Trigger direct file download
        pdf.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`);
        return true;
    } catch (err) {
        console.error('PDF export error with html-to-image:', err);
        return false;
    }
}
