package com.example.civiomobile.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
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
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
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
import com.example.civiomobile.data.api.dto.ServiceResponse
import com.example.civiomobile.ui.components.CivioButton
import com.example.civiomobile.ui.components.EmptyState
import com.example.civiomobile.ui.components.LoadingBox
import com.example.civiomobile.viewmodel.BookingFlowViewModel
import java.time.LocalDate
import java.time.format.TextStyle
import java.util.Locale

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun BookServiceScreen(
    viewModel: BookingFlowViewModel,
    onContinue: () -> Unit,
    onBack: () -> Unit
) {
    val state by viewModel.state.collectAsState()

    Scaffold(
        containerColor = MaterialTheme.colorScheme.surfaceContainerLow,
        topBar = {
            TopAppBar(
                title = { Text("Выбор услуги и даты") },
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
                state.services.isEmpty() -> EmptyState(
                    title = "Нет доступных услуг",
                    subtitle = "Эта организация пока не предлагает услуги"
                )
                else -> {
                    Column(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(bottom = 96.dp)
                    ) {
                        SectionLabel("УСЛУГА")
                        Column(
                            modifier = Modifier.padding(horizontal = 20.dp),
                            verticalArrangement = Arrangement.spacedBy(10.dp)
                        ) {
                            state.services.forEach { svc ->
                                ServiceSelectCard(
                                    service = svc,
                                    selected = svc.id == state.selectedServiceId,
                                    onClick = { viewModel.selectService(svc.id) }
                                )
                            }
                        }

                        Spacer(Modifier.height(24.dp))
                        SectionLabel("ДАТА")

                        val today = LocalDate.now()
                        val dates = (0 until 14).map { today.plusDays(it.toLong()) }
                        LazyRow(
                            contentPadding = androidx.compose.foundation.layout.PaddingValues(horizontal = 20.dp),
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            items(dates, key = { it.toString() }) { d ->
                                DateChip(
                                    date = d,
                                    isToday = d == today,
                                    selected = d == state.selectedDate,
                                    onClick = { viewModel.selectDate(d) }
                                )
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
                            text = "Посмотреть слоты",
                            onClick = {
                                viewModel.loadSlots()
                                onContinue()
                            },
                            enabled = state.selectedServiceId != null,
                            modifier = Modifier.fillMaxWidth()
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun SectionLabel(text: String) {
    Text(
        text = text,
        fontSize = 12.sp,
        fontWeight = FontWeight.Bold,
        color = MaterialTheme.colorScheme.onSurfaceVariant,
        modifier = Modifier.padding(start = 20.dp, end = 20.dp, top = 8.dp, bottom = 8.dp)
    )
}

@Composable
private fun ServiceSelectCard(
    service: ServiceResponse,
    selected: Boolean,
    onClick: () -> Unit
) {
    val border = if (selected) 2.dp else 1.dp
    val borderColor = if (selected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.outlineVariant
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(14.dp))
            .background(MaterialTheme.colorScheme.surface)
            .border(border, borderColor, RoundedCornerShape(14.dp))
            .clickable { onClick() }
            .padding(horizontal = 16.dp, vertical = 14.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Box(
            modifier = Modifier
                .size(22.dp)
                .clip(CircleShape)
                .border(
                    2.dp,
                    if (selected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.outline,
                    CircleShape
                ),
            contentAlignment = Alignment.Center
        ) {
            if (selected) {
                Box(
                    modifier = Modifier
                        .size(11.dp)
                        .clip(CircleShape)
                        .background(MaterialTheme.colorScheme.primary)
                )
            }
        }
        Spacer(Modifier.width(12.dp))
        Column(modifier = Modifier.weight(1f)) {
            Text(
                text = service.name,
                fontSize = 15.sp,
                fontWeight = FontWeight.SemiBold,
                color = MaterialTheme.colorScheme.onSurface
            )
            Text(
                text = "${service.durationMinutes} мин",
                fontSize = 13.sp,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
        Text(
            text = formatPriceShort(service.price),
            fontSize = 15.sp,
            fontWeight = FontWeight.SemiBold,
            color = if (selected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onSurface
        )
    }
}

@Composable
private fun DateChip(
    date: LocalDate,
    isToday: Boolean,
    selected: Boolean,
    onClick: () -> Unit
) {
    val bg = if (selected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.surface
    val fg = if (selected) MaterialTheme.colorScheme.onPrimary else MaterialTheme.colorScheme.onSurface
    Column(
        modifier = Modifier
            .size(width = 56.dp, height = 72.dp)
            .clip(RoundedCornerShape(14.dp))
            .background(bg)
            .border(
                width = if (selected) 0.dp else 1.dp,
                color = if (selected) bg else MaterialTheme.colorScheme.outlineVariant,
                shape = RoundedCornerShape(14.dp)
            )
            .clickable { onClick() },
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text(
            text = if (isToday) "СЕГ" else date.dayOfWeek.getDisplayName(TextStyle.SHORT, Locale("ru")).uppercase(),
            fontSize = 11.sp,
            fontWeight = FontWeight.SemiBold,
            color = fg.copy(alpha = 0.85f)
        )
        Text(
            text = date.dayOfMonth.toString(),
            fontSize = 22.sp,
            fontWeight = FontWeight.SemiBold,
            color = fg
        )
    }
}

private fun formatPriceShort(price: Double?): String =
    if (price == null) "—" else "${price.toLong()} ₽"
