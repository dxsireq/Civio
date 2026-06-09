package com.example.civiomobile.data.local

import android.content.Context
import android.content.SharedPreferences
import com.example.civiomobile.BuildConfig
import dagger.hilt.android.qualifiers.ApplicationContext
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Holds the current API base URL. Seeded from BuildConfig, overridden at
 * runtime by RemoteApiConfig (fetched from a remote text file). Kept in a
 * volatile cache so the network interceptor reads it without disk hits.
 */
@Singleton
class ApiUrlStorage @Inject constructor(
    @ApplicationContext context: Context
) {

    private val prefs: SharedPreferences =
        context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)

    @Volatile
    private var cached: String =
        prefs.getString(KEY_BASE_URL, null) ?: BuildConfig.API_BASE_URL

    fun getBaseUrl(): String = cached

    fun saveBaseUrl(url: String) {
        val normalized = if (url.endsWith("/")) url else "$url/"
        cached = normalized
        prefs.edit().putString(KEY_BASE_URL, normalized).apply()
    }

    companion object {
        private const val PREFS_NAME = "civio_config"
        private const val KEY_BASE_URL = "api_base_url"
    }
}
