// @ts-check

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    "rules": {
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          "args": "all",
          "argsIgnorePattern": "all",
          "caughtErrors": "all",
          "caughtErrorsIgnorePattern": "all",
          "destructuredArrayIgnorePattern": "all",
          "varsIgnorePattern": "Key$",
          "ignoreRestSiblings": true
        },
      ]
    }
  }
);
