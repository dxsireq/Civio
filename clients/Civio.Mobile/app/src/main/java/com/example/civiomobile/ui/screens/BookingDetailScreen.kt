package com.example.civiomobile.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Check
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import com.example.civiomobile.data.api.dto.BookingResponse
import com.example.civiomobile.ui.components.CivioButton
import com.example.civiomobile.ui.components.EmptyState
import com.example.civiomobile.ui.components.LoadingBox
import com.example.civiomobile.viewmodel.BookingDetailViewModel
import java.time.OffsetDateTime
import java.time.format.DateTimeFormatter
import java.util.Locale

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun BookingDetailScreen(
    bookingId: String,
    onShowQr: () -> Unit,
    onBack: () -> Unit = {},
    viewModel: BookingDetailViewModel = hiltViewModel()
) {
    val state by viewModel.state.collectAsState()
    var confirmCancel by remember { mutableStateOf(false) }

    Scaffold(
        containerColor = MaterialTheme.colorScheme.surfaceContainerLow,
        topBar = {
            TopAppBar(
                title = { Text("Запись #${bookingId.take(6).uppercase()}") },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Назад")
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.surfaceContainerLow
                )
            )
        }
    ) { padding ->
        Box(Modifier.fillMaxSize().padding(padding)) {
            when {
                state.loading -> LoadingBox()
                state.error != null -> EmptyState(title = "Ошибка", subtitle = state.error)
                state.booking != null -> Content(
                    booking = state.booking!!,
                    cancelling = state.cancelling,
                    actionError = state.actionError,
                    onShowQr = onShowQr,
                    onCancelClick = { confirmCancel = true }
                )
            }
        }
    }

    if (confirmCancel) {
        AlertDialog(
            onDismissRequest = { confirmCancel = false },
            title = { Text("Отменить запись?") },
            text = { Text("Это действие нельзя отменить.") },
            confirmButton = {
                TextButton(
                    onClick = {
                        confirmCancel = false
                        viewModel.cancel()
                    },
                    colors = ButtonDefaults.textButtonColors(contentColor = MaterialTheme.colorScheme.error)
                ) { Text("Отменить") }
            },
            dismissButton = {
                TextButton(onClick = { confirmCancel = false }) { Text("Назад") }
            }
        )
    }
}

@Composable
private fun Content(
    booking: BookingResponse,
    cancelling: Boolean,
    actionError: String?,
    onShowQr: () -> Unit,
    onCancelClick: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(horizontal = 20.dp, vertical = 4.dp)
    ) {
        StatusBig(booking.statusCode, booking.statusName)

        Spacer(Modifier.height(16.dp))

        Column(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(16.dp))
                .background(MaterialTheme.colorScheme.surface)
                .padding(horizontal = 18.dp, vertical = 16.dp)
        ) {
            Text(
                text = booking.serviceName,
                fontSize = 17.sp,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onSurface
            )
            Spacer(Modifier.height(8.dp))
            DetailRow("Дата", formatDateLong(booking.startAt))
            DetailRow("Время", "${formatTime(booking.startAt)} — ${formatTime(booking.endAt)}")
            val employee = listOfNotNull(booking.employeeFirstName, booking.employeeLastName)
                .joinToString(" ")
                .ifBlank { "—" }
            DetailRow("Сотрудник", employee)
            if (!booking.comment.isNullOrBlank()) {
                DetailRow("Комментарий", booking.comment)
            }
        }

        if (actionError != null) {
            Text(
                text = actionError,
                color = MaterialTheme.colorScheme.error,
                fontSize = 13.sp,
                modifier = Modifier.padding(top = 12.dp)
            )
        }

        Spacer(Modifier.height(24.dp))

        if (booking.statusCode == "confirmed") {
            CivioButton(
                text = "Показать QR-код",
                onClick = onShowQr,
                modifier = Modifier.fillMaxWidth()
            )
            Spacer(Modifier.height(10.dp))
        }

        if (booking.statusCode == "created" || booking.statusCode == "confirmed") {
            OutlinedButton(
                onClick = onCancelClick,
                enabled = !cancelling,
                modifier = Modifier.fillMaxWidth().height(48.dp),
                colors = ButtonDefaults.outlinedButtonColors(contentColor = MaterialTheme.colorScheme.error),
                border = androidx.compose.foundation.BorderStroke(1.dp, MaterialTheme.colorScheme.error)
            ) {
                Text(if (cancelling) "Отмена..." else "Отменить запись")
            }
        }

        Spacer(Modifier.height(24.dp))
    }
}

@Composable
private fun StatusBig(code: String, name: String) {
    val (bg, fg) = when (code) {
        "created" -> androidx.compose.ui.graphics.Color(0xFFFCEBD8) to androidx.compose.ui.graphics.Color(0xFFC2620C)
        "confirmed" -> MaterialTheme.colorScheme.primary to MaterialTheme.colorScheme.onPrimary
        "completed" -> MaterialTheme.colorScheme.surfaceContainer to MaterialTheme.colorScheme.onSurfaceVariant
        "cancelled", "rejected" -> MaterialTheme.colorScheme.errorContainer to MaterialTheme.colorScheme.error
        else -> MaterialTheme.colorScheme.surfaceContainer to MaterialTheme.colorScheme.onSurfaceVariant
    }
    Row(
        verticalAlignment = Alignment.CenterVertically,
        modifier = Modifier
            .clip(RoundedCornerShape(100.dp))
            .background(bg)
            .padding(horizontal = 14.dp, vertical = 6.dp)
    ) {
        if (code == "confirmed") {
            Icon(Icons.Default.Check, null, tint = fg, modifier = Modifier.size(16.dp))
            Spacer(Modifier.width(6.dp))
        }
        Text(text = name, fontSize = 13.sp, fontWeight = FontWeight.SemiBold, color = fg)
    }
}

@Composable
private fun DetailRow(label: String, value: String) {
    HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant)
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 10.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.Top
    ) {
        Text(
            text = label,
            fontSize = 13.sp,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            modifier = Modifier.width(110.dp)
        )
        Text(
            text = value,
            fontSize = 14.sp,
            fontWeight = FontWeight.Medium,
            color = MaterialTheme.colorScheme.onSurface,
            modifier = Modifier.weight(1f),
            textAlign = androidx.compose.ui.text.style.TextAlign.End
        )
    }
}

private fun formatDateLong(iso: String): String = runCatching {
    val odt = OffsetDateTime.parse(iso)
    val day = odt.dayOfWeek.getDisplayName(java.time.format.TextStyle.SHORT, Locale("ru"))
    val month = odt.month.getDisplayName(java.time.format.TextStyle.FULL, Locale("ru"))
    "${day.replaceFirstChar { it.uppercase() }}, ${odt.dayOfMonth} $month ${odt.year}"
}.getOrDefault(iso)
