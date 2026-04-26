# RussianLoveApp (React Native CLI)

Клиент к тому же бэкенду, что и веб. **Базовый URL API не зашит:** его можно ввести в приложении, задать через `android/local.properties` или (опционально) оставить пустой fallback в `src/config.ts`.

## Как задать адрес API

1. **В приложении (основной способ)**  
   На первом запуске откроется экран **«Адрес API»**. Можно сменить URL позже: **Главная** → кнопка **«Сервер»** в шапке (справа). После сохранения **сессия сбрасывается** — снова войдите.

2. **Без ввода в UI (только Android, при сборке)**  
   В каталоге `android` создайте или отредактируйте **`local.properties`** (файл обычно в `.gitignore`):

   ```properties
   API_BASE_URL=http://10.0.2.2:8080
   ```

   Скопируйте шаблон из [`android/local.properties.example`](android/local.properties.example).  
   Значение попадает в `BuildConfig` и в JS как `NativeModules.RNNativeApiConfig.defaultApiBase` (см. `getApiBaseUrl` в `src/api/apiBase.ts`).

3. **JS-fallback**  
   В [`src/config.ts`](src/config.ts) константа **`API_URL_FALLBACK_JS`** (по умолчанию пустая). Можно временно прописать, например, `http://10.0.2.2:8080` **только для эмулятора** — на реальном устройстве укажите IP/HTTPS через экран или `local.properties`.

## Подсказки по сети

| Сценарий | Пример base URL |
|----------|-----------------|
| Эмулятор, API на `localhost:8080` на ПК | `http://10.0.2.2:8080` |
| Телефон в Wi‑Fi, API на ПК | `http://<LAN-IP_ПК>:8080` |
| USB, `adb reverse tcp:8080 tcp:8080` | `http://127.0.0.1:8080` |
| Прод | `https://api.ваш-домен` (валидный TLS) |

- **Debug-сборка** (`src/debug/AndroidManifest.xml`): разрешён **cleartext HTTP** — удобно для LAN. **Release** собирается без `src/debug/`, cleartext по умолчанию **выключен** — для проды нужен **HTTPS** (или своя `networkSecurityConfig`).

- Ссылки **presigned S3/MinIO** в чате зависят от настроек **бэкенда** (`DATING_S3_*`, публичная доступность URL). Если с телефона не грузятся фото/аудио, проверьте env API и Nginx, не только base URL.

## Требования

- **Node** 18+ (для Android-сборки рекомендуется **Node 20 LTS**; на **Node 22** иногда падает RN codegen)
- **JDK  17** (для Gradle; в Android Studio: *Settings → Build → Build Tools → Gradle* — JVM 17)
- В `android/gradle.properties` у проекта **New Architecture выключена** (`newArchEnabled=false`) — так стабильнее со стеком навигации и нативными модулями
- **Android Studio** (SDK, Platform Tools), эмулятор и/или устройство с **отладкой по USB**

## Установка и запуск из консоли

```bash
cd mobile-app
npm install
npm start
# другое окно
npm run android
```

### Красный экран «Unable to load script»

В **debug** JavaScript **не лежит внутри APK** — его отдаёт **Metro** на вашем ПК (**порт 8081**).

1. В каталоге **`mobile-app`** запустите и **не закрывайте**: `npm start` (или `npx react-native start`). Дождитесь строки вроде «Metro waiting on…».
2. Перезапустите приложение на эмуляторе (**Reload** / двойное **R**) или снова **Run** из Studio.
3. **Только Android Studio (Run), без Metro** — всегда будет эта ошибка: сначала Metro, потом приложение.
4. **Телефон по USB:** с ПК выполните `adb reverse tcp:8081 tcp:8081`, Metro на хосте, приложение на устройстве.
5. Если с эмулятора всё равно не коннектится, проверьте **брандмауэр Windows** (разрешить входящие для Node на 8081) или запустите Metro так: `npx react-native start --host 0.0.0.0`.

Для **release** без Metro нужен вшитый бандл (отдельная сборка); для ежедневной разработки используйте схему выше.

## Android Studio: пошагово

1. Установите/откройте **Android Studio**, поставьте **Android SDK** (и при запросе **JDK 17**).
2. **File → Open** → папка **`mobile-app/android`** (именно `android`, не весь `mobile-app`).
3. Дождитесь **Sync Project with Gradle Files** (слон в тулбаре или всплывающая панель). При ошибке «No Java compiler» укажите **JDK 17** в настройках Gradle.
4. Подключите **телефон** (режим разработчика, **USB-отладка**) или выберите **эмулятор** в списке устройств.
5. **Обязательно** в отдельном терминале из **`mobile-app`**: `npm start` — иначе после Run будет красный экран «Unable to load script» (см. раздел выше).
6. Зелёная кнопка **Run** («▶») — приложение соберётся и установится.
7. Логи: вкладка **Logcat** (фильтр по имени пакета `com.russianloveapp`).

## Release APK

1. В **Android Studio:** **Build → Generate Signed App Bundle or APK** → **APK** (создайте или выберите keystore; для проды не используйте debug-ключ).  
2. Либо в терминале (после настройки `signingConfig` в `app/build.gradle`):

   ```bash
   cd android
   .\gradlew assembleRelease
   ```

3. Готовый файл: `android/app/build/outputs/apk/release/` (или `.../debug/` для debug).

4. Выложите APK (S3, GitHub Releases) и пропишите в веб-лендинге переменную **`VITE_APP_DOWNLOAD_URL`**.

## Проверка (smoke)

После ввода корректного URL: **вход/регистрация** → **лента** → **чат** (текст, картинка, голос) — обновления в чате по **WebSocket**.

## iOS

Проект можно собрать на macOS: `cd ios && pod install`, затем `npm run ios`. Пропишите `NSMicrophoneUsageDescription` и `NSPhotoLibraryUsageDescription` в `Info.plist` при публикации. Модуль `RNNativeApiConfig` сейчас только под **Android**; в JS fallback для iOS — `API_URL_FALLBACK_JS` и/или ввод на экране (если добавите аналогичный модуль в Xcode — можно расширить).
