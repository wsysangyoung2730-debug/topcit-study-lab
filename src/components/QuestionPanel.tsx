import { useState } from "react";
import {
  Check,
  CheckCircle2,
  Lightbulb,
  RotateCcw,
  XCircle,
} from "lucide-react";
import type { Question, QuestionPart } from "../types";
import { emptyAnswer, grade, hasAnswer, type Answer } from "../lib/study";
import { DiagramEditor, DiagramView } from "./DiagramEditor";
export function RichText({ text }: { text?: string }) {
  if (!text) return null;
  return (
    <div className="rich-text">
      {text
        .split(/(```[\s\S]*?```)/g)
        .filter(Boolean)
        .map((block, i) =>
          block.startsWith("```") ? (
            <pre key={i}>
              <code>
                {block.replace(/^```[^\n]*\n?/, "").replace(/```$/, "")}
              </code>
            </pre>
          ) : (
            block.split(/\n\n+/).map((p, j) =>
              p.trim().startsWith("|") ? (
                <div className="table-wrap" key={`${i}-${j}`}>
                  <table>
                    <tbody>
                      {p
                        .trim()
                        .split("\n")
                        .filter((l) => !/^\|[\s:|\-]+\|$/.test(l))
                        .map((line, k) => (
                          <tr key={k}>
                            {line
                              .split("|")
                              .slice(1, -1)
                              .map((cell, l) =>
                                k === 0 ? (
                                  <th key={l}>{cell.trim()}</th>
                                ) : (
                                  <td key={l}>{cell.trim()}</td>
                                ),
                              )}
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p key={`${i}-${j}`}>
                  {p
                    .split(/(\*\*.*?\*\*)/g)
                    .map((s, k) =>
                      s.startsWith("**") ? (
                        <strong key={k}>{s.slice(2, -2)}</strong>
                      ) : (
                        s
                      ),
                    )}
                </p>
              ),
            )
          ),
        )}
    </div>
  );
}
function QuestionInput({
  question: q,
  answer: a,
  onChange,
  locked,
}: {
  question: Question | QuestionPart;
  answer: Answer;
  onChange: (a: Answer) => void;
  locked: boolean;
}) {
  if (q.kind === "choice")
    return (
      <fieldset className="options">
        <legend className="sr-only">답안 선택</legend>
        {q.options?.map((o, i) => (
          <label
            key={o.id}
            className={`option ${a.value === o.id ? "selected" : ""} ${a.checked && o.id === q.answer ? "correct" : ""} ${a.checked && a.value === o.id && !a.correct ? "wrong" : ""}`}
          >
            <input
              type="radio"
              name={q.id}
              value={o.id}
              checked={a.value === o.id}
              disabled={locked}
              onChange={() => onChange({ ...a, value: o.id })}
            />
            <span className="option-number">{i + 1}</span>
            <span>{o.text}</span>
            {a.checked && o.id === q.answer && <Check size={19} />}
          </label>
        ))}
      </fieldset>
    );
  if (q.kind === "diagram")
    return (
      <>
        <h3 className="answer-heading">답안 작성</h3>
        <DiagramEditor
          value={a.diagram ?? { nodes: [], edges: [] }}
          onChange={(diagram) => onChange({ ...a, diagram })}
          disabled={locked}
        />
      </>
    );
  return (
    <div className="answer-field">
      <h3 className="answer-heading">답안 작성</h3>
      <div className="answer-label">
        <label htmlFor={`answer-${q.id}`}>
          {q.kind === "code" ? `${q.language ?? "코드"} 답안` : "답안"}
        </label>
        <span>{a.value.length}자</span>
      </div>
      {q.kind === "short" && q.acceptedAnswers?.length ? (
        <input
          id={`answer-${q.id}`}
          value={a.value}
          disabled={locked}
          onChange={(e) => onChange({ ...a, value: e.target.value })}
          placeholder="답안을 입력하세요."
        />
      ) : (
        <textarea
          id={`answer-${q.id}`}
          className={q.kind === "code" ? "code-input" : ""}
          rows={q.kind === "code" ? 13 : 7}
          value={a.value}
          disabled={locked}
          onChange={(e) => onChange({ ...a, value: e.target.value })}
          placeholder={
            q.kind === "code"
              ? (q.starterCode ??
                "코드를 작성하세요. 코드는 실행되지 않으며 모범답안과 비교하여 평가합니다.")
              : "답안과 근거를 작성하세요."
          }
          spellCheck={false}
        />
      )}
    </div>
  );
}
function Explanation({
  q,
  a,
  onChange,
}: {
  q: Question | QuestionPart;
  a: Answer;
  onChange: (a: Answer) => void;
}) {
  const auto = a.correct !== undefined;
  return (
    <section className="explanation" aria-label="정답 및 해설">
      <div
        className={`result-banner ${a.correct === false ? "incorrect" : ""}`}
      >
        {auto ? a.correct ? <CheckCircle2 /> : <XCircle /> : <Lightbulb />}
        <div>
          <strong>
            {auto
              ? a.correct
                ? "정답입니다."
                : "오답입니다."
              : "모범답안과 비교하여 평가하세요."}
          </strong>
          <p>
            {q.kind === "choice"
              ? `제출 답안: ${q.options?.find((o) => o.id === a.submittedValue)?.text ?? "미응답"} · 정답: ${q.options?.find((o) => o.id === q.answer)?.text}`
              : auto
                ? `정답: ${q.modelAnswer ?? q.acceptedAnswers?.[0] ?? q.answer}`
                : "자유 형식 답안은 아래 기준으로 직접 평가합니다."}
          </p>
        </div>
      </div>
      <div className="explanation-body">
        <div className="section-kicker">정답 및 해설</div>
        <h3>해설</h3>
        {a.checks > 1 && (
          <p>
            확인 횟수: {a.checks}회 · 최초 결과:{" "}
            {a.history?.[0]?.correct === undefined
              ? "직접 평가"
              : a.history[0].correct
                ? "정답"
                : "오답"}
          </p>
        )}
        <RichText text={q.explanation} />
        {q.modelAnswer && q.kind !== "choice" && (
          <>
            <h4>모범답안</h4>
            {q.kind === "code" ? (
              <pre>
                <code>{q.modelAnswer}</code>
              </pre>
            ) : (
              <RichText text={q.modelAnswer} />
            )}
          </>
        )}
        {q.modelDiagram && (
          <>
            <h4>예시 도식</h4>
            <DiagramView value={q.modelDiagram} />
          </>
        )}
        {q.options && (
          <>
            <h4>보기별 해설</h4>
            <div className="option-explanations">
              {q.options.map((o, i) => (
                <div key={o.id}>
                  <span
                    className={`tiny-number ${o.id === q.answer ? "right" : ""}`}
                  >
                    {i + 1}
                  </span>
                  <div>
                    <strong>
                      {o.text} {o.id === q.answer && <em>정답</em>}
                    </strong>
                    <p>{o.explanation}</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
        {q.rubric?.length && (
          <div className="rubric">
            <h4>
              평가 기준 <span>자기 평가</span>
            </h4>
            {q.rubric.map((r, i) => (
              <label key={i}>
                <input
                  type="checkbox"
                  checked={a.rubric.includes(i)}
                  onChange={() =>
                    onChange({
                      ...a,
                      rubric: a.rubric.includes(i)
                        ? a.rubric.filter((x) => x !== i)
                        : [...a.rubric, i],
                    })
                  }
                />
                <span>{r.label}</span>
                <b>{r.points}점</b>
              </label>
            ))}
          </div>
        )}
        {"keyPoints" in q && q.keyPoints.length > 0 && (
          <div className="takeaway">
            <Lightbulb size={20} />
            <div>
              <strong>핵심 개념</strong>
              <ul>
                {q.keyPoints.map((k) => (
                  <li key={k}>{k}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
        {"sources" in q && (
          <details className="source-details">
            <summary>학습 근거 및 출처</summary>
            {q.sources.map((s, i) => (
              <p key={i}>
                <strong>{s.title}</strong>
                <br />
                {s.chapter}
                {s.pages && ` · ${s.pages}`}
                {s.note && (
                  <>
                    <br />
                    {s.note}
                  </>
                )}
                {s.url && (
                  <>
                    <br />
                    <a href={s.url} target="_blank" rel="noreferrer">
                      참고자료 열기 ↗
                    </a>
                  </>
                )}
              </p>
            ))}
          </details>
        )}
      </div>
    </section>
  );
}
export function QuestionPanel({
  question: q,
  answer: a,
  onChange,
  exam,
  ended,
}: {
  question: Question;
  answer: Answer;
  onChange: (a: Answer) => void;
  exam: boolean;
  ended: boolean;
}) {
  const [partIndex, setPartIndex] = useState(0);
  const locked = (exam && ended) || a.checked;
  if (q.kind === "compound" && q.parts?.length) {
    const index = Math.min(partIndex, q.parts.length - 1),
      p = q.parts[index],
      pa = a.parts[p.id] ?? emptyAnswer();
    const change = (next: Answer) => {
      const parts = { ...a.parts, [p.id]: next };
      onChange({
        ...a,
        parts,
        checked: q.parts!.every((x) => parts[x.id]?.checked),
      });
    };
    return (
      <>
        <div className="part-tabs" role="tablist" aria-label="하위 문제">
          {q.parts.map((p, i) => (
            <button
              role="tab"
              aria-selected={i === index}
              key={p.id}
              className={i === index ? "active" : ""}
              onClick={() => setPartIndex(i)}
            >
              {i + 1}. {p.title} <small>{p.points}점</small>
              {a.parts[p.id]?.checked && <Check size={14} />}
            </button>
          ))}
        </div>
        <RichText text={p.prompt} />
        <QuestionInput
          question={p}
          answer={pa}
          onChange={change}
          locked={pa.checked || (exam && ended)}
        />
        {(!exam || ended) && (
          <>
            <div className="check-row">
              {!pa.checked ? (
                <button
                  className="primary"
                  onClick={() => change(grade(p, pa))}
                  disabled={!hasAnswer(pa)}
                >
                  정답 확인 <Check size={17} />
                </button>
              ) : !exam ? (
                <button
                  className="text-button"
                  onClick={() =>
                    change({
                      ...emptyAnswer(),
                      checks: pa.checks,
                      history: pa.history,
                    })
                  }
                >
                  <RotateCcw size={15} /> 다시 풀기
                </button>
              ) : null}
            </div>
            {pa.checked && (
              <>
                <Explanation q={p} a={pa} onChange={change} />
                <details className="source-details">
                  <summary>통합 문항 해설 및 출처</summary>
                  {a.checked && <RichText text={q.explanation} />}
                  {q.sources.map((source, i) => (
                    <p key={i}>
                      {source.title} · {source.chapter} {source.pages}
                      {source.note && (
                        <>
                          <br />
                          {source.note}
                        </>
                      )}
                      {source.url && (
                        <>
                          {" "}
                          ·{" "}
                          <a href={source.url} target="_blank" rel="noreferrer">
                            참고자료
                          </a>
                        </>
                      )}
                    </p>
                  ))}
                </details>
              </>
            )}
          </>
        )}
      </>
    );
  }
  return (
    <>
      <QuestionInput
        question={q}
        answer={a}
        onChange={onChange}
        locked={locked}
      />
      {(!exam || ended) && (
        <>
          <div className="check-row">
            {!a.checked ? (
              <>
                <span>
                  {q.kind === "choice"
                    ? "보기를 선택한 후 정답을 확인하세요."
                    : "답안 작성 후 정답을 확인하세요."}
                </span>
                <button
                  className="primary"
                  onClick={() => onChange(grade(q, a))}
                  disabled={!hasAnswer(a)}
                >
                  정답 확인 <Check size={17} />
                </button>
              </>
            ) : !exam ? (
              <button
                className="text-button"
                onClick={() =>
                  onChange({
                    ...emptyAnswer(),
                    checks: a.checks,
                    history: a.history,
                  })
                }
              >
                <RotateCcw size={15} /> 다시 풀기
              </button>
            ) : null}
          </div>
          {a.checked && <Explanation q={q} a={a} onChange={onChange} />}
        </>
      )}
    </>
  );
}
