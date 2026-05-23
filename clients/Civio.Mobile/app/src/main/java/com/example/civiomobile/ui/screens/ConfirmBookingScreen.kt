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
import androidx.compose.material.icons.filled.CalendarMonth
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Schedule
import androidx.compose.material.icons.filled.Sell
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.civiomobile.ui.components.CivioButton
import com.example.civiomobile.ui.components.CivioTextField
import com.example.civiomobile.viewmodel.BookingFlowViewModel
import java.time.OffsetDateTime
import java.time.format.DateTimeFormatter
import java.util.Locale

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ConfirmBookingScreen(
    viewModel: BookingFlowViewModel,
    onConfirmed: (String) -> Unit,
    onBack: () -> Unit
) {
    val state by viewModel.state.collectAsState()
    var comment by remember { mutableStateOf("") }

    val org = state.org
    val service = state.selectedService
    val slot = state.selectedSlot
    val booking = state.createdBooking

    LaunchedEffect(booking) {
        if (booking != null) onConfirmed(booking.id)
    }

    Scaffold(
        containerColor = MaterialTheme.colorScheme.surfaceContainerLow,
        topBar = {
            TopAppBar(
                title = { Text("Подтверждение") },
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
        if (org == null || service == null || slot == null) {
            Box(Modifier.fillMaxSize().padding(padding), contentAlignment = Alignment.Center) {
                Text("Недостаточно данных для подтверждения")
            }
            return@Scaffold
        }
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .verticalScroll(rememberScrollState())
                .padding(horizontal = 20.dp, vertical = 8.dp)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(18.dp))
                    .background(MaterialTheme.colorScheme.surface)
                    .padding(horizontal = 18.dp, vertical = 16.dp)
            ) {
                Text(
                    text = org.name,
                    fontSize = 19.sp,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onSurface
                )
                Text(
                    text = org.address,
                    fontSize = 13.sp,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    modifier = Modifier.padding(top = 4.dp)
                )
                HorizontalDivider(
                    color = MaterialTheme.colorScheme.outlineVariant,
                    modifier = Modifier.padding(vertical = 12.dp)
                )
                SummaryRow(Icons.Default.Star, "УСЛУГА", service.name)
                SummaryRow(
                    Icons.Default.Person,
                    "СОТРУДНИК",
                    "${slot.employeeFirstName} ${slot.employeeLastName}"
                )
                SummaryRow(Icons.Default.CalendarMonth, "ДАТА", formatDateFull(slot.startAt))
                SummaryRow(
                    Icons.Default.Schedule,
                    "ВРЕМЯ",
                    "${formatTime(slot.startAt)} — ${formatTime(slot.endAt)}"
                )
                SummaryRow(
                    Icons.Default.Sell,
                    "СТОИМОСТЬ",
                    if (service.price != null) "${service.price.toLong()} ₽" else "—",
                    bold = true
                )
            }

            Text(
                text = "КОММЕНТАРИЙ",
                fontSize = 12.sp,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                modifier = Modifier.padding(top = 24.dp, bottom = 10.dp)
            )
            CivioTextField(
                value = comment,
                onValueChange = { comment = it },
                label = "Комментарий",
                placeholder = "Ваши пожелания (необязательно)",
                singleLine = false,
                enabled = !state.submitting
            )

            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(top = 20.dp)
                    .clip(RoundedCornerShape(12.dp))
                    .background(MaterialTheme.colorScheme.primaryContainer)
                    .padding(horizontal = 14.dp, vertical = 12.dp)
            ) {
                Icon(
                    imageVector = Icons.Default.Info,
                    contentDescription = null,
                    tint = MaterialTheme.colorScheme.primary,
                    modifier = Modifier.size(18.dp)
                )
                Spacer(Modifier.width(10.dp))
                Text(
                    text = "После создания запись ожидает подтверждения от организации.",
                    fontSize = 13.sp,
                    color = MaterialTheme.colorScheme.onPrimaryContainer
                )
            }

            if (state.submitError != null) {
                Text(
                    text = state.submitError!!,
                    color = MaterialTheme.colorScheme.error,
                    fontSize = 13.sp,
                    modifier = Modifier.padding(top = 12.dp)
                )
            }

            Spacer(Modifier.height(24.dp))
            CivioButton(
                text = "Подтвердить запись",
                onClick = { viewModel.submit(comment) },
                loading = state.submitting,
                enabled = !state.submitting,
                modifier = Modifier.fillMaxWidth()
            )
            Spacer(Modifier.height(16.dp))
        }
    }
}

@Composable
private fun SummaryRow(icon: ImageVector, label: String, value: String, bold: Boolean = false) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 10.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Box(
            modifier = Modifier
                .size(36.dp)
                .clip(RoundedCornerShape(10.dp))
                .background(MaterialTheme.colorScheme.primaryContainer),
            contentAlignment = Alignment.Center
        ) {
            Icon(
                imageVector = icon,
                contentDescription = null,
                tint = MaterialTheme.colorScheme.primary,
                modifier = Modifier.size(18.dp)
            )
        }
        Spacer(Modifier.width(12.dp))
        Column(modifier = Modifier.fillMaxWidth()) {
            Text(
                text = label,
                fontSize = 11.sp,
                fontWeight = FontWeight.SemiBold,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            Text(
                text = value,
                fontSize = 15.sp,
                fontWeight = if (bold) FontWeight.SemiBold else FontWeight.Medium,
                color = MaterialTheme.colorScheme.onSurface,
                modifier = Modifier.padding(top = 1.dp)
            )
        }
    }
}

private fun formatDateFull(isoOffsetDateTime: String): String =
    runCatching {
        val odt = OffsetDateTime.parse(isoOffsetDateTime)
        val day = odt.dayOfWeek.getDisplayName(java.time.format.TextStyle.FULL, Locale("ru"))
        val month = odt.month.getDisplayName(java.time.format.TextStyle.FULL, Locale("ru"))
        "${day.replaceFirstChar { it.uppercase() }}, ${odt.dayOfMonth} $month ${odt.year}"
    }.getOrDefault(isoOffsetDateTime)
