import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { analyzeMatch } from "../server/matcher.js";

describe("resume matcher", () => {
  it("rewards complete skill coverage and measurable impact", () => {
    const result = analyzeMatch(
      "构建 React + TypeScript 产品，将首屏速度提升 35%",
      "需要 React 与 TypeScript 经验"
    );
    assert.equal(result.score, 100);
    assert.deepEqual(result.missingSkills, []);
  });

  it("suggests evidence for missing requirements", () => {
    const result = analyzeMatch(
      "参与过 Web 产品开发",
      "需要 React、SQL、Docker 和 AWS 经验"
    );
    assert.equal(result.score, 0);
    assert.equal(result.suggestions.length, 3);
  });
});
