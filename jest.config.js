module.exports = {
  preset: 'jest-expo',
  transformIgnorePatterns: [
    'node_modules/(?!' +
      '(@react-native|react-native|react-native-[^/]+|@react-navigation/[^/]+|expo|expo-[^/]+|@expo/[^/]+|@unimodules/[^/]+|unimodules|sentry-expo|native-base|react-native-svg' +
      '|victory-native|@shopify/react-native-skia|react-native-reanimated|react-native-gesture-handler' +
      ')/)',
  ],
};
