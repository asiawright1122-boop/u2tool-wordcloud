# u2tool-wordcloud

**Free, open-source online word cloud generator.** Paste text (English, 中文,
or mixed), tweak the shape, theme, fonts and rotation, export PNG or SVG —
everything runs in your browser, nothing is uploaded.

**Live demo:** <https://asiawright1122-boop.github.io/u2tool-wordcloud/>

## Features

- **Text → word cloud**: word frequencies computed locally, top 100 words kept
- **CJK-aware tokenization**: Chinese text splits into overlapping bigrams
  (the detail most word cloud demos get wrong), Latin text splits on
  punctuation, keeping apostrophes and hyphens (`don't`, `next-gen`)
- **Manual word editor**: edit word/weight rows directly, add or remove words
- **4 color themes × 5 shapes**, adjustable min/max font size and rotation range
- **PNG (2× pixel ratio) and SVG export**, reproducible color assignment
- **Light/dark palettes**, responsive layout, zero backend

## Use it in your project

```ts
import { tokenize } from 'u2tool-wordcloud/src/tokenizer';
// or vendor the two files: src/tokenizer.ts, src/options.ts

const words = tokenize('Paste any English or 中文 text here', { topN: 50 });
// → [{ name: 'paste', value: 10 }, { name: '文本', value: 10 }, ...]
```

The tokenizer and ECharts option builders are dependency-free (ECharts is
only needed to render), which is why they ship with unit tests.

## Development

```bash
npm install
npm test      # vitest: tokenizer + option builders
npm run dev   # local demo at http://localhost:5173
npm run build # typecheck + production build to dist/
```

## Part of the U2Tool family

This is the open-source spin-off of the
[word cloud generator](https://www.u2tool.com/zh/tools/wordcloud-generator/)
on [U2Tool](https://www.u2tool.com/) — 564 free browser tools in 10
languages, no sign-up, no uploads. Browse the
[full tool directory](https://www.u2tool.com/en/tools/) or the other
companion repos: [u2tool-hex-editor](https://github.com/asiawright1122-boop/u2tool-hex-editor),
[u2tool-chart-kit](https://github.com/asiawright1122-boop/u2tool-chart-kit),
[u2tool-csv-vcard](https://github.com/asiawright1122-boop/u2tool-csv-vcard),
[u2tool-ical-parser](https://github.com/asiawright1122-boop/u2tool-ical-parser).

Rendering by [Apache ECharts](https://echarts.apache.org/) +
[echarts-wordcloud](https://github.com/ecomfe/echarts-wordcloud).

## License

[MIT](./LICENSE) © U2Tool
