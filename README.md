# janus-parse [![npm version](https://img.shields.io/npm/v/janus-parse?style=flat-round)](https://www.npmjs.com/package/janus-parse) ![language](https://img.shields.io/badge/Language-Typescript-blue?style=flat-round) [![release](https://github.com/Casneil/janus-parse/actions/workflows/publish.yml/badge.svg)](https://github.com/Casneil/janus-parse/actions/workflows/publish.yml) [![build](https://github.com/Casneil/janus-parse/actions/workflows/build.yml/badge.svg)](https://github.com/Casneil/janus-parse/actions/workflows/build.yml)

A lightweight, high-performance, isomorphic HTML text extractor and sanitizer built entirely in TypeScript. It safely strips out targeted layout elements or malicious scripts and returns clean, whitespace-normalized text.

`janus-parse` provides dedicated entry points optimized for both Node.js environments and client-side browsers, ensuring minimal browser bundle overhead.

---

### What janus-parse does

`janus-parse` is a utility that cleans up HTML strings and extracts the raw text content.

Here is exactly what it handles:

1. **Completely removes blocked tags**: If a tag is blacklisted (like `script` or `style`), it doesn't just empty the content—it deletes the entire element so no empty HTML tags are left behind in your final string.
2. **Keeps specific HTML intact**: You can pass tags into `tagsToPreserve` (like `<code>` or `<iframe>`). It will keep their full HTML layout exactly as it is while stripping out generic structural tags like `<div>` or `<span>`.
3. **Cleans up messy whitespace**: It automatically strips out layout code indentations, tabs, and random line breaks, squashing them down into uniform, single spaces.

> **Note on implementation**: While the underlying `node-html-parser` library is excellent at reading and building HTML trees, it doesn't handle this type of conditional tag removal, selective HTML preservation, or text formatting out of the box. `janus-parse` bridges that gap by adding this specific data-cleaning layer on top of the parser.

---

## Installation

Install the package via your favorite package manager:

```bash
# Using pnpm
pnpm install janus-parse

# Using npm
npm install janus-parse

# Using yarn
yarn install janus-parse
```

---

## Usage

### Server-Side Execution (Node.js)

The `janusServer` function is asynchronous. It imports [node-html-parser](https://www.npmjs.com/package/node-html-parser) to handle complex document object trees smoothly on the backend.

```typescript
import { janusServer } from "janus-parse/server";

const rawHtml = `
  <main>
    <h1>Hello Universe</h1>
    <script type="text/javascript">alert('unwanted execution')</script>
    <p>This is a highly     spaced sentence.</p>
  </main>
`;

const cleanText = await janusServer(rawHtml); // Output: "Hello Universe This is a highly spaced sentence."
```

### Client-Side Execution (Browser)

The `janusClient` function is synchronous. It ignores server node environments and hooks directly into the browser's native, hardware-optimized `DOMParser` engine.

```typescript
import { janusClient } from "janus-parse/client";

const webMarkup =
  "<div> Dynamic Web App <style>body { display: none; }</style></div>";

const textOnly = janusClient(webMarkup); // Output: " Dynamic Web App"
```

---

## API Reference

#### `Config`

Optionanl second function parameter to fine-tune tag removal behaviors.

```typescript
type Config {
  tagsToRemove?: string[];
  tagsToPreserve?: string[];
}
```

---

- `rawHtml`: The input HTML string.
- `config`: Optional rule blocks to override standard cleaning lists.
- `janusServer(rawHtml, config)`: Returns a promise that resolves to a stripped, whitespace-normalized single-line string
- `janusClient(rawHtml, config)`: Returns a stripped, whitespace-normalized single-line string
