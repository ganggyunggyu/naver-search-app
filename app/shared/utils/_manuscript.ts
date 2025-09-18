export type KeywordCount = { word: string; count: number };
export type ManuscriptAnalysis = {
  charCount: number;
  charCountNoSpace: number;
  wordCount: number;
  readingTimeMin: number;
  topKeywords: KeywordCount[];
};

const STOPWORDS = new Set([
  '그리고','그러나','하지만','또한','및','또','그','이','저','것','좀','더','수','수있다','대한','최근','관련','때문','정도','에서','이다','으로','해서','있는','합니다','했다','하는','하는데','이다','이다.',
  '을','를','은','는','이','가','에','의','와','과','로','다','요','죠','님','합니다.','했습니다','했습니다.'
]);

export const analyzeManuscript = (
  content: string,
  include?: string
): ManuscriptAnalysis => {
  const text = (content || '').trim();
  const charCount = text.length;
  const charCountNoSpace = text.replace(/\s+/g, '').length;

  const tokens = text
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length >= 2 && !STOPWORDS.has(t));

  const wordCount = tokens.length;
  const freq = new Map<string, number>();
  for (const t of tokens) freq.set(t, (freq.get(t) || 0) + 1);

  const entries: Array<[string, number]> = Array.from(freq.entries());
  const q = (include || '').trim();
  if (q) {
    const lcText = text.toLowerCase();
    const lcQ = q.toLowerCase();
    let qCount = 0;
    if (lcQ.length > 0) qCount = Math.max(0, lcText.split(lcQ).length - 1);
    const idx = entries.findIndex(([w]) => w.toLowerCase() === lcQ);
    if (idx >= 0) {
      if (qCount > entries[idx][1]) entries[idx][1] = qCount;
    } else {
      entries.push([q, qCount]);
    }
  }

  let topKeywords = entries
    .sort((a, b) => b[1] - a[1])
    .map(([word, count]) => ({ word, count }));

  if (q && !topKeywords.some((k) => k.word.toLowerCase() === q.toLowerCase())) {
    const qCount = entries.find((e) => e[0].toLowerCase() === q.toLowerCase())?.[1] ?? 0;
    topKeywords.push({ word: q, count: qCount });
  }

  const readingTimeMin = Math.max(0.1, +(charCount / 500).toFixed(1));
  return { charCount, charCountNoSpace, wordCount, readingTimeMin, topKeywords };
};

export const formatManuscriptAnalysis = (
  analysis: ManuscriptAnalysis,
  opts?: { title?: string; url?: string }
): string => {
  const lines: string[] = [];
  if (opts?.title) lines.push(`제목: ${opts.title}`);
  if (opts?.url) lines.push(`URL: ${opts.url}`);
  lines.push(
    `문자수: ${analysis.charCount}`,
    `공백제외: ${analysis.charCountNoSpace}`,
    `단어수: ${analysis.wordCount}`,
    `예상 읽기: ${analysis.readingTimeMin}분`
  );
  if (analysis.topKeywords?.length) {
    const ks = analysis.topKeywords
      .map((k) => `#${k.word} x${k.count}`)
      .join(', ');
    lines.push(`키워드: ${ks}`);
  }
  return lines.join('\n');
};

export const countKeywordOccurrences = (
  content: string,
  keywords: string[]
): KeywordCount[] => {
  const text = (content || '').toLowerCase();
  const results: KeywordCount[] = [];
  for (const k of keywords) {
    const word = (k || '').trim();
    if (!word) continue;
    const lc = word.toLowerCase();
    const count = Math.max(0, text.split(lc).length - 1);
    results.push({ word, count });
  }
  return results;
};

export const topKoreanTokens = (
  content: string,
  topN = 10
): KeywordCount[] => {
  const text = (content || '');
  const matches = text.match(/[가-힣]{2,}/g) || [];
  const freq = new Map<string, number>();
  for (const m of matches) {
    if (STOPWORDS.has(m)) continue;
    freq.set(m, (freq.get(m) || 0) + 1);
  }
  return Array.from(freq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([word, count]) => ({ word, count }));
};

export const extractSubtitles = (content: string): string[] => {
  const lines = (content || '')
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  const candidates: string[] = [];
  for (const l of lines) {
    if (l.length < 4 || l.length > 60) continue;
    const words = l.split(/\s+/);
    if (words.length > 12) continue;
    // exclude lines that look like pure footers/links
    if (/^https?:\/\//i.test(l)) continue;
    // prefer lines without trailing punctuation that looks like normal sentence end
    if (/[\.\u3002]$/.test(l)) continue;
    if (!candidates.includes(l)) candidates.push(l);
    if (candidates.length >= 20) break;
  }
  return candidates;
};
