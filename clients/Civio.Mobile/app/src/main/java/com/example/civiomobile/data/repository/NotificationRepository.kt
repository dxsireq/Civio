package com.example.civiomobile.data.repository

import com.example.civiomobile.data.api.CivioApi
import com.example.civiomobile.data.api.dto.NotificationResponse
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class NotificationRepository @Inject constructor(
    private val api: CivioApi
) {
    suspend fun my(): List<NotificationResponse> = api.getMyNotifications()
}
