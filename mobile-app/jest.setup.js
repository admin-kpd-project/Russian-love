jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  const { View } = require('react-native');
  const initialMetrics = {
    frame: { x: 0, y: 0, width: 390, height: 844 },
    insets: { top: 0, right: 0, bottom: 0, left: 0 },
  };

  return {
    initialMetrics,
    SafeAreaInsetsContext: React.createContext(initialMetrics.insets),
    SafeAreaFrameContext: React.createContext(initialMetrics.frame),
    SafeAreaProvider: ({ children }) => React.createElement(React.Fragment, null, children),
    SafeAreaView: View,
    useSafeAreaInsets: () => initialMetrics.insets,
    useSafeAreaFrame: () => initialMetrics.frame,
  };
});

require('react-native-gesture-handler/jestSetup');
require('react-native-reanimated').setUpTests();
