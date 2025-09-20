import path from "node:path";
import fs from "node:fs";
import { pathToFileURL } from "node:url";

import { MAX_KEYS_PER_REQUEST } from "./constants.js";
import { mergeObjects, TranslationContent } from "./libs/utils.js";

type TCustomPrompt =
  | ((
      content: TranslationContent,
      targetLang: string,
      sourceLang: string
    ) => string)
  | undefined;

/**
 * Default configuration object
 */
const defaultConfig = {
  localeFolder: "locales",
  defaultLocale: "en",
  skipDefaultLocale: false,
  storageTranslationsFile: "translations",
  locales: [
    { code: "en", label: "English" },
    { code: "fr", label: "French" },
  ],
  matches: [".ts", ".tsx", ".js", ".jsx"],
  sourceFolder: "src",
  maxKeysPerRequest: MAX_KEYS_PER_REQUEST, // Nombre maximum de clés à traiter par requête

  get geminiApiKey() {
    return process.env.GEMINI_API_KEY ?? "";
  },
  get geminiApiModel() {
    return process.env.GEMINI_API_MODEL ?? "gemini-2.0-flash";
  },
};

/**
 * Configuration type
 */
export type Config = typeof defaultConfig;

export type Locale = Config["locales"][number];

/**
 * User configuration type (partial configuration)
 */
export type UserConfig = Partial<Config>;

/**
 * @returns Default configuration object
 */
export function getDefaultConfig(): Config {
  return defaultConfig;
}

/**
 * Merge the provided configuration with the default configuration.
 * @param config Partial configuration to merge with the default configuration
 * @returns Merged configuration
 */
export function getMergedConfig(config: UserConfig): Config {
  return mergeObjects(defaultConfig, config);
}

/**
 * Load and merge user configuration from a file with the default configuration.
 */
export async function getConfig(
  rootPath = process.cwd(),
  fileName = "i18n-genai.config.js"
): Promise<Config> {
  // TODO: Load user config from a file (e.g., i18n-genai.config.js, etc.)
  return getMergedConfig(await getUserConfig(rootPath, fileName));
}

/**
 * Retrieves the user configuration (i18n-genai.config.js).
 */
async function getUserConfig(
  rootPath: string,
  fileName: string
): Promise<UserConfig> {
  try {
    const configPath = path.join(rootPath, fileName);

    if (!fs.existsSync(configPath)) {
      return {};
    }

    const fileURL = pathToFileURL(path.resolve(configPath)).href;
    const module = await import(fileURL);
    return module.default satisfies UserConfig;
  } catch (error: any) {
    console.warn("Failed to load user config:", error.message);
    throw error;
  }
}
