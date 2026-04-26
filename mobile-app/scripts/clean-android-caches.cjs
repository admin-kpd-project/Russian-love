/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const dirs = [
  path.join(root, "android", "build"),
  path.join(root, "android", ".cxx"),
  path.join(root, "android", "app", "build"),
  path.join(root, "android", "app", ".cxx"),
  path.join(root, "node_modules", "react-native-reanimated", "android", "build"),
  path.join(root, "node_modules", "react-native-reanimated", "android", ".cxx"),
  path.join(root, "node_modules", "react-native-screens", "android", "build"),
  path.join(root, "node_modules", "react-native-screens", "android", ".cxx"),
  path.join(root, "node_modules", "react-native-worklets", "android", "build"),
  path.join(root, "node_modules", "react-native-worklets", "android", ".cxx"),
];

console.warn(
  "Если запущен Metro (npm start) — сначала остановите его; иначе watcher может упасть с ENOENT, когда Gradle удалит .cxx"
);

for (const d of dirs) {
  try {
    if (fs.existsSync(d)) {
      fs.rmSync(d, { recursive: true, force: true });
      console.log("Removed:", d);
    }
  } catch (e) {
    console.warn("Skip:", d, (e && e.message) || e);
  }
}
console.log("Done. Re-run: cd android && gradlew.bat clean assembleDebug (or your task).");
