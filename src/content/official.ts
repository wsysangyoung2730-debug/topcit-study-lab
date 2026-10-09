import type { Diagram, Domain, Question, SourceRef } from "../types";
import { expandedSoftwareQuestions } from "./official-expanded/software";
import { expandedDataQuestions } from "./official-expanded/data";
import { expandedSystemsQuestions } from "./official-expanded/systems";
import { expandedBusinessQuestions } from "./official-expanded/business";

// Preserve the 24 supplied captures and their stable IDs for saved study records.
// The other 51 items use original wording and examples based on public topic coverage.
const bank: Question[] = [];
const capture = (number: string, topic: string): SourceRef => ({
  title: "사용자 제공 TOPCIT 시뮬레이션 캡처",
  chapter: topic,
  pages: number === "번호 확인 불가" ? number : `원문 ${number}번`,
  note: "제공된 캡처의 지문·보기를 학습용으로 옮기고 해설을 별도로 작성했다. 캡처의 선택 표시는 정답 근거로 사용하지 않았다. 공식 전체 시험을 수록한 것이 아니다.",
});
type Entry = readonly [text: string, explanation: string];
function choice(
  id: string,
  number: string,
  domain: Domain,
  topic: string,
  prompt: string,
  options: [Entry, Entry, Entry, Entry],
  answer: number,
  explanation: string,
  stimulus?: string,
) {
  bank.push({
    id: `official-${id}`,
    round: 0,
    domain,
    kind: "choice",
    points: 5,
    difficulty: "기초",
    title:
      number === "번호 확인 불가"
        ? "제공 문항 · 번호 확인 불가"
        : `제공 문항 ${number}`,
    topic,
    prompt,
    stimulus,
    options: options.map(([text, why], i) => ({
      id: String(i + 1),
      text,
      explanation: `${i + 1 === answer ? "정답" : "오답"}. ${why}`,
    })),
    answer: String(answer),
    modelAnswer: `${answer}번. ${options[answer - 1][0]}`,
    explanation,
    keyPoints: [topic, explanation],
    sources: [capture(number, topic)],
    origin: "reference-adapted",
  });
}

choice(
  "q49",
  "49",
  "systems",
  "OAuth와 소셜 로그인",
  "아래에서 설명하는 사용자 인증 관련 기술을 고르시오.",
  [
    [
      "OAuth (Open Authorization)",
      "보기 중 소셜 로그인에서 활용되는 권한 위임 체계는 OAuth다. 사용자가 동의한 권한을 토큰으로 위임하는 것이 핵심이다.",
    ],
    [
      "OTP (One Time Password)",
      "한 번만 사용할 수 있는 비밀번호로 사용자를 확인하는 방식이다. 다른 서비스 계정을 연계하는 권한 위임 규격과 다르다.",
    ],
    [
      "PKI (Public Key Infrastructure)",
      "공개키·인증서의 발급과 검증 등을 위한 기반 체계다. 제시된 소셜 계정 연계 방식의 명칭이 아니다.",
    ],
    [
      "SSL (Secure Socket Layer)",
      "통신 구간을 보호하는 보안 프로토콜이다. 소셜 계정에 대한 권한 위임을 뜻하지 않는다.",
    ],
  ],
  1,
  "보기의 의도상 정답은 OAuth다. 엄밀히 OAuth는 인증 자체를 정의하는 규격이 아니라 권한 부여·위임 프레임워크다. 실제 로그인에서는 사용자 정보 API나 OpenID Connect 등의 인증 계층과 함께 사용된다.",
  "A기업은 웹 서비스를 시작하면서 별도의 회원가입 없이 네이버·카카오 등의 기존 계정을 활용해 서비스에 접근할 수 있도록 하였다.",
);

choice(
  "q50",
  "50",
  "systems",
  "UDP의 기본 특성",
  "UDP(User Datagram Protocol)의 특징이 아닌 것을 고르시오.",
  [
    [
      "매우 단순한 프로토콜로 흐름 제어가 없다.",
      "UDP 자체에는 TCP 같은 흐름 제어 기능이 없다. 이 설명은 UDP의 특징에 해당한다.",
    ],
    [
      "사전 설정 과정이 필요 없이 비연결형 서비스를 제공한다.",
      "UDP는 연결 설정 핸드셰이크 없이 데이터그램을 전달한다. 비연결형이라는 설명은 맞다.",
    ],
    [
      "송신 프로세스의 부하를 완화시키기 위해 혼잡 제어를 제공한다.",
      "UDP 자체는 혼잡 제어를 제공하지 않는다. 필요한 경우 응용이나 상위 프로토콜이 이를 구현한다.",
    ],
    [
      "전송 계층 수준의 신뢰성이 필요 없는 실시간 멀티미디어 데이터 전송에 이용한다.",
      "재전송 지연보다 실시간 전달이 중요한 용도에 UDP를 활용할 수 있다. 응용이 별도 손실 처리를 할 수도 있다.",
    ],
  ],
  3,
  "UDP 자체에는 연결 설정, 전달·순서 보장, 흐름 제어 및 혼잡 제어 기능이 없다. 따라서 혼잡 제어를 제공한다는 ③이 해당하지 않는다.",
);

choice(
  "q58",
  "58",
  "systems",
  "네트워크 접근제어",
  "아래 설명에 해당하는 보안 솔루션을 고르시오.",
  [
    [
      "가상 사설망 (VPN, Virtual Private Network)",
      "VPN은 공용망에서 사설망처럼 안전하게 통신하는 터널 등을 제공한다. 단말의 보안 정책 준수 점검이 주된 구별점인 사례에는 NAC가 적합하다.",
    ],
    [
      "네트워크 접근제어 (NAC, Network Access Control)",
      "사용자·단말의 신원과 보안 상태를 확인하고 정책에 따라 내부망 접근을 허용·제한하는 솔루션이다.",
    ],
    [
      "데이터 유출 방지 (DLP, Data Loss Prevention)",
      "DLP는 중요 정보의 외부 유출을 탐지·차단하는 데 초점이 있다. 접속 단말의 보안 상태 검사와 구별한다.",
    ],
    [
      "웹방화벽 (WAF, Web Application Firewall)",
      "WAF는 웹 요청을 분석해 웹 애플리케이션 공격을 막는다. 내부망 접속 단말의 종합적인 정책 준수 확인과 목적이 다르다.",
    ],
  ],
  2,
  "사용자 인증과 백신 설치 등 단말 보안 상태를 확인해 네트워크 접근을 통제하므로 NAC다.",
  "• 사용자 컴퓨터가 내부망 접근을 시도하면 사용자 인증을 수행하고 백신 프로그램 설치 등 보안 정책 준수 여부를 확인한다.\n• 정책을 준수하지 않으면 사전에 정의한 정책에 따라 접근을 통제한다.",
);

choice(
  "q74",
  "74",
  "business",
  "개인정보 비식별 처리",
  "아래에 적용된 개인정보 비식별화 방법을 고르시오.",
  [
    [
      "가명처리",
      "식별자를 다른 값으로 대체해 직접적인 식별을 어렵게 하는 방식이다. 개별 기록을 합·평균으로 표현한 사례와 다르다.",
    ],
    [
      "총계처리",
      "개별 값을 집단의 합계·평균 등 통계값으로 나타내는 방식이다. 제시된 변환과 일치한다.",
    ],
    [
      "데이터 삭제",
      "식별 정보나 특정 값을 제거하는 방식이다. 이 사례의 핵심은 제거 자체보다 합계·평균으로의 집계다.",
    ],
    [
      "데이터 범주화",
      "180cm를 170~180cm 구간처럼 범위나 범주로 나타내는 방식이다. 합·평균 집계와 다르다.",
    ],
  ],
  2,
  "개인별 키를 학생 전체의 합계 660cm와 평균 165cm로 나타냈으므로 총계처리다. 집계했다는 사실만으로 모든 재식별 위험이 자동 제거되는 것은 아니다.",
  "비식별화 전: 임꺽정 180cm, 홍길동 170cm, 이콩쥐 160cm, 김팥쥐 150cm\n비식별화 후: 학생 키 합 660cm, 평균 키 165cm",
);

choice(
  "q61",
  "61",
  "business",
  "디지털 트랜스포메이션",
  "기업이 환경 변화에 대응하기 위해 추진한 아래 전략을 고르시오.",
  [
    [
      "디지털 트랜스포메이션 (Digital Transformation)",
      "디지털 기술을 활용해 판매 방식·업무·조직·협업 생태계를 전반적으로 바꾸는 접근이다.",
    ],
    [
      "서비타이제이션 (Servitization)",
      "제품 판매에 서비스를 결합하거나 서비스 중심으로 가치를 제공하는 전환이다. 사례의 핵심인 전사적 디지털 변화와 구분한다.",
    ],
    [
      "오픈 이노베이션 (Open Innovation)",
      "외부 지식과 기술을 연구개발·사업화에 활용하는 혁신 방식이다. 협업 요소만으로 전체 사례를 이 개념으로 분류하기는 어렵다.",
    ],
    [
      "파괴적 혁신 (Disruptive Innovation)",
      "비소비자나 하위 시장에서 새로운 가치 기준으로 시작해 기존 시장 질서에 변화를 주는 혁신이다. 단순 디지털 도입과 동의어가 아니다.",
    ],
  ],
  1,
  "온라인 중심의 유통, D2C, 애자일 조직, AI·IoT·클라우드 기반 생태계로 기업 운영 전반을 바꾸므로 디지털 트랜스포메이션이다.",
  "글로벌 스포츠 브랜드 N사는 코로나19 확산 직후 중국 매장 절반과 미국 내 모든 매장 폐쇄 및 야외활동 제한으로 매출이 감소했다.\n대응: 중간 유통단계 없는 D2C 강화, 온라인 판매 중심의 채널 재편, 전사 애자일 조직 문화 확대, 생산·유통·판매 참여 기업을 위한 AI·IoT·클라우드 기반 디지털 생태계 조성",
);

choice(
  "q62",
  "62",
  "business",
  "전사적 자원관리",
  "아래에서 설명하는 시스템을 고르시오.",
  [
    [
      "CRM (Customer Relationship Management, 고객관계관리)",
      "고객 정보와 거래·접촉 이력을 활용해 고객 획득·유지·관계 개선을 지원한다. 기업 자원 전체의 통합 관리와 범위가 다르다.",
    ],
    [
      "ERP (Enterprise Resource Planning, 전사적자원관리)",
      "재무·인사·생산·구매 등 주요 업무와 경영자원을 하나의 체계로 통합해 정보를 공유한다.",
    ],
    [
      "KMS (Knowledge Management System, 지식관리)",
      "조직의 지식과 경험을 축적·검색·공유하는 데 초점이 있다.",
    ],
    [
      "SCM (Supply Chain Management, 공급망관리)",
      "공급자부터 생산·유통·고객으로 이어지는 공급망 흐름을 조정하는 데 초점이 있다.",
    ],
  ],
  2,
  "기업의 다양한 경영자원을 단일 체계로 통합하고 주요 업무와 정보를 연결하는 시스템은 ERP다.",
  "• 다양한 경영자원을 단일 체계로 통합하여 생산성을 극대화한다.\n• 주요 업무를 통합적으로 연계·관리하고 정보를 공유하여 업무 효율을 높인다.\n• 데이터 공유와 조직 유연성 향상에 기여한다.",
);

choice(
  "q63",
  "63",
  "business",
  "품질 통제 도구",
  "아래에서 설명하는 소프트웨어 품질 통제 도구를 고르시오.",
  [
    [
      "관리도 (Control Chart)",
      "시간 순서의 품질 측정값과 관리 한계를 이용해 공정의 안정성을 판단한다. 빈도순 원인 정렬 도구와 다르다.",
    ],
    [
      "산점도 (Scatter Diagram)",
      "두 변수의 관측값 쌍을 점으로 표시해 관련성을 살펴본다.",
    ],
    [
      "인과관계도 (Cause and Effect Diagram)",
      "결과에 영향을 주는 원인을 사람·방법·환경 등의 범주로 구조화하는 도구다.",
    ],
    [
      "파레토 차트 (Pareto Chart)",
      "원인을 발생 빈도 내림차순으로 표시하고 누적 비중을 통해 우선 개선 대상을 찾는 도구다.",
    ],
  ],
  4,
  "발생 빈도순 정렬과 소수 원인이 다수 문제를 만든다는 80:20 원칙이 파레토 차트의 단서다. 빈도와 함께 결함의 심각도도 검토한다.",
  "• 문제의 우선순위를 파악하기 위해 발생 빈도가 높은 순서로 정렬한다.\n• X축은 결함 원인, Y축은 결함 빈도를 표시한다.\n• 상대적으로 빈도가 높은 소수 원인이 대부분의 문제를 일으킨다는 원칙에 기반한다(80:20 법칙).",
);

choice(
  "q64",
  "64",
  "business",
  "브레인스토밍",
  "브레인스토밍의 원칙으로 옳지 않은 것을 고르시오.",
  [
    [
      "상대방의 아이디어를 비판하지 않는다.",
      "아이디어 발산 단계에서는 비판과 평가를 유보해 자유로운 제안을 촉진한다.",
    ],
    [
      "다른 사람의 아이디어를 이용하여 확장한다.",
      "다른 제안을 결합·개선하는 것은 브레인스토밍의 원칙에 해당한다.",
    ],
    [
      "자유로운 분위기에서 발표 및 경청하도록 한다.",
      "자유분방한 발상과 참여를 장려하는 설명이다.",
    ],
    [
      "아이디어의 양보다는 아이디어의 질이 중요하다.",
      "발산 단계에서는 많은 아이디어를 내는 양을 중시하며 질 평가는 뒤의 평가 단계에서 수행한다.",
    ],
  ],
  4,
  "브레인스토밍의 발산 단계는 비판 유보, 자유로운 발상, 많은 아이디어, 결합·개선을 장려한다. 따라서 양보다 질을 우선한다는 ④가 부적절하다.",
);

choice(
  "q65",
  "65",
  "business",
  "플랫폼 생태계",
  "아래의 “공통의 기반이 되는 틀”에 해당하는 IT 비즈니스 생태계 구성요소를 고르시오.",
  [
    [
      "네트워크 (Network)",
      "정보를 전달하는 통신 연결망이다. 다양한 서비스를 올려 만드는 공통 기반과는 역할이 다르다.",
    ],
    ["디바이스 (Device)", "사용자가 서비스를 이용하는 단말·기기다."],
    [
      "콘텐츠 (Contents)",
      "서비스를 통해 제공되는 정보·영상·경험 등의 내용이다.",
    ],
    [
      "플랫폼 (Platform)",
      "서비스나 상품을 만들고 제공할 때 공통으로 사용할 수 있는 기반 구조다.",
    ],
  ],
  4,
  "참여자가 기반 구조를 직접 만들지 않고 활용해 비용과 시간을 줄이는 공통 기반은 플랫폼이다.",
  "A대학은 코로나19로 오프라인 졸업식이 어려워지자 온라인 가상세계 기반 구조 서비스를 이용해 가상 캠퍼스를 만들고 졸업식을 열었다. 이런 공통 기반을 활용하면 참여자는 기반 구조 구축 비용과 기간을 줄이고 새로운 비즈니스 기회를 만들 수 있다.",
);

choice(
  "q66",
  "66",
  "business",
  "프로젝트 범위관리",
  "아래 설명에 해당하는 프로젝트관리 영역을 고르시오.",
  [
    [
      "범위관리",
      "프로젝트가 제공할 결과와 필요한 작업을 정의하고 통제한다. 작업분류체계 WBS가 핵심 단서다.",
    ],
    ["원가관리", "예산 산정·배정과 실제 비용의 통제를 다룬다."],
    ["위험관리", "목표에 영향을 줄 불확실한 사건을 식별·분석·대응한다."],
    [
      "품질관리",
      "요구되는 품질 기준을 정하고 과정·결과가 이를 만족하는지 확인한다.",
    ],
  ],
  1,
  "수행에 필요한 작업을 명시하고 WBS로 분해해 관리하는 영역은 범위관리다.",
  "• 고객 요구사항을 확인하여 프로젝트 수행에 필요한 작업을 명시적으로 포함해 관리한다.\n• 프로젝트를 통해 제공되는 제품과 서비스의 범위를 다룬다.\n• 관리 기법으로 작업분류체계(WBS, Work Breakdown Structure)를 사용한다.",
);

choice(
  "chasm",
  "번호 확인 불가",
  "business",
  "기술 수용 주기",
  "기술 수용 주기에서 선각 수용자와 전기 다수 수용자 사이에 표시된 간극을 고르시오.",
  [
    [
      "메인 스트리트 (Main Street)",
      "시장이 성숙하고 차별화·효율 중심의 경쟁이 진행되는 단계와 관련된 표현이다. 초기·주류 시장 사이 간극의 이름은 아니다.",
    ],
    [
      "볼링앨리 (Bowling Alley)",
      "주류 시장 진입 과정에서 특정 틈새시장들을 차례로 공략하는 단계와 관련된다.",
    ],
    [
      "토네이도 (Tornado)",
      "주류 시장의 수요가 급격히 확대되는 성장 단계와 관련된다.",
    ],
    [
      "캐즘 (Chasm)",
      "초기 시장의 선각 수용자와 주류 시장의 전기 다수 수용자 사이에 존재하는 수용의 간극이다.",
    ],
  ],
  4,
  "선각 수용자는 새 기술의 가능성을 중시하고 전기 다수 수용자는 검증된 실용성을 더 중시하므로 시장 확산에 간극이 생길 수 있다. 이 간극이 캐즘이다.",
  "초기 시장: 혁신 수용자 → 선각 수용자\n[ ㉠ ]\n주류 시장: 전기 다수 수용자 → 후기 다수 수용자\n말기 시장: 지각 수용자",
);

choice(
  "q69",
  "69",
  "business",
  "프로젝트 일정 도구",
  "아래에서 설명하는 차트를 고르시오.",
  [
    [
      "Candle Chart",
      "시가·고가·저가·종가 등을 표현하는 캔들 차트다. 프로젝트 작업 기간을 표현하는 도구와 다르다.",
    ],
    [
      "Gantt Chart",
      "시간축 위에 작업별 시작·종료와 기간을 수평 막대로 표시하는 간트 차트다.",
    ],
    [
      "Pareto Chart",
      "발생 빈도순 막대와 누적 비율로 개선 우선순위를 분석한다.",
    ],
    [
      "PERT (Program Evaluation and Review Technique) Chart",
      "작업의 선후관계를 네트워크로 나타내고 불확실한 소요기간 추정 등을 지원한다. 수평 일정 막대의 명칭은 간트 차트다.",
    ],
  ],
  2,
  "각 작업의 시작·끝·기간을 시간축의 수평 막대로 나타내는 일정 도구는 간트 차트다. 캡처의 PERT 영문 풀이는 Program Evaluation and Review Technique로 바로잡았다.",
  "• 프로젝트 일정관리를 위한 바 차트 형태의 도구\n• 업무별 일정의 시작과 끝을 그래픽으로 표시하여 한눈에 볼 수 있는 차트\n\n| 작업 | M | M+1 | M+2 | M+3 |\n| --- | --- | --- | --- | --- |\n| W1 | ■ | ■ | | |\n| W1.1 | ■ | | | |\n| W1.2 | | ■ | | |\n| W2 | | | ■ | ■ |\n| W2.1 | | | ■ | |\n| W2.2 | | | | ■ |",
);

choice(
  "q70",
  "70",
  "business",
  "IT 아웃소싱",
  "IT 아웃소싱의 특징으로 옳지 않은 것을 고르시오.",
  [
    [
      "발주기관의 비용 절감이 가능하다.",
      "외부 전문 인력과 규모의 경제를 활용해 비용을 줄일 가능성이 있다. 다만 항상 절감되는 것은 아니므로 총비용을 검토한다.",
    ],
    [
      "발주기관은 주요 핵심업무에 집중할 수 있다.",
      "비핵심 업무를 외부에 맡기고 내부 자원을 핵심 업무에 집중할 수 있다.",
    ],
    [
      "발주기관 자체 인력의 개발 역량이 향상된다.",
      "외주화 자체가 내부 개발 역량 향상을 보장하지 않는다. 내부 경험 축적이 줄고 외부 의존성이 커질 수도 있다.",
    ],
    [
      "아웃소싱 서비스 제공업체의 전문성을 활용할 수 있다.",
      "외부 업체가 가진 경험과 전문 기술을 활용하는 것은 아웃소싱의 주요 이점이다.",
    ],
  ],
  3,
  "개발을 외부에 맡기는 것만으로 자체 인력의 개발 역량이 자동으로 향상되지는 않는다. 요구 정의·검수·서비스 관리 역량은 내부에 유지할 필요가 있다.",
);

choice(
  "risk-avoid",
  "번호 확인 불가",
  "business",
  "프로젝트 위험 대응",
  "아래 사례에서 적용한 위험 대응 전략을 고르시오.",
  [
    [
      "회피 (Avoid)",
      "비용·일정 위험을 만드는 직접 개발 범위를 제외해 해당 위협의 원인을 제거하므로 회피다.",
    ],
    [
      "수용 (Acceptance)",
      "위험을 인정하고 감당하는 전략이다. 사례는 위험 원인이 되는 작업 자체를 바꾸었다.",
    ],
    [
      "전가 (Transfer)",
      "보험·계약 등으로 특정 위험의 책임이나 재무 부담을 제3자에게 옮기는 전략이다. 다른 플랫폼을 이용했다는 사실만으로 전가로 보지 않는다.",
    ],
    [
      "분담 (Share)",
      "기회 실현 등에 필요한 역할과 이익·위험을 파트너와 나누는 전략이다. 사례의 핵심은 개발 범위 제거다.",
    ],
  ],
  1,
  "결제 웹·플랫폼 등의 자체 개발을 범위에서 제외해 해당 개발로 인한 초과·지연 위험을 피했으므로 회피다. 타 플랫폼 사용에 따른 별도의 의존성 위험은 남을 수 있다.",
  "A사는 결제 모바일 서비스를 개발하려 한다. 기존 범위는 결제 모바일 앱, 결제 웹, 결제 플랫폼, 금융권 연계 서버 개발이다. 결제 웹·플랫폼 개발로 비용 초과와 일정 지연이 예상되자 범위를 “모바일 앱 개발 + 다른 결제 플랫폼 활용”으로 축소 변경하였다.",
);

choice(
  "q72",
  "72",
  "business",
  "서비스 수준 협약",
  "아래 설명에 해당하는 용어를 고르시오.",
  [
    [
      "CSR (Customer Service Request)",
      "사용자의 서비스 요청을 뜻한다. 서비스 수준을 상호 합의한 협약 자체와 다르다.",
    ],
    [
      "ITIL (Information Technology Infrastructure Library)",
      "IT 서비스 관리의 모범 사례 체계다. 공급자와 고객 간 개별 서비스 수준 협약의 명칭이 아니다.",
    ],
    [
      "ITSM (IT Service Management)",
      "IT 서비스를 고객 관점에서 관리하는 활동과 체계다. 개별 수준 합의 문서보다 넓은 개념이다.",
    ],
    [
      "SLA (Service Level Agreement)",
      "공급자와 사용자 사이의 서비스 범위·목표 수준·측정 방법 등을 합의한 서비스 수준 협약이다.",
    ],
  ],
  4,
  "서비스 품질 수준을 사전에 합의하고 범위·항목·성과 측정 방법을 정하는 것은 SLA다. ITIL의 풀이는 캡처의 표현 대신 Information Technology Infrastructure Library로 정리했다.",
  "공급자와 사용자 사이에 제공되는 IT서비스의 범위, 항목, 형태, 성과 측정 방법 등을 포함한다. 상호 서비스 품질 수준을 사전에 정의하고 이를 달성하기 위한 명확한 기준을 제공한다.",
);

choice(
  "q9",
  "9",
  "software",
  "객체지향 설계 원칙",
  "신규 계산기 NewCalculator는 아래 과정에서 어떤 객체지향 설계 원칙을 위배했는지 고르시오.",
  [
    [
      "단일 책임 원칙 (SRP, Single Responsibility Principle)",
      "계산과 시간·알람 관리라는 서로 다른 변경 이유를 한 클래스에 결합했다. 책임을 분리하는 SRP가 핵심이다.",
    ],
    [
      "리스코프 치환 원칙 (LSP, Liskov Substitution Principle)",
      "하위 타입이 상위 타입을 대체할 수 있어야 한다는 원칙이다. 사례에는 치환 시 계약 위반을 판단할 상속 동작이 제시되지 않았다.",
    ],
    [
      "인터페이스 분리 원칙 (ISP, Interface Segregation Principle)",
      "사용하지 않는 메서드에 클라이언트가 의존하도록 강요하지 않는 원칙이다. 문제의 직접적 초점은 클래스에 혼합된 책임이다.",
    ],
    [
      "의존성 역전 원칙 (DIP, Dependency Inversion Principle)",
      "고수준·저수준 모듈이 구체 구현보다 추상화에 의존하도록 하는 원칙이다. 제시된 변화는 책임 혼합을 보여 준다.",
    ],
  ],
  1,
  "NewCalculator가 산술 연산과 시계·알람 기능을 함께 담당해 변경 이유가 둘 이상이 된다. Calculator와 Watch의 책임을 분리하고 필요하면 조합하는 편이 적절하다.",
  "기존 Calculator: add(), subtract(), multiply(), divide()\n기존 Watch: setTime(), displayTime(), setTimer(), setAlarm(), setDate()\n신규 요구: 현재 시각 표시와 알람\nNewCalculator: add(), subtract(), multiply(), divide(), setTime(), displayTime(), setAlarm()",
);

choice(
  "q75",
  "75",
  "business",
  "소프트웨어 저작권",
  "소프트웨어 저작권에 대한 설명으로 올바르지 않은 것을 고르시오.",
  [
    [
      "소프트웨어 저작물은 컴퓨터 프로그램과 프로그램에 대한 기술서를 포함한다.",
      "프로그램의 창작적 표현과 창작성이 있는 설명·기술 문서는 보호 대상이 될 수 있다. 알고리즘이라는 아이디어 자체와는 구분한다.",
    ],
    [
      "프로그램 작성을 위한 프로그램 언어, 프로토콜, 알고리즘은 저작권으로 보호를 받는다.",
      "저작권법 제101조의2는 프로그램 작성에 쓰는 언어·규약·해법 자체를 이 법의 적용 대상에서 제외한다. 구체적인 창작적 코드 표현과 구별한다.",
    ],
    [
      "오픈소스 소프트웨어 라이선스는 저작권으로 보호를 받는다.",
      "이 보기의 취지는 오픈소스도 저작권에 기반한 라이선스 조건에 따라 이용한다는 것이다. 오픈소스가 무저작권이라는 뜻은 아니다. 라이선스 문안 자체의 창작성을 일괄 단정하는 표현으로 해석하지 않는다.",
    ],
    [
      "소프트웨어 저작자는 소프트웨어를 사용·복제·배포·수정할 수 있는 권리를 가진다.",
      "일반적으로 권리자는 복제·배포·개작 등을 통제한다. 구체적인 권리 귀속과 이용 범위는 별도 양도·계약 및 법의 규정에 따라 달라질 수 있다.",
    ],
  ],
  2,
  "정답은 ②다. 언어·규약·해법 자체와 이를 사용해 작성한 구체적인 창작적 프로그램 표현을 구분한다. 2026년 10월 9일 확인한 2026년 8월 11일 시행 저작권법 제101조의2를 근거로 했다.",
);
bank[bank.length - 1].sources.push({
  title: "국가법령정보센터 · 저작권법",
  chapter: "제101조의2(보호의 대상)",
  url: "https://law.go.kr/LSW/lsLawLinkInfo.do?chrClsCd=010202&lsJoLnkSeq=1017054983",
  note: "2026-10-09 확인. 시행 2026-08-11, 법률 제21336호. 프로그램 언어·규약·해법 자체와 구체적 표현의 구분을 확인했다.",
});

const written = (
  id: string,
  number: string,
  domain: Domain,
  topic: string,
  kind: Question["kind"],
  points: number,
): Pick<
  Question,
  | "id"
  | "round"
  | "domain"
  | "kind"
  | "points"
  | "difficulty"
  | "title"
  | "topic"
  | "sources"
  | "origin"
> => ({
  id: `official-${id}`,
  round: 0,
  domain,
  kind,
  points,
  difficulty: "응용",
  title:
    number === "번호 확인 불가"
      ? "제공 수행 문항 · 번호 확인 불가"
      : `제공 문항 ${number}`,
  topic,
  sources: [capture(number, topic)],
  origin: "reference-adapted",
});

bank.push({
  ...written("q60", "60", "business", "BCG 사업 포트폴리오", "essay", 30),
  prompt:
    "아래 상황을 참고하여 전기차 충전서비스가 BCG 매트릭스의 네 영역 중 어디에 속하는지 쓰고(10점), 그 이유를 설명하시오(20점).",
  stimulus:
    "A기업은 배달서비스와 전기차 충전서비스를 운영한다. 배달서비스는 꾸준하고 안정적인 수익을 주지만 성장이 정체되어 있다. 전기차 충전서비스는 금년에 시작해 시장점유율은 낮으나 향후 시장이 크게 확대될 것으로 예상된다.\n\n| 시장성장률 / 상대적 시장점유율 | 높음 | 낮음 |\n| --- | --- | --- |\n| 높음 | Star | Question Mark |\n| 낮음 | Cash Cow (배달서비스) | Dog |",
  explanation:
    "BCG는 시장성장률과 상대적 시장점유율이라는 두 축으로 구분한다. 신사업이라는 사실만으로 정하지 말고 “점유율이 낮다”와 “시장 확대가 예상된다”를 함께 적용한다.",
  modelAnswer:
    "전기차 충전서비스는 Question Mark(물음표) 영역에 해당한다. 사업을 새로 시작해 현재 시장점유율이 낮고, 향후 시장이 크게 확대될 것으로 예상되어 시장성장률은 높기 때문이다. 높은 성장 가능성이 있으나 자사의 점유율 확대와 경쟁력 확보를 위해 선택적 투자와 검토가 필요하다.",
  keyPoints: [
    "높은 시장성장률 + 낮은 상대적 시장점유율 → Question Mark",
    "기업 매출 성장과 시장 전체 성장률을 구분한다.",
  ],
  rubric: [
    { label: "Question Mark(물음표) 영역을 정확히 쓴다.", points: 10 },
    { label: "현재 시장점유율이 낮다는 조건을 설명한다.", points: 10 },
    { label: "향후 시장 확대에 따른 높은 시장성장률을 연결한다.", points: 10 },
  ],
});

bank.push({
  ...written("q7", "7", "software", "너비 우선 탐색", "essay", 30),
  prompt:
    "아래 그래프를 a에서 시작하여 너비 우선 탐색(BFS)한다. 동작 방식을 설명하고(20점), a부터 g까지의 탐색 순서를 쓰시오(10점). 같은 깊이에서는 그림의 왼쪽 노드부터 방문한다.",
  stimulus:
    "```text\n        a\n      /   \\\n     b     c\n    / \\   / \\\n   d   e f   g\n```\n간선: a-b, a-c, b-d, b-e, c-f, c-g",
  explanation:
    "BFS는 시작점에서 간선 수가 가까운 정점부터 탐색한다. 선입선출 큐를 사용하며, 일반 그래프에서는 방문 표시로 중복 탐색을 막는다. “클래스 계층”이 아니라 그래프에서 시작점으로부터의 거리 또는 깊이를 말한다.",
  modelAnswer:
    "시작 정점 a를 방문 표시하고 큐에 넣는다. 큐 앞에서 정점을 꺼내 처리한 뒤 아직 방문하지 않은 인접 정점을 왼쪽부터 방문 표시하고 큐 뒤에 넣는다. 큐가 빌 때까지 반복하므로 깊이 0의 a, 깊이 1의 b·c, 깊이 2의 d·e·f·g 순서로 탐색한다. 최종 순서는 a → b → c → d → e → f → g다.\n\n큐 변화: [a] → [b,c] → [c,d,e] → [d,e,f,g] → [e,f,g] → [f,g] → [g] → []",
  keyPoints: [
    "가까운 깊이를 먼저 방문",
    "FIFO 큐와 방문 표시",
    "같은 깊이의 순서는 인접 정점 처리 순서에 따른다.",
  ],
  rubric: [
    {
      label: "시작점과 가까운 깊이의 정점부터 탐색한다고 설명한다.",
      points: 10,
    },
    {
      label: "FIFO 큐의 인출·인접 정점 삽입과 방문 표시를 설명한다.",
      points: 10,
    },
    { label: "a → b → c → d → e → f → g 순서를 정확히 쓴다.", points: 10 },
  ],
});

bank.push({
  ...written("q25", "25", "data", "연관관계 분석의 지지도", "essay", 30),
  prompt:
    "구매자별 구매 품목표를 이용하여 우유와 요구르트의 지지도를 구하고(15점), 도출된 값의 의미를 설명하시오(15점).",
  stimulus:
    "| 구매자 | 유제품 구매 품목 |\n| --- | --- |\n| 고객1 | 우유, 생크림, 요구르트 |\n| 고객2 | 우유, 버터, 요구르트 |\n| 고객3 | 치즈, 우유, 요구르트 |\n| 고객4 | 우유, 요구르트, 버터 |\n| 고객5 | 생크림, 버터, 치즈 |",
  explanation:
    "지지도는 두 품목을 함께 포함한 거래 수를 전체 거래 수로 나눈다. 분모를 우유 구매 거래로 한정하는 신뢰도와 구분한다.",
  modelAnswer:
    "전체 거래는 5건이며 우유와 요구르트를 함께 구매한 거래는 고객1~4의 4건이다. 따라서 지지도 Support(우유, 요구르트)=4/5=0.8=80%다. 이는 전체 구매 거래의 80%에 두 품목이 함께 들어 있다는 뜻이다. 우유를 구매한 거래 중 요구르트도 구매한 비율을 묻는 신뢰도라면 4/4=100%지만, 여기서는 지지도를 물었다.",
  keyPoints: [
    "지지도 분모는 전체 거래",
    "동시 구매 4건 / 전체 5건 = 80%",
    "지지도와 신뢰도는 다르다.",
  ],
  rubric: [
    {
      label: "동시 구매 4건과 전체 5건을 확인하여 4/5=80%를 계산한다.",
      points: 15,
    },
    {
      label:
        "전체 거래 중 우유·요구르트를 함께 포함한 거래의 비율이라고 설명한다.",
      points: 15,
    },
  ],
});

const bubbleStarter = `def my_sort(arr):
    __ㄱ__ = len(arr)
    for __ㄴ__ in range(length - 1):
        for i in range(0, length - 1 - num):
            if __ㄷ__:
                arr[i], arr[i + 1] = __ㄹ__
    return arr

arr = [60, 30, 40, 10, 20, 50]
print("정렬 전:", arr)
arr = my_sort(arr)
print("정렬 후:", arr)`;
const bubbleAnswer = `# ㄱ: length / ㄴ: num / ㄷ: arr[i] > arr[i + 1] / ㄹ: arr[i + 1], arr[i]
def my_sort(arr):
    length = len(arr)
    for num in range(length - 1):
        for i in range(0, length - 1 - num):
            if arr[i] > arr[i + 1]:
                arr[i], arr[i + 1] = arr[i + 1], arr[i]
    return arr

arr = [60, 30, 40, 10, 20, 50]
print("정렬 전:", arr)
arr = my_sort(arr)
print("정렬 후:", arr)`;
bank.push({
  ...written("q4", "4", "software", "버블 정렬 빈칸", "code", 50),
  prompt:
    "주어진 파이썬 코드가 오름차순 버블 정렬을 수행하도록 ㄱ~ㄹ을 완성하시오. ㄱ·ㄴ은 각 10점, ㄷ·ㄹ은 각 15점이다. 빈칸 답을 ㄱ: 답안 / ㄴ: 답안 / ㄷ: 답안 / ㄹ: 답안 형식으로 쓰거나 전체 코드를 작성할 수 있다.",
  stimulus: "```python\n" + bubbleStarter + "\n```",
  language: "Python",
  starterCode: "ㄱ: \nㄴ: \nㄷ: \nㄹ: ",
  explanation:
    "length는 리스트 길이, num은 완료한 바깥 반복 횟수다. 인접한 앞 값이 뒤 값보다 크면 자리를 바꾸므로 큰 값이 오른쪽 끝으로 이동한다. 끝에 확정된 num개는 다시 비교하지 않아 안쪽 범위가 length-1-num이다. 파이썬의 두 변수 동시 대입은 오른쪽 값을 먼저 평가하므로 임시 변수 없이 교환할 수 있다. 결과는 [10, 20, 30, 40, 50, 60]이다.",
  modelAnswer: bubbleAnswer,
  keyPoints: [
    "ㄱ length / ㄴ num",
    "오름차순 비교: arr[i] > arr[i + 1]",
    "교환: arr[i + 1], arr[i]",
    "range의 끝값은 포함하지 않는다.",
  ],
  rubric: [
    { label: "ㄱ에 length를 써 뒤의 길이 참조와 일치시킨다.", points: 10 },
    { label: "ㄴ에 num을 써 안쪽 반복 범위와 일치시킨다.", points: 10 },
    {
      label: "ㄷ에 arr[i] > arr[i + 1] 또는 의미가 같은 조건을 쓴다.",
      points: 15,
    },
    { label: "ㄹ에 arr[i + 1], arr[i]를 써 인접 값을 교환한다.", points: 15 },
  ],
});

const threadStarter = `public class ThreadScheduler {
    public __ㄱ__ void main(String[] args) {
        final long timeInterval = __ㄴ__; // 10초
        Runnable runnable = __ㄷ__ {
            public void run() {
                while (true) {
                    // 센서 신호 수집 코드(생략)
                    try {
                        __ㄹ__(timeInterval);
                    } catch (InterruptedException e) {
                        e.printStackTrace();
                    }
                }
            }
        };
        Thread thread = new Thread(runnable);
        __ㅁ__;
    }
}`;
const threadAnswer = `// ㄱ: static / ㄴ: 10000 / ㄷ: new Runnable() / ㄹ: Thread.sleep / ㅁ: thread.start()
public class ThreadScheduler {
    public static void main(String[] args) {
        final long timeInterval = 10000L;
        Runnable runnable = new Runnable() {
            @Override
            public void run() {
                while (true) {
                    // 센서 신호 수집 코드(생략)
                    try {
                        Thread.sleep(timeInterval);
                    } catch (InterruptedException e) {
                        e.printStackTrace();
                    }
                }
            }
        };
        Thread thread = new Thread(runnable);
        thread.start();
    }
}`;
bank.push({
  ...written("q5", "5", "software", "Java 스레드 실행", "code", 50),
  prompt:
    "공장 설비의 센서 신호를 반복 수집하고 수집 후 10초 동안 대기하는 Java Thread 코드의 ㄱ~ㅁ을 완성하시오(각 10점). 빈칸별 답 또는 전체 코드를 작성하시오.",
  stimulus: "```java\n" + threadStarter + "\n```",
  language: "Java",
  starterCode: "ㄱ: \nㄴ: \nㄷ: \nㄹ: \nㅁ: ",
  explanation:
    "static은 제시된 main 선언에 필요한 키워드다. Thread.sleep의 시간 단위는 밀리초이므로 10초=10,000ms다. new Runnable() { ... }는 run을 구현하는 익명 클래스의 객체를 만든다. Thread.sleep은 현재 실행 중인 스레드를 대기시키고, thread.start()는 별도 스레드에서 run이 실행되도록 시작한다. thread.run()을 직접 호출하는 것은 새 스레드 시작이 아니다. 원문처럼 수집 후 sleep하면 실제 수집 시작 간격에는 수집·스케줄링 시간도 더해지므로 정확한 고정 주기 10초를 보장하지 않는다. 또한 예제의 catch는 예외 출력 뒤 반복을 계속한다.",
  modelAnswer: threadAnswer,
  keyPoints: [
    "ㄱ static / ㄴ 10000(또는 10000L)",
    "ㄷ new Runnable() / ㄹ Thread.sleep / ㅁ thread.start()",
    "start()와 run()의 직접 호출을 구분한다.",
    "밀리초 단위의 대기이며 엄밀한 고정 주기 스케줄러는 아니다.",
  ],
  rubric: [
    { label: "ㄱ에 static을 쓴다.", points: 10 },
    { label: "ㄴ에 10000 또는 10000L을 쓴다.", points: 10 },
    { label: "ㄷ에 new Runnable()을 쓴다.", points: 10 },
    { label: "ㄹ에 Thread.sleep을 쓴다.", points: 10 },
    { label: "ㅁ에 thread.start()를 쓴다.", points: 10 },
  ],
});

const robotCode = `public class Robot {
    protected void move() {
        System.out.println("작동하다.");
    }
    public void stop() {
        System.out.println("멈추다.");
    }
    public void grab() {
        System.out.println("잡다.");
    }
}

public class CookRobot extends Robot {
    public void grab() {
        System.out.println("요리팬을 잡다.");
    }
}

public class CleanRobot extends Robot {
    public void grab() {
        System.out.println("청소 도구를 잡다.");
    }
}`;
const robotDiagram: Diagram = {
  nodes: [
    {
      id: "robot",
      shape: "class",
      x: 400,
      y: 100,
      label: "Robot\n# move(): void\n+ stop(): void\n+ grab(): void",
    },
    {
      id: "cook",
      shape: "class",
      x: 215,
      y: 310,
      label: "CookRobot\n+ grab(): void",
    },
    {
      id: "clean",
      shape: "class",
      x: 585,
      y: 310,
      label: "CleanRobot\n+ grab(): void",
    },
  ],
  edges: [
    { id: "cook-parent", from: "cook", to: "robot", kind: "inheritance" },
    { id: "clean-parent", from: "clean", to: "robot", kind: "inheritance" },
  ],
};
const coffeeCode = `public class CoffeeRobot extends Robot {
    public void grab(int number) {
        if (number == 1) {
            System.out.println("컵을 잡다.");
        } else {
            System.out.println("그라인더를 잡다.");
        }
    }
}`;
bank.push({
  ...written(
    "robots",
    "번호 확인 불가",
    "software",
    "클래스 상속과 메서드 작성",
    "compound",
    80,
  ),
  prompt:
    "공통 Java 소스를 읽고 클래스 다이어그램과 CoffeeRobot 코드를 작성하시오. 각 하위 문항은 40점이다.",
  stimulus:
    "보기 1 — Java 소스(각 public 클래스는 별도 파일에 저장하는 형태)\n\n```java\n" +
    robotCode +
    "\n```\n\n보기 2 — CoffeeRobot 요건\nCoffeeRobot은 Robot을 상속한다. 정수 매개변수 number를 받아 1이면 “컵을 잡다.”, 그 외이면 “그라인더를 잡다.”를 출력하는 grab 메서드를 작성한다.",
  explanation:
    "제공 캡처의 보기 1과 보기 2 및 두 하위 문항을 한 통합 문항으로 정리했다. 캡처에서 잘린 괄호와 CleanRobot 출력문의 누락된 세미콜론은 실행 가능한 예시를 위해 보완했다. 부모 grab()과 매개변수가 다른 grab(int)는 오버로딩이며 @Override를 붙이지 않는다.",
  keyPoints: [
    "상속은 자식에서 부모로 향하는 실선과 빈 삼각형으로 표시한다.",
    "public은 +, protected는 #다.",
    "메서드의 매개변수 목록이 다르면 오버로딩이다.",
  ],
  parts: [
    {
      id: "robot-uml",
      title: "클래스 다이어그램",
      kind: "diagram",
      points: 40,
      prompt:
        "보기 1의 Robot, CookRobot, CleanRobot 클래스와 명시된 메서드, 접근 제어, 상속 관계를 모두 포함해 클래스 다이어그램을 그리시오.",
      modelAnswer:
        "Robot에 # move(): void, + stop(): void, + grab(): void를 쓴다. CookRobot과 CleanRobot에는 각각 + grab(): void를 쓴다. 두 자식에서 Robot을 향하도록 실선과 빈 삼각형을 그린다. 자식은 move와 stop을 상속받으므로 반복 표기는 생략할 수 있다.",
      explanation:
        "extends Robot은 일반화(상속) 관계다. 빈 삼각형은 부모 Robot 쪽을 향한다. 출력 문자열은 메서드 내부 구현이므로 클래스 다이어그램의 속성으로 적지 않는다. grab은 두 자식에서 같은 시그니처로 재정의한다.",
      modelDiagram: robotDiagram,
      rubric: [
        {
          label: "Robot, CookRobot, CleanRobot 세 클래스를 표시한다.",
          points: 10,
        },
        {
          label:
            "Robot의 세 메서드와 #·+ 접근 제어 및 void를 올바르게 표시한다.",
          points: 10,
        },
        { label: "두 자식에 + grab(): void를 표시한다.", points: 10 },
        {
          label:
            "두 자식에서 Robot으로 향하는 일반화(빈 삼각형) 관계를 표시한다.",
          points: 10,
        },
      ],
    },
    {
      id: "coffee-code",
      title: "CoffeeRobot 구현",
      kind: "code",
      points: 40,
      language: "Java",
      starterCode:
        "public class CoffeeRobot extends Robot {\n    // number에 따라 출력하는 grab 메서드를 작성하세요.\n}",
      prompt:
        "보기 2의 요건을 만족하는 CoffeeRobot 클래스를 Java로 작성하시오.",
      modelAnswer: coffeeCode,
      explanation:
        "extends Robot으로 상속받고 public void grab(int number)를 추가한다. ==는 값을 비교하며 =는 대입이다. println은 문자열을 출력한 뒤 줄바꿈한다. 이 메서드는 부모의 grab()과 인자 목록이 달라 오버라이딩이 아니라 오버로딩이다. 따라서 매개변수 없는 grab()은 여전히 상속되며 이 메서드에 @Override를 붙이면 컴파일 오류다.",
      rubric: [
        { label: "CoffeeRobot이 extends Robot으로 상속한다.", points: 10 },
        {
          label:
            "number 매개변수를 받는 public void grab(int number)를 선언한다.",
          points: 10,
        },
        {
          label: "number == 1과 그 외의 분기를 올바르게 작성한다.",
          points: 10,
        },
        {
          label: "분기별로 지정한 두 문자열을 System.out.println으로 출력한다.",
          points: 10,
        },
      ],
    },
  ],
});

const personCode = `class Person {
    private Car myCar;
    public Person(Car car) {
        myCar = car;
    }
    // 이하 생략
}

class Car {
    public void ride() { /* 코드 생략 */ }
}`;
bank.push({
  ...written("q6", "6", "software", "객체 참조와 클래스 관계", "diagram", 50),
  prompt:
    "아래 소스 코드에 명시된 요소를 모두 포함하여 클래스 다이어그램을 작성하시오.",
  stimulus: "```java\n" + personCode + "\n```",
  explanation:
    "Person은 필드 myCar로 Car를 지속적으로 참조하므로 Person→Car 연관 관계로 나타낼 수 있다. 외부에서 생성된 Car를 전달받는 코드만으로 전체·부분이라는 도메인 의미나 수명주기 소유를 확정할 수는 없다. 자동차를 사람의 독립적인 구성요소로 모델링한다는 추가 가정에서는 Person 쪽의 빈 마름모(집합)로 나타낼 수 있지만, 코드만을 근거로 집합 관계를 유일한 정답으로 강제하지 않는다. 합성 관계의 채운 마름모는 이 코드만으로 뒷받침되지 않는다. 생성자는 반환형을 쓰지 않는다.",
  modelAnswer:
    "Person\n- myCar: Car\n+ Person(car: Car)\n\nCar\n+ ride(): void\n\nPerson에서 Car를 참조하는 연관 관계를 연결한다. 참조 필드 이름을 선의 역할명 myCar로 표시해도 된다. 전체·부분의 추가 가정을 명시했다면 Person 쪽에 빈 마름모를 둔 집합 관계도 학습용 모델로 설명할 수 있다. 단순히 “외부 객체를 전달받는다”는 사실만으로 집합 관계가 필수라고 단정하지 않는다.",
  modelDiagram: {
    nodes: [
      {
        id: "person",
        shape: "class",
        x: 225,
        y: 150,
        label: "Person\n- myCar: Car\n+ Person(car: Car)",
      },
      {
        id: "car",
        shape: "class",
        x: 575,
        y: 150,
        label: "Car\n+ ride(): void",
      },
    ],
    edges: [
      {
        id: "car-reference",
        from: "person",
        to: "car",
        kind: "arrow",
        label: "myCar",
      },
    ],
  },
  keyPoints: [
    "클래스 박스: 이름·속성·연산",
    "private은 -, public은 +",
    "생성자에는 반환형을 쓰지 않는다.",
    "연관 관계와 도메인 의미를 추가한 집합 관계를 구분한다.",
  ],
  rubric: [
    { label: "Person과 Car 클래스를 구분해 표시한다.", points: 10 },
    { label: "Person의 private 필드 - myCar: Car를 표시한다.", points: 10 },
    { label: "+ Person(car: Car) 생성자를 반환형 없이 표시한다.", points: 10 },
    { label: "Car의 + ride(): void를 표시한다.", points: 10 },
    {
      label:
        "Person의 Car 참조 관계를 표시한다. 연관을 인정하며 집합은 추가 의미를 설명한 경우 허용한다.",
      points: 10,
    },
  ],
});

const legacyNumbers: Record<string, number> = {
  "official-robots": 3,
  "official-chasm": 67,
  "official-risk-avoid": 71,
};
export const officialQuestions: Question[] = [
  ...bank,
  ...expandedSoftwareQuestions,
  ...expandedDataQuestions,
  ...expandedSystemsQuestions,
  ...expandedBusinessQuestions,
].map((q) => {
  const officialNumber = legacyNumbers[q.id] ?? Number(q.id.replace("official-q", ""));
  if (!legacyNumbers[q.id]) return { ...q, officialNumber };
  return {
    ...q,
    officialNumber,
    title: `제공 문항 ${officialNumber}`,
    sources: q.sources.map((s) => s.title.includes("사용자 제공") ? {
      ...s,
      pages: `원문 ${officialNumber}번`,
      note: `${s.note} 공개 시뮬레이션과 대조해 원문 번호를 확인했다.`,
    } : s),
  };
}).sort((a, b) => a.officialNumber - b.officialNumber);
