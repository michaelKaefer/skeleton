module.exports = {
  extends: ['airbnb'],
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  },
  env: {
    browser: true,
    es6: true,
    node: true
  },
  settings: {
    // react: {
    //    version: "999.999.999",
    // },
  },
  rules: {
    // "no-console": 0,
    // "no-unused-vars": 0,
    // "import/no-extraneous-dependencies": ["error", {"devDependencies": true}],
  }
};
