import { describe, expect, it } from 'vitest';
import { normalizeWords, tokenize } from '../src/tokenizer';

describe('tokenize', () => {
  it('counts latin words case-insensitively', () => {
    const result = tokenize('React react REACT vue');
    expect(result[0]).toEqual({ name: 'react', value: 30 });
    expect(result[1]).toEqual({ name: 'vue', value: 10 });
  });

  it('drops single characters and punctuation', () => {
    const result = tokenize('a I am --- ... the');
    expect(result).toEqual([{ name: 'am', value: 10 }, { name: 'the', value: 10 }]);
  });

  it('keeps internal apostrophes and hyphens in tokens', () => {
    const result = tokenize("don't stop now next-gen");
    const names = result.map((w) => w.name);
    expect(names).toContain("don't");
    expect(names).toContain('next-gen');
  });

  it('splits chinese into bigrams and keeps single-character runs', () => {
    const result = tokenize('数据可视化');
    // bigrams: 数据, 据可, 可视, 视化 — 4 tokens, each weight 10 (equal
    // frequency, so order among them is collation-defined)
    expect(result).toHaveLength(4);
    expect([...result].sort((a, b) => a.name.localeCompare(b.name))).toEqual(
      [
        { name: '据可', value: 10 },
        { name: '可视', value: 10 },
        { name: '数据', value: 10 },
        { name: '视化', value: 10 },
      ].sort((a, b) => a.name.localeCompare(b.name))
    );
  });

  it('handles mixed chinese and latin on one line', () => {
    const names = tokenize('使用 TypeScript 开发').map((w) => w.name);
    expect(names).toContain('使用');
    expect(names).toContain('typescript');
  });

  it('respects topN, weightScale and stopwords', () => {
    const result = tokenize('alpha beta alpha gamma alpha beta', {
      topN: 2,
      weightScale: 1,
      stopwords: ['gamma'],
    });
    expect(result).toEqual([
      { name: 'alpha', value: 3 },
      { name: 'beta', value: 2 },
    ]);
  });

  it('returns empty array for blank input', () => {
    expect(tokenize('   \n\t ')).toEqual([]);
  });
});

describe('normalizeWords', () => {
  it('trims names, drops zero-weight and empty rows, sorts by weight', () => {
    expect(
      normalizeWords([
        { name: '  b ', value: '5' as unknown as number },
        { name: '', value: 10 },
        { name: 'a', value: 0 },
        { name: 'c', value: 9.5 },
      ])
    ).toEqual([
      { name: 'c', value: 9.5 },
      { name: 'b', value: 5 },
    ]);
  });
});
