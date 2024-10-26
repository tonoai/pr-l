export default {
  verbose: true,
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['./src/**/**.*.ts'],
  coveragePathIgnorePatterns: [
    '.module.ts',
    '<rootDir>/modules/config/*',
    '<rootDir>/modules/main.ts',
    '<rootDir>/modules/.*/types/*',
    '<rootDir>/modules/.*/const/*',
    '<rootDir>/modules/.*/entities/*',
    '<rootDir>/modules/.*/dtos/*',
  ],
  passWithNoTests: true,
  testEnvironment: 'node',
  roots: ['<rootDir>/modules/'],
  setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
};
