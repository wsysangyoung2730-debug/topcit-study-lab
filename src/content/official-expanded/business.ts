import type { Question, SourceRef } from "../../types";

const source = (number: number, chapter: string): SourceRef => ({
  title: "TOPCIT 공개 시뮬레이션 · 출제 개념 참고",
  chapter,
  pages: `원문 ${number}번`,
  url: "https://www.topcit.or.kr/ibtsimulation/IBT.do",
  note: "2026-10-10 공개 문항의 주제와 유형을 확인했다. 사례·지문·보기·해설은 학습용으로 새로 작성했으며 공식 정답이나 해설이 아니다.",
});

export const expandedBusinessQuestions: Question[] = [
  {
    id: "official-q59", round: 0, domain: "business", kind: "essay", points: 30,
    difficulty: "응용", title: "공개 문항 59 기반 재구성", topic: "GPL 배포 의무",
    prompt: "회사가 GPLv3 프로그램을 수정한 뒤 실행 파일을 고객에게 다운로드 방식으로 배포한다. 이때 지켜야 할 의무를 서로 다른 두 가지 측면에서 설명하시오. 각 15점이다.",
    stimulus: "고객은 실행 파일 사본을 전달받는다. 회사는 수정한 프로그램 자체를 배포하며, 독립된 다른 프로그램과의 결합 여부는 이 문제의 범위에 포함하지 않는다.",
    modelAnswer: "① 저작권·라이선스·보증 부인 고지를 유지하고 GPL 사본을 함께 제공한다. 수정 사실과 수정 날짜를 명시하고, 해당 수정 저작물 전체를 GPL 조건으로 제공한다.\n② 실행 파일에 대응하는 소스 코드를 GPLv3 제6조가 허용한 방식으로 제공한다. 이 사례에서는 실행 파일 다운로드 위치에서 대응 소스 코드에도 동등하게 추가 비용 없이 접근할 수 있도록 안내할 수 있다.",
    explanation: "고지·라이선스 조건과 대응 소스 제공을 구분해 쓰면 된다. GPL은 상업적 배포를 일률적으로 금지하지 않는다. 이 문제는 실행 파일 사본을 전달하는 경우로 한정했다. 서버에서만 실행하며 사용자에게 사본을 전달하지 않는 상황을 같은 것으로 단정하지 않는다.",
    keyPoints: ["배포할 때 라이선스와 고지 조건 준수", "실행 파일에 대응하는 소스 제공", "단순한 원격 서비스 이용과 사본 전달 구분"],
    rubric: [
      { label: "저작권·라이선스 고지를 유지하고 GPL 사본 및 수정 고지를 제공한다고 설명한다.", points: 15 },
      { label: "대응 소스를 라이선스가 허용한 방식으로 제공한다고 설명한다.", points: 15 },
    ],
    sources: [source(59, "오픈소스 라이선스"), { title: "GNU GPL version 3", chapter: "Sections 4–6", url: "https://www.gnu.org/licenses/gpl-3.0.html", note: "2026-10-10 공식 라이선스 원문 확인. 문제의 다운로드 배포 조건에 한정해 설명했다." }],
    origin: "reference-adapted",
  },
  {
    id: "official-q68", round: 0, domain: "business", kind: "choice", points: 5,
    difficulty: "기초", title: "공개 문항 68 기반 재구성", topic: "합성곱 신경망",
    prompt: "물류센터가 상자 사진에서 파손 흔적을 분류하려 한다. 작은 필터를 이미지의 여러 위치에 적용하고 가중치를 공유하여 지역적 특징을 추출하는 신경망 구조는 무엇인가?",
    options: [
      { id: "1", text: "합성곱 신경망(CNN)", explanation: "정답. 합성곱 필터의 지역적 연결과 가중치 공유로 이미지의 선·무늬 같은 특징을 학습한다." },
      { id: "2", text: "순환 신경망(RNN)", explanation: "오답. 순서에 따라 은닉 상태를 이어 전달하는 구조로 시계열·문장 등 순차 데이터에 활용한다. 제시된 필터 이동과 가중치 공유 설명은 CNN에 해당한다." },
      { id: "3", text: "K-means 군집화", explanation: "오답. 중심점까지의 거리로 데이터를 군집에 배정하는 알고리즘이다. 합성곱 신경망 구조가 아니다." },
      { id: "4", text: "의사결정나무", explanation: "오답. 특징에 대한 조건 분기를 반복하여 예측한다. 이미지 영역에 같은 학습 필터를 적용하는 구조를 뜻하지 않는다." },
    ],
    answer: "1", modelAnswer: "1번. 합성곱 신경망(CNN)",
    explanation: "사진을 다룬다는 사실만이 아니라 '지역 필터'와 '가중치 공유'가 결정적인 단서다. 이미지 처리에 사용할 수 있는 모델은 여러 가지지만 이 구조의 이름은 CNN이다.",
    keyPoints: ["지역 수용 영역", "합성곱 필터", "가중치 공유"],
    sources: [source(68, "딥러닝 알고리즘")], origin: "reference-adapted",
  },
  {
    id: "official-q73", round: 0, domain: "business", kind: "choice", points: 5,
    difficulty: "응용", title: "공개 문항 73 기반 재구성", topic: "DevOps 문화",
    prompt: "아래 개선 방안이 가장 직접적으로 지향하는 개발·운영 문화는 무엇인가?",
    stimulus: "서비스팀이 개발과 운영의 목표를 함께 정하고 장애 원인을 공동으로 검토한다. 변경 사항은 자동 테스트를 통과하면 배포 준비가 되며, 팀은 운영 지표와 사용자 반응을 다음 개선에 반영한다. 작은 단위의 변경을 자주 전달한다.",
    options: [
      { id: "1", text: "직무별 책임을 완전히 분리하는 기능식 조직", explanation: "오답. 기능별 조직 자체가 항상 잘못된 것은 아니지만, 사례의 핵심인 개발과 운영의 공동 책임과 피드백을 직접 설명하지 않는다." },
      { id: "2", text: "DevOps", explanation: "정답. 개발과 운영의 협업·공유 책임·자동화·지속적 피드백을 통해 변경을 안정적으로 전달하는 문화와 실천이다." },
      { id: "3", text: "최종 단계에서만 통합하는 일괄 배포", explanation: "오답. 작은 변경을 자주 통합·검증하고 운영 피드백을 반영하는 사례와 맞지 않는다." },
      { id: "4", text: "판매량에 맞춰 재고를 최소화하는 JIT", explanation: "오답. 필요한 시점에 필요한 양을 공급하는 생산·재고 관리 방식이며, 이 사례의 개발·운영 협업 문화의 명칭이 아니다." },
    ],
    answer: "2", modelAnswer: "2번. DevOps",
    explanation: "자동화 도구의 설치만으로 DevOps가 완성되는 것은 아니다. 협업과 공동 책임, 관측한 결과를 개발에 다시 반영하는 흐름이 함께 있어야 한다. 마이크로서비스를 반드시 사용해야 하는 것도 아니다.",
    keyPoints: ["개발·운영 공동 책임", "자동화된 테스트와 배포", "운영 피드백과 지속 개선"],
    sources: [source(73, "개발과 운영의 협업")], origin: "reference-adapted",
  },
];
