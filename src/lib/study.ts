import type { Diagram, Question, QuestionPart } from '../types';
export type Mode = 'study' | 'exam' | 'random' | 'review';
export interface Answer { value: string; diagram?: Diagram; checked: boolean; correct?: boolean; rubric: number[]; parts: Record<string, Answer>; submittedValue?: string; checks: number; }
export interface Session { id: string; mode: Mode; round?: number; ids: string[]; index: number; startedAt: number; deadline?: number; endedAt?: number; }
export interface StudyState { version: 1; answers: Record<string, Answer>; bookmarks: string[]; sessions: Session[]; activeId?: string; }
export const emptyAnswer = (): Answer => ({value:'',checked:false,rubric:[],parts:{},checks:0});
export const emptyState = (): StudyState => ({version:1,answers:{},bookmarks:[],sessions:[]});
export function normalize(value: string) { return value.trim().toLowerCase().replace(/\s+/g,' '); }
export function grade(q: Question | QuestionPart, a: Answer): Answer {
  const choices = q.kind === 'choice';
  const auto = choices || (q.kind === 'short' && Boolean(q.acceptedAnswers?.length));
  const correct = auto ? (choices ? a.value === q.answer : q.acceptedAnswers!.some(x=>normalize(x) === normalize(a.value))) : undefined;
  return {...a, checked:true, correct, submittedValue:a.value, checks:a.checks+1};
}
export function answerKey(session: Session, id: string) { return `${session.id}::${id}`; }
export function hasAnswer(a?: Answer): boolean { return Boolean(a && (a.value.trim() || a.diagram?.nodes.length || Object.values(a.parts).some(hasAnswer))); }
export function shuffled<T>(items: T[], random = Math.random) { const result=[...items]; for(let i=result.length-1;i>0;i--){const j=Math.floor(random()*(i+1)); [result[i],result[j]]=[result[j],result[i]];} return result; }
export function latestAnswer(state: StudyState, id: string): Answer | undefined {
  for(const s of [...state.sessions].reverse()) { const a=state.answers[answerKey(s,id)]; if(a?.checked) return a; }
}
export function score(q: Question | QuestionPart, a?: Answer): {auto:number; self:number; autoMax:number; selfMax:number} {
  if(q.kind === 'compound' && 'parts' in q) return (q.parts??[]).reduce((sum,p)=> {const n=score(p,a?.parts[p.id]); return {auto:sum.auto+n.auto,self:sum.self+n.self,autoMax:sum.autoMax+n.autoMax,selfMax:sum.selfMax+n.selfMax};},{auto:0,self:0,autoMax:0,selfMax:0});
  if(q.kind==='choice' || q.kind==='short' && q.acceptedAnswers?.length) return {auto:a?.checked&&a.correct?q.points:0,self:0,autoMax:q.points,selfMax:0};
  return {auto:0,self:(a?.checked?a.rubric:[] )?.reduce((n,i)=>n+(q.rubric?.[i]?.points??0),0)??0,autoMax:0,selfMax:q.points};
}
export function isStudyState(value: unknown): value is StudyState {
  if(!value || typeof value!=='object')return false;
  const s=value as StudyState;
  if(s.version!==1 || !Array.isArray(s.bookmarks) || !s.bookmarks.every(x=>typeof x==='string') || !Array.isArray(s.sessions) || !s.answers || typeof s.answers!=='object' || Array.isArray(s.answers))return false;
  const validAnswer=(a: Answer, depth=0):boolean=>Boolean(a && depth<4 && typeof a.value==='string' && typeof a.checked==='boolean' && Array.isArray(a.rubric) && a.rubric.every(Number.isInteger) && a.parts && typeof a.parts==='object' && Object.values(a.parts).every(x=>validAnswer(x,depth+1)) && (!a.diagram || (Array.isArray(a.diagram.nodes) && Array.isArray(a.diagram.edges) && a.diagram.nodes.every(n=>typeof n.id==='string' && typeof n.label==='string' && Number.isFinite(n.x)&&Number.isFinite(n.y)) && a.diagram.edges.every(e=>typeof e.from==='string'&&typeof e.to==='string'))));
  return s.sessions.every(x=>x && typeof x.id==='string' && ['study','exam','random','review'].includes(x.mode) && Array.isArray(x.ids) && x.ids.every(y=>typeof y==='string') && Number.isInteger(x.index) && Number.isFinite(x.startedAt) && (x.deadline===undefined||Number.isFinite(x.deadline))) && Object.values(s.answers).every(a=>validAnswer(a));
}
