# i18n-genai

AI-powered CLI to extract i18n keys from your codebase and auto-translate missing strings with Google Gemini.

This guide is for external users who want to add i18n-genai to an existing JS/TS project and use it via the CLI.

## What you get

- Extract keys from source files (`t('...')` or `i18n.t('...')`).
- Track translation progress per locale.
- Auto-translate missing strings with Gemini (batched requests, short pause between batches).
- JSON files that are easy to version and consume from any framework.

## Installation

Install as a dev dependency:

```powershell
npm install --save-dev i18n-genai
```

Optionally, use npx without installing globally:

```powershell
npx i18n-genai --help
```

## Configure Gemini

Set your Google Gemini credentials as environment variables.

Supported variables:
- `GEMINI_API_KEY` (required)
- `GEMINI_API_MODEL` (optional, default: `gemini-2.0-flash`)

Two common ways to set them:

1) .env file at your project root (auto-loaded):

```
GEMINI_API_KEY=your_api_key_here
GEMINI_API_MODEL=gemini-2.0-flash
```

2) PowerShell session variables:

```powershell
$env:GEMINI_API_KEY = "your_api_key_here"
$env:GEMINI_API_MODEL = "gemini-2.0-flash"
```

## Project configuration (i18n-genai.config.js)

Create `i18n-genai.config.js` in your project root to override defaults.

Minimal example:

```js
// i18n-genai.config.js
export default {
	defaultLocale: 'en',
}
```

Useful options (full list below):

```js
export default {
	// Where translation JSON files live
	localeFolder: 'locales',

	// Default locale
	defaultLocale: 'en',

	// Skip translating the default locale when running translate-all
	skipDefaultLocale: false,

	// File where extracted keys are stored
	storageTranslationsFile: 'translations',

	// Supported locales
	locales: [
		{ code: 'en', label: 'English' },
		{ code: 'fr', label: 'French' },
	],

	// File extensions to scan for keys
	matches: ['.ts', '.tsx', '.js', '.jsx'],

	// Folder to scan for source files
	sourceFolder: 'src',

	// Max keys per AI request
	maxKeysPerRequest: 300,
}
```

You can print the effective config (defaults + overrides) with:

```powershell
i18n-genai config
```

## Quick start

1) Set the Gemini env variables.
2) Add an `i18n-genai.config.js` if needed.
3) Extract keys from your source code:

```powershell
i18n-genai extract
```

4) Check progress per locale:

```powershell
i18n-genai status
```

5) Translate a specific locale (e.g. French):

```powershell
i18n-genai translate fr
```

6) Or translate all configured locales:

```powershell
i18n-genai translate-all
```

Tip: keys are detected when you call `t('...')` or `i18n.t('...')` in your code:

```js
// examples
t('Hello, World!')
i18n.t('Goodbye, World!')
```

## CLI commands

- `i18n-genai extract` — Scans `sourceFolder` and updates `locales/translations.json` with all discovered keys.
- `i18n-genai status` — Shows X/Y translated and % per locale by comparing against `translations.json`.
- `i18n-genai translate <locale>` — Auto-translates missing strings for the target locale via Gemini.
- `i18n-genai translate-all` — Translates all configured locales (skips `defaultLocale` if `skipDefaultLocale = true`).
- `i18n-genai config` — Prints the effective configuration.

## Output files and structure

Reference keys file (by default `locales/translations.json`):

```json
{
	"Hello, World!": "",
	"Goodbye, World!": ""
}
```

Per-locale files live in `locales/<code>.json`.

The tool reads either a flat object or an object wrapped with `translations`. It writes locale files in this format:

```json
{
	"translations": {
		"Hello, World!": "Bonjour, le monde !"
	}
}
```

## Use in your app

Any i18n library can consume the produced JSON. Two common patterns:

1) Using i18next (example):

```js
import i18next from 'i18next'
import fr from './locales/fr.json'

i18next.init({
	lng: 'fr',
	resources: {
		fr: { translation: fr.translations || fr },
	},
})
```

2) Custom `t` function:

```js
import fr from './locales/fr.json'
const messages = fr.translations || fr

function t(key) {
	return messages[key] || key
}
```

## Troubleshooting

- No keys found after `extract`? Check `sourceFolder`, `matches` (extensions), and make sure your code uses `t('...')` or `i18n.t('...')`.
- Empty AI results or errors? Ensure `GEMINI_API_KEY` is set and valid. The CLI batches requests (`maxKeysPerRequest`) and waits ~5s between batches to reduce rate limiting.
- JSON errors in locale files? The CLI logs warnings and tries to preserve existing data. Fix invalid JSON if present.
- Re-running `translate` is safe: only missing keys are processed.

## License

ISC — © Daniel Leussa.

