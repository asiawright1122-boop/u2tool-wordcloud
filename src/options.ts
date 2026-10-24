/**
 * ECharts option builders for the word cloud, extracted from U2Tool's
 * chart tooling so they can be unit-tested without a browser.
 */
import type { WordItem } from './tokenizer';

export const COLOR_THEMES = {
  default: ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452', '#9a60b4'],
  ocean: ['#0077b6', '#00b4d8', '#90e0ef', '#48cae4', '#023e8a', '#0096c7'],
  sunset: ['#ff6b6b', '#feca57', '#ff9ff3', '#54a0ff', '#5f27cd', '#00d2d3'],
  rainbow: ['#e74c3c', '#e67e22', '#f1c40f', '#2ecc71', '#3498db', '#9b59b6'],
} as const;

export type ThemeName = keyof typeof COLOR_THEMES;
export type CloudShape = 'circle' | 'cardioid' | 'diamond' | 'triangle-forward' | 'triangle' | 'pentagon' | 'star';

export interface CloudStyle {
  title: string;
  theme: ThemeName;
  shape: CloudShape;
  minFontSize: number;
  maxFontSize: number;
  rotationRange: number;
}

export interface ChartPalette {
  backgroundColor: string;
  textColor: string;
  tooltipBg: string;
  tooltipBorder: string;
  tooltipText: string;
}

export const LIGHT_PALETTE: ChartPalette = {
  backgroundColor: '#ffffff',
  textColor: '#1f2937',
  tooltipBg: '#ffffff',
  tooltipBorder: '#e5e7eb',
  tooltipText: '#111827',
};

export const DARK_PALETTE: ChartPalette = {
  backgroundColor: '#0f172a',
  textColor: '#e2e8f0',
  tooltipBg: '#1e293b',
  tooltipBorder: '#334155',
  tooltipText: '#f1f5f9',
};

function randomColorFactory(theme: ThemeName): () => string {
  const colors = COLOR_THEMES[theme];
  let cursor = 0;
  // Deterministic rotation keeps exports reproducible for the same input.
  return () => colors[cursor++ % colors.length];
}

export function buildWordCloudOption(
  words: WordItem[],
  style: CloudStyle,
  palette: ChartPalette = LIGHT_PALETTE
): Record<string, unknown> {
  const nextColor = randomColorFactory(style.theme);
  return {
    backgroundColor: palette.backgroundColor,
    title: {
      text: style.title,
      left: 'center',
      top: 10,
      textStyle: { fontSize: 16, fontWeight: 'bold', color: palette.textColor },
    },
    tooltip: {
      show: true,
      backgroundColor: palette.tooltipBg,
      borderColor: palette.tooltipBorder,
      textStyle: { color: palette.tooltipText },
    },
    series: [
      {
        type: 'wordCloud',
        shape: style.shape,
        left: 'center',
        top: 'center',
        width: '90%',
        height: '80%',
        sizeRange: [style.minFontSize, style.maxFontSize],
        rotationRange: [-style.rotationRange, style.rotationRange],
        rotationStep: 15,
        gridSize: 8,
        drawOutOfBound: false,
        layoutAnimation: true,
        textStyle: {
          fontFamily: 'sans-serif',
          fontWeight: 'bold',
          color: nextColor,
        },
        emphasis: {
          focus: 'self',
          textStyle: {
            textShadowBlur: 10,
            textShadowColor: palette === LIGHT_PALETTE ? '#94a3b8' : '#0f172a',
          },
        },
        data: words,
      },
    ],
  };
}

/** Build a data URL for PNG/SVG export from a rendered ECharts instance. */
export function buildExportUrl(
  chart: { getDataURL(opts?: unknown): string },
  format: 'png' | 'svg',
  backgroundColor: string
): string {
  if (format === 'svg') {
    return chart.getDataURL({ type: 'svg', backgroundColor });
  }
  return chart.getDataURL({ type: 'png', backgroundColor, pixelRatio: 2 });
}
