import type { ReactNode } from 'react';
const blue = '#416eac', ink = '#29435f';
function Label({ x, y, children, size = 15, anchor = 'middle' }: { x: number; y: number; children: ReactNode; size?: number; anchor?: 'middle' | 'start' | 'end' }) {
  return <text x={x} y={y} textAnchor={anchor} fontSize={size} fill={ink}>{children}</text>;
}
function Box({ x, y, w = 170, h = 52, text, sub }: { x: number; y: number; w?: number; h?: number; text: string; sub?: string }) {
  return <g><rect x={x} y={y} width={w} height={h} rx={5} fill="#edf3fc" stroke="#8ea9cb" /><Label x={x + w / 2} y={y + (sub ? 23 : h / 2 + 5)}>{text}</Label>{sub && <Label x={x + w / 2} y={y + 43} size={12}>{sub}</Label>}</g>;
}
function Edge({ x1, y1, x2, y2, label, kind = 'arrow' }: { x1: number; y1: number; x2: number; y2: number; label?: string; kind?: 'arrow' | 'line' | 'inheritance' | 'aggregation' | 'composition' | 'dependency' }) {
  const path = `M ${x1} ${y1} L ${x2} ${y2}`;
  return <g><path d={path} fill="none" stroke={blue} strokeWidth={2} strokeDasharray={kind === 'dependency' ? '6 4' : undefined} markerEnd={kind === 'line' || kind === 'aggregation' || kind === 'composition' ? undefined : kind === 'inheritance' ? 'url(#cv-triangle)' : 'url(#cv-arrow)'} markerStart={kind === 'aggregation' ? 'url(#cv-diamond)' : kind === 'composition' ? 'url(#cv-solid-diamond)' : undefined} />{label && <Label x={(x1 + x2) / 2} y={(y1 + y2) / 2 - 9} size={12}>{label}</Label>}</g>;
}
function Tree() {
  const nodes = [{ id:'a',x:380,y:40 },{id:'b',x:230,y:110},{id:'c',x:530,y:110},{id:'d',x:150,y:180},{id:'e',x:310,y:180},{id:'f',x:450,y:180},{id:'g',x:610,y:180}];
  return <>{[[0,1],[0,2],[1,3],[1,4],[2,5],[2,6]].map(([a,b]) => <Edge key={`${a}-${b}`} x1={nodes[a].x} y1={nodes[a].y} x2={nodes[b].x} y2={nodes[b].y} kind="line" />)}{nodes.map(n => <g key={n.id}><circle cx={n.x} cy={n.y} r={22} fill="#e6effa" stroke={blue}/><Label x={n.x} y={n.y+5}>{n.id}</Label></g>)}<Label x={380} y={245}>BFS · 큐 · a → b → c → d → e → f → g</Label><Label x={380} y={283}>DFS · 스택/재귀 · a → b → d → e → c → f → g</Label></>;
}
function Uml() {
  const rows = [ ['일반화(상속)', '하위 클래스', '상위 클래스','inheritance'], ['연관', '참조하는 클래스','참조 대상','arrow'], ['집합', '전체','독립적인 부분','aggregation'], ['합성','전체','수명에 종속된 부분','composition'], ['의존','사용하는 클래스','일시적으로 쓰는 대상','dependency'] ] as const;
  return <>{rows.map((r,i) => { const y=32+i*55; return <g key={r[0]}><Label x={20} y={y+5} anchor="start" size={14}>{r[0]}</Label><Box x={168} y={y-18} w={182} h={37} text={r[1]}/><Edge x1={367} y1={y} x2={497} y2={y} kind={r[3]}/><Box x={518} y={y-18} w={222} h={37} text={r[2]}/></g>; })}<Label x={380} y={314} size={12}>삼각형은 상위 클래스 쪽 · 마름모는 전체 쪽</Label></>;
}
function Normalization() {
  return <><Box x={70} y={20} w={620} h={64} text="주문(주문번호, 고객번호, 고객명)" sub="주문번호 → 고객번호 → 고객명 : 이행적 종속"/><Edge x1={270} y1={84} x2={200} y2={155}/><Edge x1={490} y1={84} x2={560} y2={155}/><Box x={40} y={160} w={320} h={75} text="주문" sub="주문번호(PK), 고객번호(FK)"/><Box x={400} y={160} w={320} h={75} text="고객" sub="고객번호(PK), 고객명"/><Label x={380} y={280}>고객명은 고객 테이블 한 곳에서 변경</Label><Label x={380} y={310} size={13}>예시 전제: 주문번호가 키, 고객번호가 고객명을 결정</Label></>;
}
function Transaction() {
  return <><rect x={30} y={46} width={700} height={152} rx={9} fill="#f4f8fe" stroke={blue} strokeDasharray="6 4"/><Label x={380} y={30}>하나의 트랜잭션 · A에서 B로 10 이체</Label><Box x={55} y={85} w={170} text="A에서 10 차감"/><Edge x1={225} y1={111} x2={285} y2={111}/><Box x={285} y={85} w={170} text="B에 10 증가"/><Edge x1={455} y1={111} x2={515} y2={111}/><Box x={515} y={85} w={185} text="모두 성공: COMMIT"/><Label x={380} y={173} size={13}>중간에 실패하면 전체 ROLLBACK → 이체 전 상태</Label><Box x={40} y={230} w={150} text="A 원자성" sub="전부 또는 전무"/><Box x={217} y={230} w={150} text="C 일관성" sub="제약조건 보존"/><Box x={394} y={230} w={150} text="I 격리성" sub="동시 실행 제어"/><Box x={571} y={230} w={150} text="D 지속성" sub="확정 결과 보존"/></>;
}
function Osi() {
  const layers=['7 응용','6 표현','5 세션','4 전송','3 네트워크','2 데이터 링크','1 물리'];
  return <><Label x={200} y={22}>OSI 7계층</Label><Label x={555} y={22}>TCP/IP 4계층 모델</Label>{layers.map((v,i) => <Box key={v} x={70} y={40+i*38} w={260} h={32} text={v}/>)}<Box x={440} y={40} w={250} h={108} text="응용 · HTTP, DNS 등"/><Box x={440} y={154} w={250} h={32} text="전송 · TCP, UDP"/><Box x={440} y={192} w={250} h={32} text="인터넷 · IP"/><Box x={440} y={230} w={250} h={70} text="링크 · Ethernet 등"/>{[[96,94],[170,170],[208,208],[266,265]].map(([a,b],i)=><Edge key={i} x1={334} y1={a} x2={433} y2={b} kind="line"/>)}</>;
}
function Deadlock() {
  return <><Box x={85} y={30} w={170} text="프로세스 A"/><Box x={500} y={30} w={170} text="자원 R1"/><Box x={85} y={235} w={170} text="자원 R2"/><Box x={500} y={235} w={170} text="프로세스 B"/><Edge x1={498} y1={56} x2={261} y2={56} label="R1을 A가 보유"/><Edge x1={170} y1={84} x2={170} y2={226}/><Label x={110} y={156} size={13}>R2 요청</Label><Edge x1={262} y1={260} x2={491} y2={260} label="R2를 B가 보유"/><Edge x1={585} y1={232} x2={585} y2={90}/><Label x={645} y={156} size={13}>R1 요청</Label><Label x={380} y={147}>서로 상대의 자원을 기다림</Label><Label x={380} y={177} size={12}>A와 B 모두 진행 불가</Label></>;
}
function Encryption() {
  return <><Label x={130} y={30}>송신자</Label><Label x={630} y={30}>수신자</Label><Box x={35} y={50} w={190} text="데이터 + 대칭키 K"/><Edge x1={228} y1={76} x2={303} y2={76} label="암호화"/><Box x={310} y={50} w={150} text="암호문"/><Edge x1={465} y1={76} x2={539} y2={76} label="K로 복호화"/><Box x={545} y={50} w={180} text="원래 데이터"/><Box x={35} y={174} w={190} h={67} text="대칭키 K" sub="수신자 공개키로 암호화"/><Edge x1={230} y1={207} x2={303} y2={207}/><Box x={310} y={180} w={150} text="암호화된 K"/><Edge x1={465} y1={207} x2={540} y2={207}/><Box x={545} y={174} w={180} h={67} text="대칭키 K 복원" sub="수신자 개인키로 복호화"/><Label x={380} y={289} size={13}>혼합 암호의 개념 예시 · 큰 데이터는 대칭키로, 키 전달은 공개키로</Label></>;
}
function Auth() {
  return <><Box x={35} y={98} w={180} h={70} text="인증 Authentication" sub="누구인지 확인"/><Edge x1={218} y1={133} x2={282} y2={133}/><Box x={290} y={98} w={180} h={70} text="인가 Authorization" sub="무엇을 할 수 있는지 확인"/><Edge x1={473} y1={133} x2={537} y2={133}/><Box x={545} y={98} w={180} h={70} text="접근 허용 / 거부" sub="대상 자원과 작업별 판단"/><Label x={380} y={52}>로그인 성공이 모든 권한을 뜻하지는 않음</Label><Label x={125} y={218} size={13}>예: 비밀번호 + OTP</Label><Label x={380} y={218} size={13}>예: 관리자만 사용자 삭제</Label><Label x={380} y={287} size={13}>OAuth: 권한 위임 · OpenID Connect: OAuth 2.0 기반 인증 계층</Label></>;
}
function Bcg() {
  return <><Label x={400} y={25}>상대적 시장점유율</Label><Label x={250} y={53} size={13}>높음</Label><Label x={570} y={53} size={13}>낮음</Label><Label x={39} y={111} size={13}>성장률</Label><Label x={39} y={135} size={13}>높음</Label><Label x={39} y={225} size={13}>성장률</Label><Label x={39} y={249} size={13}>낮음</Label><rect x={88} y={64} width={634} height={244} fill="#fff" stroke={blue}/><path d="M 405 64 V 308 M 88 186 H 722" fill="none" stroke={blue}/><Label x={248} y={111}>Star · 별</Label><Label x={248} y={145} size={13}>성장을 유지하기 위한 투자</Label><Label x={564} y={111}>Question Mark · 물음표</Label><Label x={564} y={145} size={13}>점유율 확보 가능성 판단</Label><Label x={248} y={232}>Cash Cow · 현금 창출원</Label><Label x={248} y={266} size={13}>안정적 현금 흐름</Label><Label x={564} y={232}>Dog · 개</Label><Label x={564} y={266} size={13}>사업 유지·축소 여부 검토</Label></>;
}
function Enterprise() {
  return <><Box x={260} y={113} w={240} h={90} text="ERP · 기업 내부 자원 통합" sub="회계 · 인사 · 생산 · 재고"/><Box x={20} y={30} w={220} h={65} text="SCM · 공급망" sub="공급사부터 고객까지"/><Box x={520} y={30} w={220} h={65} text="CRM · 고객 관계" sub="영업 · 마케팅 · 서비스"/><Box x={20} y={233} w={220} h={65} text="PLM · 제품 생애주기" sub="기획 · 설계 · 변경 정보"/><Box x={520} y={233} w={220} h={65} text="BI · 분석과 의사결정" sub="데이터를 지표·통찰로"/><Edge x1={240} y1={83} x2={290} y2={111} kind="line"/><Edge x1={520} y1={83} x2={470} y2={111} kind="line"/><Edge x1={240} y1={242} x2={290} y2={205} kind="line"/><Edge x1={470} y1={205} x2={520} y2={242}/></>;
}
const diagrams: Record<string, { title:string; caption:string; draw:()=>ReactNode }> = {
  'sw-algorithms': { title:'그림으로 이해하기 · BFS와 DFS', caption:'같은 깊이를 먼저 방문하는 BFS와 한 경로를 깊게 방문하는 DFS. 왼쪽 자식부터 처리한다는 조건의 예시입니다.', draw:Tree },
  'sw-uml-class': { title:'그림으로 이해하기 · UML 연결선', caption:'실선·점선, 삼각형·마름모를 구분하세요. 집합·합성은 참조 변수의 존재만으로 결정하지 않고 전체와 부분의 의미·수명을 함께 봅니다.', draw:Uml },
  'data-normalization': { title:'그림으로 이해하기 · 이행 종속 분리', caption:'다른 정규형 조건을 충족한 관계에서 이행 종속을 분리하는 3NF 예시입니다. 고객명이 바뀌어도 모든 주문 행을 수정할 필요가 없어집니다.', draw:Normalization },
  'data-transactions': { title:'그림으로 이해하기 · 이체와 ACID', caption:'입금 없이 출금만 남지 않도록 두 작업을 하나의 트랜잭션으로 묶습니다. 실제 격리 수준에 따라 동시 실행에서 허용되는 현상은 달라집니다.', draw:Transaction },
  'sys-network-addressing': { title:'그림으로 이해하기 · OSI와 TCP/IP', caption:'두 모델을 개념적으로 대응한 그림입니다. TCP/IP는 여기서 4계층 표현을 사용하며 교재에 따라 링크를 나눈 5계층 표현도 있습니다.', draw:Osi },
  'sys-synchronization-deadlock': { title:'그림으로 이해하기 · 교착 상태', caption:'각 자원이 한 개이고 빼앗을 수 없다는 예시에서 서로 상대가 보유한 자원을 기다립니다. 원형 대기만으로 모든 시스템의 교착 상태를 단정하지는 않습니다.', draw:Deadlock },
  'sec-cryptography-keys': { title:'그림으로 이해하기 · 혼합 암호', caption:'대칭 암호와 공개키 암호의 역할을 보여주는 개념 예시입니다. 현대 TLS의 실제 핸드셰이크 전체를 나타내는 도식은 아닙니다.', draw:Encryption },
  'sec-authentication': { title:'그림으로 이해하기 · 인증과 인가', caption:'신원 확인과 권한 판단을 나눠 생각하세요. 사용자가 로그인했어도 역할·소유권에 맞지 않는 작업은 거부해야 합니다.', draw:Auth },
  'biz-concept-strategy': { title:'그림으로 이해하기 · BCG 매트릭스', caption:'세로축은 시장성장률, 가로축은 상대적 시장점유율입니다. 고성장·저점유율의 신규 사업은 물음표 영역에 해당합니다.', draw:Bcg },
  'biz-concept-enterprise': { title:'그림으로 이해하기 · 기업 정보시스템의 역할', caption:'시스템별 초점을 비교한 개념도입니다. 실제 제품에서는 기능이 겹치거나 통합될 수 있고 ERP 하나가 모든 역할을 대신하지는 않습니다.', draw:Enterprise },
};
export const conceptVisualIds = Object.keys(diagrams);
export function ConceptVisual({lessonId}: {lessonId:string}) {
  const visual=diagrams[lessonId];
  if (!visual) return null;
  return <figure className="concept-visual"><strong>{visual.title}</strong><div className="concept-visual-scroll" tabIndex={0} role="region" aria-label="개념도 · 좁은 화면에서는 가로로 이동"><svg viewBox="0 0 760 330" role="img" aria-label={visual.title}><title>{visual.title}</title><desc>{visual.caption}</desc><defs><marker id="cv-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 1 1 L 9 5 L 1 9" fill="none" stroke={blue} strokeWidth="1.6"/></marker><marker id="cv-triangle" viewBox="0 0 12 12" refX="11" refY="6" markerWidth="11" markerHeight="11" orient="auto"><path d="M 1 1 L 11 6 L 1 11 Z" fill="#fbfdff" stroke={blue}/></marker><marker id="cv-diamond" viewBox="0 0 14 12" refX="1" refY="6" markerWidth="13" markerHeight="11" orient="auto"><path d="M 1 6 L 7 1 L 13 6 L 7 11 Z" fill="#fbfdff" stroke={blue}/></marker><marker id="cv-solid-diamond" viewBox="0 0 14 12" refX="1" refY="6" markerWidth="13" markerHeight="11" orient="auto"><path d="M 1 6 L 7 1 L 13 6 L 7 11 Z" fill={blue} stroke={blue}/></marker></defs>{visual.draw()}</svg></div><figcaption>{visual.caption}</figcaption></figure>;
}
