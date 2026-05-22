package com.example.civiomobile.ui.screens

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

@androidx.compose.material3.ExperimentalMaterial3Api
@Composable
private fun PlaceholderScaffold(title: String, body: String) {
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(title) },
                colors = TopAppBarDefaults.topAppBarColors()
            )
        }
    ) { padding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(24.dp),
            contentAlignment = Alignment.Center
        ) {
            Text(body)
        }
    }
}

@androidx.compose.material3.ExperimentalMaterial3Api
@Composable
fun BookServiceScreen(orgId: String, onContinue: () -> Unit) =
    PlaceholderScaffold("Запись на услугу", "Экран 5 — Фаза 3 (id=$orgId)")

@androidx.compose.material3.ExperimentalMaterial3Api
@Composable
fun SelectSlotScreen(orgId: String, onContinue: () -> Unit) =
    PlaceholderScaffold("Выбор слота", "Экран 6 — Фаза 3 (id=$orgId)")

@androidx.compose.material3.ExperimentalMaterial3Api
@Composable
fun ConfirmBookingScreen(orgId: String, onConfirmed: (String) -> Unit) =
    PlaceholderScaffold("Подтверждение", "Экран 7 — Фаза 3 (id=$orgId)")

@androidx.compose.material3.ExperimentalMaterial3Api
@Composable
fun BookingsScreen(onOpenBooking: (String) -> Unit) =
    PlaceholderScaffold("Записи", "Экран 8 — Фаза 4")

@androidx.compose.material3.ExperimentalMaterial3Api
@Composable
fun BookingDetailScreen(bookingId: String, onShowQr: () -> Unit) =
    PlaceholderScaffold("Запись", "Экран 9 — Фаза 4 (id=$bookingId)")

@androidx.compose.material3.ExperimentalMaterial3Api
@Composable
fun QrCodeScreen(bookingId: String) =
    PlaceholderScaffold("QR-код", "Экран 10 — Фаза 4 (id=$bookingId)")

@androidx.compose.material3.ExperimentalMaterial3Api
@Composable
fun NotificationsScreen() =
    PlaceholderScaffold("Уведомления", "Экран 11 — Фаза 5")

@androidx.compose.material3.ExperimentalMaterial3Api
@Composable
fun ProfileScreen(onLogout: () -> Unit) =
    PlaceholderScaffold("Профиль", "Экран 12 — Фаза 5")
