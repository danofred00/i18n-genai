import { getConfig } from "@/config";
import translate from "./translate";

export default async function translateAll() {
  const config = await getConfig();

  for (const locale of config.locales) {
    if (locale.code === config.defaultLocale && config.skipDefaultLocale)
      continue;

    await translate(locale.code);
    console.log(`\n`);
  }
}
