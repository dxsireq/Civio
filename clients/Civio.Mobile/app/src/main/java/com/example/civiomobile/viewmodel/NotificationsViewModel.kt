package com.example.civiomobile.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.civiomobile.data.api.dto.NotificationResponse
import com.example.civiomobile.data.repository.NotificationRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

data class NotificationsState(
    val loading: Boolean = true,
    val refreshing: Boolean = false,
    val items: List<NotificationResponse> = emptyList(),
    val error: String? = null
)

@HiltViewModel
class NotificationsViewModel @Inject constructor(
    private val repository: NotificationRepository
) : ViewModel() {

    private val _state = MutableStateFlow(NotificationsState())
    val state: StateFlow<NotificationsState> = _state.asStateFlow()

    init {
        load()
    }

    fun load() {
        viewModelScope.launch {
            _state.update { it.copy(loading = true, error = null) }
            runCatching { repository.my() }
                .onSuccess { items ->
                    _state.update {
                        it.copy(loading = false, items = items.sortedByDescending { n -> n.createdAt })
                    }
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
                    _state.update {
                        it.copy(refreshing = false, items = items.sortedByDescending { n -> n.createdAt })
                    }
                }
                .onFailure { _state.update { it.copy(refreshing = false) } }
        }
    }
}
