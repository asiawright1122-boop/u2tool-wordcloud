import './style.css';
import * as echarts from 'echarts';
import 'echarts-wordcloud';
import { SAMPLE_WORDS, normalizeWords, tokenize } from './tokenizer';
import {
  COLOR_THEMES,
  DARK_PALETTE,
  LIGHT_PALETTE,
  buildExportUrl,
  buildWordCloudOption,
  type CloudShape,
  type ThemeName,
} from './options';

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;

const chart = echarts.init($('chart'), undefined, { renderer: 'svg' });

let words = [...SAMPLE_WORDS];
let dark = window.matchMedia('(prefers-color-scheme: dark)').matches;

function currentStyle() {
  return {
    title: ($('title-input') as HTMLInputElement).value,
    theme: ($('theme-select') as HTMLSelectElement).value as ThemeName,
    shape: ($('shape-select') as HTMLSelectElement).value as CloudShape,
    minFontSize: Number(($('min-font') as HTMLInputElement).value),
    maxFontSize: Number(($('max-font') as HTMLInputElement).value),
    rotationRange: Number(($('rotation') as HTMLInputElement).value),
  };
}

function render() {
  const palette = dark ? DARK_PALETTE : LIGHT_PALETTE;
  document.body.classList.toggle('dark', dark);
  chart.setOption(buildWordCloudOption(words, currentStyle(), palette), true);
}

function exportChart(format: 'png' | 'svg') {
  const url = buildExportUrl(
    chart,
    format,
    dark ? DARK_PALETTE.backgroundColor : LIGHT_PALETTE.backgroundColor
  );
  const link = document.createElement('a');
  link.download = `wordcloud-${Date.now()}.${format}`;
  link.href = url;
  link.click();
}

$('load-sample').addEventListener('click', () => {
  words = [...SAMPLE_WORDS];
  render();
});

$('generate').addEventListener('click', () => {
  const text = ($('text-input') as HTMLTextAreaElement).value;
  const next = tokenize(text);
  if (next.length > 0) {
    words = next;
    render();
  }
});

$('export-png').addEventListener('click', () => exportChart('png'));
$('export-svg').addEventListener('click', () => exportChart('svg'));

$('add-word').addEventListener('click', () => {
  words = [...words, { name: `word ${words.length + 1}`, value: 50 }];
  renderWords();
  render();
});

function renderWords() {
  const host = $('word-list');
  host.innerHTML = '';
  words.forEach((word, index) => {
    const row = document.createElement('div');
    row.className = 'word-row';
    const name = document.createElement('input');
    name.value = word.name;
    name.addEventListener('change', () => {
      words[index].name = name.value;
      render();
    });
    const value = document.createElement('input');
    value.type = 'number';
    value.value = String(word.value);
    value.addEventListener('change', () => {
      words[index].value = Number(value.value) || 0;
      render();
    });
    const remove = document.createElement('button');
    remove.textContent = '✕';
    remove.disabled = words.length <= 1;
    remove.addEventListener('click', () => {
      words = words.filter((_, i) => i !== index);
      renderWords();
      render();
    });
    row.append(name, value, remove);
    host.append(row);
  });
}

for (const id of ['title-input', 'theme-select', 'shape-select', 'min-font', 'max-font', 'rotation']) {
  $(id).addEventListener('input', render);
}

$('dark-toggle').addEventListener('click', () => {
  dark = !dark;
  render();
});

window.addEventListener('resize', () => chart.resize());
document.querySelectorAll('[data-theme]').forEach((el) => {
  el.addEventListener('click', () => {
    ($('theme-select') as HTMLSelectElement).value = (el as HTMLElement).dataset.theme!;
    render();
  });
});

void COLOR_THEMES;
renderWords();
render();
