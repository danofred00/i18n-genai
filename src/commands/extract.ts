import { getConfig } from "@/config";
import {
  arrayToObject,
  extractTranslationKeysFromDirectory,
  loadTranslationsFile,
  saveTranslationsKeys,
} from "@/libs/utils";

export default async function extract() {
  const config = await getConfig();

  // load translations
  console.log("[+] Reading translation keys...");
  const translations = extractTranslationKeysFromDirectory(
    config.sourceFolder,
    config.matches
  );

  console.log(`[+] Found ${translations.length} translations keys`);
  console.log(
    "[+] Writing keys to default translations file",
    config.storageTranslationsFile
  );

  // save translations
  saveTranslationsKeys(arrayToObject(translations), config);

  // success
  console.log("[+] Done! Keys saved successfully");
}
