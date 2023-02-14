module.exports = {
  // add your custom config here
  // https://stylelint.io/user-guide/configuration
  extends: ['stylelint-config-standard-scss', 'stylelint-prettier/recommended'],
  ignoreFiles: ['**/*.svg', 'dist/**/*', '.dist/**/*', 'wp-html/**/*'],
  defaultSeverity: 'warning',
  rules: {
    'declaration-empty-line-before': null,
    'no-descending-specificity': null,
    'selector-type-no-unknown': null,
    'selector-type-case': null,
  },
}
