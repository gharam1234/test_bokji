/**
 * PDF 리포트 DTO
 * PDF 리포트 생성 요청 및 응답 형식
 */

import { IsEnum, IsOptional, IsDateString, IsBoolean } from 'class-validator';

/** PDF 리포트 생성 요청 파라미터 */
export class PDFReportQueryDto {
  @IsEnum(['week', 'month', 'quarter', 'year'])
  @IsOptional()
  period?: 'week' | 'month' | 'quarter' | 'year' = 'month';

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsBoolean()
  @IsOptional()
  includeInsights?: boolean = true;

  @IsBoolean()
  @IsOptional()
  includeCharts?: boolean = true;

  @IsEnum(['ko', 'en'])
  @IsOptional()
  language?: 'ko' | 'en' = 'ko';
}

/** PDF 리포트 생성 옵션 */
export interface PDFReportOptions {
  userId: string;
  period: 'week' | 'month' | 'quarter' | 'year';
  startDate?: Date;
  endDate?: Date;
  includeInsights: boolean;
  includeCharts: boolean;
  language: 'ko' | 'en';
}

/** PDF 리포트 메타데이터 */
export interface PDFReportMetadata {
  generatedAt: Date;
  periodLabel: string;
  totalPages: number;
  fileName: string;
}
