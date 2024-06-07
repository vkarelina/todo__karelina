import globals from "globals";
import pluginJs from "@eslint/js";


export default [
  {files: ["**/*.js"], languageOptions: {sourceType: "script"}},
  {languageOptions: { globals: globals.browser }},
  pluginJs.configs.recommended,
  {
    rules: {
      "no-param-reassign": 0,
      "max-len": ["error", { "code": 200 }],
      "no-plusplus": ["error", { "allowForLoopAfterthoughts": true }],
      "consistent-return": 0,
      "indent": ["error", 2],
      "eol-last": ["error", "always"]
      //'no-console': 'error'
    },
  },
];