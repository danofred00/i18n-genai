import { getConfig } from "@/config";
import { getUnstranslatedKeys } from "@/libs/utils";

export default async function status() {
  console.log("\n", "[+] Translations Status by locales :");

  const config = await getConfig();

  for (const locale of config.locales) {
    try {
      const { percentage, totalKeys, translatedLength } = getUnstranslatedKeys(
        locale,
        config
      );

      console.log(
        `${locale.label} (${locale.code}): ${translatedLength}/${totalKeys} (${percentage}%)`
      );
    } catch (error) {
      console.error(`[!] Something wrong on ${locale.code}.json`);
    }
  }
}
