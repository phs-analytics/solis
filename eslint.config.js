import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['node_modules/', 'dist/', 'coverage/'] },
  js.configs.recommended,
  tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
    rules: {
      // SEC-07: texto de terceiros (extratos, transações) nunca vira HTML.
      'no-restricted-syntax': [
        'error',
        {
          selector: "JSXAttribute[name.name='dangerouslySetInnerHTML']",
          message: 'Proibido (SEC-07): renderize texto, nunca HTML.',
        },
      ],
    },
  },
  { files: ['**/*.js'], extends: [tseslint.configs.disableTypeChecked] },
);
