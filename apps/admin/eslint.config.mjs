// apps/admin/eslint.config.mjs
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // Next 16 ships React Compiler lint rules that error on existing HUD/dashboard
      // patterns (setState in effects, Date.now in render, ref access). Keep them as
      // warnings so the CLI matches the previous next lint bar without a rewrite.
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/purity": "warn",
      "react-hooks/refs": "warn",
      "react-hooks/immutability": "warn",
    },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "dist-electron-admin/**",
    "electron/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
