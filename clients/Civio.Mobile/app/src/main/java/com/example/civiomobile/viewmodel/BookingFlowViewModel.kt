package com.example.civiomobile.viewmodel

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.civiomobile.data.api.dto.AvailableSlotResponse
import com.example.civiomobile.data.api.dto.BookingResponse
import com.example.civiomobile.data.api.dto.CreateBookingRequest
import com.example.civiomobile.data.api.dto.OrganizationResponse
import com.example.civiomobile.data.api.dto.ServiceResponse
import com.example.civiomobile.data.repository.BookingRepository
import com.example.civiomobile.data.repository.OrganizationRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.async
import kotlinx.coroutines.awaitAll
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import java.time.LocalDate
import javax.inject.Inject

data class BookingFlowState(
    val orgId: String,
    val org: OrganizationResponse? = null,
    val services: List<ServiceResponse> = emptyList(),
    val loading: Boolean = true,
    val error: String? = null,

    val selectedServiceId: String? = null,
    val selectedDate: LocalDate = LocalDate.now(),

    val slots: List<AvailableSlotResponse> = emptyList(),
    val slotsLoading: Boolean = false,
    val slotsError: String? = null,

    val selectedSlot: AvailableSlotResponse? = null,

    val availableDates: Set<LocalDate> = emptySet(),
    val datesLoading: Boolean = false,

    val submitting: Boolean = false,
    val submitError: String? = null,
    val createdBooking: BookingResponse? = null
) {
    val selectedService: ServiceResponse? get() = services.firstOrNull { it.id == selectedServiceId }
}

@HiltViewModel
class BookingFlowViewModel @Inject constructor(
    savedStateHandle: SavedStateHandle,
    private val orgRepository: OrganizationRepository,
    private val bookingRepository: BookingRepository
) : ViewModel() {

    private val orgId: String = savedStateHandle["orgId"] ?: error("orgId required")

    private val _state = MutableStateFlow(BookingFlowState(orgId = orgId))
    val state: StateFlow<BookingFlowState> = _state.asStateFlow()

    init {
        loadOrg()
    }

    private fun loadOrg() {
        viewModelScope.launch {
            runCatching {
                val orgDeferred = async { orgRepository.organization(orgId) }
                val svcDeferred = async { orgRepository.services(orgId) }
                orgDeferred.await() to svcDeferred.await()
            }
                .onSuccess { (org, svc) ->
                    val active = svc.filter { it.isActive }
                    val initialServiceId = active.firstOrNull()?.id
                    _state.update {
                        it.copy(
                            loading = false,
                            org = org,
                            services = active,
                            selectedServiceId = it.selectedServiceId ?: initialServiceId
                        )
                    }
                    _state.value.selectedServiceId?.let { loadAvailableDates(it) }
                }
                .onFailure { e -> _state.update { it.copy(loading = false, error = e.message) } }
        }
    }

    fun selectService(serviceId: String) {
        if (_state.value.selectedServiceId == serviceId) return
        _state.update {
            it.copy(
                selectedServiceId = serviceId,
                slots = emptyList(),
                selectedSlot = null,
                availableDates = emptySet()
            )
        }
        loadAvailableDates(serviceId)
    }

    private fun loadAvailableDates(serviceId: String) {
        val today = LocalDate.now()
        val datesToCheck = (0 until 14).map { today.plusDays(it.toLong()) }
        viewModelScope.launch {
            _state.update { it.copy(datesLoading = true) }
            val available = datesToCheck.map { date ->
                async {
                    runCatching {
                        bookingRepository.availableSlots(orgId, serviceId, date.toString())
                    }.getOrDefault(emptyList()).let { if (it.isNotEmpty()) date else null }
                }
            }.awaitAll().filterNotNull().toSet()
            _state.update { current ->
                val newDate = if (current.selectedDate in available) current.selectedDate
                              else datesToCheck.firstOrNull { it in available } ?: current.selectedDate
                current.copy(
                    datesLoading = false,
                    availableDates = available,
                    selectedDate = newDate,
                    slots = emptyList(),
                    selectedSlot = null
                )
            }
        }
    }

    fun selectDate(date: LocalDate) {
        _state.update {
            if (it.selectedDate == date) it
            else it.copy(selectedDate = date, slots = emptyList(), selectedSlot = null)
        }
    }

    fun loadSlots() {
        val current = _state.value
        val serviceId = current.selectedServiceId ?: return
        viewModelScope.launch {
            _state.update { it.copy(slotsLoading = true, slotsError = null) }
            runCatching {
                bookingRepository.availableSlots(
                    orgId = orgId,
                    serviceId = serviceId,
                    date = current.selectedDate.toString()
                )
            }
                .onSuccess { result ->
                    _state.update {
                        it.copy(slots = result, slotsLoading = false, selectedSlot = null)
                    }
                }
                .onFailure { e ->
                    _state.update {
                        it.copy(slotsLoading = false, slotsError = e.message ?: "Не удалось загрузить слоты")
                    }
                }
        }
    }

    fun selectSlot(slot: AvailableSlotResponse) {
        _state.update { it.copy(selectedSlot = slot) }
    }

    fun submit(comment: String?) {
        val s = _state.value
        val serviceId = s.selectedServiceId ?: return
        val slot = s.selectedSlot ?: return
        viewModelScope.launch {
            _state.update { it.copy(submitting = true, submitError = null) }
            runCatching {
                bookingRepository.create(
                    CreateBookingRequest(
                        organizationId = orgId,
                        serviceId = serviceId,
                        employeeId = slot.employeeId,
                        startAt = slot.startAt,
                        comment = comment?.trim()?.ifBlank { null }
                    )
                )
            }
                .onSuccess { booking ->
                    _state.update { it.copy(submitting = false, createdBooking = booking) }
                }
                .onFailure { e ->
                    _state.update {
                        it.copy(submitting = false, submitError = e.message ?: "Не удалось создать запись")
                    }
                }
        }
    }

    fun clearSubmitError() {
        _state.update { it.copy(submitError = null) }
    }
}
