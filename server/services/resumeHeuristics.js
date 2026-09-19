// Pattern-based bullet quality checks — deliberately not an LLM call: these
// are mechanical, testable rules (a number present, a strong opening verb)
// that don't need judgment, so keeping them local is faster, free, and
// instant to run on every bullet instead of batching them through Claude.

const WEAK_OPENERS = [
  "responsible for",
  "duties included",
  "worked on",
  "worked with",
  "helped with",
  "helped to",
  "in charge of",
  "tasked with",
  "involved in",
  "participated in",
  "assisted with",
  "assisted in",
];

const STRONG_ACTION_VERBS = [
  "built", "led", "developed", "architected", "implemented", "designed",
  "optimized", "reduced", "increased", "launched", "created", "managed",
  "delivered", "automated", "improved", "spearheaded", "established",
  "streamlined", "achieved", "drove", "engineered", "shipped", "scaled",
  "migrated", "refactored", "debugged", "deployed", "integrated",
  "mentored", "coordinated", "analyzed", "researched", "authored",
  "negotiated", "presented", "trained", "resolved", "accelerated",
  "cut", "grew", "generated", "saved", "boosted",
];

const QUANTIFIED_IMPACT_PATTERN = /\d/;

// A crude but standard heuristic: "was/were/is/are/been" followed shortly by
// a past-participle-shaped word (ends in -ed) reads as passive voice.
const PASSIVE_VOICE_PATTERN = /\b(was|were|is|are|been|being)\s+(\w+ed)\b/i;

function firstWord(text) {
  const match = text.trim().match(/^[A-Za-z]+/);
  return match ? match[0].toLowerCase() : "";
}

function matchedWeakOpener(bulletText) {
  const lower = bulletText.trim().toLowerCase();
  return WEAK_OPENERS.find((phrase) => lower.startsWith(phrase)) || null;
}

function hasWeakOpener(bulletText) {
  return matchedWeakOpener(bulletText) !== null;
}

function hasStrongActionVerbStart(bulletText) {
  return STRONG_ACTION_VERBS.includes(firstWord(bulletText));
}

function hasQuantifiedImpact(bulletText) {
  return QUANTIFIED_IMPACT_PATTERN.test(bulletText);
}

function isPassiveVoice(bulletText) {
  return PASSIVE_VOICE_PATTERN.test(bulletText);
}

// Returns the flags plus human-readable issue strings, reused for both the
// resume-wide category scores and (later) per-bullet inline highlighting.
function analyzeBullet(bulletText) {
  const matchedOpener = matchedWeakOpener(bulletText);
  const weakOpener = matchedOpener !== null;
  const strongVerb = hasStrongActionVerbStart(bulletText);
  const quantified = hasQuantifiedImpact(bulletText);
  const passive = isPassiveVoice(bulletText);

  const issues = [];
  if (weakOpener) issues.push(`Starts with a filler phrase ("${matchedOpener}")`);
  if (!strongVerb && !weakOpener) issues.push("Doesn't open with a strong action verb");
  if (passive) issues.push("Written in passive voice");
  if (!quantified) issues.push("No quantified impact (a number, %, or metric)");

  return { weakOpener, strongVerb, quantified, passive, issues };
}

module.exports = {
  analyzeBullet,
  hasWeakOpener,
  hasStrongActionVerbStart,
  hasQuantifiedImpact,
  isPassiveVoice,
};
