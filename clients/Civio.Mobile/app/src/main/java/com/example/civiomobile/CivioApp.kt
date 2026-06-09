package com.example.civiomobile

import android.app.Application
import com.example.civiomobile.data.remote.RemoteApiConfig
import dagger.hilt.EntryPoint
import dagger.hilt.InstallIn
import dagger.hilt.android.EntryPointAccessors
import dagger.hilt.android.HiltAndroidApp
import dagger.hilt.components.SingletonComponent
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch

@HiltAndroidApp
class CivioApp : Application() {

    private val appScope = CoroutineScope(SupervisorJob())

    override fun onCreate() {
        super.onCreate()
        // Refresh the API base URL from the remote config file on launch.
        val entryPoint = EntryPointAccessors.fromApplication(
            this,
            BootstrapEntryPoint::class.java
        )
        appScope.launch { entryPoint.remoteApiConfig().refresh() }
    }

    @EntryPoint
    @InstallIn(SingletonComponent::class)
    interface BootstrapEntryPoint {
        fun remoteApiConfig(): RemoteApiConfig
    }
}
