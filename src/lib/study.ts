import type { Diagram, Question, QuestionPart } from "../types";
export type Mode = "study" | "exam" | "random" | "review";
export interface Answer {
  value: string;
  diagram?: Diagram;
  checked: boolean;
  correct?: boolean;
  rubric: number[];
  parts: Record<string, Answer>;
  submittedValue?: string;
  checks: number;
  history?: { value: string; correct?: boolean; at: number }[];
}
export interface Session {
  id: string;
  mode: Mode;
  round?: number;
  ids: string[];
  index: number;
  startedAt: number;
  deadline?: number;
  endedAt?: number;
}
export interface StudyState {
  version: 1;
  answers: Record<string, Answer>;
  bookmarks: string[];
  sessions: Session[];
  activeId?: string;
}
export const emptyAnswer = (): Answer => ({
  value: "",
  checked: false,
  rubric: [],
  parts: {},
  checks: 0,
});
export const emptyState = (): StudyState => ({
  version: 1,
  answers: {},
  bookmarks: [],
  sessions: [],
});
export function expandPublicStudySessions(
  state: StudyState,
  publicIds: string[],
): StudyState {
  const sessions = state.sessions.map((session) => {
    if (
      session.round !== 0 ||
      session.mode !== "study" ||
      session.endedAt !== undefined ||
      session.ids.length >= publicIds.length ||
      !session.ids.every((id) => publicIds.includes(id))
    )
      return session;
    return {
      ...session,
      ids: [...publicIds],
      index: publicIds.indexOf(session.ids[session.index]),
    };
  });
  return sessions.some((session, i) => session !== state.sessions[i])
    ? { ...state, sessions }
    : state;
}
export function normalize(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}
export function grade(q: Question | QuestionPart, a: Answer): Answer {
  const choices = q.kind === "choice";
  const auto =
    choices || (q.kind === "short" && Boolean(q.acceptedAnswers?.length));
  const correct = auto
    ? choices
      ? a.value === q.answer
      : q.acceptedAnswers!.some((x) => normalize(x) === normalize(a.value))
    : undefined;
  return {
    ...a,
    checked: true,
    correct,
    submittedValue: a.value,
    checks: a.checks + 1,
    history: [
      ...(a.history ?? []),
      { value: a.value, correct, at: Date.now() },
    ],
  };
}
export function answerKey(session: Session, id: string) {
  return `${session.id}::${id}`;
}
export function hasAnswer(a?: Answer): boolean {
  return Boolean(
    a &&
    (a.value.trim() ||
      a.diagram?.nodes.length ||
      Object.values(a.parts).some(hasAnswer)),
  );
}
export function shuffled<T>(items: T[], random = Math.random) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
export function latestAnswer(
  state: StudyState,
  id: string,
): Answer | undefined {
  let latest: Answer | undefined;
  let lastTime = -Infinity;
  const checkedTime = (a: Answer, fallback: number): number =>
    Math.max(
      a.checked ? (a.history?.at(-1)?.at ?? fallback) : -Infinity,
      ...Object.values(a.parts).map((p) => checkedTime(p, fallback)),
    );
  for (const session of [...state.sessions].reverse()) {
    const answer = state.answers[answerKey(session, id)];
    if (!answer) continue;
    const time = checkedTime(answer, session.startedAt);
    if (time > lastTime) {
      latest = answer;
      lastTime = time;
    }
  }
  return latest;
}
export function automaticResults(a?: Answer): boolean[] {
  return !a
    ? []
    : a.checked && a.correct !== undefined
      ? [a.correct]
      : Object.values(a.parts).flatMap(automaticResults);
}
export function score(
  q: Question | QuestionPart,
  a?: Answer,
): { auto: number; self: number; autoMax: number; selfMax: number } {
  if (q.kind === "compound" && "parts" in q)
    return (q.parts ?? []).reduce(
      (sum, p) => {
        const n = score(p, a?.parts[p.id]);
        return {
          auto: sum.auto + n.auto,
          self: sum.self + n.self,
          autoMax: sum.autoMax + n.autoMax,
          selfMax: sum.selfMax + n.selfMax,
        };
      },
      { auto: 0, self: 0, autoMax: 0, selfMax: 0 },
    );
  if (q.kind === "choice" || (q.kind === "short" && q.acceptedAnswers?.length))
    return {
      auto: a?.checked && a.correct ? q.points : 0,
      self: 0,
      autoMax: q.points,
      selfMax: 0,
    };
  return {
    auto: 0,
    self:
      (a?.checked ? a.rubric : [])?.reduce(
        (n, i) => n + (q.rubric?.[i]?.points ?? 0),
        0,
      ) ?? 0,
    autoMax: 0,
    selfMax: q.points,
  };
}
export function isStudyState(value: unknown): value is StudyState {
  if (!value || typeof value !== "object") return false;
  const s = value as StudyState;
  const strings = (v: unknown): v is string[] =>
    Array.isArray(v) && v.every((x) => typeof x === "string");
  if (
    s.version !== 1 ||
    !strings(s.bookmarks) ||
    !Array.isArray(s.sessions) ||
    !s.answers ||
    typeof s.answers !== "object" ||
    Array.isArray(s.answers)
  )
    return false;
  const validAnswer = (a: Answer, depth = 0): boolean =>
    Boolean(
      a &&
      depth < 4 &&
      typeof a.value === "string" &&
      typeof a.checked === "boolean" &&
      (a.correct === undefined || typeof a.correct === "boolean") &&
      (a.history === undefined ||
        (Array.isArray(a.history) &&
          a.history.every(
            (h) =>
              h &&
              typeof h.value === "string" &&
              Number.isFinite(h.at) &&
              (h.correct === undefined || typeof h.correct === "boolean"),
          ))) &&
      Number.isInteger(a.checks) &&
      a.checks >= 0 &&
      Array.isArray(a.rubric) &&
      new Set(a.rubric).size === a.rubric.length &&
      a.rubric.every((x) => Number.isInteger(x) && x >= 0) &&
      a.parts &&
      typeof a.parts === "object" &&
      !Array.isArray(a.parts) &&
      Object.values(a.parts).every((x) => validAnswer(x, depth + 1)) &&
      (!a.diagram ||
        (Array.isArray(a.diagram.nodes) &&
          Array.isArray(a.diagram.edges) &&
          a.diagram.nodes.every(
            (n) =>
              n &&
              typeof n.id === "string" &&
              typeof n.label === "string" &&
              [
                "action",
                "decision",
                "start",
                "end",
                "class",
                "entity",
                "bar",
              ].includes(n.shape) &&
              Number.isFinite(n.x) &&
              Number.isFinite(n.y),
          ) &&
          new Set(a.diagram.nodes.map((n) => n.id)).size ===
            a.diagram.nodes.length &&
          a.diagram.edges.every(
            (e) =>
              e &&
              typeof e.id === "string" &&
              (e.label === undefined || typeof e.label === "string") &&
              (e.kind === undefined ||
                [
                  "arrow",
                  "line",
                  "inheritance",
                  "aggregation",
                  "composition",
                  "dependency",
                ].includes(e.kind)) &&
              a.diagram!.nodes.some((n) => n.id === e.from) &&
              a.diagram!.nodes.some((n) => n.id === e.to),
          ))),
    );
  if (
    !s.sessions.every(
      (x) =>
        x &&
        typeof x.id === "string" &&
        ["study", "exam", "random", "review"].includes(x.mode) &&
        strings(x.ids) &&
        x.ids.length > 0 &&
        new Set(x.ids).size === x.ids.length &&
        Number.isInteger(x.index) &&
        x.index >= 0 &&
        x.index < x.ids.length &&
        Number.isFinite(x.startedAt) &&
        (x.deadline === undefined || Number.isFinite(x.deadline)) &&
        (x.endedAt === undefined || Number.isFinite(x.endedAt)),
    )
  )
    return false;
  return (
    new Set(s.sessions.map((x) => x.id)).size === s.sessions.length &&
    (s.activeId === undefined || s.sessions.some((x) => x.id === s.activeId)) &&
    Object.values(s.answers).every((a) => validAnswer(a))
  );
}

export function submitSession(
  state: StudyState,
  session: Session,
  questions: Question[],
  at = Date.now(),
): StudyState {
  if (state.sessions.find((s) => s.id === session.id)?.endedAt !== undefined)
    return state;
  const lookup = new Map(questions.map((q) => [q.id, q]));
  const answers = { ...state.answers };
  for (const id of session.ids) {
    const q = lookup.get(id);
    if (!q) continue;
    const key = answerKey(session, id),
      a = answers[key] ?? emptyAnswer();
    answers[key] =
      q.kind === "compound"
        ? {
            ...a,
            checked: true,
            parts: Object.fromEntries(
              (q.parts ?? []).map((p) => [
                p.id,
                grade(p, a.parts[p.id] ?? emptyAnswer()),
              ]),
            ),
          }
        : grade(q, a);
  }
  return {
    ...state,
    answers,
    sessions: state.sessions.map((s) =>
      s.id === session.id ? { ...s, endedAt: at } : s,
    ),
  };
}
