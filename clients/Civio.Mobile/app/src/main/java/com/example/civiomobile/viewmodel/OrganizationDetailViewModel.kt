package com.example.civiomobile.viewmodel

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.civiomobile.data.api.dto.OrganizationResponse
import com.example.civiomobile.data.api.dto.ServiceResponse
import com.example.civiomobile.data.repository.OrganizationRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.async
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

sealed interface OrganizationDetailState {
    data object Loading : OrganizationDetailState
    data class Ready(
        val organization: OrganizationResponse,
        val services: List<ServiceResponse>
    ) : OrganizationDetailState
    data class Error(val message: String) : OrganizationDetailState
}

@HiltViewModel
class OrganizationDetailViewModel @Inject constructor(
    savedStateHandle: SavedStateHandle,
    private val repository: OrganizationRepository
) : ViewModel() {

    private val orgId: String = savedStateHandle["orgId"] ?: error("orgId required")

    private val _state = MutableStateFlow<OrganizationDetailState>(OrganizationDetailState.Loading)
    val state: StateFlow<OrganizationDetailState> = _state.asStateFlow()

    init {
        load()
    }

    fun load() {
        viewModelScope.launch {
            _state.value = OrganizationDetailState.Loading
            runCatching {
                val orgDeferred = async { repository.organization(orgId) }
                val svcDeferred = async { repository.services(orgId) }
                OrganizationDetailState.Ready(
                    organization = orgDeferred.await(),
                    services = svcDeferred.await()
                )
            }
                .onSuccess { _state.value = it }
                .onFailure { _state.value = OrganizationDetailState.Error(it.message ?: "Не удалось загрузить") }
        }
    }
}
