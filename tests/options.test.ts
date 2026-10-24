import { describe, expect, it } from 'vitest';
import {
  COLOR_THEMES,
  DARK_PALETTE,
  buildWordCloudOption,
  buildExportUrl,
} from '../src/options';

describe('buildWordCloudOption', () => {
  const style = {
    title: 'Demo',
    theme: 'ocean' as const,
    shape: 'circle' as const,
    minFontSize: 12,
    maxFontSize: 60,
    rotationRange: 45,
  };

  it('builds a wordCloud series wired to the words and style', () => {
    const words = [
      { name: 'alpha', value: 100 },
      { name: 'beta', value: 50 },
    ];
    const option = buildWordCloudOption(words, style, DARK_PALETTE) as Record<string, any>;

    expect(option.series[0].type).toBe('wordCloud');
    expect(option.series[0].shape).toBe('circle');
    expect(option.series[0].sizeRange).toEqual([12, 60]);
    expect(option.series[0].rotationRange).toEqual([-45, 45]);
    expect(option.series[0].data).toEqual(words);
    expect(option.backgroundColor).toBe(DARK_PALETTE.backgroundColor);
    expect(option.title.text).toBe('Demo');
  });

  it('assigns colors deterministically from the selected theme', () => {
    const words = COLOR_THEMES.ocean.map((_, i) => ({ name: `w${i}`, value: 100 - i }));
    const option = buildWordCloudOption(words, style) as Record<string, any>;
    const factory = option.series[0].textStyle.color as () => string;

    expect(factory()).toBe(COLOR_THEMES.ocean[0]);
    expect(factory()).toBe(COLOR_THEMES.ocean[1]);
    // wraps around after exhausting the palette
    for (let i = 2; i < COLOR_THEMES.ocean.length; i++) factory();
    expect(factory()).toBe(COLOR_THEMES.ocean[0]);
  });

  it('rejects nothing for every declared theme name', () => {
    for (const theme of Object.keys(COLOR_THEMES)) {
      const option = buildWordCloudOption([{ name: 'x', value: 1 }], { ...style, theme: theme as never });
      expect((option as Record<string, any>).series[0].data).toHaveLength(1);
    }
  });
});

describe('buildExportUrl', () => {
  it('requests svg type for svg and pixelRatio 2 png', () => {
    const calls: Array<Record<string, unknown>> = [];
    const fake = {
      getDataURL(opts?: unknown) {
        calls.push(opts as Record<string, unknown>);
        return 'data:image/png;base64,x';
      },
    };
    buildExportUrl(fake, 'svg', '#fff');
    buildExportUrl(fake, 'png', '#fff');
    expect(calls[0]).toEqual({ type: 'svg', backgroundColor: '#fff' });
    expect(calls[1]).toEqual({ type: 'png', backgroundColor: '#fff', pixelRatio: 2 });
  });
});
