import { Config, typedQuestion } from "./types";

const config: Config = {
  questions: [
    typedQuestion({
      type: "single-select",
      name: "a",
      message: "Select library for A",
      extensions: ["a1", "a2"],
      default: "a2",
    }),
    typedQuestion({
      type: "multi-select",
      name: "optional",
      message: "Select optional extensions",
      extensions: ["b", "c", "d"],
    }),
  ],
};
export default config;
