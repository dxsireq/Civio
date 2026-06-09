package com.example.civiomobile.data.remote

import com.example.civiomobile.BuildConfig
import com.example.civiomobile.data.local.ApiUrlStorage
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.OkHttpClient
import okhttp3.Request
import java.util.concurrent.TimeUnit
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Fetches the active API base URL from a remote text file (e.g. GitHub raw).
 * The file holds a single line — the tunnel URL. Updating the file repoints
 * all installed APKs on next launch; no rebuild needed.
 */
@Singleton
class RemoteApiConfig @Inject constructor(
    private val apiUrlStorage: ApiUrlStorage
) {

    private val client = OkHttpClient.Builder()
        .callTimeout(8, TimeUnit.SECONDS)
        .build()

    /** Best-effort refresh. On any failure keeps the last-known URL. */
    suspend fun refresh() = withContext(Dispatchers.IO) {
        runCatching {
            val request = Request.Builder().url(BuildConfig.API_CONFIG_URL).build()
            client.newCall(request).execute().use { response ->
                if (!response.isSuccessful) return@use
                val url = response.body?.string()
                    ?.lineSequence()
                    ?.map { it.trim() }
                    ?.firstOrNull { it.startsWith("http://") || it.startsWith("https://") }
                if (!url.isNullOrBlank()) {
                    apiUrlStorage.saveBaseUrl(url)
                }
            }
        }
        Unit
    }
}
