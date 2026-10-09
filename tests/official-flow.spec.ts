import { expect, test, type Page } from "@playwright/test";
import type { StudyState } from "../src/lib/study";
import { legacyPublicState } from "./fixtures/legacy-public";

test.use({ baseURL: "http://127.0.0.1:4281" });

async function savedState(page: Page): Promise<StudyState> {
  return page.evaluate(
    () =>
      new Promise((resolve, reject) => {
        const request = indexedDB.open("topcit-study-lab", 1);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const db = request.result;
          const read = db
            .transaction("records")
            .objectStore("records")
            .get("state");
          read.onsuccess = () => {
            db.close();
            resolve(read.result?.state ?? read.result);
          };
          read.onerror = () => {
            db.close();
            reject(read.error);
          };
        };
      }),
  );
}

async function seedLegacy(page: Page) {
  await page.addInitScript((state) => {
    if (sessionStorage.getItem("legacy-seeded")) return;
    sessionStorage.setItem("legacy-seeded", "yes");
    localStorage.setItem(
      "topcit-study-lab-checkpoint",
      JSON.stringify({
        savedAt: Date.now(),
        state,
      }),
    );
  }, legacyPublicState());
}

test("기존 24문항의 위치·답안·북마크를 보존하고 75문항을 이어 푼다", async ({
  page,
}) => {
  await seedLegacy(page);
  await page.goto("/");
  await page.getByRole("button", { name: "사이트 안에서 해설 학습" }).click();
  await expect(page.locator(".nav-question-count")).toHaveText("3 / 75 문항");
  await expect(
    page.getByRole("heading", { name: "제공 문항 3", exact: true }),
  ).toBeVisible();
  await expect(page.getByLabel("검토하기", { exact: true })).toBeChecked();
  await page.getByRole("tab", { name: /CoffeeRobot 구현/ }).click();
  await expect(page.locator("textarea")).toHaveValue(
    "public class CoffeeRobot extends Robot {}",
  );
  await expect(page.locator(".rubric input").first()).toBeChecked();
  await page.getByRole("button", { name: "50번 문제", exact: true }).click();
  await expect(page.getByRole("radio").nth(1)).toBeChecked();
  await expect(page.getByRole("region", { name: "정답 및 해설" })).toHaveCount(
    0,
  );
  await expect
    .poll(async () => (await savedState(page))?.sessions[0].index)
    .toBe(49);
  const state = await savedState(page);
  expect(state.answers).toEqual(legacyPublicState().answers);
  expect(state.bookmarks).toEqual(legacyPublicState().bookmarks);
  await page.reload();
  await page.getByRole("button", { name: "사이트 안에서 해설 학습" }).click();
  await expect(page.locator(".nav-question-count")).toHaveText("50 / 75 문항");
});

test("75문항 학습에서 통합형 하위 해설과 자기 평가를 독립적으로 표시한다", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(page.locator(".official-card")).toContainText("제공 문항 24개");
  await expect(page.locator(".official-card")).toContainText("재구성 51개");
  await page.getByRole("button", { name: "사이트 안에서 해설 학습" }).click();
  await expect(page.locator(".question-list button")).toHaveCount(75);
  await page.getByRole("radio").nth(2).check();
  await page.getByRole("button", { name: "정답 확인" }).click();
  await expect(page.locator(".option-explanations > div")).toHaveCount(4);
  await page.getByRole("button", { name: "22번 문제", exact: true }).click();
  await page.getByRole("tab", { name: /부모 이름/ }).click();
  await page.locator("textarea").fill("SELECT * FROM Category;");
  await page.getByRole("button", { name: "정답 확인" }).click();
  await expect(
    page.getByText("모범답안과 비교하여 평가하세요.", { exact: true }),
  ).toBeVisible();
  await page.locator(".rubric input").first().check();
  await page.getByText("통합 문항 해설 및 출처", { exact: true }).click();
  await expect(page.locator(".source-details[open]")).toContainText(
    "공식 해설이 아닙니다",
  );
  await expect(
    page.getByText("부모와 자식은 서로 다른 종류의 개체가 아니라", {
      exact: false,
    }),
  ).toHaveCount(0);
  await page.getByRole("tab", { name: /자기참조 ERD/ }).click();
  await expect(page.getByRole("region", { name: "정답 및 해설" })).toHaveCount(
    0,
  );
  await expect(page.getByText("예시 도식", { exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "＋ 엔터티", exact: true }).click();
  await page
    .getByLabel("도형 내용", { exact: true })
    .fill("Category\nPK category_id\nname NOT NULL\nFK parent_id");
  await page.getByRole("button", { name: "정답 확인" }).click();
  await expect(page.getByText("예시 도식", { exact: true })).toBeVisible();
  await page.locator(".rubric input").first().check();
  await page.getByText("통합 문항 해설 및 출처", { exact: true }).click();
  await expect(page.locator(".source-details[open]")).toContainText(
    "부모와 자식은 서로 다른 종류의 개체가 아니라",
  );
  await page.getByRole("tab", { name: /부모 이름/ }).click();
  await expect(page.locator(".rubric input").first()).toBeChecked();

  await page.getByRole("button", { name: "41번 문제", exact: true }).click();
  await page.locator("textarea").fill('{"memberId":"M-027"}');
  await page.getByRole("button", { name: "정답 확인" }).click();
  await page.getByRole("tab", { name: /동시 예약 보호/ }).click();
  await expect(page.getByRole("region", { name: "정답 및 해설" })).toHaveCount(
    0,
  );
  await page.locator("textarea").fill("ㄱ: seat_lock(); ㄴ: seat_unlock();");
  await page.getByRole("button", { name: "정답 확인" }).click();
  await page.getByText("통합 문항 해설 및 출처", { exact: true }).click();
  await expect(page.locator(".source-details[open]")).toContainText(
    "두 요구를 각각 평가한다",
  );
  await page.getByRole("button", { name: "다시 풀기" }).click();
  await expect(page.getByRole("region", { name: "정답 및 해설" })).toHaveCount(
    0,
  );

  await page.getByRole("button", { name: "23번 문제", exact: true }).click();
  await page.locator("textarea").fill("CREATE TABLE Asset (asset_code TEXT);");
  await page.getByRole("button", { name: "정답 확인" }).click();
  await expect(page.locator(".result-banner")).toContainText("직접 평가");
  await page.locator(".rubric input").first().check();
  await page.getByRole("button", { name: "학습 마치기", exact: true }).click();
  await expect(page.locator(".modal-scores")).toContainText("자기 평가");
  expect(errors).toEqual([]);
});

test("공개 기반 시험은 150분이며 제출 전 해설을 숨기고 제출 후 답안을 잠근다", async ({
  page,
}) => {
  await page.clock.install();
  await page.goto("/");
  await page.getByRole("button", { name: "내부 모의시험 · 150분" }).click();
  await expect(page.locator(".question-list button")).toHaveCount(75);
  await expect
    .poll(async () => {
      const state = await savedState(page);
      const session = state?.sessions[0];
      return session && session.deadline! - session.startedAt;
    })
    .toBe(150 * 60 * 1000);
  await expect(page.getByRole("button", { name: "정답 확인" })).toHaveCount(0);
  await page.getByRole("radio").nth(2).check();
  await page.getByRole("button", { name: "41번 문제", exact: true }).click();
  await page.locator("textarea").fill("{}");
  await page.getByRole("tab", { name: /동시 예약 보호/ }).click();
  await expect(page.getByRole("region", { name: "정답 및 해설" })).toHaveCount(
    0,
  );
  await expect(page.locator(".concept-links")).toHaveCount(0);
  await expect
    .poll(async () => (await savedState(page))?.sessions[0].index)
    .toBe(40);
  const session = (await savedState(page)).sessions[0];
  await page.reload();
  await page.getByRole("button", { name: "내부 모의시험 · 150분" }).click();
  await expect(page.locator(".nav-question-count")).toHaveText("41 / 75 문항");
  await expect(page.locator("textarea")).toHaveValue("{}");
  await expect(page.getByRole("button", { name: "정답 확인" })).toHaveCount(0);
  await page.getByRole("tab", { name: /동시 예약 보호/ }).click();
  expect((await savedState(page)).sessions).toEqual([session]);
  await page.getByRole("button", { name: "평가 종료", exact: true }).click();
  await expect(page.locator(".modal-scores")).toHaveCount(0);
  await page.getByRole("button", { name: "마치고 결과 보기" }).click();
  await expect(page.locator("textarea")).toBeDisabled();
  await expect(page.locator(".result-banner")).toContainText("직접 평가");
  await page.getByRole("button", { name: "1번 문제", exact: true }).click();
  await expect(page.getByRole("radio").first()).toBeDisabled();
  await expect(page.locator(".result-banner")).toContainText("정답입니다");
  await expect(page.locator(".session-summary")).toContainText("5/300");
});

test("공개 기반 시험은 시간 만료 시 자동 제출한다", async ({ page }) => {
  await page.clock.install();
  await page.goto("/");
  await page.getByRole("button", { name: "내부 모의시험 · 150분" }).click();
  await page.clock.fastForward(150 * 60 * 1000 + 1000);
  await expect(
    page.getByText("시험 시간이 끝나 답안을 제출했습니다.", { exact: true }),
  ).toBeVisible();
  await expect(page.getByRole("radio").first()).toBeDisabled();
  await expect(page.locator(".session-summary")).toContainText("0/300");
});

test("백업 가져오기도 기존 학습을 확장하며 모바일에서 75문항을 탐색한다", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  page.once("dialog", (dialog) => dialog.accept());
  await page.locator('input[type="file"]').setInputFiles({
    name: "legacy-study.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(legacyPublicState())),
  });
  await expect(
    page.getByText("학습 기록을 가져왔습니다.", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "사이트 안에서 해설 학습" }).click();
  await expect(page.locator(".nav-question-count")).toHaveText("3 / 75 문항");
  await expect(page.getByRole("region", { name: "정답 및 해설" })).toHaveCount(
    0,
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "메뉴 열기", exact: true }).click();
  await page.getByRole("button", { name: "75번 문제", exact: true }).click();
  await expect(page.locator(".nav-question-count")).toHaveText("75 / 75 문항");
  await expect(page.getByRole("button", { name: "다음 문제" })).toBeDisabled();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});
