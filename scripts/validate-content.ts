import assert from "node:assert/strict";
import { questions } from "../src/content";
import type { Question, QuestionPart } from "../src/types";
const ids = new Set<string>();
const promptKeys = new Set<string>();
function verify(q: Question | QuestionPart, context: string) {
  assert(q.prompt.trim().length > 4, `${context}: 지문 누락`);
  assert(q.explanation.trim().length > 10, `${context}: 해설 누락`);
  assert(q.points > 0, `${context}: 배점`);
  if (q.kind === "choice") {
    assert.equal(q.options?.length, 4, `${context}: 보기4개`);
    assert.equal(
      new Set(q.options!.map((o) => o.id)).size,
      4,
      `${context}: 보기ID 중복`,
    );
    assert(
      q.options!.some((o) => o.id === q.answer),
      `${context}: 정답ID`,
    );
    assert(
      q.options!.every((o) => o.text.trim() && o.explanation.trim().length > 8),
      `${context}: 보기 해설`,
    );
  } else if (q.kind === "compound" && "parts" in q) {
    assert(q.parts?.length, `${context}: 하위 문항`);
    assert.equal(
      new Set(q.parts!.map((p) => p.id)).size,
      q.parts!.length,
      `${context}: 하위ID중복`,
    );
    assert.equal(
      q.parts!.reduce((s, p) => s + p.points, 0),
      q.points,
      `${context}: 하위 배점 합`,
    );
    q.parts!.forEach((p) => verify(p, context + "/" + p.id));
  } else {
    assert(q.modelAnswer?.trim(), `${context}: 모범답안`);
    if (q.kind === "short" && q.acceptedAnswers?.length) {
      assert(
        q.acceptedAnswers.every((x) => x.trim()),
        `${context}: 허용 답안`,
      );
    } else {
      assert(q.rubric?.length, `${context}: 자기평가 기준`);
      assert.equal(
        q.rubric!.reduce((s, r) => s + r.points, 0),
        q.points,
        `${context}: 루브릭 합`,
      );
    }
  }
  if (q.modelDiagram) {
    const d = q.modelDiagram;
    assert(d.nodes.length > 0, `${context}: 도식 노드`);
    assert.equal(new Set(d.nodes.map((n) => n.id)).size, d.nodes.length);
    d.edges.forEach((e) =>
      assert(
        d.nodes.some((n) => n.id === e.from) &&
          d.nodes.some((n) => n.id === e.to),
        `${context}: 끊긴 연결`,
      ),
    );
  }
}
for (const q of questions) {
  assert(!ids.has(q.id), `중복 ID: ${q.id}`);
  ids.add(q.id);
  assert(q.round >= 0 && q.round <= 10, `${q.id}: 회차`);
  assert(
    q.title.trim() && q.topic.trim() && q.keyPoints.length,
    `${q.id}: 학습 메타정보`,
  );
  assert(
    q.sources.length &&
      q.sources.every((s) => s.title.trim() && s.chapter.trim()),
    `${q.id}: 출처`,
  );
  assert(!JSON.stringify(q).includes("/Users/"), `${q.id}: 개인 로컬 경로`);
  if (q.round > 0) {
    const key = q.domain + "|" + q.prompt + "|" + (q.stimulus ?? "");
    assert(!promptKeys.has(key), `같은 지문: ${q.id}`);
    promptKeys.add(key);
  }
  verify(q, q.id);
}
assert.equal(questions.filter((q) => q.round > 0).length, 750);
for (let round = 1; round <= 10; round++) {
  const list = questions.filter((q) => q.round === round);
  assert.equal(list.length, 75, `${round}회차 문항수`);
  assert.equal(
    list.reduce((s, q) => s + q.points, 0),
    1000,
    `${round}회차 배점`,
  );
  const specs = {
    software: [21, 365],
    data: [19, 265],
    systems: [18, 235],
    business: [17, 135],
  };
  for (const [domain, [count, points]] of Object.entries(specs)) {
    const items = list.filter((q) => q.domain === domain);
    assert.equal(items.length, count);
    assert.equal(
      items.reduce((s, q) => s + q.points, 0),
      points,
    );
    assert.equal(items.filter((q) => q.kind === "choice").length, 15);
  }
}
console.log(
  `검증 통과: 창작·재구성 750문항 + 제공된 공식 캡처 ${questions.filter((q) => q.round === 0).length}문항, 회차별 75문항·1000점`,
);
