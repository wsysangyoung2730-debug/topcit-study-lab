import { test } from "node:test";
import assert from "node:assert/strict";
import {
  answerKey,
  automaticResults,
  emptyAnswer,
  emptyState,
  grade,
  isStudyState,
  latestAnswer,
  score,
  submitSession,
  type Session,
} from "../src/lib/study";
import type { Question } from "../src/types";
const q = { id: "q", kind: "choice", answer: "b", points: 5 } as Question;
const session: Session = {
  id: "s",
  mode: "exam",
  ids: ["q", "mixed"],
  index: 0,
  startedAt: 100,
  deadline: 9100,
};
const mixed = {
  id: "mixed",
  kind: "compound",
  points: 80,
  parts: [
    { id: "short", kind: "short", acceptedAnswers: ["4"], points: 20 },
    {
      id: "essay",
      kind: "essay",
      points: 60,
      rubric: [{ label: "근거", points: 60 }],
    },
  ],
} as Question;
test("시험 제출은 미응답을 오답 처리하며 자유 답안은 자동 판정하지 않는다", () => {
  const before = { ...emptyState(), sessions: [session] };
  const after = submitSession(before, session, [q, mixed], 9100);
  assert.equal(after.answers["s::q"].correct, false);
  assert.equal(after.answers["s::mixed"].parts.short.correct, false);
  assert.equal(after.answers["s::mixed"].parts.essay.correct, undefined);
  assert.equal(after.sessions[0].endedAt, 9100);
  assert.equal(before.sessions[0].endedAt, undefined);
  assert.deepEqual(before.answers, {});
  assert.equal(submitSession(after, session, [q, mixed], 9200), after);
});
test("시험과 연습의 같은 문항 기록은 서로 독립적이다", () => {
  assert.notEqual(
    answerKey(session, "q"),
    answerKey({ ...session, id: "another" }, "q"),
  );
});
test("통합 문항 부분 확인도 오답 복습에서 찾는다", () => {
  const a = {
    ...emptyAnswer(),
    parts: { short: grade(mixed.parts![0], { ...emptyAnswer(), value: "3" }) },
  };
  const state = {
    ...emptyState(),
    sessions: [session],
    answers: { "s::mixed": a },
  };
  assert.equal(latestAnswer(state, "mixed"), a);
  assert.deepEqual(automaticResults(a), [false]);
  assert.equal(score(mixed, a).auto, 0);
});
test("재풀이 후 첫 확인 결과와 최근 결과를 보존한다", () => {
  const first = grade(q, { ...emptyAnswer(), value: "a" });
  const second = grade(q, {
    ...emptyAnswer(),
    value: "b",
    checks: first.checks,
    history: first.history,
  });
  assert.equal(second.correct, true);
  assert.equal(second.checks, 2);
  assert.equal(second.history?.[0].correct, false);
  assert.equal(second.history?.[1].correct, true);
});
test("가져오기에서 잘못된 위치·중복 평가·끊긴 도식을 거부한다", () => {
  assert.equal(
    isStudyState({ ...emptyState(), sessions: [{ ...session, index: 2 }] }),
    false,
  );
  assert.equal(
    isStudyState({
      ...emptyState(),
      answers: { x: { ...emptyAnswer(), rubric: [0, 0] } },
    }),
    false,
  );
  assert.equal(
    isStudyState({
      ...emptyState(),
      answers: {
        x: {
          ...emptyAnswer(),
          diagram: {
            nodes: [],
            edges: [{ id: "e", from: "missing", to: "other" }],
          },
        },
      },
    }),
    false,
  );
  assert.equal(
    isStudyState({
      ...emptyState(),
      sessions: [session],
      activeId: "s",
      answers: { "s::q": grade(q, { ...emptyAnswer(), value: "b" }) },
    }),
    true,
  );
});
