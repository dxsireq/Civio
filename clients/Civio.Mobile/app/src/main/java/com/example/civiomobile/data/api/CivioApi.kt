package com.example.civiomobile.data.api

import com.example.civiomobile.data.api.dto.AuthResponse
import com.example.civiomobile.data.api.dto.CurrentUserResponse
import com.example.civiomobile.data.api.dto.LoginRequest
import com.example.civiomobile.data.api.dto.RegisterRequest
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST

interface CivioApi {

    @POST("api/auth/login")
    suspend fun login(@Body body: LoginRequest): AuthResponse

    @POST("api/auth/register")
    suspend fun register(@Body body: RegisterRequest): AuthResponse

    @GET("api/auth/me")
    suspend fun getMe(): CurrentUserResponse
}
