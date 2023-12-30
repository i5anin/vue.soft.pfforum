module.exports = {
  transform: {
    '^.+\\.vue$': '@vue/vue3-jest',
    '^.+\\.js$': 'babel-jest',
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: ['**/tests/**/*.spec.js', '**/__tests__/**/*.spec.js'],
  transformIgnorePatterns: ['<rootDir>/node_modules/'],
}
