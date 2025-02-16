import { config } from '@cropemall/eslint-config/react-internal'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

export default tseslint.config(...config, {
  plugins: {
    'react-refresh': reactRefresh,
  },
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
  },
})
