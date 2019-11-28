module.exports = {
    globals: {
        'ts-jest': {
            tsConfig: 'tsconfig.json',
            // to speed up prototyping, this is how to disable ts in tests
            diagnostics: false,
        },
    },
    preset: 'ts-jest',
    testEnvironment: 'node',
    moduleFileExtensions: ['js', 'ts'],
    coverageDirectory: './coverage',
    collectCoverage: true,
    collectCoverageFrom: [
        './src/RNPlugin.ts',
    ],
};