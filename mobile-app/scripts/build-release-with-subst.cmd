@echo off
setlocal
REM Сборка release с коротким путём (T:), иначе CMake Reanimated падает: mkdir ... C_/Users/... / лимит 250 знаков
REM После скрипта subst снимается. Если Android Studio открыт с C:\, не оставляйте T: смонтированным — Kotlin увидит разные «корни» (T: vs C:).
cd /d "%~dp0.."
if not exist "android\gradlew.bat" (
  echo Запускайте из mobile-app, рядом должна быть папка android
  exit /b 1
)
set "MOBILE_ROOT=%CD%"

subst T: /d 2>nul
subst T: "%MOBILE_ROOT%"
if errorlevel 1 (
  echo Не удалось subst T: на "%MOBILE_ROOT%"
  exit /b 1
)

T:
cd T:\android
call gradlew.bat assembleRelease
set "GRADLE_ERR=%errorLEVEL%"

REM Вернуться в обычный каталог, чтобы снять subst
cd /d "%MOBILE_ROOT%"
subst T: /d

REM Убрать кэш с путями T:\ — иначе Studio/Gradle на C:\ не найдёт :react-native-* (No variants / Basedir T:\…)
if exist "%MOBILE_ROOT%\android\.gradle" rmdir /s /q "%MOBILE_ROOT%\android\.gradle"

if %GRADLE_ERR% neq 0 exit /b %GRADLE_ERR%
echo.
echo APK: android\app\build\outputs\apk\release\app-release.apk
echo (путь в профиле по-прежнему длинный, но файл тот же)
exit /b 0
