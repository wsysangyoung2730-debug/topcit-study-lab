export type Domain = "software" | "data" | "systems" | "business";
export type QuestionKind =
  "choice" | "short" | "essay" | "code" | "diagram" | "compound";
export interface SourceRef {
  title: string;
  chapter: string;
  pages?: string;
  url?: string;
  note?: string;
}
export interface Option {
  id: string;
  text: string;
  explanation: string;
}
export interface Criterion {
  label: string;
  points: number;
}
export type Shape =
  "action" | "decision" | "start" | "end" | "class" | "entity" | "bar";
export interface DiagramNode {
  id: string;
  x: number;
  y: number;
  label: string;
  shape: Shape;
}
export interface DiagramEdge {
  id: string;
  from: string;
  to: string;
  label?: string;
  kind?:
    | "arrow"
    | "line"
    | "inheritance"
    | "aggregation"
    | "composition"
    | "dependency";
}
export interface Diagram {
  nodes: DiagramNode[];
  edges: DiagramEdge[];
}
export interface QuestionPart {
  id: string;
  title: string;
  kind: Exclude<QuestionKind, "compound">;
  prompt: string;
  points: number;
  options?: Option[];
  answer?: string;
  acceptedAnswers?: string[];
  modelAnswer: string;
  explanation: string;
  rubric?: Criterion[];
  language?: string;
  starterCode?: string;
  modelDiagram?: Diagram;
}
export interface Question {
  id: string;
  officialNumber?: number;
  round: number;
  domain: Domain;
  kind: QuestionKind;
  points: number;
  difficulty: "기초" | "응용" | "심화";
  topic: string;
  title: string;
  prompt: string;
  stimulus?: string;
  options?: Option[];
  answer?: string;
  acceptedAnswers?: string[];
  explanation: string;
  keyPoints: string[];
  modelAnswer?: string;
  rubric?: Criterion[];
  sources: SourceRef[];
  origin: "reference-adapted" | "original";
  language?: string;
  starterCode?: string;
  modelDiagram?: Diagram;
  parts?: QuestionPart[];
}
export const domains: {
  id: Domain;
  label: string;
  short: string;
  color: string;
}[] = [
  {
    id: "software",
    label: "소프트웨어 개발",
    short: "소프트웨어",
    color: "#5370bc",
  },
  { id: "data", label: "데이터 관리", short: "데이터", color: "#258774" },
  {
    id: "systems",
    label: "시스템아키텍처·정보보안",
    short: "시스템·보안",
    color: "#a16bb7",
  },
  {
    id: "business",
    label: "IT 비즈니스",
    short: "IT 비즈니스",
    color: "#c18b42",
  },
];
export const kindLabels: Record<QuestionKind, string> = {
  choice: "객관식",
  short: "단답·계산",
  essay: "서술형",
  code: "코드 작성",
  diagram: "다이어그램",
  compound: "통합형",
};
