package com.example.civiomobile.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.pulltorefresh.PullToRefreshBox
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.LifecycleEventObserver
import androidx.lifecycle.compose.LocalLifecycleOwner
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import com.example.civiomobile.data.api.dto.OrganizationResponse
import com.example.civiomobile.ui.components.EmptyState
import com.example.civiomobile.ui.components.LoadingBox
import com.example.civiomobile.viewmodel.OrganizationsState
import com.example.civiomobile.viewmodel.OrganizationsViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun OrganizationsScreen(
    onOpenOrg: (String) -> Unit,
    viewModel: OrganizationsViewModel = hiltViewModel()
) {
    val state by viewModel.state.collectAsState()

    val lifecycleOwner = LocalLifecycleOwner.current
    DisposableEffect(lifecycleOwner) {
        val observer = LifecycleEventObserver { _, event ->
            if (event == Lifecycle.Event.ON_RESUME) viewModel.refreshIfLoaded()
        }
        lifecycleOwner.lifecycle.addObserver(observer)
        onDispose { lifecycleOwner.lifecycle.removeObserver(observer) }
    }

    Scaffold(
        containerColor = MaterialTheme.colorScheme.surfaceContainerLow,
        contentWindowInsets = WindowInsets(0, 0, 0, 0)
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
        ) {
            Text(
                text = "Каталог",
                fontSize = 30.sp,
                fontWeight = FontWeight.SemiBold,
                color = MaterialTheme.colorScheme.onSurface,
                modifier = Modifier.padding(start = 20.dp, end = 20.dp, top = 12.dp, bottom = 16.dp)
            )

            val query = (state as? OrganizationsState.Ready)?.query.orEmpty()
            SearchBar(
                value = query,
                onValueChange = viewModel::search,
                enabled = state is OrganizationsState.Ready,
                modifier = Modifier.padding(horizontal = 20.dp)
            )

            Spacer(Modifier.height(12.dp))

            when (val s = state) {
                is OrganizationsState.Loading -> LoadingBox()
                is OrganizationsState.Error -> EmptyState(
                    title = "Ошибка",
                    subtitle = s.message
                )
                is OrganizationsState.Ready -> {
                    val filtered = remember(s.items, s.query) {
                        if (s.query.isBlank()) s.items
                        else s.items.filter { it.name.contains(s.query, ignoreCase = true) }
                    }
                    PullToRefreshBox(
                        isRefreshing = s.refreshing,
                        onRefresh = viewModel::refresh,
                        modifier = Modifier.fillMaxSize()
                    ) {
                        if (filtered.isEmpty()) {
                            EmptyState(
                                title = "Ничего не найдено",
                                subtitle = if (s.query.isBlank()) "Каталог пуст" else "Измените поисковый запрос"
                            )
                        } else {
                            LazyColumn(
                                modifier = Modifier.fillMaxSize(),
                                contentPadding = androidx.compose.foundation.layout.PaddingValues(
                                    start = 20.dp, end = 20.dp, top = 4.dp, bottom = 24.dp
                                ),
                                verticalArrangement = Arrangement.spacedBy(12.dp)
                            ) {
                                items(filtered, key = { it.id }) { org ->
                                    OrgCard(org = org, onClick = { onOpenOrg(org.id) })
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun SearchBar(
    value: String,
    onValueChange: (String) -> Unit,
    enabled: Boolean,
    modifier: Modifier = Modifier
) {
    OutlinedTextField(
        value = value,
        onValueChange = onValueChange,
        modifier = modifier
            .fillMaxWidth()
            .heightIn(min = 48.dp),
        placeholder = { Text("Поиск организации...") },
        leadingIcon = {
            Icon(
                imageVector = Icons.Default.Search,
                contentDescription = null,
                tint = MaterialTheme.colorScheme.onSurfaceVariant
            )
        },
        singleLine = true,
        shape = RoundedCornerShape(24.dp),
        enabled = enabled,
        colors = OutlinedTextFieldDefaults.colors(
            focusedContainerColor = MaterialTheme.colorScheme.surface,
            unfocusedContainerColor = MaterialTheme.colorScheme.surface
        )
    )
}

@Composable
private fun OrgCard(org: OrganizationResponse, onClick: () -> Unit) {
    Card(
        onClick = onClick,
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 0.dp),
        border = androidx.compose.foundation.BorderStroke(
            1.dp,
            MaterialTheme.colorScheme.outlineVariant
        ),
        shape = RoundedCornerShape(16.dp)
    ) {
        Row(modifier = Modifier.fillMaxWidth()) {
            Box(
                modifier = Modifier
                    .width(3.dp)
                    .heightIn(min = 96.dp)
                    .background(MaterialTheme.colorScheme.primary)
            )
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Text(
                    text = org.name,
                    fontSize = 16.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = MaterialTheme.colorScheme.onSurface
                )
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.Default.LocationOn,
                        contentDescription = null,
                        tint = MaterialTheme.colorScheme.onSurfaceVariant,
                        modifier = Modifier.size(14.dp)
                    )
                    Spacer(Modifier.width(4.dp))
                    Text(
                        text = "${org.city} · ${org.address}",
                        fontSize = 13.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
                if (!org.description.isNullOrBlank()) {
                    Text(
                        text = org.description,
                        fontSize = 13.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        maxLines = 2
                    )
                }
            }
        }
    }
}

