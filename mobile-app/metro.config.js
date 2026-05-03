const path = require('path');
const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('metro-config').MetroConfig}
 */
const base = getDefaultConfig(__dirname);
const prev = base.resolver?.blockList;
// Gradle во время assemble* параллельно меняет android/.cxx и android/build в node_modules — Metro не должен watch (ENOENT).
const cxx =
  path.sep === '\\'
    ? '.*\\\\android\\\\\\.cxx\\\\.*'
    : '.*\\/android\\/\\.cxx\\/.*';
const androidBuild =
  path.sep === '\\'
    ? '.*\\\\android\\\\build\\\\.*'
    : '.*\\/android\\/build\\/.*';
const extra = `${cxx}|${androidBuild}`;
const blockList =
  prev instanceof RegExp && /\)\$$/.test(prev.source)
    ? new RegExp(prev.source.replace(/\)\$$/, `|${extra})$`))
    : new RegExp(`(?:${extra})$`);

const config = {
  resolver: {
    blockList,
  },
};

module.exports = mergeConfig(base, config);
