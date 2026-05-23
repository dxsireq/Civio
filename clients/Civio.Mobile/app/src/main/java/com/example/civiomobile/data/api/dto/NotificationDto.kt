package com.example.civiomobile.data.api.dto

data class NotificationResponse(
    val id: String,
    val bookingId: String? = null,
    val typeCode: String,
    val typeName: String,
    val channelCode: String,
    val statusCode: String,
    val title: String,
    val message: String,
    val createdAt: String,
    val sentAt: String? = null
)
