package com.example.civiomobile.data.repository

import com.example.civiomobile.data.api.CivioApi
import com.example.civiomobile.data.api.dto.AvailableSlotResponse
import com.example.civiomobile.data.api.dto.BookingQrResponse
import com.example.civiomobile.data.api.dto.BookingResponse
import com.example.civiomobile.data.api.dto.BookingSummaryResponse
import com.example.civiomobile.data.api.dto.CreateBookingRequest
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class BookingRepository @Inject constructor(
    private val api: CivioApi
) {
    suspend fun availableSlots(
        orgId: String,
        serviceId: String,
        date: String
    ): List<AvailableSlotResponse> = api.getAvailableSlots(orgId, serviceId, date)

    suspend fun create(request: CreateBookingRequest): BookingResponse =
        api.createBooking(request)

    suspend fun my(): List<BookingSummaryResponse> = api.getMyBookings()

    suspend fun byId(id: String): BookingResponse = api.getBooking(id)

    suspend fun cancel(id: String): BookingResponse = api.cancelBooking(id)

    suspend fun qr(id: String): BookingQrResponse = api.getBookingQr(id)
}
