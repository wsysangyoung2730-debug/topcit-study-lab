import { useEffect, useRef, useState, type ReactNode } from 'react';

const preferenceKey = 'topcit-pane-ratio';
const clamp = (value: number) => Math.max(20, Math.min(80, value));
function storedRatio() {
  try {
    const stored = localStorage.getItem(preferenceKey);
    const value = stored === null ? 48 : Number(stored);
    return Number.isFinite(value) ? clamp(value) : 48;
  } catch { return 48; }
}

export function ResizablePanes({ top, children, resetKey }: {
  top: ReactNode; children: ReactNode; resetKey: string;
}) {
  const [ratio, setRatio] = useState(storedRatio);
  const [dragging, setDragging] = useState(false);
  const container = useRef<HTMLElement>(null);
  const topPane = useRef<HTMLDivElement>(null);
  const bottomPane = useRef<HTMLDivElement>(null);
  useEffect(() => {
    try { localStorage.setItem(preferenceKey, String(ratio)); } catch { /* Layout works without storage. */ }
  }, [ratio]);
  useEffect(() => {
    topPane.current?.scrollTo(0, 0);
    bottomPane.current?.scrollTo(0, 0);
  }, [resetKey]);
  function move(clientY: number) {
    const rect = container.current?.getBoundingClientRect();
    if (rect) setRatio(clamp(((clientY - rect.top - 13) / (rect.height - 26)) * 100));
  }
  return <article ref={container} className={`question-card split-panes${dragging ? ' resizing' : ''}`} style={{ gridTemplateRows: `minmax(100px, ${ratio}fr) 26px minmax(100px, ${100 - ratio}fr)` }}>
    <div className="split-pane split-top" id="question-pane" ref={topPane} tabIndex={0} aria-label="문제 영역">{top}</div>
    <div className="pane-resizer" role="separator" tabIndex={0} aria-label="문제와 답안 영역 높이 조절" aria-orientation="horizontal" aria-controls="question-pane" aria-valuemin={20} aria-valuemax={80} aria-valuenow={Math.round(ratio)} aria-valuetext={`문제 영역 ${Math.round(ratio)}%`} title="드래그 또는 위·아래 방향키로 높이 조절 · 두 번 클릭하면 초기화"
      onPointerDown={(e) => { if (e.button !== 0) return; e.preventDefault(); e.currentTarget.focus(); e.currentTarget.setPointerCapture(e.pointerId); setDragging(true); move(e.clientY); }}
      onPointerMove={(e) => { if (e.currentTarget.hasPointerCapture(e.pointerId)) move(e.clientY); }}
      onPointerUp={(e) => { if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId); setDragging(false); }}
      onPointerCancel={() => setDragging(false)} onLostPointerCapture={() => setDragging(false)} onDoubleClick={() => setRatio(48)}
      onKeyDown={(e) => {
        const actions: Record<string, number> = { ArrowUp: ratio - 3, ArrowDown: ratio + 3, Home: 20, End: 80, Enter: 48 };
        if (e.key in actions) { e.preventDefault(); setRatio(clamp(actions[e.key])); }
      }}>
      <span aria-hidden="true">•••</span><small aria-hidden="true">영역 크기 조절</small>
    </div>
    <div className="split-pane split-bottom" ref={bottomPane} tabIndex={0} aria-label="답안 및 해설 영역">{children}</div>
  </article>;
}
