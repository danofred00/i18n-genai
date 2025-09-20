import { Config, Locale } from "@/config";
import fs from "node:fs";
import path from "node:path";

////////////////////////////////////////////////////////////////////
///////////////// OBJECT MANIPULATION FUNCTIONS ////////////////////
////////////////////////////////////////////////////////////////////

/**
 * Merges two objects.
 */
export function mergeObjects<T>(obj1: T, obj2: Partial<T>): T {
  return { ...obj1, ...obj2 };
}

/**
 * Chunks an object into smaller objects of a specified size.
 */
export function chunkObject<T extends Record<string, string>>(
  obj: T,
  chunkSize: number
): T[] {
  const entries = Object.entries(obj);
  const chunks: T[] = [];

  for (let i = 0; i < entries.length; i += chunkSize) {
    const chunk = Object.fromEntries(entries.slice(i, i + chunkSize));
    chunks.push(chunk as T);
  }

  return chunks;
}

/**
 * Converts an array of strings into an object with the strings as keys and empty strings as values.
 */
export function arrayToObject<T extends string | number>(arr: T[]) {
  return arr.reduce((acc, v) => ({ ...acc, [v]: "" }), {} as Record<T, string>);
}

////////////////////////////////////////////////////////////////////
////////////////// FILE MANIPULATION FUNCTIONS /////////////////////
////////////////////////////////////////////////////////////////////

/**
 * Extracts translation keys from a given text.
 * @param text The text to extract translation keys from.
 * @returns An array of extracted translation keys.
 */
export function extractTranslationsKeysFromText(text: string): string[] {
  const regex = /(?:i18n\.t|t)\(\s*(['"])(.*?)\1\s*\)/g;
  const keys: string[] = [];
  let match;
  while ((match = regex.exec(text)) !== null) {
    keys.push(match[2]);
  }
  return keys;
}

/**
 * Extracts translation keys from a given file.
 * @param filePath The path to the file to extract translation keys from.
 * @returns An array of extracted translation keys.
 */
export function extractTranslationsKeysFromFile(filePath: string): string[] {
  const fileContent = fs.readFileSync(filePath, "utf-8");
  return extractTranslationsKeysFromText(fileContent);
}

/**
 * Recursively reads files from a directory and yields their file paths.
 * @param dir The directory to read files from.
 * @param fileExtensions Optional array of file extensions to filter by (e.g., ['.ts', '.js']).
 * @returns A generator that yields file paths.
 */
export function* readFilesRecursively(
  dir: string,
  fileExtensions?: string[]
): Generator<string, void, unknown> {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stats = fs.statSync(fullPath);

    if (stats.isDirectory()) {
      yield* readFilesRecursively(fullPath, fileExtensions);
    } else if (stats.isFile()) {
      if (!fileExtensions || fileExtensions.includes(path.extname(file))) {
        yield fullPath;
      }
    }
  }
}

/**
 * Recursively extracts translation keys from all files in a directory.
 * @param dir The directory to scan for files.
 * @param fileExtensions Optional array of file extensions to filter by.
 * @returns An array of all extracted translation keys.
 */
export function extractTranslationKeysFromDirectory(
  dir: string,
  fileExtensions: string[] = [".ts", ".js", ".tsx", ".jsx"]
): string[] {
  const allKeys: string[] = [];

  for (const filePath of readFilesRecursively(dir, fileExtensions)) {
    const keys = extractTranslationsKeysFromFile(filePath);
    allKeys.push(...keys);
  }

  return [...new Set(allKeys)]; // Remove duplicates
}

////////////////////////////////////////////////////////////////////
////////////////// TEXT MANIPULATION FUNCTIONS /////////////////////
////////////////////////////////////////////////////////////////////

/**
 * Saves translations to a locale file.
 */
export function saveTranslationsToFile(
  locale: Locale,
  translations: Record<string, string>,
  config: Config
) {
  const targetLocaleFile = getTranslationsFilePath(config, locale.code);

  let existingData = { translations: {} as Record<string, string> };

  if (fs.existsSync(targetLocaleFile)) {
    try {
      const fileContent = JSON.parse(
        fs.readFileSync(targetLocaleFile, "utf-8")
      );

      console.log("fileContent", fileContent, translations)

      existingData = fileContent.translations
        ? fileContent
        : { translations: fileContent };
    } catch (error) {
      console.warn(
        `[!] Warning: Could not parse existing translations file for locale "${locale.code}". Overwriting with new data.`
      );
    }
  }

  existingData.translations = { ...existingData.translations, ...translations };
  // ensure directory exists
  const dir = path.dirname(targetLocaleFile);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  console.log(
    `[+] Saving ${
      Object.keys(translations).length
    } translations to ${targetLocaleFile}`
  );
  fs.writeFileSync(targetLocaleFile, JSON.stringify(existingData, null, 2), {
    encoding: "utf-8",
  });
  console.log(`[+] Translations saved successfully to ${locale.code}.json`);
}

/**
 * Saves new translation keys to the translations file.
 */
export function saveTranslationsKeys(
  keys: Record<string, string>,
  config: Config
) {
  let newKeysAdded = 0;
  const trFile = getTranslationsFilePath(config);
  const existingKeys: Record<string, string> = fs.existsSync(trFile)
    ? JSON.parse(fs.readFileSync(trFile, "utf-8"))
    : {};

  for (const key of Object.keys(keys)) {
    if (!existingKeys[key]) {
      newKeysAdded++;
      existingKeys[key] = "";
    }
  }

  // ensure directory exists
  const dir = path.dirname(trFile);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Save the updated keys back to the file
  fs.writeFileSync(trFile, JSON.stringify(existingKeys, null, 2), {
    encoding: "utf-8",
  });

  console.log(`[+] Saved ${newKeysAdded} new keys to ${path.basename(trFile)}`);
  return existingKeys;
}

/**
 * Gets the file path for the translations file based on the configuration and optional locale.
 */
export function getTranslationsFilePath(config: Config, locale?: string) {
  return path.join(
    process.cwd(),
    config.localeFolder,
    `${locale || "translations"}.json`
  );
}

export function loadTranslationsFile(
  config: Config,
  locale?: Locale
): Record<string, string> {
  const localeFilePath = getTranslationsFilePath(config, locale?.code);
  if (fs.existsSync(localeFilePath)) {
    try {
      const fileContent = JSON.parse(fs.readFileSync(localeFilePath, "utf-8"));
      return !locale ? fileContent : fileContent.translations ?? {};
    } catch (error) {
      console.warn(
        `[!] Warning: Could not parse translations file for locale "${locale?.code}".`
      );
    }
  }
  return {};
}

/**
 * Gets the untranslated keys for a specific locale.
 */
export function getUnstranslatedKeys(locale: Locale, config: Config) {
  // Load existing translations for the locale
  const localeTranslations = loadTranslationsFile(config, locale);

  // load translations key registered to generic file
  const genericTranslations = loadTranslationsFile(config);

  // then compare locale translations keys to generic keys registered
  const allKeys = Object.keys(genericTranslations);
  const untranslatedKeys = allKeys.filter((key) => !localeTranslations[key]);

  const totalKeys = allKeys.length;
  const translatedLength = totalKeys - untranslatedKeys.length;
  const percentage =
    allKeys.length > 0
      ? Math.round((translatedLength / allKeys.length) * 100)
      : 0;

  return { untranslatedKeys, percentage, translatedLength, totalKeys };
}
