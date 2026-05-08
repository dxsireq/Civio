package com.example.civiomobile.data.api.dto

data class LoginRequest(
    val email: String,
    val password: String
)

data class RegisterRequest(
    val email: String,
    val password: String,
    val firstName: String,
    val lastName: String,
    val middleName: String? = null,
    val phone: String? = null
)

data class AuthResponse(
    val userId: String,
    val email: String,
    val firstName: String,
    val lastName: String,
    val accessToken: String
)

data class CurrentUserResponse(
    val userId: String,
    val email: String,
    val firstName: String,
    val lastName: String,
    val middleName: String? = null,
    val phone: String? = null
)
