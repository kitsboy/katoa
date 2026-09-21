import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist', 'src/types/database.generated.ts', 'public/**', 'supabase/functions/**'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        // Context/hook files export useX() hooks alongside their Provider component; that is
        // a deliberate pattern here (the plugin matches these as literal names, not regex).
        { allowConstantExport: true, allowExportNames: ['useAuth', 'useToast', 'useCurrency', 'useLanguage', 'translations', 'languageFlags', 'languageNames', 'CURRENCY_OPTIONS'] },
      ],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  }
);