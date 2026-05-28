package com.example.civiomobile.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.civiomobile.data.api.dto.OrganizationResponse
import com.example.civiomobile.data.repository.OrganizationRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

sealed interface OrganizationsState {
    data object Loading : OrganizationsState
    data class Ready(
        val items: List<OrganizationResponse>,
        val query: String = "",
        val refreshing: Boolean = false
    ) : OrganizationsState
    data class Error(val message: String) : OrganizationsState
}

@HiltViewModel
class OrganizationsViewModel @Inject constructor(
    private val repository: OrganizationRepository
) : ViewModel() {

    private val _state = MutableStateFlow<OrganizationsState>(OrganizationsState.Loading)
    val state: StateFlow<OrganizationsState> = _state.asStateFlow()

    init {
        load()
    }

    fun load() {
        viewModelScope.launch {
            _state.value = OrganizationsState.Loading
            runCatching { repository.catalog() }
                .onSuccess { _state.value = OrganizationsState.Ready(items = it) }
                .onFailure { _state.value = OrganizationsState.Error(it.message ?: "Не удалось загрузить каталог") }
        }
    }

    fun refresh() {
        val current = _state.value as? OrganizationsState.Ready ?: run { load(); return }
        viewModelScope.launch {
            _state.value = current.copy(refreshing = true)
            runCatching { repository.catalog() }
                .onSuccess { _state.value = current.copy(items = it, refreshing = false) }
                .onFailure { _state.value = current.copy(refreshing = false) }
        }
    }

    fun search(query: String) {
        val current = _state.value as? OrganizationsState.Ready ?: return
        _state.value = current.copy(query = query)
    }

    fun refreshIfLoaded() {
        if (_state.value !is OrganizationsState.Loading) refresh()
    }
}
