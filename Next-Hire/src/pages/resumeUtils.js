// src/pages/resumeUtils.js
// Utility helpers used by ResumeAnalyzer.jsx
// - sanitizeResult: normalize backend response into fields UI expects
// - detectProjectKeywords: scans projects/skills to build categories report
// - computeAdjustedScore: produce a final adjusted score with keyword bonuses

/**
 * sanitizeResult(raw)
 * Accepts backend response (object) and returns normalized:
 * {
 *   summary: string,
 *   score: number,
 *   strengths: string[],
 *   weaknesses: string[],
 *   tips: string[],
 *   missing_keywords: string[],
 *   skills: string[],            // optional: flattened skills
 *   projects: [{title, description, keywords: []}]
 * }
 */
export function sanitizeResult(raw = {}) {
  // Defensive defaults — adapt if your backend uses different keys
  const summary = raw.summary || raw.snippet || raw.excerpt || "";
  const score = Number.isFinite(Number(raw.score)) ? Number(raw.score) : (raw.ats_score ? Number(raw.ats_score) : 0);
  const strengths = Array.isArray(raw.strengths) ? raw.strengths : (Array.isArray(raw.positives) ? raw.positives : []);
  const weaknesses = Array.isArray(raw.weaknesses) ? raw.weaknesses : (Array.isArray(raw.improvements) ? raw.improvements : []);
  const tips = Array.isArray(raw.tips) ? raw.tips : (Array.isArray(raw.recommendations) ? raw.recommendations : []);
  const missing_keywords = Array.isArray(raw.missing_keywords) ? raw.missing_keywords : (Array.isArray(raw.missing) ? raw.missing : []);
  const skills = Array.isArray(raw.skills) ? raw.skills : (Array.isArray(raw.tech) ? raw.tech : []);
  // Normalize projects: try a few shapes
  let projects = [];
  if (Array.isArray(raw.projects)) {
    projects = raw.projects.map((p) => ({
      title: p.title || p.name || "Project",
      description: p.description || p.desc || "",
      keywords: Array.isArray(p.keywords) ? p.keywords.map(String) : extractKeywordsFromText(p.description || p.title || "")
    }));
  } else if (Array.isArray(raw.experiences)) {
    projects = raw.experiences.map((e) => ({
      title: e.title || e.role || "Experience",
      description: e.summary || e.description || "",
      keywords: Array.isArray(e.keywords) ? e.keywords.map(String) : extractKeywordsFromText(e.summary || e.description || e.title || "")
    }));
  }

  // If no projects but there is skills list, synthesize one project
  if (projects.length === 0 && skills.length > 0) {
    projects = [{
      title: "Skills",
      description: "Synthesized from skills",
      keywords: skills.map(String)
    }];
  }

  return {
    summary,
    score,
    strengths,
    weaknesses,
    tips,
    missing_keywords,
    skills,
    projects
  };
}

// tiny keyword extractor: split by non-word and choose unique tokens that look like tech words
function extractKeywordsFromText(text = "") {
  if (!text) return [];
  const tok = text.toLowerCase().split(/[^a-z0-9+#.]+/).map(Boolean);
  // filter out tiny words & numbers, keep likely tech tokens
  const filtered = tok.filter((t) => t.length > 1 && !/^\d+$/.test(t));
  // dedupe
  return Array.from(new Set(filtered)).slice(0, 20);
}

/**
 * detectProjectKeywords(cleaned)
 * Builds a report: {
 *   totalMatches: number,
 *   foundCount: number,
 *   categories: {
 *     frontend: { total: N, foundCount: M, found: [...], missing: [...] },
 *     backend: {...}, database: {...}, devops: {...}, ml: {...}, cloud: {...}
 *   }
 * }
 *
 * This implementation ships with a default keyword map — adjust to your product's taxonomy.
 */
export function detectProjectKeywords(cleaned) {
  // Default taxonomy
  const TAX = {
    frontend: ["html", "css", "javascript", "typescript", "react", "vue", "angular", "nextjs", "nuxt", "webpack", "tailwind"],
    backend: ["node", "express", "django", "flask", "spring", "java", "ruby", "rails", "php", "asp.net", "golang", "go"],
    database: ["postgres", "postgresql", "mysql", "mongodb", "redis", "sqlite", "dynamodb", "sql", "oracle"],
    devops: ["docker", "kubernetes", "ci/cd", "github actions", "jenkins", "terraform", "ansible", "helm"],
    cloud: ["aws", "azure", "gcp", "serverless", "lambda"],
    ml: ["tensorflow", "pytorch", "sklearn", "scikit-learn", "keras", "nlp"]
  };

  // build a set of all tokens from cleaned.projects keywords + cleaned.skills
  const tokenSet = new Set();
  (cleaned.projects || []).forEach((p) => {
    (p.keywords || []).forEach((k) => tokenSet.add(String(k).toLowerCase()));
    // also parse title/description tokens
    extractKeywordsFromText(p.title).forEach((t) => tokenSet.add(t));
    extractKeywordsFromText(p.description).forEach((t) => tokenSet.add(t));
  });
  (cleaned.skills || []).forEach((s) => tokenSet.add(String(s).toLowerCase()));
  // include summary tokens
  extractKeywordsFromText(cleaned.summary).forEach((t) => tokenSet.add(t));

  // For each category compute matches
  const categories = {};
  let totalMatches = 0;
  let foundCount = 0;
  Object.keys(TAX).forEach((cat) => {
    const all = TAX[cat];
    const found = [];
    const missing = [];
    all.forEach((kw) => {
      if (tokenSet.has(kw.toLowerCase())) {
        found.push(kw);
      } else {
        missing.push(kw);
      }
    });
    categories[cat] = {
      total: all.length,
      foundCount: found.length,
      found,
      missing
    };
    totalMatches += found.length;
    foundCount += found.length;
  });

  return {
    totalMatches,
    foundCount,
    categories
  };
}

/**
 * computeAdjustedScore(baseScore, report)
 * baseScore: number (0-100)
 * report: output of detectProjectKeywords
 *
 * Strategy:
 * - Give a small per-keyword bonus (2 points each), capped so final <= 100.
 * - Also add a small category-completion bonus (if found >= 50% of category)
 */
export function computeAdjustedScore(baseScore = 0, report = { totalMatches: 0, categories: {} }) {
  const base = Number.isFinite(Number(baseScore)) ? Number(baseScore) : 0;
  const perKeyword = 2; // points per matched keyword
  const keywordBonus = (report.totalMatches || 0) * perKeyword;

  // category bonus: for each category with >= 50% coverage, add 3 points
  let categoryBonus = 0;
  Object.values(report.categories || {}).forEach((info) => {
    if (!info || !info.total) return;
    if ((info.foundCount / info.total) >= 0.5) categoryBonus += 3;
  });

  let adjusted = base + keywordBonus + categoryBonus;
  if (adjusted > 100) adjusted = 100;
  if (adjusted < 0) adjusted = 0;
  // round
  return Math.round(adjusted);
}
