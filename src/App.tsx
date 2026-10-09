import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Bookmark,
  Check,
  ChevronRight,
  Clock,
  Download,
  ExternalLink,
  GraduationCap,
  LayoutGrid,
  Menu,
  Play,
  Search,
  Shuffle,
  Target,
  TrendingUp,
  Upload,
  X,
} from "lucide-react";
import { questions, roundDescriptions } from "./content";
import { domains, kindLabels, type Domain, type Question } from "./types";
import {
  answerKey,
  automaticResults,
  emptyAnswer,
  emptyState,
  grade,
  hasAnswer,
  isStudyState,
  latestAnswer,
  score,
  shuffled,
  submitSession,
  type Answer,
  type Mode,
  type Session,
  type StudyState,
} from "./lib/study";
import { exportState, readState, writeState, stageState } from "./lib/storage";
import { QuestionPanel, RichText } from "./components/QuestionPanel";
import { ConceptGuide } from "./components/ConceptGuide";
import { relatedConcepts } from "./concepts";
import { ResizablePanes } from "./components/ResizablePanes";
const lookup = new Map(questions.map((q) => [q.id, q]));
const modeLabels: Record<Mode, string> = {
  study: "학습 모드",
  exam: "모의시험",
  random: "랜덤 연습",
  review: "복습 모드",
};
const pad = (n: number) => String(n).padStart(2, "0");
export default function App() {
  const [state, setState] = useState<StudyState>(emptyState),
    [ready, setReady] = useState(false),
    [saveStatus, setSaveStatus] = useState("불러오는 중"),
    [view, setView] = useState<"home" | "session">("home"),
    [section, setSection] = useState("rounds"),
    [conceptId, setConceptId] = useState<string | null>(null),
    [menu, setMenu] = useState(false),
    [now, setNow] = useState(Date.now()),
    [filter, setFilter] = useState<Domain | "all">("all"),
    [search, setSearch] = useState(""),
    [count, setCount] = useState(10),
    [reviewFilter, setReviewFilter] = useState<"wrong" | "bookmark">("wrong"),
    [notice, setNotice] = useState(""),
    [confirmFinish, setConfirmFinish] = useState(false);
  const importRef = useRef<HTMLInputElement>(null);
  const hydrated = useRef(false);
  const latestState = useRef(state);
  latestState.current = state;
  useEffect(() => {
    const flush = () => {
      if (hydrated.current) stageState(latestState.current);
    };
    const hidden = () => {
      if (document.visibilityState === "hidden") flush();
    };
    window.addEventListener("pagehide", flush);
    document.addEventListener("visibilitychange", hidden);
    return () => {
      window.removeEventListener("pagehide", flush);
      document.removeEventListener("visibilitychange", hidden);
    };
  }, []);
  const finishRef = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!confirmFinish) return;
    const prior = document.activeElement as HTMLElement | null;
    finishRef.current?.querySelector<HTMLButtonElement>("button")?.focus();
    return () => prior?.focus();
  }, [confirmFinish]);
  useEffect(() => {
    readState()
      .then((s) => {
        setState(s);
        hydrated.current = true;
        setReady(true);
        setSaveStatus("기록 저장됨");
      })
      .catch(() => {
        setReady(true);
        setSaveStatus("저장 공간을 사용할 수 없습니다. 기록을 내보내세요.");
      });
  }, []);
  useEffect(() => {
    if (!ready || !hydrated.current) return;
    setSaveStatus("저장 중");
    const timer = setTimeout(() => {
      writeState(state)
        .then(() => setSaveStatus("기록 저장됨"))
        .catch(() => setSaveStatus("저장 실패 · 기록을 내보내세요"));
    }, 250);
    return () => clearTimeout(timer);
  }, [state, ready]);
  const active = state.sessions.find((s) => s.id === state.activeId);
  const q = active ? lookup.get(active.ids[active.index]) : undefined;
  useEffect(() => {
    if (active?.mode !== "exam" || active.endedAt) return;
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [active?.id, active?.mode, active?.endedAt]);
  useEffect(() => {
    if (
      active?.mode === "exam" &&
      !active.endedAt &&
      active.deadline &&
      now >= active.deadline
    ) {
      setState((s) => submitSession(s, active, questions));
      setNotice("시험 시간이 끝나 답안을 제출했습니다.");
    }
  }, [now, active]);
  const answered = questions.filter((q) => latestAnswer(state, q.id));
  const wrong = questions.filter((q) =>
    automaticResults(latestAnswer(state, q.id)).includes(false),
  );
  const autoRecords = answered.flatMap((q) =>
    automaticResults(latestAnswer(state, q.id)),
  );
  const filtered = questions.filter(
    (q) =>
      (filter === "all" || q.domain === filter) &&
      `${q.topic} ${q.title}`.toLowerCase().includes(search.toLowerCase()),
  );
  const reviewQuestions = (
    reviewFilter === "bookmark"
      ? questions.filter((q) => state.bookmarks.includes(q.id))
      : wrong
  ).filter(
    (q) =>
      (filter === "all" || q.domain === filter) &&
      `${q.topic} ${q.title}`.includes(search),
  );
  const stats = useMemo(
    () =>
      domains.map((d) => {
        const records = questions
          .filter((q) => q.domain === d.id)
          .map((q) => latestAnswer(state, q.id))
          .filter(Boolean);
        const auto = records.flatMap(automaticResults);
        return {
          ...d,
          done: records.length,
          accuracy: auto.length
            ? Math.round((auto.filter(Boolean).length / auto.length) * 100)
            : undefined,
        };
      }),
    [state],
  );
  function start(mode: Mode, ids: string[], round?: number) {
    if (!ids.length) {
      setNotice("선택한 조건에 맞는 문제가 없습니다.");
      return;
    }
    const existing =
      mode === "study" || mode === "exam"
        ? [...state.sessions]
            .reverse()
            .find((s) => s.mode === mode && s.round === round && !s.endedAt)
        : undefined;
    if (existing) {
      setState((s) => ({ ...s, activeId: existing.id }));
    } else {
      const session: Session = {
        id: crypto.randomUUID(),
        mode,
        ids,
        index: 0,
        round,
        startedAt: Date.now(),
        ...(mode === "exam" ? { deadline: Date.now() + 150 * 60 * 1000 } : {}),
      };
      setState((s) => ({
        ...s,
        sessions: [...s.sessions, session],
        activeId: session.id,
      }));
    }
    setView("session");
    setMenu(false);
    window.scrollTo(0, 0);
  }
  function updateAnswer(answer: Answer) {
    if (!active || !q) return;
    setState((s) => ({
      ...s,
      answers: { ...s.answers, [answerKey(active, q.id)]: answer },
    }));
  }
  function bookmark(id: string) {
    setState((s) => ({
      ...s,
      bookmarks: s.bookmarks.includes(id)
        ? s.bookmarks.filter((x) => x !== id)
        : [...s.bookmarks, id],
    }));
  }
  function navigate(index: number) {
    if (!active) return;
    setState((s) => ({
      ...s,
      sessions: s.sessions.map((x) =>
        x.id === active.id ? { ...x, index } : x,
      ),
    }));
    setMenu(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function goHome(next = "rounds") {
    setSection(next);
    setView("home");
    setMenu(false);
    setNotice("");
  }
  async function importFile(file?: File) {
    if (!file) return;
    try {
      if (file.size > 30_000_000) throw new Error();
      const parsed: unknown = JSON.parse(await file.text());
      if (!isStudyState(parsed)) throw new Error();
      if (!window.confirm("백업 파일의 기록으로 현재 학습 기록을 교체할까요?"))
        return;
      setState(parsed);
      setView("home");
      setNotice("학습 기록을 가져왔습니다.");
    } catch {
      setNotice(
        "올바른 Study Lab 백업 파일이 아닙니다. 현재 기록은 유지됩니다.",
      );
    } finally {
      if (importRef.current) importRef.current.value = "";
    }
  }
  const a =
    active && q
      ? (state.answers[answerKey(active, q.id)] ?? emptyAnswer())
      : emptyAnswer();
  const sessionQuestions = active
    ? active.ids
        .map((id) => lookup.get(id))
        .filter((x): x is Question => Boolean(x))
    : [];
  const done = active
    ? sessionQuestions.filter((q) =>
        hasAnswer(state.answers[answerKey(active, q.id)]),
      ).length
    : 0;
  const sessionScore = active
    ? sessionQuestions.reduce(
        (s, q) => {
          const n = score(q, state.answers[answerKey(active, q.id)]);
          return {
            auto: s.auto + n.auto,
            self: s.self + n.self,
            autoMax: s.autoMax + n.autoMax,
            selfMax: s.selfMax + n.selfMax,
          };
        },
        { auto: 0, self: 0, autoMax: 0, selfMax: 0 },
      )
    : undefined;
  const remaining = active?.deadline
    ? Math.max(0, Math.floor((active.deadline - now) / 1000))
    : 0;
  return (
    <div className="app-shell">
      <aside className={`sidebar ${menu ? "open" : ""}`}>
        <button
          className="mobile-close icon-button"
          onClick={() => setMenu(false)}
          aria-label="메뉴 닫기"
        >
          <X />
        </button>
        {view === "home" ? (
          <>
            <div className="nav-label">학습 메뉴</div>
            <nav>
              {[
                ["concepts", "개념 정리", BookOpen],
                ["rounds", "회차별 학습", LayoutGrid],
                ["random", "랜덤 연습", Shuffle],
                ["review", "오답 · 북마크", Bookmark],
                ["stats", "학습 기록", TrendingUp],
              ].map(([id, label, Icon]) => {
                const I = Icon as typeof LayoutGrid;
                return (
                  <button
                    key={id as string}
                    className={section === id ? "active" : ""}
                    onClick={() => goHome(id as string)}
                  >
                    <I size={19} />
                    {label as string}
                    {id === "review" && wrong.length > 0 && (
                      <span className="nav-count">{wrong.length}</span>
                    )}
                  </button>
                );
              })}
            </nav>
            <div className="sidebar-note">
              <strong>학습 안내</strong>
              <p>
                학습 모드에서는 문항마다 정답과 해설을 확인합니다. 모의시험은
                제출 후 해설이 공개됩니다.
              </p>
              <p>서술·코드·도식 답안은 모범답안과 기준으로 직접 평가합니다.</p>
            </div>
          </>
        ) : (
          <>
            <button className="back-nav" onClick={() => goHome()}>
              <ArrowLeft size={16} /> 학습실로 돌아가기
            </button>
            <div className="nav-label">
              문항 목록{" "}
              <span>
                {done}/{active?.ids.length}
              </span>
            </div>
            <div className="question-map question-map-list">
              {domains.map((d, i) => {
                const items = sessionQuestions
                  .map((item, index) => ({ item, index }))
                  .filter(({ item }) => item.domain === d.id);
                if (!items.length) return null;
                return (
                  <details className="domain-section" key={d.id} open>
                    <summary>
                      M{i + 1}. {d.label}
                    </summary>
                    <div className="question-list">
                      {items.map(({ item, index }) => {
                        const record =
                          active && state.answers[answerKey(active, item.id)];
                        return (
                          <button
                            key={item.id}
                            title={`${index + 1}번 ${kindLabels[item.kind]}`}
                            aria-label={`${index + 1}번 문제`}
                            aria-current={
                              q?.id === item.id ? "step" : undefined
                            }
                            className={`${q?.id === item.id ? "current" : ""} ${record?.checked ? (record.correct === false ? "wrong" : "done") : hasAnswer(record) ? "written" : ""} ${state.bookmarks.includes(item.id) ? "flagged" : ""}`}
                            onClick={() => navigate(index)}
                          >
                            <span className="q-status" aria-hidden="true">
                              {q?.id === item.id
                                ? "➜"
                                : record?.checked
                                  ? "✓"
                                  : "□"}
                            </span>
                            <span className="q-label">
                              {index + 1}번 [{kindLabels[item.kind]}]
                            </span>
                            <span className="q-meta">
                              {item.points}점
                              {state.bookmarks.includes(item.id) ? " ☆" : ""}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </details>
                );
              })}
            </div>
            <div className="progress-panel">
              <h3>진행 현황</h3>
              <table className="progress-table">
                <thead>
                  <tr>
                    <th>구분</th>
                    <th>미응답</th>
                    <th>검토</th>
                    <th>전체</th>
                  </tr>
                </thead>
                <tbody>
                  {domains.map((d, i) => {
                    const items = sessionQuestions.filter(
                      (item) => item.domain === d.id,
                    );
                    if (!items.length) return null;
                    return (
                      <tr key={d.id}>
                        <th>
                          M{i + 1}. {d.short}
                        </th>
                        <td>
                          {
                            items.filter(
                              (item) =>
                                !hasAnswer(
                                  active &&
                                    state.answers[answerKey(active, item.id)],
                                ),
                            ).length
                          }
                        </td>
                        <td>
                          {
                            items.filter((item) =>
                              state.bookmarks.includes(item.id),
                            ).length
                          }
                        </td>
                        <td>{items.length}</td>
                      </tr>
                    );
                  })}
                  <tr>
                    <th>합계</th>
                    <td>{sessionQuestions.length - done}</td>
                    <td>
                      {
                        sessionQuestions.filter((item) =>
                          state.bookmarks.includes(item.id),
                        ).length
                      }
                    </td>
                    <td>{sessionQuestions.length}</td>
                  </tr>
                </tbody>
              </table>
              <p className="map-legend">✓ 확인 완료 · 주황색: 오답 · ☆ 검토</p>
            </div>
          </>
        )}
        <div className="sidebar-bottom">
          <div className="save-status">
            <span /> {saveStatus}
          </div>
          <div className="backup-buttons">
            <button onClick={() => exportState(state)}>
              <Download size={14} /> 내보내기
            </button>
            <button onClick={() => importRef.current?.click()}>
              <Upload size={14} /> 가져오기
            </button>
          </div>
          <p>학습 기록은 이 브라우저에 저장됩니다.</p>
        </div>
      </aside>
      {menu && (
        <button
          className="menu-overlay"
          aria-label="메뉴 닫기"
          onClick={() => setMenu(false)}
        />
      )}
      <input
        type="file"
        hidden
        accept="application/json,.json"
        ref={importRef}
        onChange={(e) => void importFile(e.target.files?.[0])}
      />
      <div className="workspace">
        <header className="topbar">
          <div className="topbar-brand">
            <button
              className="icon-button mobile-menu"
              aria-label="메뉴 열기"
              onClick={() => setMenu(true)}
            >
              <Menu />
            </button>
            <button className="brand" onClick={() => goHome()}>
              <span className="brand-mark">
                <BookOpen size={27} />
              </span>
              <span className="official-title">
                TOPCIT 학습 시뮬레이션
                <small>STUDY LAB · 비공식 학습 도구</small>
              </span>
            </button>
          </div>
          <div className="topbar-center">
            <Clock size={25} />
            <span
              className={`timer ${view === "session" && active?.mode === "exam" && remaining < 300 ? "urgent" : ""}`}
            >
              {view === "session" && active?.mode === "exam" && !active.endedAt
                ? `${pad(Math.floor(remaining / 60))}:${pad(remaining % 60)} / 150:00`
                : active?.endedAt && view === "session"
                  ? "제출 완료"
                  : "시간 제한 없음"}
            </span>
            <span className="mode-label">
              {view === "home"
                ? section === "concepts"
                  ? "개념 정리"
                  : "회차 선택"
                : active?.round === 0
                  ? "공개 문항 기반 학습"
                  : `${active?.round ? `${pad(active.round)}회차 · ` : ""}${active ? modeLabels[active.mode] : ""}`}
            </span>
          </div>
          <div className="topbar-right">
            <span>문항별 정답·해설 학습</span>
          </div>
        </header>
        {!ready ? (
          <main className="loading">학습 기록을 불러오고 있습니다…</main>
        ) : (
          <>
            {notice && (
              <div className="notice" role="status">
                {notice}
                <button aria-label="알림 닫기" onClick={() => setNotice("")}>
                  <X size={15} />
                </button>
              </div>
            )}
            {view === "home" ? (
              <main className="home-content home-page">
                <div className="home-intro">
                  <h1>
                    {section === "concepts"
                      ? "개념 정리 · 교재 1~5권"
                      : section === "rounds"
                        ? "모의응시 · 회차 선택"
                        : section === "random"
                          ? "랜덤 연습"
                          : section === "review"
                            ? "오답 · 북마크"
                            : "학습 기록"}
                  </h1>
                  <p>
                    {section === "concepts"
                      ? "핵심 요약과 비교표로 개념을 익히고 관련 문제를 풀어 보세요."
                      : section === "rounds"
                        ? "회차를 선택하여 학습하거나 제한 시간 안에 모의시험을 응시할 수 있습니다."
                        : section === "random"
                          ? "영역과 개념을 선택해 여러 회차의 문제를 섞어 연습합니다."
                          : section === "review"
                            ? "틀린 문항과 검토할 문항을 모아서 다시 풀이합니다."
                            : "문항별 최근 확인 결과와 학습 이력을 확인합니다."}
                  </p>
                </div>
                {section !== "concepts" && (
                  <div className="stats-strip">
                    <div>
                      <BookOpen size={19} />
                      <span>
                        학습한 문제
                        <strong>
                          {answered.length}
                          <small> / {questions.length}</small>
                        </strong>
                      </span>
                    </div>
                    <div>
                      <Target size={19} />
                      <span>
                        객관·단답 정답률
                        <strong>
                          {autoRecords.length
                            ? `${Math.round((autoRecords.filter(Boolean).length / autoRecords.length) * 100)}%`
                            : "—"}
                          <small> 최근 답안 기준</small>
                        </strong>
                      </span>
                    </div>
                    <div>
                      <Bookmark size={19} />
                      <span>
                        다시 볼 문제
                        <strong>
                          {state.bookmarks.length}
                          <small> 북마크</small>
                        </strong>
                      </span>
                    </div>
                    <div>
                      <GraduationCap size={21} />
                      <span>
                        준비된 연습
                        <strong>
                          10<small> 회차 · 750문항</small>
                        </strong>
                      </span>
                    </div>
                  </div>
                )}
                {section === "concepts" ? (
                  <ConceptGuide
                    selectedId={conceptId}
                    onSelect={(id) => {
                      setConceptId(id);
                      window.scrollTo(0, 0);
                    }}
                    onPractice={(ids) => start("review", ids)}
                  />
                ) : section === "rounds" ? (
                  <>
                    <div className="section-heading">
                      <div>
                        <h2>회차별 학습</h2>
                        <p>
                          1회차는 참고자료 기반, 2–10회차는 개념을 확장한 창작
                          문제입니다.
                        </p>
                      </div>
                      <span className="pill">75문항 / 회차</span>
                    </div>
                    <div className="round-grid">
                      {Array.from({ length: 10 }, (_, i) => i + 1).map(
                        (round) => {
                          const items = questions.filter(
                              (q) => q.round === round,
                            ),
                            completed = items.filter((q) =>
                              latestAnswer(state, q.id),
                            ).length;
                          return (
                            <article
                              className={`round-card ${round === 1 ? "featured" : ""}`}
                              key={round}
                            >
                              <div className="round-card-top">
                                <span className="round-number">
                                  {pad(round)}
                                </span>
                                <span className="round-type">
                                  {round === 1
                                    ? "참고자료 기반"
                                    : "창작 예상문제"}
                                </span>
                                {completed === 75 && <CheckCircleIcon />}
                              </div>
                              <h3>
                                {roundDescriptions[round - 1]?.title ??
                                  `${round}회차 종합 연습`}
                              </h3>
                              <p>
                                {roundDescriptions[round - 1]?.description ??
                                  "네 영역의 개념을 실전 형식으로 확인합니다."}
                              </p>
                              <div className="round-meta">
                                <span>
                                  <BookOpen size={13} /> 75문항
                                </span>
                                <span>기초 → 응용</span>
                              </div>
                              <div className="round-progress">
                                <span
                                  style={{
                                    width: `${(completed / 75) * 100}%`,
                                  }}
                                />
                              </div>
                              <div className="round-bottom">
                                <small>
                                  {completed
                                    ? `${completed} / 75문항 확인`
                                    : "미응시"}
                                </small>
                                <div>
                                  <button
                                    className="exam-link"
                                    onClick={() =>
                                      start(
                                        "exam",
                                        items.map((q) => q.id),
                                        round,
                                      )
                                    }
                                  >
                                    시험
                                  </button>
                                  <button
                                    className="start-link"
                                    aria-label={`${round}회차 학습 시작`}
                                    onClick={() =>
                                      start(
                                        "study",
                                        items.map((q) => q.id),
                                        round,
                                      )
                                    }
                                  >
                                    {completed ? "계속 학습" : "학습 시작"}{" "}
                                    <ArrowRight size={16} />
                                  </button>
                                </div>
                              </div>
                            </article>
                          );
                        },
                      )}
                    </div>
                    <OfficialCard
                      startExam={() =>
                        start("exam", questions.filter((q) => q.round === 0).map((q) => q.id), 0)
                      }
                      start={() =>
                        start(
                          "study",
                          questions
                            .filter((q) => q.round === 0)
                            .map((q) => q.id),
                          0,
                        )
                      }
                      count={questions.filter((q) => q.round === 0).length}
                    />
                  </>
                ) : section === "random" ? (
                  <section className="practice-builder">
                    <div className="section-heading">
                      <div>
                        <h2>나에게 맞는 연습 만들기</h2>
                        <p>선택한 조건에서 중복 없이 무작위로 출제합니다.</p>
                      </div>
                      <Shuffle size={24} />
                    </div>
                    <Filters
                      filter={filter}
                      setFilter={setFilter}
                      search={search}
                      setSearch={setSearch}
                    />
                    <div className="random-controls">
                      <label>
                        풀 문제 수
                        <select
                          value={count}
                          onChange={(e) => setCount(Number(e.target.value))}
                        >
                          {[10, 20, 30, 50].map((n) => (
                            <option key={n} value={n}>
                              {n}문항
                            </option>
                          ))}
                        </select>
                      </label>
                      <p>
                        현재 조건에 맞는 문제{" "}
                        <strong>{filtered.length}개</strong>
                      </p>
                      <button
                        className="primary"
                        disabled={!filtered.length}
                        onClick={() =>
                          start(
                            "random",
                            shuffled(filtered)
                              .slice(0, count)
                              .map((q) => q.id),
                          )
                        }
                      >
                        연습 시작 <ArrowRight size={17} />
                      </button>
                    </div>
                    <div className="topic-chips">
                      {[...new Set(filtered.map((q) => q.topic))]
                        .slice(0, 36)
                        .map((t) => (
                          <button key={t} onClick={() => setSearch(t)}>
                            {t}
                          </button>
                        ))}
                    </div>
                  </section>
                ) : section === "review" ? (
                  <>
                    <div className="review-tabs">
                      <button
                        className={reviewFilter === "wrong" ? "active" : ""}
                        onClick={() => setReviewFilter("wrong")}
                      >
                        오답 {wrong.length}
                      </button>
                      <button
                        className={reviewFilter === "bookmark" ? "active" : ""}
                        onClick={() => setReviewFilter("bookmark")}
                      >
                        북마크 {state.bookmarks.length}
                      </button>
                    </div>
                    <Filters
                      filter={filter}
                      setFilter={setFilter}
                      search={search}
                      setSearch={setSearch}
                    />
                    {reviewQuestions.length ? (
                      <>
                        <div className="review-action">
                          <span>{reviewQuestions.length}개의 문제</span>
                          <button
                            className="primary"
                            onClick={() =>
                              start(
                                "review",
                                reviewQuestions.map((q) => q.id),
                              )
                            }
                          >
                            모아서 다시 풀기 <ArrowRight size={16} />
                          </button>
                        </div>
                        <div className="review-list">
                          {reviewQuestions.map((item) => (
                            <button
                              key={item.id}
                              onClick={() => start("review", [item.id])}
                            >
                              <span className="pill">
                                {item.round === 0
                                  ? "공개 기반"
                                  : `${item.round}회차`}
                              </span>
                              <div>
                                <strong>{item.title}</strong>
                                <p>
                                  {item.topic} · {kindLabels[item.kind]}
                                </p>
                              </div>
                              <ChevronRight size={18} />
                            </button>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div className="empty-state">
                        <Bookmark size={35} />
                        <h3>
                          {reviewFilter === "wrong"
                            ? "틀린 문제는 여기에 모입니다."
                            : "다시 보고 싶은 문제를 저장하세요."}
                        </h3>
                        <p>
                          문제를 풀며 북마크를 남기거나, 정답 확인 후
                          복습해보세요.
                        </p>
                        <button className="primary" onClick={() => goHome()}>
                          문제 풀러 가기
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div className="domain-stats">
                      {stats.map((d) => (
                        <article key={d.id}>
                          <span
                            className="domain-dot"
                            style={{ background: d.color }}
                          />
                          <h3>{d.label}</h3>
                          <strong>
                            {d.accuracy === undefined ? "—" : `${d.accuracy}%`}
                          </strong>
                          <p>{d.done}문항 학습 · 자동 채점 문항 정답률</p>
                          <div className="round-progress">
                            <span
                              style={{
                                width: `${d.accuracy ?? 0}%`,
                                background: d.color,
                              }}
                            />
                          </div>
                        </article>
                      ))}
                    </div>
                    <div className="section-heading">
                      <h2>나의 학습 기록</h2>
                    </div>
                    {state.sessions.length ? (
                      <div className="history-list">
                        {[...state.sessions].reverse().map((s) => (
                          <button
                            key={s.id}
                            onClick={() => {
                              setState((v) => ({ ...v, activeId: s.id }));
                              setView("session");
                            }}
                          >
                            <span>
                              {new Date(s.startedAt).toLocaleDateString(
                                "ko-KR",
                              )}
                            </span>
                            <strong>
                              {s.round === 0
                                ? "공개 기반 학습"
                                : s.round
                                  ? `${s.round}회차`
                                  : ""}{" "}
                              {modeLabels[s.mode]}
                            </strong>
                            <span>
                              {s.ids.length}문항 ·{" "}
                              {s.endedAt ? "완료" : "진행 중"}
                            </span>
                            <ChevronRight size={17} />
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="empty-state">
                        <TrendingUp />
                        <p>첫 문제를 풀면 학습 기록이 시작됩니다.</p>
                      </div>
                    )}
                  </>
                )}
                <footer className="site-footer">
                  <span>TOPCIT STUDY LAB</span>
                  <p>
                    공식 TOPCIT과 별개인 개인 학습 서비스 · 모의 점수는 실제
                    시험 성적을 예측하지 않습니다.
                  </p>
                  <a
                    href="https://www.topcit.or.kr"
                    target="_blank"
                    rel="noreferrer"
                  >
                    공식 사이트 <ExternalLink size={12} />
                  </a>
                </footer>
              </main>
            ) : active && q ? (
              <main className="session-content">
                <div className="session-heading">
                  <h1>문제 풀이 영역</h1>
                  <span>
                    {q.round === 0 ? "공개 문항 기반 학습" : `${q.round}회차`} ·{" "}
                    {domains.find((d) => d.id === q.domain)?.label}
                  </span>
                </div>
                {active.endedAt && sessionScore && (
                  <div className="session-summary">
                    <div>
                      <strong>학습 결과</strong>
                      <p>자동 채점과 자기 평가를 나누어 확인하세요.</p>
                    </div>
                    <span>
                      자동{" "}
                      <b>
                        {sessionScore.auto}/{sessionScore.autoMax}
                      </b>
                    </span>
                    <span>
                      자기 평가{" "}
                      <b>
                        {sessionScore.self}/{sessionScore.selfMax}
                      </b>
                    </span>
                  </div>
                )}
                <ResizablePanes
                  resetKey={q.id}
                  top={
                    <div className="question-header">
                      <div className="question-number-panel">
                        <strong>{active.index + 1}</strong>
                        <span>
                          {kindLabels[q.kind]}
                          <br />
                          {q.points}점
                        </span>
                        <label className="review-check">
                          <input
                            type="checkbox"
                            checked={state.bookmarks.includes(q.id)}
                            onChange={() => bookmark(q.id)}
                          />
                          검토하기
                        </label>
                      </div>
                      <div className="question-heading">
                        <h2>{q.title}</h2>
                        <div className="question-prompt">
                          <RichText text={q.prompt} />
                        </div>
                        {q.stimulus && (
                          <div className="stimulus">
                            <RichText text={q.stimulus} />
                          </div>
                        )}
                      </div>
                    </div>
                  }
                >
                  <div className="answer-section">
                    <QuestionPanel
                      key={`${active.id}-${q.id}`}
                      question={q}
                      answer={a}
                      onChange={updateAnswer}
                      exam={active.mode === "exam"}
                      ended={Boolean(active.endedAt)}
                    />
                    {(active.mode !== "exam" || active.endedAt) &&
                      (a.checked ||
                        (a.parts &&
                          Object.values(a.parts).some(
                            (part) => part.checked,
                          ))) &&
                      relatedConcepts(q).length > 0 && (
                        <div className="concept-links">
                          <strong>이 문제의 개념 다시 보기</strong>
                          {relatedConcepts(q).map((lesson) => (
                            <button
                              key={lesson.id}
                              onClick={() => {
                                setConceptId(lesson.id);
                                goHome("concepts");
                                window.scrollTo(0, 0);
                              }}
                            >
                              {lesson.title} →
                            </button>
                          ))}
                        </div>
                      )}
                  </div>
                </ResizablePanes>
                <div className="question-nav">
                  <span className="nav-question-count">
                    {active.index + 1} / {active.ids.length} 문항
                  </span>
                  <div className="question-nav-actions">
                    <button
                      className="primary"
                      disabled={active.index === 0}
                      onClick={() => navigate(active.index - 1)}
                    >
                      <ArrowLeft size={18} />
                      이전 문제
                    </button>
                    <button
                      className="primary"
                      disabled={active.index === active.ids.length - 1}
                      onClick={() => navigate(active.index + 1)}
                    >
                      다음 문제
                      <ArrowRight size={18} />
                    </button>
                    <button
                      className="finish-button"
                      onClick={() => setConfirmFinish(true)}
                    >
                      {active.endedAt
                        ? "결과 보기"
                        : active.mode === "exam"
                          ? "평가 종료"
                          : "학습 마치기"}
                    </button>
                  </div>
                </div>
                <div className="question-footnote">
                  {q.round === 0
                    ? `${q.officialNumber}번 · ${q.title.includes("재구성") ? "공개 출제 개념을 바탕으로 재구성" : "사용자 제공 문항"} · 자체 작성 해설`
                    : q.origin === "reference-adapted"
                      ? "제공된 참고자료를 바탕으로 구성한 학습 문항"
                      : "교재 개념에 기반한 창작 예상문제"}{" "}
                  · 정답 확인 후 해설과 출처를 볼 수 있습니다.
                </div>
              </main>
            ) : (
              <main className="empty-state">
                <p>이 기록의 문항을 찾을 수 없습니다.</p>
                <button onClick={() => goHome()}>학습실로</button>
              </main>
            )}
          </>
        )}
      </div>
      {confirmFinish && active && (
        <div className="modal-backdrop">
          <section
            ref={finishRef}
            onKeyDown={(e) => {
              if (e.key === "Escape") setConfirmFinish(false);
              if (e.key === "Tab") {
                const buttons =
                  finishRef.current?.querySelectorAll<HTMLButtonElement>(
                    "button",
                  );
                if (!buttons?.length) return;
                const first = buttons[0],
                  last = buttons[buttons.length - 1];
                if (e.shiftKey && document.activeElement === first) {
                  e.preventDefault();
                  last.focus();
                } else if (!e.shiftKey && document.activeElement === last) {
                  e.preventDefault();
                  first.focus();
                }
              }
            }}
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="finish-title"
          >
            <div className="modal-icon">
              <GraduationCap size={30} />
            </div>
            <h2 id="finish-title">
              {active.endedAt
                ? "이번 학습을 마쳤어요."
                : "지금 학습을 마칠까요?"}
            </h2>
            <p>
              {done} / {active.ids.length}문항에 답안을 작성했습니다.
              <br />
              {active.mode === "exam" && !active.endedAt
                ? "제출 후에는 답안을 수정할 수 없고 해설이 공개됩니다."
                : "기록은 저장되어 학습 기록에서 다시 볼 수 있어요."}
            </p>
            {sessionScore && (active.mode !== "exam" || active.endedAt) && (
              <div className="modal-scores">
                <span>
                  자동 채점{" "}
                  <b>
                    {sessionScore.auto}/{sessionScore.autoMax}
                  </b>
                </span>
                <span>
                  자기 평가{" "}
                  <b>
                    {sessionScore.self}/{sessionScore.selfMax}
                  </b>
                </span>
              </div>
            )}
            <div className="modal-actions">
              <button
                className="secondary"
                onClick={() => setConfirmFinish(false)}
              >
                계속 보기
              </button>
              <button
                className="primary"
                onClick={() => {
                  if (!active.endedAt) {
                    setState((s) =>
                      active.mode === "exam"
                        ? submitSession(s, active, questions)
                        : {
                            ...s,
                            sessions: s.sessions.map((x) =>
                              x.id === active.id
                                ? { ...x, endedAt: Date.now() }
                                : x,
                            ),
                          },
                    );
                    setConfirmFinish(false);
                    setNotice(
                      "학습을 마쳤습니다. 문제별 해설과 자기 평가를 확인하세요.",
                    );
                  } else {
                    setConfirmFinish(false);
                    goHome("stats");
                  }
                }}
              >
                {active.endedAt ? "학습 기록 보기" : "마치고 결과 보기"}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
function CheckCircleIcon() {
  return (
    <span className="completed-icon">
      <Check size={17} />
    </span>
  );
}
function Filters({
  filter,
  setFilter,
  search,
  setSearch,
}: {
  filter: Domain | "all";
  setFilter: (d: Domain | "all") => void;
  search: string;
  setSearch: (s: string) => void;
}) {
  return (
    <div className="filters">
      <div className="filter-pills">
        <button
          className={filter === "all" ? "active" : ""}
          onClick={() => setFilter("all")}
        >
          전체 영역
        </button>
        {domains.map((d) => (
          <button
            key={d.id}
            className={filter === d.id ? "active" : ""}
            onClick={() => setFilter(d.id)}
          >
            {d.short}
          </button>
        ))}
      </div>
      <label className="search-box">
        <Search size={17} />
        <input
          aria-label="개념 검색"
          placeholder="개념 검색 (예: 정규화, UML)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </label>
    </div>
  );
}
function OfficialCard({ start, startExam, count }: { start: () => void; startExam: () => void; count: number }) {
  return (
    <section className="official-card">
      <div className="official-icon">
        <ExternalLink size={24} />
      </div>
      <div>
        <span className="section-kicker">공식 시뮬레이션</span>
        <h3>공식 원본과 해설 학습</h3>
        <p>
          원문은 공식 사이트에서, 풀이와 관련 개념은 이곳에서 공부하세요.
          <br />
          내부 학습 {count}문항: 제공 문항 24개 + 출제 개념 기반 재구성 51개.
          지문이 원문과 다를 수 있으며, 정답과 해설은 자체 작성했습니다.
        </p>
      </div>
      <div className="official-actions">
        <a
          className="secondary"
          href="https://www.topcit.or.kr/ibtsimulation/IBT.do"
          target="_blank"
          rel="noreferrer"
        >
          공식 원본 실행 <ExternalLink size={14} />
        </a>
        <button className="primary" disabled={!count} onClick={start}>
          사이트 안에서 해설 학습 <ArrowRight size={15} />
        </button>
        <button className="secondary" disabled={!count} onClick={startExam}>
          내부 모의시험 · 150분
        </button>
      </div>
    </section>
  );
}
