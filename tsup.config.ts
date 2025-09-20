
import { defineConfig } from "tsup";

export default defineConfig({
    entry: ["bin/cli.ts"],
    format: ['esm'],
    banner: { js: '#!/usr/bin/env node' },
    outDir: "dist/bin",
    clean: true,
    sourcemap: false,
    minify: true,
    dts: false,
    external: ["fs", "path", "dotenv", "commander"]
})