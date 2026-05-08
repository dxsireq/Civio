package com.example.civiomobile.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable

private val CivioColorScheme = lightColorScheme(
    primary = Primary,
    onPrimary = OnPrimary,
    primaryContainer = PrimaryContainer,
    onPrimaryContainer = OnPrimaryContainer,
    surface = Surface,
    surfaceVariant = SurfaceContainer,
    surfaceContainer = SurfaceContainer,
    surfaceContainerLow = SurfaceDim,
    onSurface = OnSurface,
    onSurfaceVariant = OnSurfaceVariant,
    outline = Outline,
    outlineVariant = OutlineVariant,
    error = Error,
    onError = OnError,
    errorContainer = ErrorContainer,
    onErrorContainer = OnErrorContainer,
)

@Composable
fun CivioMobileTheme(
    content: @Composable () -> Unit
) {
    MaterialTheme(
        colorScheme = CivioColorScheme,
        typography = Typography,
        content = content
    )
}
