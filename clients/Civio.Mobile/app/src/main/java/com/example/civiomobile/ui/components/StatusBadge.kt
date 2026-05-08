package com.example.civiomobile.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import com.example.civiomobile.ui.theme.ErrorContainer
import com.example.civiomobile.ui.theme.OnPrimaryContainer
import com.example.civiomobile.ui.theme.PrimaryContainer
import com.example.civiomobile.ui.theme.Success
import com.example.civiomobile.ui.theme.SuccessContainer
import com.example.civiomobile.ui.theme.Warning
import com.example.civiomobile.ui.theme.WarningContainer

enum class StatusKind { Created, Confirmed, Completed, Cancelled, Rejected }

@Composable
fun StatusBadge(kind: StatusKind, text: String, modifier: Modifier = Modifier) {
    val (bg, fg) = when (kind) {
        StatusKind.Created -> PrimaryContainer to OnPrimaryContainer
        StatusKind.Confirmed -> SuccessContainer to Success
        StatusKind.Completed -> SuccessContainer to Success
        StatusKind.Cancelled -> ErrorContainer to MaterialTheme.colorScheme.onErrorContainer
        StatusKind.Rejected -> WarningContainer to Warning
    }
    Text(
        text = text,
        color = fg,
        style = MaterialTheme.typography.labelMedium,
        modifier = modifier
            .clip(RoundedCornerShape(999.dp))
            .background(bg)
            .padding(horizontal = 10.dp, vertical = 4.dp)
    )
}

@Composable
fun StatusBadge(text: String, container: Color, content: Color, modifier: Modifier = Modifier) {
    Text(
        text = text,
        color = content,
        style = MaterialTheme.typography.labelMedium,
        modifier = modifier
            .clip(RoundedCornerShape(999.dp))
            .background(container)
            .padding(horizontal = 10.dp, vertical = 4.dp)
    )
}
