package com.russianloveapp

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule

/**
 * Exposes [BuildConfig.API_BASE_DEFAULT] to JS (from android/local.properties API_BASE_URL).
 */
class ApiConfigModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {
    override fun getName(): String = "RNNativeApiConfig"

    override fun getConstants(): Map<String, Any> {
        return mapOf("defaultApiBase" to BuildConfig.API_BASE_DEFAULT)
    }
}
