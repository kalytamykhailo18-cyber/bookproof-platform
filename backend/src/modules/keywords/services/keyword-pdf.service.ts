import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as puppeteer from 'puppeteer';
import { KeywordGenerationResult } from './keyword-ai.service';
import { Language, TargetMarket } from '@prisma/client';

export interface PdfGenerationInput {
  bookTitle: string;
  genre: string;
  category: string;
  language: Language;
  targetMarket: TargetMarket;
  keywords: KeywordGenerationResult;
}

@Injectable()
export class KeywordPdfService {
  private readonly logger = new Logger(KeywordPdfService.name);

  constructor(private configService: ConfigService) {}

  /**
   * Generate PDF report from keyword research
   */
  async generatePdf(input: PdfGenerationInput): Promise<Buffer> {
    this.logger.log(`Generating PDF for: ${input.bookTitle}`);

    const html = this.generateHtml(input);

    try {
      // Launch headless browser
      const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });

      const page = await browser.newPage();

      // Set content
      await page.setContent(html, {
        waitUntil: 'networkidle0',
      });

      // Generate PDF
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20mm',
          right: '15mm',
          bottom: '20mm',
          left: '15mm',
        },
      });

      await browser.close();

      this.logger.log(`PDF generated successfully for: ${input.bookTitle}`);

      return Buffer.from(pdfBuffer);
    } catch (error) {
      this.logger.error('Error generating PDF', error);
      throw error;
    }
  }

  /**
   * Generate HTML content for PDF
   */
  private generateHtml(input: PdfGenerationInput): string {
    const { bookTitle, genre, category, language, targetMarket, keywords } = input;

    return `
<!DOCTYPE html>
<html lang="${this.getLanguageCode(language)}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Keyword Research Report - ${bookTitle}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      background: #fff;
    }

    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 40px 30px;
      margin-bottom: 30px;
    }

    .header h1 {
      font-size: 28px;
      margin-bottom: 10px;
      font-weight: 600;
    }

    .header p {
      font-size: 14px;
      opacity: 0.9;
    }

    .meta {
      background: #f7fafc;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 30px;
      border-left: 4px solid #667eea;
    }

    .meta-row {
      display: flex;
      margin-bottom: 8px;
    }

    .meta-label {
      font-weight: 600;
      width: 120px;
      color: #4a5568;
    }

    .meta-value {
      color: #2d3748;
    }

    .section {
      margin-bottom: 40px;
      page-break-inside: avoid;
    }

    .section-title {
      font-size: 20px;
      font-weight: 600;
      color: #2d3748;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 2px solid #667eea;
    }

    .section-description {
      color: #718096;
      margin-bottom: 15px;
      font-size: 14px;
    }

    .keyword-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 10px;
      margin-bottom: 20px;
    }

    .keyword-item {
      background: #f7fafc;
      padding: 8px 12px;
      border-radius: 4px;
      font-size: 14px;
      border-left: 3px solid #667eea;
    }

    .keyword-list {
      list-style: none;
      margin-bottom: 20px;
    }

    .keyword-list li {
      padding: 8px 0;
      padding-left: 20px;
      position: relative;
      font-size: 14px;
    }

    .keyword-list li::before {
      content: "•";
      position: absolute;
      left: 0;
      color: #667eea;
      font-weight: bold;
      font-size: 18px;
    }

    .guideline {
      background: #fff;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }

    .guideline-title {
      font-size: 16px;
      font-weight: 600;
      color: #2d3748;
      margin-bottom: 10px;
      display: flex;
      align-items: center;
    }

    .guideline-title::before {
      content: "→";
      margin-right: 10px;
      color: #667eea;
      font-weight: bold;
    }

    .guideline-instruction {
      color: #4a5568;
      margin-bottom: 10px;
      font-size: 14px;
    }

    .guideline-examples {
      background: #f7fafc;
      padding: 12px;
      border-radius: 4px;
      font-size: 13px;
    }

    .guideline-examples strong {
      color: #2d3748;
      display: block;
      margin-bottom: 5px;
    }

    .guideline-examples ul {
      list-style: none;
      padding-left: 15px;
    }

    .guideline-examples li {
      padding: 3px 0;
      color: #718096;
    }

    .kdp-box {
      background: #fff;
      border: 2px dashed #cbd5e0;
      border-radius: 6px;
      padding: 12px;
      margin-bottom: 12px;
      font-size: 13px;
      font-family: 'Courier New', monospace;
      color: #2d3748;
    }

    .kdp-box-number {
      display: inline-block;
      background: #667eea;
      color: white;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      text-align: center;
      line-height: 24px;
      margin-right: 8px;
      font-size: 12px;
      font-weight: bold;
    }

    .footer {
      margin-top: 50px;
      padding-top: 20px;
      border-top: 2px solid #e2e8f0;
      text-align: center;
      color: #718096;
      font-size: 12px;
    }

    .highlight-box {
      background: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }

    .highlight-box strong {
      color: #92400e;
    }

    @media print {
      .section {
        page-break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Keyword Research Report</h1>
    <p>Comprehensive keyword analysis for Amazon KDP optimization</p>
    <p style="margin-top: 10px; padding: 8px 15px; background: rgba(255,255,255,0.2); border-radius: 4px; display: inline-block;">
      <strong>Target Market:</strong> ${this.getMarketName(targetMarket)}
    </p>
  </div>

  <div class="meta">
    <div class="meta-row">
      <span class="meta-label">Book Title:</span>
      <span class="meta-value">${this.escapeHtml(bookTitle)}</span>
    </div>
    <div class="meta-row">
      <span class="meta-label">Genre:</span>
      <span class="meta-value">${this.escapeHtml(genre)}</span>
    </div>
    <div class="meta-row">
      <span class="meta-label">Category:</span>
      <span class="meta-value">${this.escapeHtml(category)}</span>
    </div>
    <div class="meta-row">
      <span class="meta-label">Language:</span>
      <span class="meta-value">${this.getLanguageName(language)}</span>
    </div>
    <div class="meta-row">
      <span class="meta-label">Target Market:</span>
      <span class="meta-value">${this.getMarketName(targetMarket)}</span>
    </div>
    <div class="meta-row">
      <span class="meta-label">Generated:</span>
      <span class="meta-value">${new Date().toLocaleString()}</span>
    </div>
  </div>

  <!-- Primary Keywords -->
  <div class="section">
    <h2 class="section-title">1. Primary Keywords</h2>
    <p class="section-description">
      Broad, high-volume search terms that define your book's main topic. Use these in your title and throughout your listing.
    </p>
    <div class="keyword-grid">
      ${keywords.primaryKeywords.map(kw => `<div class="keyword-item">${this.escapeHtml(kw)}</div>`).join('')}
    </div>
  </div>

  <!-- Secondary Keywords -->
  <div class="section">
    <h2 class="section-title">2. Secondary Keywords</h2>
    <p class="section-description">
      More specific terms related to subtopics and themes in your book. Include these in your subtitle and description.
    </p>
    <ul class="keyword-list">
      ${keywords.secondaryKeywords.map(kw => `<li>${this.escapeHtml(kw)}</li>`).join('')}
    </ul>
  </div>

  <!-- Long-tail Keywords -->
  <div class="section">
    <h2 class="section-title">3. Long-tail Keywords</h2>
    <p class="section-description">
      Specific phrases that readers might search for (3-5 words each). These often have less competition and higher conversion rates.
    </p>
    <ul class="keyword-list">
      ${keywords.longTailKeywords.map(kw => `<li>${this.escapeHtml(kw)}</li>`).join('')}
    </ul>
  </div>

  <!-- Usage Guidelines -->
  <div class="section">
    <h2 class="section-title">4. Keyword Usage Guidelines</h2>
    <p class="section-description">
      Practical instructions for implementing your keywords across your book listing.
    </p>
    ${keywords.usageGuidelines.map(guide => `
      <div class="guideline">
        <div class="guideline-title">${this.escapeHtml(guide.location)}</div>
        <div class="guideline-instruction">${this.escapeHtml(guide.instruction)}</div>
        ${guide.examples.length > 0 ? `
          <div class="guideline-examples">
            <strong>Examples:</strong>
            <ul>
              ${guide.examples.map(ex => `<li>${this.escapeHtml(ex)}</li>`).join('')}
            </ul>
          </div>
        ` : ''}
      </div>
    `).join('')}
  </div>

  <!-- KDP Suggestions -->
  <div class="section">
    <h2 class="section-title">5. Amazon KDP Optimization</h2>

    ${keywords.kdpSuggestions.title && keywords.kdpSuggestions.title.length > 0 ? `
      <h3 style="font-size: 16px; margin: 20px 0 10px 0; color: #4a5568;">Title Suggestions</h3>
      <ul class="keyword-list">
        ${keywords.kdpSuggestions.title.map(t => `<li>${this.escapeHtml(t)}</li>`).join('')}
      </ul>
    ` : ''}

    ${keywords.kdpSuggestions.subtitle && keywords.kdpSuggestions.subtitle.length > 0 ? `
      <h3 style="font-size: 16px; margin: 20px 0 10px 0; color: #4a5568;">Subtitle Suggestions</h3>
      <ul class="keyword-list">
        ${keywords.kdpSuggestions.subtitle.map(s => `<li>${this.escapeHtml(s)}</li>`).join('')}
      </ul>
    ` : ''}

    ${keywords.kdpSuggestions.description && keywords.kdpSuggestions.description.length > 0 ? `
      <h3 style="font-size: 16px; margin: 20px 0 10px 0; color: #4a5568;">Description Tips</h3>
      <ul class="keyword-list">
        ${keywords.kdpSuggestions.description.map(d => `<li>${this.escapeHtml(d)}</li>`).join('')}
      </ul>
    ` : ''}

    ${keywords.kdpSuggestions.backendKeywords && keywords.kdpSuggestions.backendKeywords.length > 0 ? `
      <h3 style="font-size: 16px; margin: 20px 0 10px 0; color: #4a5568;">Backend Keywords (7 boxes)</h3>
      <div class="highlight-box">
        <strong>Important:</strong> Each keyword box accepts up to 50 characters. Don't repeat words from your title or author name.
      </div>
      ${keywords.kdpSuggestions.backendKeywords.map((kw, idx) => `
        <div class="kdp-box">
          <span class="kdp-box-number">${idx + 1}</span>
          ${this.escapeHtml(kw)}
        </div>
      `).join('')}
    ` : ''}
  </div>

  <div class="footer">
    <p><strong>BookProof</strong> - Professional Keyword Research Service</p>
    <p>This report is confidential and intended for the book author only.</p>
  </div>
</body>
</html>
    `.trim();
  }

  /**
   * Escape HTML special characters
   */
  private escapeHtml(text: string): string {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
  }

  /**
   * Get language code for HTML
   */
  private getLanguageCode(language: Language): string {
    switch (language) {
      case Language.EN:
        return 'en';
      case Language.ES:
        return 'es';
      case Language.PT:
        return 'pt';
      default:
        return 'en';
    }
  }

  /**
   * Get language name
   */
  private getLanguageName(language: Language): string {
    switch (language) {
      case Language.EN:
        return 'English';
      case Language.ES:
        return 'Spanish';
      case Language.PT:
        return 'Portuguese';
      default:
        return 'English';
    }
  }

  /**
   * Get market name
   */
  private getMarketName(market: TargetMarket): string {
    switch (market) {
      case TargetMarket.US:
        return 'Amazon United States (amazon.com)';
      case TargetMarket.BR:
        return 'Amazon Brazil (amazon.com.br)';
      default:
        return 'Amazon United States (amazon.com)';
    }
  }
}
