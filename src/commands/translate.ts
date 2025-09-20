import { getConfig } from "@/config";
import { processTranslationsBatch } from "@/libs/ai";
import { getUnstranslatedKeys, saveTranslationsToFile } from "@/libs/utils";

type TranslateOptions = {
  locale: string;
};

export default async function translate(locale: string) {
  const config = await getConfig();

  // check if the locale is avaliable
  const targetLocale = config.locales.find((v) => v.code === locale);
  if (!targetLocale) {
    throw new Error(
      `[!] Unavaliable Locale ${locale}. Use one of ${config.locales
        .map((l) => l.code)
        .join(", ")}`
    );
  }

  console.log(
    `[+] Translating to ${targetLocale.label} (${targetLocale.code})`
  );

  const { untranslatedKeys } = getUnstranslatedKeys(targetLocale, config);
  if (untranslatedKeys.length === 0) {
    console.log(
      `[+] All keys are already translated for this locale. Nothing to do.`
    );
    return;
  }

  console.log(`[+] Found ${untranslatedKeys.length} untranslated keys`);

  // process the translation
  console.log("[+] Starting translation process...");
  const translated = await processTranslationsBatch(
    untranslatedKeys,
    targetLocale,
    config
  );
  const translatedLength = Object.keys(translated).length;

  if (translatedLength === 0) {
    console.log("[!] No translations were generated");
    return;
  }

  // save translations
  saveTranslationsToFile(targetLocale, translated, config);
  console.log(`[+] ${translatedLength} strings translated`);
}
