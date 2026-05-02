module.exports = {
  preset: 'react-native',
  setupFiles: ['<rootDir>/jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|@react-navigation|react-native-audio-recorder-player|react-native-gesture-handler|react-native-image-picker|react-native-linear-gradient|react-native-qrcode-svg|react-native-reanimated|react-native-safe-area-context|react-native-screens|react-native-svg|react-native-video|lucide-react-native)/)',
  ],
};
