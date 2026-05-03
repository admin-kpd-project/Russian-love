package com.russianloveapp

import android.app.Application
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.load
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost
import com.facebook.react.defaults.DefaultReactNativeHost
import com.facebook.react.soloader.OpenSourceMergedSoMapping
import com.facebook.soloader.SoLoader

class MainApplication : Application(), ReactApplication {

  override val reactNativeHost: ReactNativeHost =
      object : DefaultReactNativeHost(this) {
        override fun getPackages(): List<ReactPackage> =
            PackageList(this).packages.apply {
              add(ApiConfigPackage())
            }

        override fun getJSMainModuleName(): String = "index"

        /**
         * При `react { debuggableVariants = [] }` JS кладётся в assets — Metro не используется.
         * Иначе DevSupport бесконечно шлёт ws на 10.0.2.2:8081 и забивает Logcat.
         * Если уберёте бандл из debug и снова будете грузить с Metro — верните `BuildConfig.DEBUG`.
         */
        override fun getUseDeveloperSupport(): Boolean {
          if (!BuildConfig.DEBUG) return false
          return try {
            assets.open("index.android.bundle").close()
            false
          } catch (_: Exception) {
            true
          }
        }

        override val isNewArchEnabled: Boolean = BuildConfig.IS_NEW_ARCHITECTURE_ENABLED
        override val isHermesEnabled: Boolean = BuildConfig.IS_HERMES_ENABLED
      }

  override val reactHost: ReactHost
    get() = getDefaultReactHost(applicationContext, reactNativeHost)

  override fun onCreate() {
    super.onCreate()
    SoLoader.init(this, OpenSourceMergedSoMapping)
    if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) {
      // If you opted-in for the New Architecture, we load the native entry point for this app.
      load()
    }
  }
}
