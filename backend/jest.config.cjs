module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  coverageDirectory: '<rootDir>/coverage',
  collectCoverageFrom: ['src/domain/companyCollaborator/**/*.{ts,js}', 'src/api/routes/companyCollaboratorRoutes.ts']
};
