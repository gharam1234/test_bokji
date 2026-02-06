/**
 * PDF 리포트 생성 서비스
 * 분석 데이터를 PDF 형식으로 변환
 */

import { Injectable, Logger } from '@nestjs/common';
import { PDFReportOptions, PDFReportMetadata } from '../dto/pdf-report.dto';
import { AnalyticsSummaryResponseDto } from '../dto/analytics-summary.dto';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

// Puppeteer는 선택적 의존성
// import * as puppeteer from 'puppeteer';

@Injectable()
export class PDFGeneratorService {
  private readonly logger = new Logger(PDFGeneratorService.name);

  /**
   * PDF 리포트 생성
   * @param data 분석 요약 데이터
   * @param options 생성 옵션
   */
  async generateReport(
    data: AnalyticsSummaryResponseDto,
    options: PDFReportOptions,
  ): Promise<{ buffer: Buffer; metadata: PDFReportMetadata }> {
    this.logger.log(`Generating PDF report for user ${options.userId}`);

    try {
      // HTML 템플릿 생성
      const html = this.generateHTML(data, options);

      // PDF 생성 (Puppeteer 사용)
      const buffer = await this.htmlToPDF(html);

      // 메타데이터 생성
      const metadata: PDFReportMetadata = {
        generatedAt: new Date(),
        periodLabel: data.period.label,
        totalPages: 1,
        fileName: this.generateFileName(data.period.label),
      };

      this.logger.log(`PDF report generated: ${metadata.fileName}`);

      return { buffer, metadata };
    } catch (error) {
      this.logger.error(`Failed to generate PDF: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * HTML 템플릿 생성
   */
  private generateHTML(
    data: AnalyticsSummaryResponseDto,
    options: PDFReportOptions,
  ): string {
    const isKorean = options.language === 'ko';

    return `
<!DOCTYPE html>
<html lang="${options.language}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${isKorean ? '복지 분석 리포트' : 'Welfare Analytics Report'}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Noto Sans KR', -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 12px;
      line-height: 1.6;
      color: #333;
      padding: 40px;
    }
    
    .header {
      text-align: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 2px solid #3b82f6;
    }
    
    .header h1 {
      font-size: 24px;
      color: #1e3a8a;
      margin-bottom: 8px;
    }
    
    .header .period {
      font-size: 14px;
      color: #64748b;
    }
    
    .section {
      margin-bottom: 25px;
    }
    
    .section h2 {
      font-size: 16px;
      color: #1e40af;
      margin-bottom: 12px;
      padding-bottom: 8px;
      border-bottom: 1px solid #e2e8f0;
    }
    
    .overview-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 15px;
      margin-bottom: 20px;
    }
    
    .stat-card {
      background: #f8fafc;
      border-radius: 8px;
      padding: 15px;
      text-align: center;
    }
    
    .stat-card .value {
      font-size: 24px;
      font-weight: bold;
      color: #1e3a8a;
    }
    
    .stat-card .label {
      font-size: 11px;
      color: #64748b;
      margin-top: 4px;
    }
    
    .stat-card .change {
      font-size: 10px;
      margin-top: 4px;
    }
    
    .stat-card .change.positive {
      color: #059669;
    }
    
    .stat-card .change.negative {
      color: #dc2626;
    }
    
    .category-list {
      list-style: none;
    }
    
    .category-item {
      display: flex;
      align-items: center;
      margin-bottom: 8px;
    }
    
    .category-bar {
      flex: 1;
      height: 20px;
      background: #e2e8f0;
      border-radius: 4px;
      overflow: hidden;
      margin: 0 10px;
    }
    
    .category-bar-fill {
      height: 100%;
      background: linear-gradient(90deg, #3b82f6, #60a5fa);
      border-radius: 4px;
    }
    
    .category-name {
      width: 80px;
      font-size: 11px;
    }
    
    .category-value {
      width: 60px;
      text-align: right;
      font-size: 11px;
      color: #64748b;
    }
    
    .insights {
      background: #fef3c7;
      border-radius: 8px;
      padding: 15px;
    }
    
    .insight-item {
      margin-bottom: 10px;
      padding-bottom: 10px;
      border-bottom: 1px solid #fcd34d;
    }
    
    .insight-item:last-child {
      margin-bottom: 0;
      padding-bottom: 0;
      border-bottom: none;
    }
    
    .insight-title {
      font-weight: bold;
      color: #92400e;
      margin-bottom: 4px;
    }
    
    .insight-desc {
      font-size: 11px;
      color: #78350f;
    }
    
    .footer {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e2e8f0;
      text-align: center;
      font-size: 10px;
      color: #94a3b8;
    }
    
    .program-table {
      width: 100%;
      border-collapse: collapse;
    }
    
    .program-table th,
    .program-table td {
      padding: 8px 12px;
      text-align: left;
      border-bottom: 1px solid #e2e8f0;
    }
    
    .program-table th {
      background: #f1f5f9;
      font-size: 11px;
      color: #475569;
    }
    
    .program-table td {
      font-size: 11px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>📊 ${isKorean ? '나의 복지 분석 리포트' : 'My Welfare Analytics Report'}</h1>
    <div class="period">${data.period.label} (${data.period.startDate} ~ ${data.period.endDate})</div>
  </div>

  <div class="section">
    <h2>${isKorean ? '활동 요약' : 'Activity Overview'}</h2>
    <div class="overview-grid">
      <div class="stat-card">
        <div class="value">${data.overview.totalSearches}</div>
        <div class="label">${isKorean ? '검색' : 'Searches'}</div>
        <div class="change ${data.overview.searchesChange >= 0 ? 'positive' : 'negative'}">
          ${data.overview.searchesChange >= 0 ? '+' : ''}${data.overview.searchesChange}%
        </div>
      </div>
      <div class="stat-card">
        <div class="value">${data.overview.totalViews}</div>
        <div class="label">${isKorean ? '조회' : 'Views'}</div>
        <div class="change ${data.overview.viewsChange >= 0 ? 'positive' : 'negative'}">
          ${data.overview.viewsChange >= 0 ? '+' : ''}${data.overview.viewsChange}%
        </div>
      </div>
      <div class="stat-card">
        <div class="value">${data.overview.totalBookmarks}</div>
        <div class="label">${isKorean ? '즐겨찾기' : 'Bookmarks'}</div>
        <div class="change ${data.overview.bookmarksChange >= 0 ? 'positive' : 'negative'}">
          ${data.overview.bookmarksChange >= 0 ? '+' : ''}${data.overview.bookmarksChange}%
        </div>
      </div>
      <div class="stat-card">
        <div class="value">${data.overview.activeDays}</div>
        <div class="label">${isKorean ? '활동일' : 'Active Days'}</div>
      </div>
    </div>
  </div>

  <div class="section">
    <h2>${isKorean ? '관심 카테고리 분포' : 'Category Distribution'}</h2>
    <ul class="category-list">
      ${data.categoryDistribution
        .slice(0, 5)
        .map(
          (cat) => `
        <li class="category-item">
          <span class="category-name">${cat.category}</span>
          <div class="category-bar">
            <div class="category-bar-fill" style="width: ${cat.percentage}%"></div>
          </div>
          <span class="category-value">${cat.count}회 (${cat.percentage}%)</span>
        </li>
      `,
        )
        .join('')}
    </ul>
  </div>

  <div class="section">
    <h2>${isKorean ? '가장 많이 본 복지 TOP 5' : 'Top 5 Viewed Welfare'}</h2>
    <table class="program-table">
      <thead>
        <tr>
          <th>${isKorean ? '순위' : 'Rank'}</th>
          <th>${isKorean ? '복지명' : 'Program'}</th>
          <th>${isKorean ? '카테고리' : 'Category'}</th>
          <th>${isKorean ? '조회수' : 'Views'}</th>
        </tr>
      </thead>
      <tbody>
        ${data.topWelfarePrograms
          .slice(0, 5)
          .map(
            (prog, idx) => `
          <tr>
            <td>${idx + 1}</td>
            <td>${prog.programName}</td>
            <td>${prog.category}</td>
            <td>${prog.viewCount}회</td>
          </tr>
        `,
          )
          .join('')}
      </tbody>
    </table>
  </div>

  ${
    options.includeInsights && data.insights.length > 0
      ? `
  <div class="section">
    <h2>💡 ${isKorean ? '맞춤 인사이트' : 'Personalized Insights'}</h2>
    <div class="insights">
      ${data.insights
        .slice(0, 3)
        .map(
          (insight) => `
        <div class="insight-item">
          <div class="insight-title">${insight.title}</div>
          <div class="insight-desc">${insight.description}</div>
        </div>
      `,
        )
        .join('')}
    </div>
  </div>
  `
      : ''
  }

  <div class="footer">
    ${isKorean ? '생성일시' : 'Generated at'}: ${format(new Date(), 'yyyy-MM-dd HH:mm', { locale: ko })}
    <br>
    ${isKorean ? '본 리포트는 개인 복지 탐색 활동을 기반으로 생성되었습니다.' : 'This report is based on your personal welfare exploration activities.'}
  </div>
</body>
</html>
    `;
  }

  /**
   * HTML을 PDF로 변환
   * 실제 구현시 Puppeteer 사용
   */
  private async htmlToPDF(html: string): Promise<Buffer> {
    // 개발 환경에서는 더미 PDF 반환
    // 실제 구현시 Puppeteer 사용:
    //
    // const browser = await puppeteer.launch({
    //   headless: true,
    //   args: ['--no-sandbox', '--disable-setuid-sandbox'],
    // });
    //
    // const page = await browser.newPage();
    // await page.setContent(html, { waitUntil: 'networkidle0' });
    //
    // const pdf = await page.pdf({
    //   format: 'A4',
    //   margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' },
    //   printBackground: true,
    // });
    //
    // await browser.close();
    // return pdf;

    // 더미 PDF (테스트용)
    const dummyPdfContent = `%PDF-1.4
1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj
2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj
3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >> endobj
xref
0 4
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
trailer << /Size 4 /Root 1 0 R >>
startxref
196
%%EOF`;

    return Buffer.from(dummyPdfContent);
  }

  /**
   * PDF 파일명 생성
   */
  private generateFileName(periodLabel: string): string {
    const timestamp = format(new Date(), 'yyyyMMdd');
    const sanitizedLabel = periodLabel.replace(/[^a-zA-Z0-9가-힣]/g, '-');
    return `welfare-analytics-${sanitizedLabel}-${timestamp}.pdf`;
  }
}
