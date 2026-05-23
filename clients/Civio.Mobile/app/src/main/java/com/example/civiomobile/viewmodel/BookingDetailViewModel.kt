package com.example.civiomobile.viewmodel

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.civiomobile.data.api.dto.BookingResponse
import com.example.civiomobile.data.repository.BookingRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

data class BookingDetailState(
    val loading: Boolean = true,
    val booking: BookingResponse? = null,
    val cancelling: Boolean = false,
    val error: String? = null,
    val actionError: String? = null
)

@HiltViewModel
class BookingDetailViewModel @Inject constructor(
    savedStateHandle: SavedStateHandle,
    private val repository: BookingRepository
) : ViewModel() {

    private val bookingId: String = savedStateHandle["bookingId"] ?: error("bookingId required")

    private val _state = MutableStateFlow(BookingDetailState())
    val state: StateFlow<BookingDetailState> = _state.asStateFlow()

    init {
        load()
    }

    fun load() {
        viewModelScope.launch {
            _state.update { it.copy(loading = true, error = null) }
            runCatching { repository.byId(bookingId) }
                .onSuccess { b -> _state.update { it.copy(loading = false, booking = b) } }
                .onFailure { e -> _state.update { it.copy(loading = false, error = e.message ?: "Не удалось загрузить") } }
        }
    }

    fun cancel() {
        viewModelScope.launch {
            _state.update { it.copy(cancelling = true, actionError = null) }
            runCatching { repository.cancel(bookingId) }
                .onSuccess { b -> _state.update { it.copy(cancelling = false, booking = b) } }
                .onFailure { e -> _state.update { it.copy(cancelling = false, actionError = e.message ?: "Не удалось отменить") } }
        }
    }
}
