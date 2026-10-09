import { softwareDataConcepts } from "./software-data";
import { systemsSecurityConcepts } from "./systems-security";
import { businessConcepts } from "./business";
import type { ConceptLesson } from "./types";
import type { Question } from "../types";
export { conceptBooks } from "./types";
export const concepts: ConceptLesson[] = [
  ...softwareDataConcepts,
  ...systemsSecurityConcepts,
  ...businessConcepts,
];
const normalize = (text: string) =>
  text.toLocaleLowerCase().replace(/\s+/g, "");
export function relevance(lesson: ConceptLesson, question: Question): number {
  if (lesson.related.domain !== question.domain) return 0;
  const heading = normalize(`${question.title} ${question.topic}`);
  const body = normalize(`${question.prompt} ${question.keyPoints.join(" ")}`);
  return lesson.related.keywords.reduce((score, keyword) => {
    const term = normalize(keyword);
    return score + (heading.includes(term) ? 3 : body.includes(term) ? 1 : 0);
  }, 0);
}
export function relatedQuestions(lesson: ConceptLesson, pool: Question[]) {
  return pool
    .map((question) => ({ question, weight: relevance(lesson, question) }))
    .filter((item) => item.weight > 0)
    .sort((a, b) => b.weight - a.weight || a.question.round - b.question.round)
    .map((item) => item.question);
}
export function relatedConcepts(question: Question) {
  return concepts
    .map((lesson) => ({ lesson, weight: relevance(lesson, question) }))
    .filter((item) => item.weight > 0)
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 3)
    .map((item) => item.lesson);
}
