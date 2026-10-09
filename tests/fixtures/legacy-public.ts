import { emptyAnswer, type StudyState } from "../../src/lib/study";

export const legacyPublicIds = [
  "official-q49",
  "official-q50",
  "official-q58",
  "official-q74",
  "official-q61",
  "official-q62",
  "official-q63",
  "official-q64",
  "official-q65",
  "official-q66",
  "official-chasm",
  "official-q69",
  "official-q70",
  "official-risk-avoid",
  "official-q72",
  "official-q9",
  "official-q75",
  "official-q60",
  "official-q7",
  "official-q25",
  "official-q4",
  "official-q5",
  "official-robots",
  "official-q6",
];

export function legacyPublicState(): StudyState {
  return {
    version: 1,
    activeId: "legacy-public",
    sessions: [
      {
        id: "legacy-public",
        mode: "study",
        round: 0,
        ids: [...legacyPublicIds],
        index: 22,
        startedAt: 100,
      },
    ],
    bookmarks: ["official-robots", "official-chasm", "official-risk-avoid"],
    answers: {
      "legacy-public::official-q50": { ...emptyAnswer(), value: "2" },
      "legacy-public::official-robots": {
        ...emptyAnswer(),
        parts: {
          "coffee-code": {
            ...emptyAnswer(),
            value: "public class CoffeeRobot extends Robot {}",
            checked: true,
            submittedValue: "public class CoffeeRobot extends Robot {}",
            rubric: [0],
            checks: 1,
            history: [
              {
                value: "public class CoffeeRobot extends Robot {}",
                at: 200,
              },
            ],
          },
        },
      },
    },
  };
}
