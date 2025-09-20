import { GoogleGenAI } from "@google/genai";
import { Config, Locale } from "@/config.js";
import { MAX_KEYS_PER_REQUEST } from "@/constants.js";
import { arrayToObject, chunkObject } from "./utils.js";

/**
 * Create a prompt for the AI model based on the provided content and language.
 */
export function createPrompt(
  content: Record<string, string>,
  lang: string = "English"
): string {
  return `
    Please complete my translation file by adding the ${lang} version of the keys in this JSON as values.
    Return only the JSON response with no comments, no additional messages, nothing else but the requested JSON.

    Here is my JSON:
    
    ${JSON.stringify(content)}
    `;
}

/**
 * Make a request to the AI model with the given prompt and configuration.
 */
export async function makeRequest(prompt: string, config: Config) {
  const { geminiApiKey, geminiApiModel } = config;
  const ai = new GoogleGenAI({ apiKey: geminiApiKey });
  const response = await ai.models.generateContent({
    model: geminiApiModel,
    contents: prompt,
  });

  return response;
}

/**
 * Process a batch of translation keys by sending them to the AI model and collecting the translations.
 */
export async function processTranslationsBatch(
  keys: string[],
  locale: Locale,
  config: Config
) {
  const maxKeysPerRequest = config.maxKeysPerRequest ?? MAX_KEYS_PER_REQUEST;
  const chunks = chunkObject(arrayToObject(keys), maxKeysPerRequest);
  const allTranslations: Record<string, string> = {};

  console.log(
    `[+] Processing ${keys.length} keys in ${chunks.length} chunks of up to ${maxKeysPerRequest} keys each.`
  );

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const chunkSize = Object.keys(chunk).length;
    console.log(
      `[+] Processing chunk ${i + 1}/${chunks.length} with ${chunkSize} keys...`
    );

    try {
      const prompt = createPrompt(chunk, locale.label);
      console.log(
        `[+] Sending request to AI model (${config.geminiApiModel})...`
      );

      const response = await makeRequest(prompt, config);
      const responseText = response.text || "";

      const begin = responseText.indexOf("{");
      const end = responseText.lastIndexOf("}");
      // check if the response contains a JSON object
      if (begin === -1 || end === -1) {
        console.error("[-] No JSON object found in the response.");
        continue;
      }

      //
      const translated = JSON.parse(responseText.slice(begin, end + 1));
      Object.assign(allTranslations, translated);
      console.log(
        `[+] Chunk ${i + 1} processed successfully, obtained ${
          Object.keys(translated).length
        } translations.`
      );

      // pause the request for 5 seconds to avoid rate limiting
      if (i < chunks.length - 1) {
        console.log("[+] Pausing for 5 seconds to avoid rate limiting...");
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
    } catch (error) {
      console.error(`[-] Error processing chunk ${i + 1}:`, error);
      continue;
    }
  }

  return allTranslations;
}

