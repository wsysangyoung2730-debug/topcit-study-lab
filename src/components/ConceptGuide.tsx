import { useState } from "react";
import { ArrowLeft, ArrowRight, BookOpen, Search } from "lucide-react";
import { concepts, conceptBooks, relatedQuestions } from "../concepts";
import { questions } from "../content";
import { kindLabels } from "../types";
import { RichText } from "./QuestionPanel";
import { ConceptVisual } from "./ConceptVisual";
import "./concept-guide.css";

export function ConceptGuide({
  selectedId,
  onSelect,
  onPractice,
}: {
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onPractice: (ids: string[]) => void;
}) {
  const [book, setBook] = useState(0);
  const [search, setSearch] = useState("");
  const current = concepts.find((lesson) => lesson.id === selectedId);
  const visible = concepts.filter(
    (lesson) =>
      (!book || lesson.book === book) &&
      [
        lesson.title,
        lesson.summary,
        ...lesson.keyPoints,
        ...lesson.pitfalls,
        lesson.example.body,
        ...lesson.comparison.rows.flat(),
        ...lesson.related.keywords,
      ]
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  if (current) {
    const related = relatedQuestions(current, questions);
    return (
      <article className="concept-article">
        <button className="secondary" onClick={() => onSelect(null)}>
          <ArrowLeft size={15} /> 개념 목록
        </button>
        <header>
          <span className="pill">
            {current.book}권 ·{" "}
            {conceptBooks.find((b) => b.id === current.book)?.title}
          </span>
          <h2>{current.title}</h2>
          <p>{current.summary}</p>
        </header>
        <ConceptVisual lessonId={current.id} />
        <section>
          <h3>핵심 요약</h3>
          <ul className="concept-keypoints">
            {current.keyPoints.map((point, i) => (
              <li key={i}>{point}</li>
            ))}
          </ul>
        </section>
        <section>
          <h3>한눈에 비교</h3>
          <div
            className="concept-table-scroll"
            tabIndex={0}
            role="region"
            aria-label="개념 비교표"
          >
            <table>
              <thead>
                <tr>
                  {current.comparison.headers.map((head, i) => (
                    <th key={i} scope="col">
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {current.comparison.rows.map((row, i) => (
                  <tr key={i}>
                    {row.map((cell, j) =>
                      j === 0 ? (
                        <th key={j} scope="row">
                          {cell}
                        </th>
                      ) : (
                        <td key={j}>{cell}</td>
                      ),
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <section className="concept-pitfalls">
          <h3>헷갈리기 쉬운 점</h3>
          <ul>
            {current.pitfalls.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </section>
        <section className="concept-example">
          <h3>예제로 이해하기 · {current.example.title}</h3>
          <RichText text={current.example.body} />
        </section>
        <section>
          <div className="section-heading">
            <div>
              <h3>관련 문제로 확인하기</h3>
              <p>
                여러 회차에서 이 개념과 연결된 {related.length}문항을
                찾았습니다.
              </p>
            </div>
            {related.length > 0 && (
              <button
                className="primary"
                onClick={() =>
                  onPractice(related.slice(0, 10).map((q) => q.id))
                }
              >
                관련 문제 {Math.min(10, related.length)}개 풀기{" "}
                <ArrowRight size={15} />
              </button>
            )}
          </div>
          <div className="concept-questions">
            {related.slice(0, 5).map((q) => (
              <button key={q.id} onClick={() => onPractice([q.id])}>
                <span>
                  {q.round ? `${q.round}회차` : "공식 제공 문항"} ·{" "}
                  {kindLabels[q.kind]}
                </span>
                <strong>{q.title}</strong>
                <ArrowRight size={15} />
              </button>
            ))}
          </div>
        </section>
        <footer className="concept-source">
          <h3>학습 근거</h3>
          {current.sources.map((source, i) => (
            <p key={i}>
              {source.title} · {source.chapter}
              {source.pages
                ? ` · ${source.pages}${source.pages.includes("쪽") ? "" : "쪽"}`
                : ""}
              {source.note ? ` — ${source.note}` : ""}
            </p>
          ))}
          <p>
            첨부된 ver.3 교재의 개념을 학습용으로 재구성했습니다. 전체 교재를
            대체하거나 공식 출제 범위를 보장하지 않습니다.
          </p>
        </footer>
      </article>
    );
  }
  return (
    <section className="concept-library">
      <div className="concept-intro">
        <BookOpen size={28} />
        <div>
          <strong>개념을 이해하고, 문제에 적용하기</strong>
          <p>
            첨부 교재 1~5권의 주요 개념 {concepts.length}개를
            요약·비교표·예제·주의점으로 정리했습니다.
          </p>
        </div>
      </div>
      <div className="concept-book-tabs" role="group" aria-label="교재 선택">
        <button aria-pressed={!book} onClick={() => setBook(0)}>
          전체
        </button>
        {conceptBooks.map((b) => (
          <button
            key={b.id}
            aria-pressed={book === b.id}
            onClick={() => setBook(b.id)}
          >
            {b.id}권 {b.title}
          </button>
        ))}
      </div>
      <label className="concept-search">
        <Search size={18} />
        <input
          aria-label="개념 검색"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="개념 검색 · 예: 상속, 정규화, 암호화"
        />
      </label>
      <p className="concept-result-count">{visible.length}개 개념</p>
      {visible.length ? (
        <div className="concept-list">
          {visible.map((lesson, i) => (
            <button
              key={lesson.id}
              onClick={() => {
                onSelect(lesson.id);
                window.scrollTo(0, 0);
              }}
            >
              <span className="concept-list-number">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <small>
                  {lesson.book}권 ·{" "}
                  {conceptBooks.find((b) => b.id === lesson.book)?.title}
                </small>
                <strong>{lesson.title}</strong>
                <p>{lesson.summary}</p>
              </div>
              <ArrowRight size={18} />
            </button>
          ))}
        </div>
      ) : (
        <p className="empty-state">
          검색에 맞는 개념이 없습니다. 다른 단어나 교재를 선택해 주세요.
        </p>
      )}
    </section>
  );
}
