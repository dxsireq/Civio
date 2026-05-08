package com.example.civiomobile.navigation

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.CalendarToday
import androidx.compose.material.icons.outlined.Home
import androidx.compose.material.icons.outlined.Notifications
import androidx.compose.material.icons.outlined.Person
import androidx.compose.ui.graphics.vector.ImageVector

data class BottomNavItem(
    val route: String,
    val label: String,
    val icon: ImageVector
)

val BottomNavItems = listOf(
    BottomNavItem(Routes.CATALOG, "Каталог", Icons.Outlined.Home),
    BottomNavItem(Routes.BOOKINGS, "Записи", Icons.Outlined.CalendarToday),
    BottomNavItem(Routes.NOTIFICATIONS, "Уведомления", Icons.Outlined.Notifications),
    BottomNavItem(Routes.PROFILE, "Профиль", Icons.Outlined.Person)
)
