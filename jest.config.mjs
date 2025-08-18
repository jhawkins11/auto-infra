/** @type {import('ts-jest').JestConfigWithTsJest} */
const config = {
  // use babel-jest to transform TypeScript
  testEnvironment: 'node',
  transform: {
    '^.+\.(ts|tsx)$': 'babel-jest',
  },
  moduleNameMapper: {
    '^(?:.*?/)?commands/(.*)\.js$': '<rootDir>/commands/$1.ts',
    '^(?:.*?/)?services/(.*)\.js$': '<rootDir>/services/$1.ts',
    '^(?:.*?/)?prompts/(.*)\.js$': '<rootDir>/prompts/$1.ts',
    '^(?:.*?/)?types/(.*)\.js$': '<rootDir>/types/$1.ts',
    '^<rootDir>/(.*)\.js$': '<rootDir>/$1.ts',
    '^\.\/fileWriter\.js$': '<rootDir>/services/fileWriter.ts',
  },
};

export default config;
