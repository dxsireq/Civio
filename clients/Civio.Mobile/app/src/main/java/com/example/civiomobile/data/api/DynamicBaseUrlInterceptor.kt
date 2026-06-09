package com.example.civiomobile.data.api

import com.example.civiomobile.data.local.ApiUrlStorage
import okhttp3.HttpUrl.Companion.toHttpUrlOrNull
import okhttp3.Interceptor
import okhttp3.Response
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Rewrites scheme/host/port of every request to the current ApiUrlStorage
 * value. Retrofit is built with a placeholder base URL; the real target is
 * resolved per-request, so a new tunnel URL takes effect without rebuilding.
 */
@Singleton
class DynamicBaseUrlInterceptor @Inject constructor(
    private val apiUrlStorage: ApiUrlStorage
) : Interceptor {

    override fun intercept(chain: Interceptor.Chain): Response {
        val request = chain.request()
        val base = apiUrlStorage.getBaseUrl().toHttpUrlOrNull()
            ?: return chain.proceed(request)

        val newUrl = request.url.newBuilder()
            .scheme(base.scheme)
            .host(base.host)
            .port(base.port)
            .build()

        return chain.proceed(request.newBuilder().url(newUrl).build())
    }
}
