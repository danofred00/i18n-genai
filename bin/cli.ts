import {
  extract,
  getConfigCommand,
  status,
  translate,
  translateAll,
  DESCRIPTION, NAME, VERSION 
} from "../src";
import { program } from "commander";
import dotenv from "dotenv";

dotenv.config();

program
  .name(NAME)
  .version(VERSION)
  .description(DESCRIPTION)
  .action(() => {});

program
  .command("extract")
  .description(
    "Extract translation keys from source files to translations.json"
  )
  .action(extract);

program
  .command("status")
  .description("Show translation status for all locales ")
  .action(status);

program
  .command("translate")
  .argument("<locale>", "The specified locale")
  .description("Generate translations for the specified locale")
  .action(translate);

program
  .command("translate-all")
  .description("Generate translations for all configured locales")
  .action(translateAll);

program
  .command("config")
  .description("Displays all the configuration of the tool")
  .action(getConfigCommand);

program.parse(process.argv);
