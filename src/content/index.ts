import type { Question } from "../types";
import { softwareQuestions } from "./software";
import { dataQuestions } from "./data";
import { systemsQuestions } from "./systems";
import { businessQuestions } from "./business";
import { officialQuestions } from "./official";
export const questions: Question[] = [
  ...softwareQuestions,
  ...dataQuestions,
  ...systemsQuestions,
  ...businessQuestions,
  ...officialQuestions,
];
export const roundDescriptions = [
  {
    title: "기본기를 연결하는 첫 연습",
    description:
      "제공된 교재와 문제풀이 자료의 개념을 실전 형식으로 재구성했어요.",
  },
  {
    title: "구조를 이해하는 시간",
    description:
      "소프트웨어 설계, 데이터 구조와 업무 프로세스의 기초를 다져요.",
  },
  {
    title: "흐름과 동시성을 다루기",
    description: "프로그램 실행과 트랜잭션, 시스템 운영의 흐름을 살펴봐요.",
  },
  {
    title: "성능과 품질을 함께",
    description: "조회 성능, 품질 관리와 개선의 근거를 확인해요.",
  },
  {
    title: "안정적인 시스템 만들기",
    description: "복구 전략과 운영 위험을 구체적인 사례로 판단해요.",
  },
  {
    title: "데이터로 판단하는 연습",
    description: "분석 지표와 구현 결과를 계산하고 그 의미를 설명해요.",
  },
  {
    title: "확장하는 서비스 설계",
    description: "분산 처리와 일관성, 변화하는 요구사항을 연결해요.",
  },
  {
    title: "업무와 기술의 접점",
    description: "여러 영역의 개념을 실제 업무의 의사결정에 적용해요.",
  },
  {
    title: "운영 문제를 해결하는 힘",
    description: "처리량과 병목, 위험을 분석하며 대안을 비교해요.",
  },
  {
    title: "개념을 묶는 종합 연습",
    description: "익힌 개념을 새로운 상황에서 적용하고 취약점을 정리해요.",
  },
];
