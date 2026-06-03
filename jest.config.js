// Zona horaria determinista para los tests. El negocio opera en UTC-3
// (Uruguay/Argentina) y hay lógica de fechas (cultivos vigentes) sensible a la
// TZ. Sin esto, el runner del CI (UTC) clasifica distinto que la Mac de dev
// (-03) y los tests con fechas se vuelven flaky.
process.env.TZ = "America/Montevideo";

module.exports = {
  preset: "jest-expo",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  testMatch: ["<rootDir>/src/**/*.test.ts", "<rootDir>/src/**/*.test.tsx"],
  transformIgnorePatterns: [
    "node_modules/(?!((jest-)?react-native|@react-native|react-native|expo(nent)?|@expo(nent)?/.*|expo-.*|@expo/.*|@react-navigation/.*)/)",
  ],
};
