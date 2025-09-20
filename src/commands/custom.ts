import fs from "node:fs";
import { Config, getConfig } from "@/config.js";


function getTemplate(config: Config) { 
    return `
export default { 
    defaultLocale: "${config.defaultLocale}",
    localeFolder: "${config.localeFolder}",
    sourceFolder: "${config.sourceFolder}",
    matches: ${JSON.stringify(config.matches)},
    locales: ${JSON.stringify(config.locales)},
}
    `;
}

type CustomOptions = {
    file: string;
}

export default async function custom(options?: Partial<CustomOptions>) {
    const config = await getConfig();

    // generate the template
    const template = getTemplate(config);
    
    // write the template to a file
    const filePath = options?.file || "i18n-genai.config.js";
    
    if (fs.existsSync(filePath)) {
        console.error(`[!] Error: File ${filePath} already exists. Aborting to prevent overwrite.`);
        process.exit(1);
    }

    fs.writeFileSync(filePath, template, { encoding: "utf-8" });
    console.log(`[+] Configuration template written to ${filePath}`);
}