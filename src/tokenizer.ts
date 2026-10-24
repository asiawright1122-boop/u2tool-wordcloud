/**
 * Word-frequency tokenizer for word cloud generation.
 *
 * Extracted from the U2Tool word cloud generator and hardened with tests.
 * Handles Latin words, digits, and CJK (Chinese) character bigrams, which is
 * the part most word cloud demos get wrong: Chinese has no spaces, so
 * single-character splitting produces noise.
 */

export interface WordItem {
  name: string;
  value: number;
}

export interface TokenizeOptions {
  /** Maximum number of words to keep (highest frequency first). */
  topN?: number;
  /** Frequency multiplier applied to every kept word (visual weight scale). */
  weightScale?: number;
  /** Extra words to drop (case-insensitive), e.g. stopwords. */
  stopwords?: string[];
}

const DEFAULT_TOP_N = 100;
const DEFAULT_WEIGHT_SCALE = 10;

/** CJK Unified Ideographs (common Han range). */
function isCjkChar(ch: string): boolean {
  const code = ch.codePointAt(0) ?? 0;
  return code >= 0x4e00 && code <= 0x9fff;
}

/**
 * Tokenize free text into weighted word items.
 *
 * Latin/digit tokens are split on non-word characters; CJK text is split
 * into overlapping bigrams (unigrams when a run is a single character),
 * which matches how word clouds surface Chinese keywords.
 */
export function tokenize(
  input: string,
  options: TokenizeOptions = {}
): WordItem[] {
  const topN = options.topN ?? DEFAULT_TOP_N;
  const weightScale = options.weightScale ?? DEFAULT_WEIGHT_SCALE;
  const stopwords = new Set((options.stopwords ?? []).map((w) => w.toLowerCase()));

  const counts = new Map<string, number>();
  const push = (token: string) => {
    if (token.length <= 1 || stopwords.has(token.toLowerCase())) return;
    // Tokens made only of joiners (e.g. "---", "''") are not words.
    if (!/[a-z0-9\u4e00-\u9fa5]/.test(token)) return;
    counts.set(token, (counts.get(token) ?? 0) + 1);
  };

  for (const rawLine of input.toLowerCase().split(/\r?\n/)) {
    // Split each line into runs of CJK characters and runs of word/digit chars.
    let buffer = '';
    let bufferIsCjk = false;
    const flush = () => {
      if (!buffer) return;
      if (bufferIsCjk) {
        if (buffer.length === 1) {
          push(buffer);
        } else {
          for (let i = 0; i + 1 < buffer.length; i++) {
            push(buffer.slice(i, i + 2));
          }
        }
      } else {
        push(buffer);
      }
      buffer = '';
    };

    for (const ch of rawLine) {
      if (isCjkChar(ch)) {
        if (!bufferIsCjk && buffer) flush();
        bufferIsCjk = true;
        buffer += ch;
      } else if (/[a-z0-9'_-]/.test(ch)) {
        if (bufferIsCjk && buffer) flush();
        bufferIsCjk = false;
        buffer += ch;
      } else {
        flush();
      }
    }
    flush();
  }

  return Array.from(counts.entries())
    .map(([name, count]) => ({ name, value: count * weightScale }))
    .sort((a, b) => b.value - a.value || a.name.localeCompare(b.name))
    .slice(0, topN);
}

/** Weighted word list used by the manual editor. */
export function normalizeWords(words: WordItem[]): WordItem[] {
  return words
    .filter((w) => typeof w.name === 'string' && w.name.trim().length > 0)
    .map((w) => ({ name: w.name.trim(), value: Number(w.value) || 0 }))
    .filter((w) => w.value > 0)
    .sort((a, b) => b.value - a.value);
}

export const SAMPLE_WORDS: WordItem[] = [
  { name: 'Innovation', value: 100 },
  { name: 'Technology', value: 95 },
  { name: 'Design', value: 90 },
  { name: 'Development', value: 85 },
  { name: 'Creativity', value: 80 },
  { name: 'Solution', value: 75 },
  { name: 'Efficiency', value: 70 },
  { name: 'Quality', value: 65 },
  { name: 'Teamwork', value: 60 },
  { name: 'Growth', value: 55 },
  { name: 'Success', value: 50 },
  { name: 'Future', value: 45 },
];
