import assert from 'node:assert/strict';
import { concepts, relatedQuestions } from '../src/concepts/index';
import { questions } from '../src/content/index';
import { conceptVisualIds } from '../src/components/ConceptVisual';
const ids = new Set<string>();
for (const lesson of concepts) {
  assert(!ids.has(lesson.id), `중복 개념 ID: ${lesson.id}`); ids.add(lesson.id);
  assert(lesson.title && lesson.summary && lesson.example.title && lesson.example.body, `${lesson.id}: 내용 누락`);
  assert(lesson.keyPoints.length >= 3 && lesson.pitfalls.length >= 2, `${lesson.id}: 요약/주의점 부족`);
  assert(lesson.comparison.headers.length >= 2 && lesson.comparison.rows.length >= 2, `${lesson.id}: 비교표 부족`);
  assert(lesson.comparison.rows.every(row => row.length === lesson.comparison.headers.length && row.every(Boolean)), `${lesson.id}: 비교표 열 불일치`);
  assert(lesson.sources.length && lesson.sources.every(source => source.title && source.chapter), `${lesson.id}: 출처 누락`);
  assert(lesson.related.keywords.length > 0 && relatedQuestions(lesson, questions).length > 0, `${lesson.id}: 연결된 문제 없음`);
}
for (let book = 1; book <= 5; book++) assert(concepts.filter(c => c.book === book).length >= 10, `${book}권 개념이 10개 미만`);
assert.equal(conceptVisualIds.length, 10, '핵심 개념도 10개');
for (const id of conceptVisualIds) assert(ids.has(id), `그림에 대응하는 개념 없음: ${id}`);
console.log(`개념 검증 통과: 5권 ${concepts.length}개 개념, 비교표·출처·문제 연결, SVG 개념도 10개`);
