# RussianLoveApp (React Native CLI)

Клиент к тому же бэкенду, что и веб. **Канонический staging API:** `https://dev.forruss.ru` (см. `src/config.ts` → `CANONICAL_STAGING_API_BASE` / `API_URL_FALLBACK_JS`). Другой URL можно ввести в приложении или задать в `android/local.properties` для локальной разработки.

## Как задать адрес API

1. **В приложении (основной способ)**  
   На первом запуске откроется экран **«Адрес API»**. Можно сменить URL позже: **Главная** → кнопка **«Сервер»** в шапке (справа). После сохранения **сессия сбрасывается** — снова войдите.

2. **Без ввода в UI (только Android, при сборке)**  
   В каталоге `android` создайте или отредактируйте **`local.properties`** (файл обычно в `.gitignore`):

   ```properties
   # Staging (как в src/config.ts):
   API_BASE_URL=https://dev.forruss.ru
   # Локально — uvicorn на ПК (часто 8000) или nginx 8080:
   # API_BASE_URL=http://10.0.2.2:8000
   ```

   Скопируйте шаблон из [`android/local.properties.example`](android/local.properties.example).  
   Значение попадает в `BuildConfig` и в JS как `NativeModules.RNNativeApiConfig.defaultApiBase` (см. `getApiBaseUrl` в `src/api/apiBase.ts`).

3. **JS-fallback**  
   В [`src/config.ts`](src/config.ts): **`API_URL_FALLBACK_JS`** = **`https://dev.forruss.ru`**. Локально: `http://10.0.2.2:8000` или `:8080` (через «Сервер» или `API_BASE_URL`). **`WEB_PUBLIC_BASE_URL`** по умолчанию пустой — для QR берётся origin от базы API (тот же staging).

## Подсказки по сети

| Сценарий | Пример base URL |
|----------|-----------------|
| Staging (дефолт в приложении и в `config.ts`) | `https://dev.forruss.ru` |
| Эмулятор, API на `localhost` на ПК (uvicorn) | `http://10.0.2.2:8000` |
| Эмулятор, nginx на ПК `:8080` | `http://10.0.2.2:8080` |
| Телефон в Wi‑Fi, API на ПК | `http://<LAN-IP_ПК>:8080` |
| USB, `adb reverse tcp:8080 tcp:8080` | `http://127.0.0.1:8080` |
| Свой прод-сервер | `https://api.ваш-домен` (валидный TLS) |

- Если после смены дефолта в `config.ts` всё ещё не тот сервер — в приложении уже мог быть сохранён старый URL (**«Сервер»** → вставьте нужный base, или **очистка данных** приложения / переустановка сбросит AsyncStorage).

- **Cleartext HTTP**: в `res/xml/network_security_config.xml` разрешён для любого хоста (удобно для `http://192.168…`). Для публичного API предпочитайте **HTTPS**. **Debug** дополнительно доверяет пользовательским CA в `src/debug/res/xml/network_security_config.xml`.

- Ссылки **presigned S3/MinIO** в чате зависят от настроек **бэкенда** (`DATING_S3_*`, публичная доступность URL). Если с телефона не грузятся фото/аудио, проверьте env API и Nginx, не только base URL.

## Требования

- **Node** 18+ (для Android-сборки рекомендуется **Node 20 LTS**; на **Node 22** иногда падает RN codegen)
- **JDK  17** (для Gradle; в Android Studio: *Settings → Build → Build Tools → Gradle* — JVM 17; Gradle **11+** обязателен, **не Java 8**)
- В `android/gradle.properties` у проекта **New Architecture выключена** (`newArchEnabled=false`) — так стабильнее со стеком навигации и нативными модулями
- **Android Studio** (SDK, Platform Tools), эмулятор и/или устройство с **отладкой по USB**

### Windows: `react-native-reanimated` / CMake — `ninja: mkdir(… C_/Users/ …) No such file or directory`

Это ограничение **длины пути** и/или **Ninja/CMake** на Windows при нативной сборке. Официальный чеклист: [Building for Android on Windows (Reanimated)](https://docs.swmansion.com/react-native-reanimated/docs/guides/building-on-windows/).

1. **Включите длинные пути** в системе: [документация Microsoft](https://learn.microsoft.com/en-us/windows/win32/fileio/maximum-file-path-limitation) (параметр `LongPathsEnabled` в реестре или “Групповая политика”).
2. **Сократите путь к репозиторию** (например, `C:\work\rl\mobile-app`) или используйте `subst` на отдельную букву диска — см. тот же гайд Reanimated.
3. Убедитесь, что в пути **нет пробелов** в папке проекта.
4. **Ninja** не ниже `1.12.0` (см. SDK Manager → SDK Tools) — старые версии плохо обрабатывают длинные пути.
5. Сбросьте кэш нативной сборки и пересоберите:
   ```bash
   cd mobile-app
   npm run android:clean-native
   cd android
   gradlew.bat clean
   gradlew.bat assembleDebug
   ```
6. Снимите переменную окружения **`_JAVA_OPTIONS`**, если она задана (её съедает ворнинги и мешает диагностике).

**Ошибка: «Dependency requires at least JVM version 11. This build uses a Java 8 JVM»** — `android/gradlew.bat` **по умолчанию подставляет JBR Android Studio** (и перекрывает `JAVA_HOME` с Java 8), если не задано `set ANDROID_USE_SYSTEM_JAVA=1`. Сборка: из каталога `android` вызывайте `.\gradlew.bat`, а не `gradlew.bat` с другой копией из `PATH` без этого скрипта.

**Metro: `Error: ENOENT, watch '…node_modules\…\.cxx\…` или `…android\build\…`** — во время **assembleDebug** Gradle и Metro идут параллельно; каталоги **`.cxx`** и **`android/build`** в `node_modules` создаются и удаляются. В `metro.config.js` эти пути исключены из watch. Дополнительно **остановите** `npm start` на время `gradlew` / `android:clean-native`, затем снова `npm start`.

**Kotlin: `this and base files have different roots: T:\node_modules\…` и `C:\…\android`** — после сборки через `subst T:` снимите диск: `subst T: /d`, откройте проект только с **реального** пути `C:\…`, выполните `cd android` → `.\gradlew.bat --stop`. В `gradle.properties` включено `kotlin.incremental=false`, чтобы Studio/Gradle не ломались на смешении `T:\` и `C:\`.

**Gradle: `No matching variant` / `Basedir T:\node_modules\… does not exist` для всех `:react-native-*`** — в `android/.gradle` закэшированы пути с диска **T:** после `subst`. Снимите `subst T: /d`, затем **`npm run android:clean-native`** (удаляет в т.ч. `android/.gradle`) и снова **Sync Project / assembleDebug**. Скрипт `scripts\build-release-with-subst.cmd` после сборки сам снимает `T:` и чистит `android/.gradle`.

**assembleRelease: `ninja: mkdir(…C_/…reanimated)…` / длина пути 250+** — CMake кладёт объекты Reanimated в очень длинные каталоги. **Самый быстрый вариант на Windows:** в **cmd** из `mobile-app` (буква **T:** не должна быть занята):

`scripts\build-release-with-subst.cmd`

(скрипт монтирует `T:\` = текущий `mobile-app` и вызывает `gradlew assembleRelease` — пути в сборке короче). Дополнительно: [длинные пути](https://learn.microsoft.com/en-us/windows/win32/fileio/maximum-file-path-limitation) в Windows, **Ninja 1.12+** (SDK Manager), либо вручную: `subst R: C:\путь\к\mobile-app` → `R:` → `cd R:\android` → `gradlew assembleRelease` → `subst R: /d`. Клон в `C:\rl\` тоже помогает.

По умолчанию в `android/gradle.properties` собираются **только** `arm64-v8a` и `x86_64` (телефоны и типичные эмуляторы), чтобы сократить пути и время сборки. Сборка под **32-bit** (`armeabi-v7a` / `x86`): вручную задайте `reactNativeArchitectures=…` в `gradle.properties` и используйте короткий путь + длинные имена путей в Windows.

## Установка и запуск из консоли

```bash
cd mobile-app
npm install
npm start
# другое окно
npm run android
```

### В Logcat: «failed to connect to /10.0.2.2 (port 8081)» / WebSocket packager

При вшитом бандле (`react { debuggableVariants = [] }`) в `MainApplication` отключается DevSupport, если в APK есть `index.android.bundle` — эти сообщения не должны повторяться. Если всё же видите — пересоберите приложение.

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
