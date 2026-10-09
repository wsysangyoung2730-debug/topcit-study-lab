import { test } from "node:test";
import assert from "node:assert/strict";
import {
  grade,
  emptyAnswer,
  emptyState,
  isStudyState,
  score,
  shuffled,
} from "../src/lib/study";
import type { Question } from "../src/types";
const q = { kind: "choice", answer: "b", points: 5 } as Question;
test("선택지의 위치가 아닌 ID로 채점한다", () => {
  assert.equal(grade(q, { ...emptyAnswer(), value: "b" }).correct, true);
  assert.equal(grade(q, { ...emptyAnswer(), value: "a" }).correct, false);
});
test("서술과 코드에는 자동 정오를 부여하지 않는다", () => {
  assert.equal(
    grade({ ...q, kind: "essay" }, emptyAnswer()).correct,
    undefined,
  );
});
test("정답 확인 전 점수를 부여하지 않는다", () => {
  assert.equal(score(q, { ...emptyAnswer(), correct: true }).auto, 0);
});
test("허용 답안만 정규화하여 단답 채점한다", () => {
  const short = {
    ...q,
    kind: "short",
    acceptedAnswers: ["TCP/IP"],
  } as Question;
  assert.equal(
    grade(short, { ...emptyAnswer(), value: " tcp/ip " }).correct,
    true,
  );
  assert.equal(grade(short, { ...emptyAnswer(), value: "tcp" }).correct, false);
});
test("자기평가 점수와 자동점수를 구분한다", () => {
  const essay = {
    ...q,
    kind: "essay",
    points: 30,
    rubric: [
      { label: "핵심", points: 20 },
      { label: "근거", points: 10 },
    ],
  } as Question;
  assert.deepEqual(
    score(essay, { ...emptyAnswer(), checked: true, rubric: [0] }),
    { auto: 0, self: 20, autoMax: 0, selfMax: 30 },
  );
});
test("잘못된 백업 파일을 거부한다", () => {
  assert.ok(isStudyState(emptyState()));
  assert.ok(!isStudyState({ version: 1 }));
  assert.ok(!isStudyState({ ...emptyState(), answers: { bad: { value: 5 } } }));
});
test("무작위 섞기는 원본을 보존하고 중복을 만들지 않는다", () => {
  const before = [1, 2, 3, 4];
  assert.deepEqual([...shuffled(before, () => 0.2)].sort(), before);
  assert.deepEqual(before, [1, 2, 3, 4]);
});
