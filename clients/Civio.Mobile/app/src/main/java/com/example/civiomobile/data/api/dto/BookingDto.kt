package com.example.civiomobile.data.api.dto

data class AvailableSlotResponse(
    val employeeId: String,
    val employeeFirstName: String,
    val employeeLastName: String,
    val startAt: String,
    val endAt: String
)

data class CreateBookingRequest(
    val organizationId: String,
    val serviceId: String,
    val employeeId: String,
    val startAt: String,
    val comment: String? = null
)

data class BookingResponse(
    val id: String,
    val organizationId: String,
    val organizationName: String? = null,
    val organizationCity: String? = null,
    val organizationAddress: String? = null,
    val serviceId: String,
    val serviceName: String,
    val price: Double? = null,
    val employeeId: String? = null,
    val employeeFirstName: String? = null,
    val employeeLastName: String? = null,
    val citizenId: String,
    val statusCode: String,
    val statusName: String,
    val comment: String? = null,
    val startAt: String,
    val endAt: String,
    val createdAt: String
)

data class BookingQrResponse(
    val bookingId: String,
    val token: String
)

data class BookingSummaryResponse(
    val id: String,
    val organizationId: String,
    val organizationName: String? = null,
    val serviceId: String,
    val serviceName: String,
    val employeeId: String? = null,
    val employeeFirstName: String? = null,
    val employeeLastName: String? = null,
    val citizenId: String,
    val statusCode: String,
    val comment: String? = null,
    val startAt: String,
    val createdAt: String
)
