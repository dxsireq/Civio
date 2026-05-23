package com.example.civiomobile.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Done
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.pulltorefresh.PullToRefreshBox
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import com.example.civiomobile.data.api.dto.NotificationResponse
import com.example.civiomobile.ui.components.EmptyState
import com.example.civiomobile.ui.components.LoadingBox
import com.example.civiomobile.viewmodel.NotificationsViewModel
import java.time.Duration
import java.time.OffsetDateTime

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun NotificationsScreen(viewModel: NotificationsViewModel = hiltViewModel()) {
    val state by viewModel.state.collectAsState()

    Scaffold(containerColor = MaterialTheme.colorScheme.surface) { padding ->
        Column(modifier = Modifier.fillMaxSize().padding(padding)) {
            Text(
                text = "Уведомления",
                fontSize = 30.sp,
                fontWeight = FontWeight.SemiBold,
                color = MaterialTheme.colorScheme.onSurface,
                modifier = Modifier.padding(start = 20.dp, end = 20.dp, top = 12.dp, bottom = 12.dp)
            )

            when {
                state.loading -> LoadingBox()
                state.error != null -> EmptyState(title = "Ошибка", subtitle = state.error)
                else -> {
                    PullToRefreshBox(
                        isRefreshing = state.refreshing,
                        onRefresh = viewModel::refresh,
                        modifier = Modifier.fillMaxSize()
                    ) {
                        if (state.items.isEmpty()) {
                            EmptyState(
                                title = "Нет уведомлений",
                                subtitle = "Здесь появятся обновления по вашим записям"
                            )
                        } else {
                            LazyColumn(
                                modifier = Modifier.fillMaxSize(),
                                contentPadding = PaddingValues(bottom = 24.dp)
                            ) {
                                items(state.items, key = { it.id }) { n ->
                                    NotificationItem(n)
                                    HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant)
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun NotificationItem(n: NotificationResponse) {
    val (bg, fg, icon) = iconStyle(n.typeCode)
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 20.dp, vertical = 14.dp),
        verticalAlignment = Alignment.Top
    ) {
        Box(
            modifier = Modifier
                .size(40.dp)
                .clip(CircleShape)
                .background(bg),
            contentAlignment = Alignment.Center
        ) {
            Icon(imageVector = icon, contentDescription = null, tint = fg, modifier = Modifier.size(20.dp))
        }
        Spacer(Modifier.size(14.dp))
        Column(modifier = Modifier.fillMaxWidth()) {
            Row(
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.Top,
                modifier = Modifier.fillMaxWidth()
            ) {
                Text(
                    text = n.title,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = MaterialTheme.colorScheme.onSurface,
                    modifier = Modifier.weight(1f)
                )
                Spacer(Modifier.size(8.dp))
                Text(
                    text = formatRelative(n.createdAt),
                    fontSize = 11.sp,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
            Text(
                text = n.message,
                fontSize = 13.sp,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                modifier = Modifier.padding(top = 2.dp)
            )
        }
    }
}

@Composable
private fun iconStyle(typeCode: String): Triple<Color, Color, ImageVector> {
    val cs = MaterialTheme.colorScheme
    return when {
        typeCode.contains("confirm", ignoreCase = true) ->
            Triple(Color(0xFFDCF2E4), Color(0xFF1F8F4E), Icons.Default.Check)
        typeCode.contains("created", ignoreCase = true) ->
            Triple(Color(0xFFFCEBD8), Color(0xFFC2620C), Icons.Default.Add)
        typeCode.contains("cancel", ignoreCase = true) || typeCode.contains("reject", ignoreCase = true) ->
            Triple(cs.errorContainer, cs.error, Icons.Default.Close)
        typeCode.contains("complete", ignoreCase = true) ->
            Triple(Color(0xFFECEDF2), cs.onSurfaceVariant, Icons.Default.Done)
        else ->
            Triple(cs.primaryContainer, cs.primary, Icons.Default.Notifications)
    }
}

private fun formatRelative(iso: String): String = runCatching {
    val now = OffsetDateTime.now()
    val then = OffsetDateTime.parse(iso)
    val d = Duration.between(then, now)
    when {
        d.toMinutes() < 1 -> "только что"
        d.toMinutes() < 60 -> "${d.toMinutes()} мин"
        d.toHours() < 24 -> "${d.toHours()} ч"
        d.toDays() < 7 -> "${d.toDays()} дн"
        else -> "${d.toDays() / 7} нед"
    }
}.getOrDefault(iso)
