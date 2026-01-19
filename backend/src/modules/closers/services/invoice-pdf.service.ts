import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as puppeteer from 'puppeteer';

export interface InvoicePdfInput {
  invoiceNumber: string;
  clientName: string;
  clientEmail: string;
  clientCompany?: string;
  packageName: string;
  packageDescription?: string;
  credits: number;
  price: number;
  currency: string;
  validityDays: number;
  specialTerms?: string;
  dueDate?: Date;
  createdAt: Date;
  closerName?: string;
  closerEmail?: string;
}

@Injectable()
export class InvoicePdfService {
  private readonly logger = new Logger(InvoicePdfService.name);
  private readonly companyName: string;
  private readonly companyAddress: string;
  private readonly companyEmail: string;

  constructor(private configService: ConfigService) {
    this.companyName = this.configService.get('COMPANY_NAME') || 'BookProof';
    this.companyAddress = this.configService.get('COMPANY_ADDRESS') || '';
    this.companyEmail = this.configService.get('COMPANY_EMAIL') || 'support@bookproof.com';
  }

  /**
   * Generate PDF invoice
   */
  async generateInvoicePdf(input: InvoicePdfInput): Promise<Buffer> {
    this.logger.log(`Generating invoice PDF: ${input.invoiceNumber}`);

    const html = this.generateHtml(input);

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
   * Generate HTML content for invoice PDF
   */
  private generateHtml(input: InvoicePdfInput): string {
    const {
      invoiceNumber,
      clientName,
      clientEmail,
      clientCompany,
      packageName,
      packageDescription,
      credits,
      price,
      currency,
      validityDays,
      specialTerms,
      dueDate,
      createdAt,
      closerName,
      closerEmail,
    } = input;

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
  <title>Invoice ${invoiceNumber}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.5;
      color: #333;
      background: #fff;
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
      align-items: flex-start;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 2px solid #667eea;
    }

    .company-info h1 {
      font-size: 28px;
      color: #667eea;
      margin-bottom: 5px;
    }

    .company-info p {
      color: #666;
      font-size: 12px;
    }

    .invoice-title {
      text-align: right;
    }

    .invoice-title h2 {
      font-size: 24px;
      color: #333;
      margin-bottom: 5px;
    }

    .invoice-title .invoice-number {
      font-size: 16px;
      color: #667eea;
      font-weight: bold;
    }

    .invoice-title .invoice-date {
      color: #666;
      font-size: 13px;
      margin-top: 5px;
    }

    .billing-section {
      display: flex;
      justify-content: space-between;
      margin-bottom: 40px;
    }

    .bill-to, .bill-from {
      width: 45%;
    }

    .section-title {
      font-size: 12px;
      color: #999;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 10px;
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
      font-size: 12px;
      text-transform: uppercase;
      color: #666;
      border-bottom: 2px solid #e0e0e0;
    }

    .items-table td {
      padding: 15px;
      border-bottom: 1px solid #e0e0e0;
      vertical-align: top;
    }

    .items-table .item-name {
      font-weight: 500;
    }

    .items-table .item-description {
      font-size: 12px;
      color: #666;
      margin-top: 5px;
    }

    .items-table .text-right {
      text-align: right;
    }

    .totals {
      width: 300px;
      margin-left: auto;
      margin-bottom: 40px;
    }

    .totals-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid #e0e0e0;
    }

    .totals-row.total {
      font-size: 18px;
      font-weight: bold;
      border-bottom: none;
      padding-top: 15px;
      color: #667eea;
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
    }

    .terms-section p {
      font-size: 12px;
      color: #666;
      margin-bottom: 5px;
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
    }

    .payment-info p {
      font-size: 13px;
      opacity: 0.9;
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

    .contact-info p {
      margin-bottom: 3px;
    }
  </style>
</head>
<body>
  <div class="invoice-container">
    <!-- Header -->
    <div class="header">
      <div class="company-info">
        <h1>${this.companyName}</h1>
        ${this.companyAddress ? `<p>${this.companyAddress}</p>` : ''}
        <p>${this.companyEmail}</p>
      </div>
      <div class="invoice-title">
        <h2>INVOICE</h2>
        <div class="invoice-number">${invoiceNumber}</div>
        <div class="invoice-date">Date: ${formatDate(createdAt)}</div>
        ${dueDate ? `<div class="invoice-date">Due: ${formatDate(dueDate)}</div>` : ''}
      </div>
    </div>

    <!-- Billing Section -->
    <div class="billing-section">
      <div class="bill-to">
        <div class="section-title">Bill To</div>
        <div class="billing-name">${clientName}</div>
        <div class="billing-details">
          ${clientCompany ? `<p>${clientCompany}</p>` : ''}
          <p>${clientEmail}</p>
        </div>
      </div>
      ${closerName ? `
      <div class="bill-from">
        <div class="section-title">Your Account Executive</div>
        <div class="billing-name">${closerName}</div>
        <div class="billing-details">
          ${closerEmail ? `<p>${closerEmail}</p>` : ''}
        </div>
      </div>
      ` : ''}
    </div>

    <!-- Items Table -->
    <table class="items-table">
      <thead>
        <tr>
          <th style="width: 50%">Description</th>
          <th style="width: 20%">Credits</th>
          <th style="width: 15%">Validity</th>
          <th style="width: 15%" class="text-right">Amount</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <div class="item-name">${packageName}</div>
            ${packageDescription ? `<div class="item-description">${packageDescription}</div>` : ''}
          </td>
          <td>${credits.toLocaleString()}</td>
          <td>${validityDays} days</td>
          <td class="text-right">${formatCurrency(price, currency)}</td>
        </tr>
      </tbody>
    </table>

    <!-- Totals -->
    <div class="totals">
      <div class="totals-row">
        <span>Subtotal</span>
        <span>${formatCurrency(price, currency)}</span>
      </div>
      <div class="totals-row total">
        <span>Total Due</span>
        <span>${formatCurrency(price, currency)}</span>
      </div>
    </div>

    <!-- Terms -->
    ${specialTerms ? `
    <div class="terms-section">
      <h3>Special Terms & Conditions</h3>
      <p>${specialTerms}</p>
    </div>
    ` : ''}

    <!-- Payment Info -->
    <div class="payment-info">
      <h3>Payment Instructions</h3>
      <p>Please use the payment link provided in your email to complete this payment securely via our payment processor.</p>
      <p>Credits will be activated immediately upon successful payment.</p>
    </div>

    <!-- Footer -->
    <div class="contact-info">
      <p>Questions about this invoice?</p>
      <p>Contact us at ${this.companyEmail}</p>
    </div>

    <div class="footer">
      <p>Thank you for your business!</p>
      <p>&copy; ${new Date().getFullYear()} ${this.companyName}. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `;
  }
}
