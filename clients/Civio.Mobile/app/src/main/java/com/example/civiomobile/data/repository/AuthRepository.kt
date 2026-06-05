package com.example.civiomobile.data.repository

import com.example.civiomobile.data.api.CivioApi
import com.example.civiomobile.data.api.EmailNotVerifiedException
import com.example.civiomobile.data.api.dto.AuthResponse
import com.example.civiomobile.data.api.dto.CurrentUserResponse
import com.example.civiomobile.data.api.dto.LoginRequest
import com.example.civiomobile.data.api.dto.RegisterRequest
import com.example.civiomobile.data.api.dto.ResendCodeRequest
import com.example.civiomobile.data.api.dto.VerifyEmailRequest
import com.example.civiomobile.data.local.TokenStorage
import retrofit2.HttpException
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class AuthRepository @Inject constructor(
    private val api: CivioApi,
    private val tokenStorage: TokenStorage
) {

    fun isAuthenticated(): Boolean = tokenStorage.hasToken()

    suspend fun login(email: String, password: String): AuthResponse {
        try {
            val response = api.login(LoginRequest(email, password))
            tokenStorage.saveToken(response.accessToken)
            return response
        } catch (e: HttpException) {
            if (e.code() == 403) {
                val body = e.response()?.errorBody()?.string() ?: ""
                if (body.contains("email_not_verified")) {
                    throw EmailNotVerifiedException()
                }
            }
            throw e
        }
    }

    /**
     * Creates the account. Returns email only — no token until email is verified.
     */
    suspend fun register(
        email: String,
        password: String,
        firstName: String,
        lastName: String,
        middleName: String? = null,
        phone: String? = null
    ): String {
        val response = api.register(
            RegisterRequest(email, password, firstName, lastName, middleName, phone)
        )
        return response.email
    }

    suspend fun verifyEmail(email: String, code: String): AuthResponse {
        val response = api.verifyEmail(VerifyEmailRequest(email, code))
        tokenStorage.saveToken(response.accessToken)
        return response
    }

    suspend fun resendCode(email: String) {
        api.resendCode(ResendCodeRequest(email))
    }

    suspend fun me(): CurrentUserResponse = api.getMe()

    fun logout() {
        tokenStorage.clear()
    }
}
