package com.example.civiomobile.ui.components

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

@Composable
fun CivioCard(
    modifier: Modifier = Modifier,
    onClick: (() -> Unit)? = null,
    content: @Composable () -> Unit
) {
    val baseModifier = modifier.fillMaxWidth()
    val colors = CardDefaults.cardColors(
        containerColor = MaterialTheme.colorScheme.surface
    )
    val elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)
    val border = androidx.compose.foundation.BorderStroke(
        1.dp,
        MaterialTheme.colorScheme.outlineVariant
    )

    if (onClick != null) {
        Card(
            modifier = baseModifier,
            onClick = onClick,
            colors = colors,
            elevation = elevation,
            border = border
        ) {
            Column(modifier = Modifier.padding(16.dp)) { content() }
        }
    } else {
        Card(
            modifier = baseModifier,
            colors = colors,
            elevation = elevation,
            border = border
        ) {
            Column(modifier = Modifier.padding(16.dp)) { content() }
        }
    }
}
