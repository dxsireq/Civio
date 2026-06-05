package com.example.civiomobile.ui.screens

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.example.civiomobile.ui.components.CivioButton
import com.example.civiomobile.ui.components.CivioTextField
import com.example.civiomobile.viewmodel.AuthState
import com.example.civiomobile.viewmodel.AuthViewModel
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun VerifyEmailScreen(
    email: String,
    onVerified: () -> Unit,
    onNavigateBack: () -> Unit,
    viewModel: AuthViewModel = hiltViewModel()
) {
    val state by viewModel.state.collectAsState()
    var code by remember { mutableStateOf("") }
    var resendMessage by remember { mutableStateOf("") }
    var countdown by remember { mutableIntStateOf(0) }
    val scope = rememberCoroutineScope()

    val isLoading = state is AuthState.Loading
    val errorMessage = (state as? AuthState.Error)?.message

    LaunchedEffect(state) {
        if (state is AuthState.Authenticated) onVerified()
    }

    fun startCountdown() {
        scope.launch {
            countdown = 60
            while (countdown > 0) {
                delay(1000)
                countdown--
            }
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Подтверждение email") },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Назад")
                    }
                }
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(horizontal = 24.dp, vertical = 16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            Text(
                text = "Мы отправили 6-значный код на",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            Text(
                text = email,
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurface
            )

            Spacer(Modifier.height(8.dp))

            CivioTextField(
                value = code,
                onValueChange = { if (it.length <= 6 && it.all(Char::isDigit)) { code = it; viewModel.resetError() } },
                label = "Код подтверждения",
                placeholder = "000000",
                keyboardType = KeyboardType.NumberPassword,
                isError = errorMessage != null,
                errorText = errorMessage,
                enabled = !isLoading
            )

            CivioButton(
                text = "Подтвердить",
                onClick = { viewModel.verifyEmail(email, code) },
                enabled = code.length == 6 && !isLoading,
                loading = isLoading,
                modifier = Modifier.fillMaxWidth()
            )

            CivioButton(
                text = if (countdown > 0) "Повторная отправка ($countdown с)" else "Отправить код повторно",
                onClick = {
                    resendMessage = ""
                    scope.launch {
                        try {
                            viewModel.resendCode(email)
                            resendMessage = "Код отправлен повторно."
                            startCountdown()
                        } catch (_: Exception) { }
                    }
                },
                enabled = countdown == 0 && !isLoading,
                modifier = Modifier.fillMaxWidth()
            )

            if (resendMessage.isNotEmpty()) {
                Text(
                    text = resendMessage,
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.primary,
                    textAlign = TextAlign.Center,
                    modifier = Modifier.fillMaxWidth()
                )
            }
        }
    }
}
