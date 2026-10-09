import type { Question, SourceRef, Diagram, Criterion } from "../types";

export const swSource: Record<string, SourceRef> = {
  process: {
    title: "TOPCIT ESSENCE ver.3 · 소프트웨어 개발",
    chapter: "I. 소프트웨어 공학 개요",
    pages: "인쇄 18–26 (PDF 20–28)",
    note: "2020년판 단원에 근거한 학습용 재구성·창작",
  },
  reuse: {
    title: "TOPCIT ESSENCE ver.3 · 소프트웨어 개발",
    chapter: "II. 소프트웨어 재사용",
    pages: "인쇄 30–33 (PDF 32–35)",
  },
  algorithm: {
    title: "TOPCIT ESSENCE ver.3 · 소프트웨어 개발",
    chapter: "III. 자료구조와 알고리즘",
    pages: "인쇄 36–48 (PDF 38–50)",
  },
  design: {
    title: "TOPCIT ESSENCE ver.3 · 소프트웨어 개발",
    chapter: "IV. 소프트웨어 설계 원리",
    pages: "인쇄 52–58 (PDF 54–60)",
  },
  architecture: {
    title: "TOPCIT ESSENCE ver.3 · 소프트웨어 개발",
    chapter: "V. 소프트웨어 아키텍처 설계",
    pages: "인쇄 62–64 (PDF 64–66)",
  },
  object: {
    title: "TOPCIT ESSENCE ver.3 · 소프트웨어 개발",
    chapter: "VI. 객체지향 분석과 설계",
    pages: "인쇄 67–80 (PDF 69–82)",
  },
  ux: {
    title: "TOPCIT ESSENCE ver.3 · 소프트웨어 개발",
    chapter: "VII. 사용자 인터페이스와 사용자 경험",
    pages: "인쇄 83–84 (PDF 85–86)",
  },
  language: {
    title: "TOPCIT ESSENCE ver.3 · 소프트웨어 개발",
    chapter: "VIII. 프로그래밍 언어와 개발 환경",
    pages: "인쇄 87–95 (PDF 89–97)",
    note: "언어 예제는 학습용으로 자체 작성",
  },
  test: {
    title: "TOPCIT ESSENCE ver.3 · 소프트웨어 개발",
    chapter: "IX. 소프트웨어 테스트와 리팩토링",
    pages: "인쇄 99–104 (PDF 101–106)",
  },
  requirements: {
    title: "TOPCIT ESSENCE ver.3 · 소프트웨어 개발",
    chapter: "X. 소프트웨어 요구사항 관리",
    pages: "인쇄 108–111 (PDF 110–113)",
  },
  config: {
    title: "TOPCIT ESSENCE ver.3 · 소프트웨어 개발",
    chapter: "XI. 소프트웨어 형상 관리",
    pages: "인쇄 115–119 (PDF 117–121)",
  },
  maintenance: {
    title: "TOPCIT ESSENCE ver.3 · 소프트웨어 개발",
    chapter: "XII. 소프트웨어 유지 관리",
    pages: "인쇄 122–123 (PDF 124–125)",
  },
  opensource: {
    title: "TOPCIT ESSENCE ver.3 · 소프트웨어 개발",
    chapter: "XIII. 오픈소스 소프트웨어",
    pages: "인쇄 127–129 (PDF 129–131)",
  },
};
const screenshotPages: Record<string, string> = {
  algorithm: "문제 PDF 1, 3쪽 / 해설 PDF 1, 4쪽",
  object: "문제 PDF 1쪽 / 해설 PDF 1–2쪽",
  design: "문제 PDF 2쪽 / 해설 PDF 2–3쪽",
  test: "문제 PDF 4쪽 / 해설 PDF 4–5쪽",
  activity: "문제 PDF 3쪽 / 해설 PDF 4쪽",
};
export function sources(round: number, key: string): SourceRef[] {
  const ref =
    swSource[key === "activity" ? "object" : key] ?? swSource.language;
  return round === 1 && screenshotPages[key]
    ? [
        {
          title: "2020 TOPCIT 문제풀이 01 소프트웨어 개발 및 해설",
          chapter: "사용자 제공 스크린샷 정리 자료",
          pages: screenshotPages[key],
          note: "원문을 그대로 전재하지 않고 조건·사례를 재구성했다. 주석이 포함된 자료이며 공식 정답 인증을 의미하지 않는다.",
        },
        ref,
      ]
    : [ref];
}
const topicNames: Record<string, string> = {
  process: "소프트웨어 개발 프로세스",
  reuse: "소프트웨어 재사용",
  algorithm: "자료구조·알고리즘",
  design: "설계 원리",
  architecture: "소프트웨어 아키텍처",
  object: "객체지향·UML",
  activity: "활동 다이어그램·UML",
  ux: "사용자 경험·UI",
  language: "프로그래밍 언어",
  test: "테스트·리팩토링",
  requirements: "요구사항 관리",
  config: "형상 관리",
  maintenance: "유지보수",
  opensource: "오픈소스",
};
export function base(
  round: number,
  n: number,
  topic: string,
  title: string,
): Pick<
  Question,
  "id" | "round" | "domain" | "difficulty" | "topic" | "title" | "origin"
> {
  return {
    id: `sw-r${round}-${n}`,
    round,
    domain: "software",
    difficulty: n < 8 ? "기초" : n < 16 ? "응용" : "심화",
    topic: topicNames[topic] ?? topic,
    title,
    origin: round === 1 ? "reference-adapted" : "original",
  };
}
export type Wrong = [string, string];
export function mc(
  round: number,
  n: number,
  source: string,
  title: string,
  prompt: string,
  right: string,
  why: string,
  wrong: Wrong[],
): Question {
  const data: [string, string][] = [[right, why], ...wrong];
  const offset = (round + n) % 4;
  const ordered = data.slice(offset).concat(data.slice(0, offset));
  return {
    ...base(round, n, source, title),
    kind: "choice",
    points: 5,
    prompt,
    options: ordered.map(([text, explanation], i) => ({
      id: String(i + 1),
      text,
      explanation,
    })),
    answer: String(ordered.indexOf(data[0]) + 1),
    explanation: why,
    keyPoints: [why],
    sources: sources(round, source),
  };
}
export function rubric(items: [string, number][]): Criterion[] {
  return items.map(([label, points]) => ({ label, points }));
}
export function activity(
  actions: string[],
  decision?: { after: number; label: string; yes: string; no: string },
): Diagram {
  if (decision) {
    return {
      nodes: [
        { id: "s", x: 400, y: 30, label: "시작", shape: "start" },
        { id: "a", x: 400, y: 100, label: actions[0], shape: "action" },
        { id: "d", x: 400, y: 210, label: decision.label, shape: "decision" },
        { id: "y", x: 170, y: 330, label: decision.yes, shape: "action" },
        { id: "n", x: 630, y: 330, label: decision.no, shape: "action" },
        { id: "m", x: 400, y: 430, label: "", shape: "decision" },
        { id: "f", x: 400, y: 550, label: "종료", shape: "end" },
      ],
      edges: [
        { id: "e1", from: "s", to: "a" },
        { id: "e2", from: "a", to: "d" },
        { id: "e3", from: "d", to: "y", label: "[예]" },
        { id: "e4", from: "d", to: "n", label: "[아니요]" },
        { id: "e5", from: "y", to: "m" },
        { id: "e6", from: "n", to: "m" },
        { id: "e7", from: "m", to: "f" },
      ],
    };
  }
  return {
    nodes: [
      { id: "s", x: 360, y: 20, label: "시작", shape: "start" },
      ...actions.map((label, i) => ({
        id: `a${i}`,
        x: 300,
        y: 100 + i * 100,
        label,
        shape: "action" as const,
      })),
      {
        id: "f",
        x: 360,
        y: 100 + actions.length * 100,
        label: "종료",
        shape: "end",
      },
    ],
    edges: [
      { id: "e0", from: "s", to: "a0" },
      ...actions
        .slice(1)
        .map((_, i) => ({ id: `e${i + 1}`, from: `a${i}`, to: `a${i + 1}` })),
      { id: "ef", from: `a${actions.length - 1}`, to: "f" },
    ],
  };
}
