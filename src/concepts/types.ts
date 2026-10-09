import type { Domain, SourceRef } from '../types';
export interface ConceptLesson {
  id: string;
  book: 1 | 2 | 3 | 4 | 5;
  title: string;
  summary: string;
  keyPoints: string[];
  comparison: { headers: string[]; rows: string[][] };
  pitfalls: string[];
  example: { title: string; body: string };
  sources: SourceRef[];
  related: { domain: Domain; keywords: string[] };
}
export const conceptBooks = [
  { id: 1, title: '소프트웨어 개발' },
  { id: 2, title: '데이터 이해와 활용' },
  { id: 3, title: '시스템 아키텍처' },
  { id: 4, title: '정보보안 이해와 활용' },
  { id: 5, title: 'IT 비즈니스와 윤리' },
] as const;
