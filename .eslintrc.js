module.exports = {
  root: true,
  extends: '@react-native',
  rules: {
    // Convert warnings to errors for issues that can be auto-fixed
    'no-trailing-spaces': 'error',
    'eol-last': 'error',
    'semi': 'error',
    'comma-dangle': ['error', 'always-multiline'],
    'curly': 'error',
    'dot-notation': 'error',
    'react-native/no-inline-styles': 'warn', // Keep as warning since fixing might require style refactoring
  },
};
