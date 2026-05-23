package com.example.civiomobile.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.AssistChip
import androidx.compose.material3.AssistChipDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.civiomobile.data.api.dto.AvailableSlotResponse
import com.example.civiomobile.ui.components.CivioButton
import com.example.civiomobile.ui.components.EmptyState
import com.example.civiomobile.ui.components.LoadingBox
import com.example.civiomobile.viewmodel.BookingFlowViewModel
import java.time.OffsetDateTime
import java.time.format.DateTimeFormatter
import java.util.Locale

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SelectSlotScreen(
    viewModel: BookingFlowViewModel,
    onContinue: () -> Unit,
    onBack: () -> Unit
) {
    val state by viewModel.state.collectAsState()
    val service = state.selectedService

    Scaffold(
        containerColor = MaterialTheme.colorScheme.surfaceContainerLow,
        topBar = {
            TopAppBar(
                title = { Text("Выбор времени") },
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
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(bottom = 96.dp)
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(start = 20.dp, end = 20.dp, top = 8.dp),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    if (service != null) {
                        OutlineChip(label = service.name)
                    }
                    OutlineChip(label = formatDateRu(state.selectedDate.toString()))
                }

                Text(
                    text = "ДОСТУПНЫЕ СЛОТЫ",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    modifier = Modifier.padding(horizontal = 20.dp, vertical = 16.dp)
                )

                when {
                    state.slotsLoading -> LoadingBox()
                    state.slotsError != null -> EmptyState(
                        title = "Ошибка",
                        subtitle = state.slotsError
                    )
                    state.slots.isEmpty() -> EmptyState(
                        title = "Нет свободных слотов",
                        subtitle = "Выберите другую дату или услугу"
                    )
                    else -> LazyVerticalGrid(
                        columns = GridCells.Fixed(3),
                        contentPadding = PaddingValues(horizontal = 20.dp, vertical = 4.dp),
                        horizontalArrangement = Arrangement.spacedBy(10.dp),
                        verticalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        items(state.slots, key = { it.employeeId + it.startAt }) { slot ->
                            SlotCell(
                                slot = slot,
                                selected = state.selectedSlot == slot,
                                onClick = { viewModel.selectSlot(slot) }
                            )
                        }
                    }
                }
            }

            Box(
                modifier = Modifier
                    .align(Alignment.BottomCenter)
                    .fillMaxWidth()
                    .background(MaterialTheme.colorScheme.surfaceContainerLow)
                    .padding(horizontal = 20.dp, vertical = 12.dp)
            ) {
                CivioButton(
                    text = "Продолжить",
                    onClick = onContinue,
                    enabled = state.selectedSlot != null && !state.slotsLoading,
                    modifier = Modifier.fillMaxWidth()
                )
            }
        }
    }
}

@Composable
private fun OutlineChip(label: String) {
    AssistChip(
        onClick = {},
        label = { Text(label, color = MaterialTheme.colorScheme.primary) },
        colors = AssistChipDefaults.assistChipColors(
            containerColor = MaterialTheme.colorScheme.surface
        ),
        border = AssistChipDefaults.assistChipBorder(
            enabled = true,
            borderColor = MaterialTheme.colorScheme.primary
        )
    )
}

@Composable
private fun SlotCell(
    slot: AvailableSlotResponse,
    selected: Boolean,
    onClick: () -> Unit
) {
    val bg = if (selected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.surface
    val fg = if (selected) MaterialTheme.colorScheme.onPrimary else MaterialTheme.colorScheme.onSurface
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(4.dp)
    ) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(44.dp)
                .clip(RoundedCornerShape(12.dp))
                .background(bg)
                .border(
                    width = if (selected) 0.dp else 1.dp,
                    color = if (selected) bg else MaterialTheme.colorScheme.outline,
                    shape = RoundedCornerShape(12.dp)
                )
                .clickable { onClick() },
            contentAlignment = Alignment.Center
        ) {
            Text(
                text = formatTime(slot.startAt),
                fontSize = 15.sp,
                fontWeight = FontWeight.SemiBold,
                color = fg
            )
        }
        Text(
            text = "${slot.employeeFirstName} ${slot.employeeLastName.take(1)}.",
            fontSize = 10.sp,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
    }
}

internal fun formatTime(isoOffsetDateTime: String): String =
    runCatching {
        OffsetDateTime.parse(isoOffsetDateTime).format(DateTimeFormatter.ofPattern("HH:mm"))
    }.getOrDefault(isoOffsetDateTime)

internal fun formatDateRu(localDateIso: String): String =
    runCatching {
        val d = java.time.LocalDate.parse(localDateIso)
        val day = d.dayOfWeek.getDisplayName(java.time.format.TextStyle.SHORT, Locale("ru"))
        val month = d.month.getDisplayName(java.time.format.TextStyle.FULL, Locale("ru"))
        "${day.replaceFirstChar { it.uppercase() }}, ${d.dayOfMonth} $month"
    }.getOrDefault(localDateIso)
