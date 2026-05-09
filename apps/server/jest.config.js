module.exports = {
  verbose: true,
  testTimeout: 50000,
  preset: "ts-jest",
  setupFiles: [
    "<rootDir>/test/jest.setup.ts"
  ],
  moduleFileExtensions: [
    "js",
    "json",
    "ts"
  ],
  rootDir: "src",
  testRegex: ".*\\.spec\\.ts$",
  transform: {
    "^.+\\.(t|j)s$": [
      "ts-jest",
      {
        useESM: false,
      }
    ]
  },
  transformIgnorePatterns: [
    "node_modules/(?!.*(uuid|@apollo/server))"
  ],
  collectCoverageFrom: [
    "**/*.(t|j)s"
  ],
  moduleNameMapper: {
    "^src/(.*)$": "<rootDir>/$1",
    "^uuid$": require.resolve('uuid'),
    "^firebase-admin$": require.resolve('firebase-admin'),
  },
  coverageDirectory: "../coverage",
  testEnvironment: "node",
  maxWorkers: 5,
}