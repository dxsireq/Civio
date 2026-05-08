package com.example.civiomobile.data.repository

import com.example.civiomobile.data.api.CivioApi
import com.example.civiomobile.data.api.dto.AuthResponse
import com.example.civiomobile.data.api.dto.CurrentUserResponse
import com.example.civiomobile.data.api.dto.LoginRequest
import com.example.civiomobile.data.api.dto.RegisterRequest
import com.example.civiomobile.data.local.TokenStorage
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class AuthRepository @Inject constructor(
    private val api: CivioApi,
    private val tokenStorage: TokenStorage
) {

    fun isAuthenticated(): Boolean = tokenStorage.hasToken()

    suspend fun login(email: String, password: String): AuthResponse {
        val response = api.login(LoginRequest(email, password))
        tokenStorage.saveToken(response.accessToken)
        return response
    }

    suspend fun register(
        email: String,
        password: String,
        firstName: String,
        lastName: String,
        middleName: String? = null,
        phone: String? = null
    ): AuthResponse {
        val response = api.register(
            RegisterRequest(email, password, firstName, lastName, middleName, phone)
        )
        tokenStorage.saveToken(response.accessToken)
        return response
    }

    suspend fun me(): CurrentUserResponse = api.getMe()

    fun logout() {
        tokenStorage.clear()
    }
}
