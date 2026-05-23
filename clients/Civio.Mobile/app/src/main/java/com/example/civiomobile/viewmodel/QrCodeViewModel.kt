package com.example.civiomobile.viewmodel

import android.graphics.Bitmap
import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.civiomobile.data.api.dto.BookingResponse
import com.example.civiomobile.data.repository.BookingRepository
import com.google.zxing.BarcodeFormat
import com.journeyapps.barcodescanner.BarcodeEncoder
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.async
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import javax.inject.Inject

data class QrCodeState(
    val loading: Boolean = true,
    val booking: BookingResponse? = null,
    val qrBitmap: Bitmap? = null,
    val error: String? = null
)

@HiltViewModel
class QrCodeViewModel @Inject constructor(
    savedStateHandle: SavedStateHandle,
    private val repository: BookingRepository
) : ViewModel() {

    private val bookingId: String = savedStateHandle["bookingId"] ?: error("bookingId required")

    private val _state = MutableStateFlow(QrCodeState())
    val state: StateFlow<QrCodeState> = _state.asStateFlow()

    init {
        load()
    }

    private fun load() {
        viewModelScope.launch {
            _state.update { it.copy(loading = true, error = null) }
            runCatching {
                val bookingDeferred = async { repository.byId(bookingId) }
                val qr = repository.qr(bookingId)
                val bitmap = withContext(Dispatchers.Default) {
                    BarcodeEncoder().encodeBitmap(qr.token, BarcodeFormat.QR_CODE, 720, 720)
                }
                bookingDeferred.await() to bitmap
            }
                .onSuccess { (booking, bitmap) ->
                    _state.update { it.copy(loading = false, booking = booking, qrBitmap = bitmap) }
                }
                .onFailure { e ->
                    _state.update { it.copy(loading = false, error = e.message ?: "Не удалось загрузить QR") }
                }
        }
    }
}
