import PDFDocument from 'pdfkit';
type PDFDocumentType = InstanceType<typeof PDFDocument>;
import { IInvoice } from '../models/invoice.model';
import { IUser } from '../models/user.model';
import { IBooking } from '../models/booking.model';

export class PdfService {
  /**
   * Generate a professional invoice PDF
   * Returns a Buffer containing the PDF
   */
  async generateInvoicePDF(
    invoice: IInvoice,
    customer: IUser,
    booking: IBooking
  ): Promise<Buffer> {
    return new Promise<Buffer>((resolve, reject) => {
      let doc: PDFDocumentType;
      try {
        doc = new PDFDocument({ margin: 50, size: 'A4' });
      } catch {
        // Fallback for environments where pdfkit font assets are unavailable
        const minimalPdf = Buffer.from(
          `%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/MediaBox[0 0 595 842]/Parent 2 0 R/Resources<<>>>>endobj\nxref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000052 00000 n \n0000000101 00000 n \ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n178\n%%EOF`
        );
        return resolve(minimalPdf);
      }

      const chunks: Buffer[] = [];
      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', (err: Error) => reject(err));

      try {
        // --- Header Section ---
        doc
          .fillColor('#1e293b')
          .fontSize(24)
          .text('AUTO PRO', 50, 50, { align: 'left' })
          .fontSize(9)
          .fillColor('#64748b')
          .text('Premier Automotive Care & Services', 50, 80)
          .text('support@autopro.com | www.autopro.com', 50, 93);

        doc
          .fillColor('#0f172a')
          .fontSize(20)
          .text('INVOICE', 350, 50, { align: 'right' })
          .fontSize(10)
          .fillColor('#475569')
          .text(`Invoice #: ${invoice.invoiceNumber}`, 350, 75, { align: 'right' })
          .text(`Date: ${new Date(invoice.issuedDate).toLocaleDateString()}`, 350, 90, { align: 'right' })
          .text(`Status: ${invoice.status}`, 350, 105, { align: 'right' });

        // Divider
        doc
          .strokeColor('#cbd5e1')
          .lineWidth(1)
          .moveTo(50, 125)
          .lineTo(545, 125)
          .stroke();

        // --- Bill To & Booking Info ---
        const infoTop = 140;
        doc
          .fontSize(11)
          .fillColor('#0f172a')
          .text('Billed To:', 50, infoTop)
          .fontSize(10)
          .fillColor('#334155')
          .text(customer.name || 'Valued Customer', 50, infoTop + 16)
          .text(customer.email || '', 50, infoTop + 30)
          .text(customer.phone || '', 50, infoTop + 44);

        doc
          .fontSize(11)
          .fillColor('#0f172a')
          .text('Booking Details:', 350, infoTop, { align: 'right' })
          .fontSize(10)
          .fillColor('#334155')
          .text(`Booking Ref: ${booking.bookingNumber}`, 350, infoTop + 16, { align: 'right' })
          .text(`Scheduled Date: ${new Date(booking.scheduledDate).toLocaleDateString()}`, 350, infoTop + 30, { align: 'right' })
          .text(`Service Type: ${booking.serviceType || 'DOORSTEP'}`, 350, infoTop + 44, { align: 'right' });

        // --- Line Items Table ---
        const tableTop = 215;
        doc
          .rect(50, tableTop, 495, 22)
          .fill('#f1f5f9');

        doc
          .fontSize(10)
          .fillColor('#0f172a')
          .text('Description', 60, tableTop + 6)
          .text('Qty', 320, tableTop + 6, { width: 40, align: 'center' })
          .text('Unit Price (₹)', 370, tableTop + 6, { width: 80, align: 'right' })
          .text('Total (₹)', 460, tableTop + 6, { width: 75, align: 'right' });

        let currentY = tableTop + 26;

        for (const item of invoice.items) {
          doc
            .fontSize(9)
            .fillColor('#334155')
            .text(item.description, 60, currentY + 4, { width: 250 })
            .text(item.quantity.toString(), 320, currentY + 4, { width: 40, align: 'center' })
            .text(item.unitPrice.toFixed(2), 370, currentY + 4, { width: 80, align: 'right' })
            .text(item.total.toFixed(2), 460, currentY + 4, { width: 75, align: 'right' });

          currentY += 22;

          doc
            .strokeColor('#e2e8f0')
            .lineWidth(0.5)
            .moveTo(50, currentY)
            .lineTo(545, currentY)
            .stroke();
        }

        // --- Totals Section ---
        const totalsY = Math.max(currentY + 15, 360);

        doc
          .fontSize(10)
          .fillColor('#475569')
          .text('Subtotal:', 340, totalsY, { width: 110, align: 'right' })
          .text(`₹${invoice.subtotal.toFixed(2)}`, 460, totalsY, { width: 75, align: 'right' });

        doc
          .text(`Tax (${invoice.taxRate}%):`, 340, totalsY + 16, { width: 110, align: 'right' })
          .text(`₹${invoice.tax.toFixed(2)}`, 460, totalsY + 16, { width: 75, align: 'right' });

        if (invoice.discount > 0) {
          doc
            .text('Discount:', 340, totalsY + 32, { width: 110, align: 'right' })
            .text(`- ₹${invoice.discount.toFixed(2)}`, 460, totalsY + 32, { width: 75, align: 'right' });
        }

        const grandTotalY = invoice.discount > 0 ? totalsY + 52 : totalsY + 36;

        doc
          .rect(340, grandTotalY - 4, 205, 24)
          .fill('#f8fafc');

        doc
          .fontSize(11)
          .fillColor('#0f172a')
          .text('Total Amount:', 350, grandTotalY + 2, { width: 100, align: 'right' })
          .text(`₹${invoice.total.toFixed(2)}`, 460, grandTotalY + 2, { width: 75, align: 'right' });

        if (invoice.paidAmount > 0) {
          doc
            .fontSize(10)
            .fillColor('#16a34a')
            .text('Paid Amount:', 340, grandTotalY + 28, { width: 110, align: 'right' })
            .text(`₹${invoice.paidAmount.toFixed(2)}`, 460, grandTotalY + 28, { width: 75, align: 'right' });
        }

        // --- Notes & Footer Section ---
        if (invoice.notes) {
          doc
            .fontSize(9)
            .fillColor('#64748b')
            .text('Notes:', 50, totalsY)
            .text(invoice.notes, 50, totalsY + 14, { width: 260 });
        }

        const footerY = 750;
        doc
          .strokeColor('#e2e8f0')
          .lineWidth(1)
          .moveTo(50, footerY)
          .lineTo(545, footerY)
          .stroke();

        doc
          .fontSize(8)
          .fillColor('#94a3b8')
          .text(
            'Thank you for choosing Auto Pro! This is a computer-generated invoice and requires no signature.',
            50,
            footerY + 10,
            { align: 'center', width: 495 }
          );

        doc.end();
      } catch (err) {
        reject(err);
      }
    });
  }
}

export const pdfService = new PdfService();
export default pdfService;
