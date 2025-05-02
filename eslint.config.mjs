// eslint.config.mjs
import withNuxt from './.nuxt/eslint.config.mjs'
import prettierPlugin from 'eslint-plugin-prettier'

export default withNuxt({
  plugins: {
    prettier: prettierPlugin,
  },
  rules: {
    'prettier/prettier': ['error', {}, { usePrettierrc: true }],
  },
})
