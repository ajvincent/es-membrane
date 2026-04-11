import eslint from '@eslint/js';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';

export default defineConfig(
  eslint.configs.recommended,
  tseslint.configs.recommendedTypeChecked,
  //tseslint.configs.stylisticTypeChecked,
  [
    {
      languageOptions: {
        parserOptions: {
          projectService: {
            allowDefaultProject: ["*.ts"],
            defaultProject: "./tsconfig.json",
          }
        }
      },
      files: [
        "**/*.ts"
      ]
    }
  ]
);
