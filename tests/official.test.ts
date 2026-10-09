import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { test } from "node:test";
import { officialQuestions } from "../src/content/official";
import {
  emptyAnswer,
  expandPublicStudySessions,
  grade,
  isStudyState,
  score,
} from "../src/lib/study";
import { legacyPublicIds, legacyPublicState } from "./fixtures/legacy-public";

const publicIds = officialQuestions.map((q) => q.id);
function question(number: number) {
  const q = officialQuestions.find((q) => q.officialNumber === number);
  assert(q);
  return q;
}

test("제공 24개 식별자와 재구성 51개 및 원문 번호를 구분한다", () => {
  assert.equal(officialQuestions.length, 75);
  assert.equal(legacyPublicIds.length, 24);
  const legacy = officialQuestions.filter((q) =>
    legacyPublicIds.includes(q.id),
  );
  const expanded = officialQuestions.filter(
    (q) => !legacyPublicIds.includes(q.id),
  );
  assert.equal(legacy.length, 24);
  assert.equal(expanded.length, 51);
  assert(legacy.every((q) => !q.title.includes("재구성")));
  assert(expanded.every((q) => q.title.includes("재구성")));
  assert(
    expanded.every((q) => q.sources.some((s) => s.note?.includes("공식"))),
  );
  assert.deepEqual(
    officialQuestions.map((q) => q.officialNumber),
    Array.from({ length: 75 }, (_, i) => i + 1),
  );
  assert.equal(question(3).id, "official-robots");
  assert.equal(question(67).id, "official-chasm");
  assert.equal(question(71).id, "official-risk-avoid");
  assert.equal(question(74).domain, "business");
});

test("진행 중인 제공 문항 학습은 ID 기준 위치와 모든 기록을 보존하며 확장한다", () => {
  const before = legacyPublicState();
  assert(isStudyState(before));
  const after = expandPublicStudySessions(before, publicIds);
  assert(isStudyState(after));
  assert.deepEqual(after.sessions[0].ids, publicIds);
  assert.equal(after.sessions[0].index, 2);
  assert.equal(
    after.sessions[0].ids[after.sessions[0].index],
    "official-robots",
  );
  assert.equal(after.sessions[0].id, before.sessions[0].id);
  assert.equal(after.sessions[0].startedAt, 100);
  assert.equal(after.activeId, before.activeId);
  assert.equal(after.answers, before.answers);
  assert.equal(after.bookmarks, before.bookmarks);
  assert.equal(before.sessions[0].ids.length, 24);
  assert.equal(before.sessions[0].index, 22);
  assert.equal(expandPublicStudySessions(after, publicIds), after);
});

test("완료·시험·복습·연습 회차와 미등록 ID 세션은 확장하지 않는다", () => {
  const state = legacyPublicState();
  const legacy = state.sessions[0];
  state.sessions = [
    { ...legacy, id: "done", endedAt: 300 },
    { ...legacy, id: "exam", mode: "exam", deadline: 900100 },
    { ...legacy, id: "review", mode: "review" },
    { ...legacy, id: "practice", round: 1 },
    { ...legacy, id: "unknown", ids: ["removed-question"], index: 0 },
  ];
  state.activeId = "done";
  assert.equal(expandPublicStudySessions(state, publicIds), state);
});

test("새 통합형과 수행형의 자유 답안은 자동 채점하지 않는다", () => {
  for (const number of [22, 23, 24, 41, 42, 43, 59]) {
    const q = question(number);
    for (const part of q.parts ?? [q]) {
      const checked = grade(part, { ...emptyAnswer(), value: "임의 답안" });
      assert.equal(checked.correct, undefined, `${number}/${part.id}`);
      assert.equal(score(part, checked).auto, 0);
      assert.equal(score(part, checked).self, 0);
      assert.equal(
        score(part, { ...checked, rubric: [0] }).self,
        part.rubric![0].points,
      );
    }
  }
});

test("재구성 SQLite 모범답안과 제약 위반을 실행 확인한다", () => {
  const db = new DatabaseSync(":memory:");
  try {
    db.exec(`PRAGMA foreign_keys = ON;
      CREATE TABLE Category (
        category_id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        parent_id INTEGER REFERENCES Category(category_id)
      );
      INSERT INTO Category VALUES
        (10, '도서', NULL), (20, '기술', 10), (30, '문학', 10),
        (40, '프로그래밍', 20), (50, '디자인', 20);`);
    const sql = question(22).parts?.find(
      (part) => part.id === "sql",
    )?.modelAnswer;
    assert(sql);
    assert.deepEqual(
      db
        .prepare(sql)
        .all()
        .map((row) => Object.values(row)),
      [
        [10, "도서", "최상위"],
        [20, "기술", "도서"],
        [30, "문학", "도서"],
        [40, "프로그래밍", "기술"],
        [50, "디자인", "기술"],
      ],
    );
    db.exec(question(23).modelAnswer!);
    db.exec("INSERT INTO Asset VALUES ('A-1', '노트북', '2026-10-10');");
    assert.throws(
      () => db.exec("INSERT INTO Asset VALUES ('A-1', '중복', NULL);"),
      /UNIQUE/,
    );
    assert.throws(
      () => db.exec("INSERT INTO Asset VALUES (NULL, '누락', NULL);"),
      /NOT NULL/,
    );
    const script = question(24).stimulus?.match(/```sql\n([\s\S]*?)\n```/)?.[1];
    assert(script);
    assert.throws(
      () => db.exec(script),
      /UNIQUE constraint failed: Application.application_id/,
    );
    db.exec("INSERT INTO Application VALUES ('A-206', '신규 신청', 'N');");
    assert.equal(
      db.prepare("SELECT COUNT(*) AS count FROM Application").get()?.count,
      3,
    );
  } finally {
    db.close();
  }
});

test("공개 기반 JSON 모범답안은 요구한 자료형과 값을 보존한다", () => {
  const model = question(41).parts?.find(
    (part) => part.id === "profile",
  )?.modelAnswer;
  assert(model);
  assert.deepEqual(JSON.parse(model), {
    memberId: "M-027",
    displayName: "윤서",
    rooms: ["소리방", "합주실"],
    active: true,
  });
});
