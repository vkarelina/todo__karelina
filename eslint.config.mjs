import globals from "globals";
import pluginJs from "@eslint/js";

export default [
  { files: ["**/*.js"], languageOptions: { sourceType: "script" } },
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  {
    rules: {
      "semi": ["error", "always"],
      "indent": ["error", 2],
      "no-trailing-spaces": "error",
      "no-multi-spaces": "error",
      "no-mixed-spaces-and-tabs": "error",
      "max-len": ["error", { "code": 80 }],
      "no-unused-vars": ["warn"],
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "no-param-reassign": 0,
      "no-plusplus": ["error", { "allowForLoopAfterthoughts": true }],
      "consistent-return": 0,
      "eol-last": ["error", "always"]
    },
  },
];