const SKILLS = [
    "react",
    "typescript",
    "javascript",
    "node.js",
    "node",
    "express",
    "python",
    "java",
    "go",
    "sql",
    "postgresql",
    "mysql",
    "sqlite",
    "mongodb",
    "redis",
    "docker",
    "kubernetes",
    "aws",
    "azure",
    "git",
    "graphql",
    "rest",
    "ci/cd",
    "testing",
    "figma",
    "agile"
];
const IMPACT_WORDS = [
    "improved",
    "increased",
    "reduced",
    "built",
    "launched",
    "optimized",
    "提升",
    "降低",
    "负责",
    "构建",
    "上线"
];
function includesTerm(text, term) {
    const normalized = text.toLowerCase();
    if (term === "node") {
        return /\bnode(?:\.js)?\b/.test(normalized);
    }
    return normalized.includes(term);
}
export function analyzeMatch(resumeText, jobDescription) {
    const requiredSkills = SKILLS.filter((skill) => includesTerm(jobDescription, skill)).filter((skill, index, list) => {
        if (skill === "node" && list.includes("node.js"))
            return false;
        return list.indexOf(skill) === index;
    });
    const matchedSkills = requiredSkills.filter((skill) => includesTerm(resumeText, skill));
    const missingSkills = requiredSkills.filter((skill) => !matchedSkills.includes(skill));
    const skillScore = requiredSkills.length === 0
        ? 60
        : Math.round((matchedSkills.length / requiredSkills.length) * 80);
    const hasMetrics = /\d+(?:[.,]\d+)?%|\d+\+/.test(resumeText);
    const hasImpact = IMPACT_WORDS.some((word) => includesTerm(resumeText, word));
    const score = Math.min(100, skillScore + (hasMetrics ? 10 : 0) + (hasImpact ? 10 : 0));
    const suggestions = [];
    if (missingSkills.length > 0) {
        suggestions.push(`补充与 ${missingSkills.slice(0, 3).join("、")} 相关的真实项目经历。`);
    }
    if (!hasMetrics) {
        suggestions.push("使用百分比、响应时间或用户规模量化项目成果。");
    }
    if (!hasImpact) {
        suggestions.push("用“构建、优化、上线”等结果导向动词描述贡献。");
    }
    if (suggestions.length === 0) {
        suggestions.push("匹配度很好，下一步可针对岗位职责调整经历排序。");
    }
    return {
        score,
        matchedSkills,
        missingSkills,
        suggestions,
        summary: score >= 80
            ? "高度匹配，建议重点准备项目取舍与技术深挖。"
            : score >= 60
                ? "具备主要基础，补齐关键证据后值得投递。"
                : "目前存在明显能力缺口，建议先定向优化简历。"
    };
}
