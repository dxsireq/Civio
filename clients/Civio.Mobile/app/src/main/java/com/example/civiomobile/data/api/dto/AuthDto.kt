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

data class RegisterResponse(
    val email: String
)

data class VerifyEmailRequest(
    val email: String,
    val code: String
)

data class ResendCodeRequest(
    val email: String
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
