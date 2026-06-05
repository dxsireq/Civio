package com.example.civiomobile.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.civiomobile.data.api.AuthEventBus
import com.example.civiomobile.data.api.EmailNotVerifiedException
import com.example.civiomobile.data.api.dto.AuthResponse
import com.example.civiomobile.data.repository.AuthRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

sealed interface AuthState {
    data object Idle : AuthState
    data object Loading : AuthState
    data class Authenticated(val user: AuthResponse) : AuthState
    data class PendingVerification(val email: String) : AuthState
    data class Error(val message: String) : AuthState
}

@HiltViewModel
class AuthViewModel @Inject constructor(
    private val repository: AuthRepository,
    authEventBus: AuthEventBus
) : ViewModel() {

    private val _state = MutableStateFlow<AuthState>(AuthState.Idle)
    val state: StateFlow<AuthState> = _state.asStateFlow()

    val logoutSignal: SharedFlow<Unit> = authEventBus.logout

    fun isAuthenticated(): Boolean = repository.isAuthenticated()

    fun login(email: String, password: String) {
        viewModelScope.launch {
            _state.value = AuthState.Loading
            runCatching { repository.login(email, password) }
                .onSuccess { _state.value = AuthState.Authenticated(it) }
                .onFailure { e ->
                    if (e is EmailNotVerifiedException) {
                        // Resend a fresh code automatically, then go to verify screen
                        runCatching { repository.resendCode(email) }
                        _state.value = AuthState.PendingVerification(email)
                    } else {
                        _state.value = AuthState.Error(e.message ?: "Ошибка входа")
                    }
                }
        }
    }

    fun register(
        email: String,
        password: String,
        firstName: String,
        lastName: String,
        middleName: String? = null,
        phone: String? = null
    ) {
        viewModelScope.launch {
            _state.value = AuthState.Loading
            runCatching {
                repository.register(email, password, firstName, lastName, middleName, phone)
            }
                .onSuccess { _state.value = AuthState.PendingVerification(it) }
                .onFailure { _state.value = AuthState.Error(it.message ?: "Ошибка регистрации") }
        }
    }

    fun verifyEmail(email: String, code: String) {
        viewModelScope.launch {
            _state.value = AuthState.Loading
            runCatching { repository.verifyEmail(email, code) }
                .onSuccess { _state.value = AuthState.Authenticated(it) }
                .onFailure { _state.value = AuthState.Error(it.message ?: "Неверный код") }
        }
    }

    fun resendCode(email: String) {
        viewModelScope.launch {
            runCatching { repository.resendCode(email) }
            // Errors surfaced in VerifyEmailScreen via separate state if needed
        }
    }

    fun logout() {
        repository.logout()
        _state.value = AuthState.Idle
    }

    fun resetError() {
        if (_state.value is AuthState.Error) _state.value = AuthState.Idle
    }
}
