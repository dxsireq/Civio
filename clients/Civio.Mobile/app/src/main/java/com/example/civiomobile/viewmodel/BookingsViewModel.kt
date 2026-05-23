package com.example.civiomobile.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.civiomobile.data.api.dto.BookingSummaryResponse
import com.example.civiomobile.data.repository.BookingRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

enum class BookingFilter(val label: String) {
    All("Все"),
    Active("Активные"),
    Completed("Завершённые"),
    Cancelled("Отменённые");

    fun matches(statusCode: String): Boolean = when (this) {
        All -> true
        Active -> statusCode == "created" || statusCode == "confirmed"
        Completed -> statusCode == "completed"
        Cancelled -> statusCode == "cancelled" || statusCode == "rejected"
    }
}

data class BookingsState(
    val loading: Boolean = true,
    val refreshing: Boolean = false,
    val items: List<BookingSummaryResponse> = emptyList(),
    val filter: BookingFilter = BookingFilter.All,
    val error: String? = null
) {
    val filtered: List<BookingSummaryResponse>
        get() = items.filter { filter.matches(it.statusCode) }
}

@HiltViewModel
class BookingsViewModel @Inject constructor(
    private val repository: BookingRepository
) : ViewModel() {

    private val _state = MutableStateFlow(BookingsState())
    val state: StateFlow<BookingsState> = _state.asStateFlow()

    init {
        load()
    }

    fun load() {
        viewModelScope.launch {
            _state.update { it.copy(loading = true, error = null) }
            runCatching { repository.my() }
                .onSuccess { items ->
                    _state.update { it.copy(loading = false, items = items.sortedByDescending { b -> b.startAt }) }
                }
                .onFailure { e ->
                    _state.update { it.copy(loading = false, error = e.message ?: "Не удалось загрузить") }
                }
        }
    }

    fun refresh() {
        viewModelScope.launch {
            _state.update { it.copy(refreshing = true) }
            runCatching { repository.my() }
                .onSuccess { items ->
                    _state.update { it.copy(refreshing = false, items = items.sortedByDescending { b -> b.startAt }) }
                }
                .onFailure { _state.update { it.copy(refreshing = false) } }
        }
    }

    fun setFilter(filter: BookingFilter) {
        _state.update { it.copy(filter = filter) }
    }
}
