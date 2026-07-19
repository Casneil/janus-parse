# janus-parse

[![npm version](https://shields.io)](https://npmjs.com)
[![License: MIT](https://shields.io)](https://opensource.org)

A lightweight, high-performance, isomorphic HTML text extractor and sanitizer built entirely in TypeScript. It safely strips out targeted layout elements or malicious scripts and returns clean, whitespace-normalized text.

`janus-parse` provides dedicated entry points optimized for both Node.js environments and client-side browsers, ensuring minimal browser bundle overhead.

---

## Features

* **Isomorphic Architecture:** Native support for both Node.js servers and Web Browsers.
* **Smart Tree Shaking:** Heavy server-side dependencies are dynamically imported, keeping your browser footprint tiny.
* **Strict Validation:** Automatically ensures inputs are safe and structurally sound before parsing.
* **Built-in TypeScript Types:** Ship code confidently with full type safety and explicit configuration interfaces.

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

### 1. Server-Side Execution (Node.js)

The `janusServer` function is asynchronous. It dynamically imports [node-html-parser](https://www.npmjs.com/package/node-html-parser) to handle complex document object trees smoothly on the backend.

```typescript
import { janusServer } from 'janus-parse';

const rawHtml = `
  <main>
    <h1>Hello Universe</h1>
    <script type="text/javascript">alert('unwanted execution')</script>
    <p>This is a highly     spaced sentence.</p>
  </main>
`;

const cleanText = await janusServer(rawHtml);
console.log(cleanText);
// Output: "Hello Universe This is a highly spaced sentence."
```

### 2. Client-Side Execution (Browser)

The `janusClient` function is synchronous. It ignores server node environments and hooks directly into the browser's native, hardware-optimized `DOMParser` engine.

```typescript
import { janusClient } from 'janus-parse';

const webMarkup = '<div> Dynamic Web App <style>body { display: none; }</style></div>';

const textOnly = janusClient(webMarkup);
console.log(textOnly);
// Output: " Dynamic Web App"
```

### 3. Custom Configurations

You can modify which HTML tags are targeted for destruction by passing an optional configuration object.

```typescript
	const structuralConfig = {
		addBlacklistTags: ['span', 'section'], // Purge extra elements
		removeBlacklistTags: ['script']        // Keep scripts if you are building an isolated sandbox
	};
```

```typescript
import { janusServer } from 'janus-parse';

const processedTextServer = await janusServer(htmlSource, structuralConfig);
```

```typescript
import { janusClient } from 'janus-parse';

const processedTextClient = janusClienthtmlSource, structuralConfig);
```

---

## API Reference

### `Config`
TypeScript interface passed to fine-tune tag removal behaviors.
```typescript
interface Config {
  addBlacklistTags?: string[];
  removeBlacklistTags?: string[];
}
```

### `janusServer(text: string, config?: Config): Promise<string>`
* **`text`**: The input raw HTML string.
* **`config`**: Optional rule blocks to override standard cleaning lists.
* **Returns**: A promise that resolves to a stripped, whitespace-normalized single-line string.

### `janusClient(text: string, config?: Config): string`
* **`text`**: The input raw HTML string.
* **`config`**: Optional rule blocks to override standard cleaning lists.
* **Returns**: A clean string containing target inner-text nodes parsed from the browser context.

---

## Development & Testing

If you want to contribute or modify this package, pull down the code and use the built-in development workflows:

```bash
# Install dependencies
pnpm install

# Run the test suite via Vitest
pnpm test

# Check or fix formatting rules
pnpm fmt

# Compile the TypeScript project into the 'dist/' folder
pnpm build
```

---

## License

Distributed under the MIT License. See [LICENSE](LICENSE) for more information.
