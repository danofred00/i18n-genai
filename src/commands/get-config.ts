import { getConfig } from "@/config";

export default async function getConfigCommand() {
  const config = await getConfig();
  console.log(JSON.stringify({ config }, null, 2));
}
