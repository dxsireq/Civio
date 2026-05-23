package com.example.civiomobile.data.api

import com.example.civiomobile.data.api.dto.AuthResponse
import com.example.civiomobile.data.api.dto.AvailableSlotResponse
import com.example.civiomobile.data.api.dto.BookingResponse
import com.example.civiomobile.data.api.dto.BookingSummaryResponse
import com.example.civiomobile.data.api.dto.CreateBookingRequest
import com.example.civiomobile.data.api.dto.CurrentUserResponse
import com.example.civiomobile.data.api.dto.LoginRequest
import com.example.civiomobile.data.api.dto.OrganizationResponse
import com.example.civiomobile.data.api.dto.RegisterRequest
import com.example.civiomobile.data.api.dto.ServiceResponse
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Path
import retrofit2.http.Query

interface CivioApi {

    @POST("api/auth/login")
    suspend fun login(@Body body: LoginRequest): AuthResponse

    @POST("api/auth/register")
    suspend fun register(@Body body: RegisterRequest): AuthResponse

    @GET("api/auth/me")
    suspend fun getMe(): CurrentUserResponse

    @GET("api/organizations")
    suspend fun getCatalog(@Query("city") city: String? = null): List<OrganizationResponse>

    @GET("api/organizations/{id}")
    suspend fun getOrganization(@Path("id") id: String): OrganizationResponse

    @GET("api/organizations/{id}/services")
    suspend fun getOrganizationServices(@Path("id") id: String): List<ServiceResponse>

    @GET("api/organizations/{id}/available-slots")
    suspend fun getAvailableSlots(
        @Path("id") orgId: String,
        @Query("serviceId") serviceId: String,
        @Query("date") date: String
    ): List<AvailableSlotResponse>

    @POST("api/bookings")
    suspend fun createBooking(@Body body: CreateBookingRequest): BookingResponse

    @GET("api/bookings/my")
    suspend fun getMyBookings(): List<BookingSummaryResponse>

    @GET("api/bookings/{id}")
    suspend fun getBooking(@Path("id") id: String): BookingResponse

    @POST("api/bookings/{id}/cancel")
    suspend fun cancelBooking(@Path("id") id: String): BookingResponse
}
