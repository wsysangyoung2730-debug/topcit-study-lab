import type { Question } from "../types";
import { softwareChoices } from "./software-choice";
import { softwareOpen } from "./software-open";

export const softwareQuestions: Question[] = [
  ...softwareChoices,
  ...softwareOpen,
].sort(
  (a, b) =>
    a.round - b.round ||
    Number(a.id.split("-").at(-1)) - Number(b.id.split("-").at(-1)),
);
