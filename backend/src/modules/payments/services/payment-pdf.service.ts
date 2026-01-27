import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as puppeteer from 'puppeteer';

export interface PaymentInvoicePdfInput {
  invoiceNumber: string;
  customerName: string;
  customerEmail: string;
  customerCompany?: string;
  packageName: string;
  credits: number;
  baseAmount: number;
  discountAmount?: number;
  finalAmount: number;
  currency: string;
  activationWindowDays: number;
  couponCode?: string;
  purchaseDate: Date;
  paymentMethod: string;
  stripePaymentId?: string;
}

export interface PaymentReceiptPdfInput {
  receiptNumber: string;
  customerName: string;
  customerEmail: string;
  customerCompany?: string;
  packageName: string;
  credits: number;
  amount: number;
  currency: string;
  paymentDate: Date;
  paymentMethod: string;
  transactionId: string;
}

@Injectable()
export class PaymentPdfService {
  private readonly logger = new Logger(PaymentPdfService.name);
  private readonly companyName: string;
  private readonly companyAddress: string;
  private readonly companyEmail: string;
  private readonly supportEmail: string;

  constructor(private configService: ConfigService) {
    this.companyName = this.configService.get('COMPANY_NAME') || 'BookProof';
    this.companyAddress =
      this.configService.get('COMPANY_ADDRESS') ||
      '123 Publishing Ave, Suite 456\nNew York, NY 10001, USA';
    this.companyEmail = this.configService.get('COMPANY_EMAIL') || 'billing@bookproof.app';
    this.supportEmail = this.configService.get('SUPPORT_EMAIL') || 'support@bookproof.app';
  }

  /**
   * Generate invoice PDF for credit purchase
   */
  async generateInvoicePdf(input: PaymentInvoicePdfInput): Promise<Buffer> {
    this.logger.log(`Generating invoice PDF: ${input.invoiceNumber}`);

    const html = this.generateInvoiceHtml(input);

    try {
      const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });

      const page = await browser.newPage();

      await page.setContent(html, {
        waitUntil: 'networkidle0',
      });

      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '15mm',
          right: '15mm',
          bottom: '15mm',
          left: '15mm',
        },
      });

      await browser.close();

      this.logger.log(`Invoice PDF generated successfully: ${input.invoiceNumber}`);

      return Buffer.from(pdfBuffer);
    } catch (error) {
      this.logger.error('Error generating invoice PDF', error);
      throw error;
    }
  }

  /**
   * Generate receipt PDF for payment
   */
  async generateReceiptPdf(input: PaymentReceiptPdfInput): Promise<Buffer> {
    this.logger.log(`Generating receipt PDF: ${input.receiptNumber}`);

    const html = this.generateReceiptHtml(input);

    try {
      const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });

      const page = await browser.newPage();

      await page.setContent(html, {
        waitUntil: 'networkidle0',
      });

      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '15mm',
          right: '15mm',
          bottom: '15mm',
          left: '15mm',
        },
      });

      await browser.close();

      this.logger.log(`Receipt PDF generated successfully: ${input.receiptNumber}`);

      return Buffer.from(pdfBuffer);
    } catch (error) {
      this.logger.error('Error generating receipt PDF', error);
      throw error;
    }
  }

  /**
   * Generate HTML for invoice
   */
  private generateInvoiceHtml(input: PaymentInvoicePdfInput): string {
    const formatCurrency = (amount: number, curr: string) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: curr,
      }).format(amount);
    };

    const formatDate = (date: Date) => {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    };

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice ${input.invoiceNumber}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.5;
      color: #333;
      font-size: 14px;
    }
    .invoice-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 30px;
    }
    .header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 3px solid #667eea;
    }
    .company-info h1 {
      font-size: 32px;
      color: #667eea;
      margin-bottom: 8px;
    }
    .company-info p {
      color: #666;
      font-size: 12px;
      line-height: 1.6;
    }
    .invoice-title {
      text-align: right;
    }
    .invoice-title h2 {
      font-size: 28px;
      color: #333;
      margin-bottom: 5px;
    }
    .invoice-number {
      font-size: 16px;
      color: #667eea;
      font-weight: bold;
      margin-top: 5px;
    }
    .invoice-date {
      color: #666;
      font-size: 13px;
      margin-top: 5px;
    }
    .status-badge {
      display: inline-block;
      padding: 4px 12px;
      background: #10b981;
      color: white;
      border-radius: 4px;
      font-size: 11px;
      font-weight: bold;
      text-transform: uppercase;
      margin-top: 8px;
    }
    .billing-section {
      display: flex;
      justify-content: space-between;
      margin-bottom: 40px;
      padding: 20px;
      background: #f8f9fa;
      border-radius: 8px;
    }
    .bill-to {
      width: 48%;
    }
    .section-title {
      font-size: 11px;
      color: #999;
      text-transform: uppercase;
      letter-spacing: 1.2px;
      margin-bottom: 10px;
      font-weight: bold;
    }
    .billing-name {
      font-size: 16px;
      font-weight: bold;
      color: #333;
      margin-bottom: 5px;
    }
    .billing-details {
      color: #666;
      font-size: 13px;
      line-height: 1.6;
    }
    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 30px;
    }
    .items-table th {
      background: #f8f9fa;
      padding: 12px 15px;
      text-align: left;
      font-size: 11px;
      text-transform: uppercase;
      color: #666;
      border-bottom: 2px solid #e0e0e0;
      font-weight: bold;
      letter-spacing: 0.5px;
    }
    .items-table td {
      padding: 15px;
      border-bottom: 1px solid #e0e0e0;
    }
    .item-name {
      font-weight: 600;
      color: #333;
    }
    .item-description {
      font-size: 12px;
      color: #666;
      margin-top: 5px;
    }
    .text-right {
      text-align: right;
    }
    .totals {
      width: 350px;
      margin-left: auto;
      margin-bottom: 40px;
    }
    .totals-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid #e0e0e0;
    }
    .totals-row.discount {
      color: #10b981;
    }
    .totals-row.total {
      font-size: 20px;
      font-weight: bold;
      border-top: 2px solid #333;
      border-bottom: none;
      padding-top: 15px;
      color: #667eea;
      margin-top: 5px;
    }
    .payment-info {
      background: #667eea;
      color: white;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 30px;
    }
    .payment-info h3 {
      font-size: 14px;
      margin-bottom: 10px;
      font-weight: bold;
    }
    .payment-info p {
      font-size: 13px;
      opacity: 0.95;
      line-height: 1.6;
    }
    .payment-info .highlight {
      background: rgba(255,255,255,0.2);
      padding: 2px 6px;
      border-radius: 3px;
      font-weight: bold;
    }
    .terms-section {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 30px;
    }
    .terms-section h3 {
      font-size: 14px;
      color: #333;
      margin-bottom: 10px;
      font-weight: bold;
    }
    .terms-section ul {
      margin-left: 20px;
      color: #666;
      font-size: 12px;
    }
    .terms-section li {
      margin-bottom: 5px;
    }
    .footer {
      text-align: center;
      color: #999;
      font-size: 11px;
      padding-top: 20px;
      border-top: 1px solid #e0e0e0;
    }
    .contact-info {
      margin-top: 20px;
      text-align: center;
      font-size: 12px;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="invoice-container">
    <!-- Header -->
    <div class="header">
      <div class="company-info">
        <h1>${this.companyName}</h1>
        <p>${this.companyAddress.replace(/\n/g, '<br>')}</p>
        <p><strong>Email:</strong> ${this.companyEmail}</p>
      </div>
      <div class="invoice-title">
        <h2>INVOICE</h2>
        <div class="invoice-number">${input.invoiceNumber}</div>
        <div class="invoice-date">Date: ${formatDate(input.purchaseDate)}</div>
        <div class="status-badge">PAID</div>
      </div>
    </div>

    <!-- Billing Section -->
    <div class="billing-section">
      <div class="bill-to">
        <div class="section-title">Bill To</div>
        <div class="billing-name">${input.customerName}</div>
        <div class="billing-details">
          ${input.customerCompany ? `<p>${input.customerCompany}</p>` : ''}
          <p>${input.customerEmail}</p>
        </div>
      </div>
      <div class="bill-to">
        <div class="section-title">Payment Details</div>
        <div class="billing-details">
          <p><strong>Method:</strong> ${input.paymentMethod}</p>
          ${input.stripePaymentId ? `<p><strong>Transaction:</strong> ${input.stripePaymentId.substring(0, 20)}...</p>` : ''}
          ${input.couponCode ? `<p><strong>Coupon:</strong> ${input.couponCode}</p>` : ''}
        </div>
      </div>
    </div>

    <!-- Items Table -->
    <table class="items-table">
      <thead>
        <tr>
          <th style="width: 45%">Description</th>
          <th style="width: 20%">Credits</th>
          <th style="width: 20%">Valid For</th>
          <th style="width: 15%" class="text-right">Amount</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <div class="item-name">${input.packageName}</div>
            <div class="item-description">BookProof Review Campaign Credits</div>
          </td>
          <td>${input.credits.toLocaleString()}</td>
          <td>${input.activationWindowDays} days</td>
          <td class="text-right">${formatCurrency(input.baseAmount, input.currency)}</td>
        </tr>
      </tbody>
    </table>

    <!-- Totals -->
    <div class="totals">
      <div class="totals-row">
        <span>Subtotal</span>
        <span>${formatCurrency(input.baseAmount, input.currency)}</span>
      </div>
      ${input.discountAmount && input.discountAmount > 0 ? `
      <div class="totals-row discount">
        <span>Discount ${input.couponCode ? `(${input.couponCode})` : ''}</span>
        <span>-${formatCurrency(input.discountAmount, input.currency)}</span>
      </div>
      ` : ''}
      <div class="totals-row total">
        <span>Total Paid</span>
        <span>${formatCurrency(input.finalAmount, input.currency)}</span>
      </div>
    </div>

    <!-- Payment Confirmation -->
    <div class="payment-info">
      <h3>✓ Payment Received</h3>
      <p>Thank you! Your payment has been processed successfully.</p>
      <p><span class="highlight">${input.credits.toLocaleString()} credits</span> have been added to your account and are valid for <span class="highlight">${input.activationWindowDays} days</span>.</p>
      <p>You can start creating review campaigns immediately from your dashboard.</p>
    </div>

    <!-- Terms -->
    <div class="terms-section">
      <h3>Terms & Conditions</h3>
      <ul>
        <li>Credits are valid for ${input.activationWindowDays} days from purchase date</li>
        <li>Credits can be used to create book review campaigns</li>
        <li>Each ebook review consumes 1 credit, audiobook reviews consume 2 credits</li>
        <li>Unused credits expire after the validity period</li>
        <li>Refunds available within 30 days for unused credits only</li>
      </ul>
    </div>

    <!-- Contact Info -->
    <div class="contact-info">
      <p><strong>Questions about this invoice?</strong></p>
      <p>Contact us at ${this.supportEmail}</p>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p>Thank you for choosing ${this.companyName}!</p>
      <p>&copy; ${new Date().getFullYear()} ${this.companyName}. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `;
  }

  /**
   * Generate HTML for receipt
   */
  private generateReceiptHtml(input: PaymentReceiptPdfInput): string {
    const formatCurrency = (amount: number, curr: string) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: curr,
      }).format(amount);
    };

    const formatDate = (date: Date) => {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    };

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Receipt ${input.receiptNumber}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.5;
      color: #333;
      font-size: 14px;
    }
    .receipt-container {
      max-width: 600px;
      margin: 0 auto;
      padding: 40px;
      border: 2px dashed #e0e0e0;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 2px solid #10b981;
    }
    .company-name {
      font-size: 28px;
      color: #667eea;
      font-weight: bold;
      margin-bottom: 5px;
    }
    .receipt-title {
      font-size: 20px;
      color: #333;
      margin-top: 10px;
    }
    .receipt-number {
      font-size: 14px;
      color: #666;
      margin-top: 5px;
    }
    .success-badge {
      display: inline-block;
      padding: 6px 16px;
      background: #10b981;
      color: white;
      border-radius: 4px;
      font-size: 12px;
      font-weight: bold;
      text-transform: uppercase;
      margin-top: 10px;
    }
    .customer-info {
      background: #f8f9fa;
      padding: 15px;
      border-radius: 6px;
      margin-bottom: 25px;
    }
    .customer-info h3 {
      font-size: 12px;
      color: #999;
      text-transform: uppercase;
      margin-bottom: 8px;
      letter-spacing: 0.5px;
    }
    .customer-info p {
      color: #333;
      font-size: 14px;
      margin: 3px 0;
    }
    .details-section {
      margin-bottom: 25px;
    }
    .detail-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid #e0e0e0;
    }
    .detail-label {
      color: #666;
      font-size: 13px;
    }
    .detail-value {
      color: #333;
      font-weight: 600;
      text-align: right;
    }
    .detail-row.highlight {
      background: #f0fdf4;
      padding: 10px;
      margin: 10px 0;
      border-radius: 6px;
      border: none;
    }
    .detail-row.highlight .detail-value {
      color: #10b981;
      font-size: 16px;
    }
    .total-section {
      background: #667eea;
      color: white;
      padding: 20px;
      border-radius: 8px;
      margin: 25px 0;
    }
    .total-section .amount {
      font-size: 32px;
      font-weight: bold;
      text-align: center;
      margin: 10px 0;
    }
    .total-section .label {
      text-align: center;
      font-size: 14px;
      opacity: 0.9;
    }
    .transaction-info {
      background: #f8f9fa;
      padding: 15px;
      border-radius: 6px;
      margin-bottom: 25px;
    }
    .transaction-info h3 {
      font-size: 12px;
      color: #999;
      text-transform: uppercase;
      margin-bottom: 8px;
    }
    .transaction-info p {
      font-size: 12px;
      color: #666;
      margin: 3px 0;
      font-family: monospace;
    }
    .footer {
      text-align: center;
      color: #999;
      font-size: 11px;
      padding-top: 20px;
      border-top: 1px solid #e0e0e0;
      margin-top: 30px;
    }
    .contact {
      margin-top: 15px;
      font-size: 12px;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="receipt-container">
    <!-- Header -->
    <div class="header">
      <div class="company-name">${this.companyName}</div>
      <div class="receipt-title">PAYMENT RECEIPT</div>
      <div class="receipt-number">${input.receiptNumber}</div>
      <div class="success-badge">✓ PAYMENT SUCCESSFUL</div>
    </div>

    <!-- Customer Info -->
    <div class="customer-info">
      <h3>Customer</h3>
      <p><strong>${input.customerName}</strong></p>
      ${input.customerCompany ? `<p>${input.customerCompany}</p>` : ''}
      <p>${input.customerEmail}</p>
    </div>

    <!-- Payment Details -->
    <div class="details-section">
      <div class="detail-row">
        <span class="detail-label">Payment Date</span>
        <span class="detail-value">${formatDate(input.paymentDate)}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Payment Method</span>
        <span class="detail-value">${input.paymentMethod}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Item Purchased</span>
        <span class="detail-value">${input.packageName}</span>
      </div>
      <div class="detail-row highlight">
        <span class="detail-label">Credits Received</span>
        <span class="detail-value">${input.credits.toLocaleString()} Credits</span>
      </div>
    </div>

    <!-- Total Amount -->
    <div class="total-section">
      <div class="label">Total Amount Paid</div>
      <div class="amount">${formatCurrency(input.amount, input.currency)}</div>
      <div class="label">Transaction Completed Successfully</div>
    </div>

    <!-- Transaction Info -->
    <div class="transaction-info">
      <h3>Transaction Details</h3>
      <p><strong>Transaction ID:</strong> ${input.transactionId}</p>
      <p><strong>Receipt Number:</strong> ${input.receiptNumber}</p>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p>This receipt confirms your payment has been processed.</p>
      <p>Your credits are now available in your account.</p>
      <div class="contact">
        <p>Questions? Contact us at ${this.supportEmail}</p>
        <p>${this.companyEmail}</p>
      </div>
      <p style="margin-top: 15px;">&copy; ${new Date().getFullYear()} ${this.companyName}. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `;
  }
}
